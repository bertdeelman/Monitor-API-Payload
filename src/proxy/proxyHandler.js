const http = require('http');
const EventEmitter = require('events');

class ProxyHandler extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.target = {
            host: 'localhost',
            port: config.defaultTarget.port
        };
        
        // Initialize stats
        this.stats = {
            totalRequests: 0,
            xmlRequests: 0,
            jsonRequests: 0,
            startTime: Date.now(),
            methodStats: {
                GET: 0,
                POST: 0,
                PUT: 0,
                DELETE: 0
            },
            statusCodes: {
                '2xx': 0,
                '3xx': 0,
                '4xx': 0,
                '5xx': 0
            }
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
            this.stats.methodStats[clientReq.method] = (this.stats.methodStats[clientReq.method] || 0) + 1;

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

                // Update status code stats
                const statusCategory = `${Math.floor(proxyRes.statusCode / 100)}xx`;
                this.stats.statusCodes[statusCategory] = (this.stats.statusCodes[statusCategory] || 0) + 1;

                const responseMessage = this.getStatusMessage(proxyRes.statusCode);

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
                    this.stats.statusCodes['5xx'] = (this.stats.statusCodes['5xx'] || 0) + 1;
                    
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
            202: 'Accepted',
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
        return messages[statusCode] || `Status code ${statusCode}`;
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.startTime
        };
    }
}

module.exports = ProxyHandler;