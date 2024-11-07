class StatusCodesMonitor {
    constructor() {
        this.statusCodes = {
            '2xx': 0,
            '3xx': 0,
            '4xx': 0,
            '5xx': 0
        };
        this.detailed = new Map();
    }

    addStatus(code) {
        // Update general category
        const category = `${Math.floor(code / 100)}xx`;
        this.statusCodes[category] = (this.statusCodes[category] || 0) + 1;

        // Update detailed stats
        const current = this.detailed.get(code) || 0;
        this.detailed.set(code, current + 1);
    }

    getStats() {
        return {
            categories: this.statusCodes,
            detailed: Object.fromEntries(this.detailed),
            total: Object.values(this.statusCodes).reduce((a, b) => a + b, 0)
        };
    }
}

module.exports = StatusCodesMonitor;