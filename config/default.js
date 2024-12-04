module.exports = {
    proxy: {
        port: 3000,
        defaultTarget: {
            host: 'localhost',
            port: 80  // Updated from 8080 to 80
        }
    },
    web: {
        port: 9000
    },
    monitoring: {
        maxStoredRequests: 100,
        maxEndpointsToShow: 5,
        updateInterval: 1000
    }
};