const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const ProxyHandler = require('./src/proxy/proxyHandler');
const SocketHandler = require('./src/socketHandler');

// Create Express app
const app = express();
const webServer = http.createServer(app);
const io = new Server(webServer);

// Static configuration
const config = {
    proxy: {
        listenPort: 80,        // Main traffic now comes through port 80
        target: {
            host: 'localhost',
            port: 8888         // Forward to IIS on 8888
        }
    },
    web: {
        port: 9000            // Monitoring interface remains on 9000
    }
};

// Create proxy server
const proxyHandler = new ProxyHandler(config.proxy);
const proxyServer = http.createServer(proxyHandler.handleRequest.bind(proxyHandler));

// Setup socket handler
const socketHandler = new SocketHandler(io, proxyHandler);

// Serve static files
app.use(express.static('public'));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start servers
proxyServer.listen(config.proxy.listenPort, () => {
    console.clear();
    console.log('\x1b[42m%s\x1b[0m', ' API MONITOR STARTED ');
    console.log('\x1b[36m%s\x1b[0m', `Proxy server running on port ${config.proxy.listenPort}`);
    console.log('\x1b[36m%s\x1b[0m', `Forwarding to: http://localhost:${config.proxy.target.port}`);
});

webServer.listen(config.web.port, () => {
    console.log('\x1b[36m%s\x1b[0m', `Web interface available at: http://localhost:${config.web.port}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    proxyServer.close(() => {
        webServer.close(() => {
            process.exit(0);
        });
    });
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});