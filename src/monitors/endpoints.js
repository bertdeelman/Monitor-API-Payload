class EndpointsMonitor {
    constructor() {
        this.endpoints = new Map();
        this.maxEndpoints = 5;
    }

    addEndpoint(url, method) {
        const key = `${method} ${url}`;
        const now = Date.now();
        
        // Update or create endpoint stats
        const current = this.endpoints.get(key) || {
            count: 0,
            lastUsed: now,
            method,
            url
        };
        
        current.count++;
        current.lastUsed = now;
        this.endpoints.set(key, current);
    }

    getStats() {
        // Convert endpoints map to array and sort by last used time
        const sortedEndpoints = Array.from(this.endpoints.entries())
            .map(([key, data]) => ({
                ...data,
                key
            }))
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, this.maxEndpoints);

        return {
            total: this.endpoints.size,
            recent: sortedEndpoints // Only return one sorted list
        };
    }
}

module.exports = EndpointsMonitor;