class SocketHandler {
    constructor(io, proxyHandler) {
        this.io = io;
        this.proxyHandler = proxyHandler;
        this.setupSocketHandlers();
        this.setupProxyHandlers();
        this.startStatsInterval();
        this.connectionCount = 0;
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            this.connectionCount++;
            
            // Only log for first connection
            if (this.connectionCount === 1) {
                console.log('Client connected to monitoring interface');
            }

            // Send initial stats
            socket.emit('stats', this.proxyHandler.getStats());
            socket.emit('configUpdated', this.proxyHandler.target);

            // Handle target configuration updates
            socket.on('updateConfig', (newConfig) => {
                this.proxyHandler.updateTarget({
                    host: newConfig.hostname,
                    port: parseInt(newConfig.port)
                });
            });

            socket.on('disconnect', () => {
                this.connectionCount--;
                if (this.connectionCount === 0) {
                    console.log('All clients disconnected from monitoring interface');
                }
            });
        });
    }

    setupProxyHandlers() {
        this.proxyHandler.on('request', (requestData) => {
            this.io.emit('request', requestData);
        });

        this.proxyHandler.on('targetUpdated', (target) => {
            this.io.emit('configUpdated', target);
        });
    }

    startStatsInterval() {
        setInterval(() => {
            if (this.connectionCount > 0) {
                this.io.emit('stats', this.proxyHandler.getStats());
            }
        }, 1000);
    }
}

module.exports = SocketHandler;