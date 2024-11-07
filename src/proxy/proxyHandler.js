const http = require('http');
const EventEmitter = require('events');
const ResponseTimeMonitor = require('../monitors/responseTime');
const StatusCodesMonitor = require('../monitors/statusCodes');
const EndpointsMonitor = require('../monitors/endpoints');

class ProxyHandler extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.target = {
            host: 'localhost',
            port: 80
        };
        
        // Initialize monitors
        this.responseTimeMonitor = new ResponseTimeMonitor();
        this.statusCodesMonitor = new StatusCodesMonitor();
        this.endpointsMonitor = new EndpointsMonitor();

        this.stats = {
            totalRequests: 0,
            xmlRequests: 0,
            jsonRequests: 0,
            startTime: Date.now()
        };
    }

    detectPayloadType(body, contentType) {
        if (!body) return 'unknown';
        
        if (contentType) {
            if (contentType.includes('application/json')) return 'json';
            if (contentType.includes('application/xml') || contentType.includes('text/xml')) return 'xml';
        }
        
        const trimmed = body.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
        if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) return 'xml';
        
        return 'unknown';
    }

    handleRequest(clientReq, clientRes) {
        const startTime = Date.now();
        let requestBody = '';

        clientReq.on('data', chunk => {
            requestBody += chunk.toString();
        });

        clientReq.on('end', () => {
            const payloadType = this.detectPayloadType(requestBody, clientReq.headers['content-type']);
            
            // Update basic stats
            this.stats.totalRequests++;
            if (payloadType === 'json') this.stats.jsonRequests++;
            if (payloadType === 'xml') this.stats.xmlRequests++;

            // Forward the request
            const options = {
                hostname: this.target.host,
                port: this.target.port,
                path: clientReq.url,
                method: clientReq.method,
                headers: {
                    ...clientReq.headers,
                    host: `${this.target.host}:${this.target.port}`
                }
            };

            const proxyReq = http.request(options, proxyRes => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                // Update monitors
                this.responseTimeMonitor.addTime(responseTime);
                this.statusCodesMonitor.addStatus(proxyRes.statusCode);
                this.endpointsMonitor.addEndpoint(clientReq.url, clientReq.method);

                // Emit request event
                this.emit('request', {
                    method: clientReq.method,
                    url: clientReq.url,
                    timestamp: new Date().toISOString(),
                    body: requestBody,
                    type: payloadType,
                    contentType: clientReq.headers['content-type'],
                    statusCode: proxyRes.statusCode,
                    responseTime: responseTime
                });

                clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(clientRes);
            });

            proxyReq.on('error', (error) => {
                console.error('Proxy request error:', error);
                if (!clientRes.headersSent) {
                    clientRes.writeHead(502).end('Bad Gateway - Unable to reach target server');
                }
            });

            if (requestBody) {
                proxyReq.write(requestBody);
            }
            proxyReq.end();
        });
    }

    updateTarget(newTarget) {
        this.target = newTarget;
        this.emit('targetUpdated', newTarget);
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.startTime,
            responseTimes: this.responseTimeMonitor.getStats(),
            statusCodes: this.statusCodesMonitor.getStats(),
            endpoints: this.endpointsMonitor.getStats()
        };
    }
}

module.exports = ProxyHandler;