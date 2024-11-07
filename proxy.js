const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const config = require('./config/default');
const ProxyHandler = require('./src/proxy/proxyHandler');
const SocketHandler = require('./src/socketHandler');

// Create Express app
const app = express();
const webServer = http.createServer(app);
const io = new Server(webServer);

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
proxyServer.listen(config.proxy.port, () => {
    console.clear();
    console.log('\x1b[42m%s\x1b[0m', ' API MONITOR STARTED ');
    console.log(`Proxy server running on port ${config.proxy.port}`);
});

webServer.listen(config.web.port, () => {
    console.log(`Web interface available at: http://localhost:${config.web.port}`);
    console.log('\nTo use:');
    console.log(`1. Configure target API in the web interface (default: localhost:${config.proxy.defaultTarget.port})`);
    console.log(`2. Send requests to localhost:${config.proxy.port}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    proxyServer.close(() => {
        webServer.close(() => {
            process.exit(0);
        });
    });
});