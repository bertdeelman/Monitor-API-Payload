const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const minimist = require('minimist');
const net = require('net');
const ProxyHandler = require('./src/proxy/proxyHandler');
const SocketHandler = require('./src/socketHandler');

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Show help if requested or no arguments provided
if (argv.help || argv.h || process.argv.length <= 2) {
    console.log(`
API Monitor - Traffic monitoring tool
===================================

Usage: program.exe -source [port] -destination [port]
Example: program.exe -source 80 -destination 888

Ports:
  -source        Port to listen on (e.g., 80)
  -destination   Port to forward traffic to (e.g., 888)
  
Monitor interface will be available at: http://localhost:9000

Created by Bert Deelman
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
        port: argv.source || 80,
        defaultTarget: {
            host: 'localhost',
            port: argv.destination || 888
        }
    },
    web: {
        port: 9000    // Monitor interface port
    }
};

function formatError(message) {
    return `\x1b[31mError: ${message}\x1b[0m`;
}

function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    resolve(false);
                }
            })
            .once('listening', () => {
                server.close();
                resolve(true);
            })
            .listen(port);
    });
}

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

// Start servers with sequential port checking
async function startServers() {
    try {
        // Check proxy port first
        if (!(await isPortAvailable(config.proxy.port))) {
            console.error(formatError(`Port ${config.proxy.port} is already in use`));
            process.exit(1);
        }

        // Then check monitor port
        if (!(await isPortAvailable(config.web.port))) {
            console.error(formatError(`Monitor port ${config.web.port} is already in use`));
            process.exit(1);
        }

        // Start servers only if both ports are available
        proxyServer.listen(config.proxy.port, () => {
            console.clear();
            console.log('\x1b[42m%s\x1b[0m', ' API MONITOR STARTED ');
            console.log('\x1b[36m%s\x1b[0m', `Proxy server running on port ${config.proxy.port}`);
        });

        webServer.listen(config.web.port, () => {
            console.log('\x1b[36m%s\x1b[0m', `Web interface available at: http://localhost:${config.web.port}`);
            console.log('\nTo use:');
            console.log(`1. Configure target API to run on port ${config.proxy.defaultTarget.port}`);
            console.log(`2. All traffic to port ${config.proxy.port} will be monitored and forwarded`);
        });
    } catch (error) {
        console.error(formatError(error.message));
        process.exit(1);
    }
}

// Start the servers
startServers();

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    proxyServer.close(() => {
        webServer.close(() => {
            process.exit(0);
        });
    });
});

// Handle uncaught exceptions with nicer formatting
process.on('uncaughtException', (error) => {
    console.error(formatError(error.message));
    process.exit(1);
});