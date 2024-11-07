class ResponseTimeMonitor {
    constructor() {
        this.times = [];
        this.maxStoredTimes = 100;
    }

    addTime(time) {
        this.times.push(time);
        if (this.times.length > this.maxStoredTimes) {
            this.times.shift();
        }
    }

    getStats() {
        if (this.times.length === 0) {
            return {
                current: 0,
                average: 0,
                min: 0,
                max: 0
            };
        }

        return {
            current: this.times[this.times.length - 1],
            average: Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length),
            min: Math.min(...this.times),
            max: Math.max(...this.times)
        };
    }
}

module.exports = ResponseTimeMonitor;