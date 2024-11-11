const http = require('http');
const EventEmitter = require('events');
const EndpointsMonitor = require('../monitors/endpoints');
const ResponseTimeMonitor = require('../monitors/responseTime');
const StatusCodesMonitor = require('../monitors/statusCodes');

class ProxyHandler extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.target = config.target;
        
        // Initialize monitors
        this.endpointsMonitor = new EndpointsMonitor();
        this.responseTimeMonitor = new ResponseTimeMonitor();
        this.statusCodesMonitor = new StatusCodesMonitor();
        
        // Initialize basic stats
        this.stats = {
            totalRequests: 0,
            xmlRequests: 0,
            jsonRequests: 0,
            startTime: Date.now()
        };
    }

    handleRequest(clientReq, clientRes) {
        const startTime = Date.now();
        let requestBody = '';

        clientReq.on('data', chunk => {
            requestBody += chunk.toString();
        });

        clientReq.on('end', () => {
            // Update basic stats
            this.stats.totalRequests++;
            
            // Track endpoint
            this.endpointsMonitor.addEndpoint(clientReq.url, clientReq.method);

            const payloadType = this.detectPayloadType(requestBody, clientReq.headers['content-type']);
            
            if (payloadType === 'json') {
                this.stats.jsonRequests++;
            } else if (payloadType === 'xml') {
                this.stats.xmlRequests++;
            }

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

                // Handle 302 redirects and other 3xx responses
                if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400) {
                    let location = proxyRes.headers.location;
                    if (location) {
                        const targetPortStr = `:${this.target.port}`;
                        if (location.includes(targetPortStr)) {
                            location = location.replace(targetPortStr, '');
                            proxyRes.headers.location = location;
                        }
                    }
                }

                const responseMessage = `${proxyRes.statusCode} - ${this.getStatusMessage(proxyRes.statusCode)}`;

                this.emit('request', {
                    method: clientReq.method,
                    url: clientReq.url,
                    timestamp: new Date().toISOString(),
                    body: requestBody,
                    type: payloadType,
                    contentType: clientReq.headers['content-type'],
                    statusCode: proxyRes.statusCode,
                    responseTime: responseTime,
                    responseMessage: responseMessage
                });

                clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(clientRes);
            });

            proxyReq.on('error', (error) => {
                console.error('Proxy request error:', error);
                if (!clientRes.headersSent) {
                    const errorMessage = `502 - Unable to reach ${this.target.host}:${this.target.port}`;
                    this.statusCodesMonitor.addStatus(502);
                    
                    clientRes.writeHead(502);
                    clientRes.end(errorMessage);

                    this.emit('request', {
                        method: clientReq.method,
                        url: clientReq.url,
                        timestamp: new Date().toISOString(),
                        body: requestBody,
                        type: payloadType,
                        contentType: clientReq.headers['content-type'],
                        statusCode: 502,
                        responseTime: Date.now() - startTime,
                        responseMessage: errorMessage
                    });
                }
            });

            if (requestBody) {
                proxyReq.write(requestBody);
            }
            proxyReq.end();
        });
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.startTime,
            endpoints: this.endpointsMonitor.getStats(),
            responseTimes: this.responseTimeMonitor.getStats(),
            statusCodes: this.statusCodesMonitor.getStats()
        };
    }

    // Utility methods remain the same
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

    getStatusMessage(statusCode) {
        const messages = {
            200: 'Request successful',
            201: 'Created successfully',
            204: 'No Content',
            301: 'Moved Permanently',
            302: 'Found (Redirect)',
            304: 'Not Modified',
            400: 'Bad request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable'
        };
        return messages[statusCode] || `Status code: ${statusCode}`;
    }
}

module.exports = ProxyHandler;