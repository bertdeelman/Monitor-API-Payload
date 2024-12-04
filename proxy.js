const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const minimist = require('minimist');
const ProxyHandler = require('./src/proxy/proxyHandler');
const SocketHandler = require('./src/socketHandler');

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Show help if requested
if (argv.help || argv.h) {
    console.log(`
API Monitor - Traffic monitoring tool
===================================

Usage: program.exe -source [port] -destination [port]
Example: program.exe -source 3000 -destination 8888

Ports:
  -source        Port to listen on (e.g., 3000)
  -destination   Port to forward traffic to (e.g., 8888)
  
Monitor interface will be available at: http://localhost:9000

Created by Ben de Ridder
`);
    process.exit(0);
}

// Create Express app
const app = express();
const webServer = http.createServer(app);
const io = new Server(webServer);

// Default configuration
const config = {
    proxy: {
        port: argv.source || 3000,
        defaultTarget: {
            host: 'localhost',
            port: argv.destination || 80
        }
    },
    web: {
        port: 9000
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
proxyServer.listen(config.proxy.port, () => {
    console.clear();
    console.log('\x1b[42m%s\x1b[0m', ' API MONITOR STARTED ');
    console.log('\x1b[36m%s\x1b[0m', `Proxy server running on port ${config.proxy.port}`);
});

webServer.listen(config.web.port, () => {
    console.log('\x1b[36m%s\x1b[0m', `Web interface available at: http://localhost:${config.web.port}`);
    console.log('\nTo use:');
    console.log(`1. Configure target API (default: localhost:${config.proxy.defaultTarget.port})`);
    console.log(`2. Send requests to localhost:${config.proxy.port}`);
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});