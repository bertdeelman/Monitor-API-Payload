function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function formatPayload(payload, type) {
    try {
        if (type === 'json') {
            return JSON.stringify(JSON.parse(payload), null, 2)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        } else if (type === 'xml') {
            return payload
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }
        return payload;
    } catch (e) {
        console.error('Error formatting payload:', e);
        return payload;
    }
}

function getResponseClass(statusCode) {
    if (statusCode < 300) return 'success';
    if (statusCode < 400) return 'redirect';
    if (statusCode < 500) return 'client-error';
    return 'server-error';
}

function copyRequestDetails(button, data) {
    const timestamp = new Date().toISOString();
    const details = `Request Details (${timestamp})
=============================
Endpoint: ${data.url}
Method: ${data.method}
Content-Type: ${data.contentType || 'Not specified'}
Type: ${data.type.toUpperCase()}
Status Code: ${data.statusCode}
Response Time: ${data.responseTime}ms

Payload:
${data.body}
`;
    
    navigator.clipboard.writeText(details)
        .then(() => {
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                button.textContent = 'Copy';
                button.style.backgroundColor = '#666';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
}

function updateResponseTimeDisplay(stats) {
    document.getElementById('currentResponseTime').textContent = 
        stats.responseTimes[stats.responseTimes.length - 1] || 0;
    document.getElementById('avgResponseTime').textContent = 
        `${Math.round(stats.averageResponseTime)}ms`;
    document.getElementById('minResponseTime').textContent = 
        `${Math.min(...stats.responseTimes)}ms`;
    document.getElementById('maxResponseTime').textContent = 
        `${Math.max(...stats.responseTimes)}ms`;
}

function updateStatusCodesDisplay(stats) {
    const statusCodes = stats.statusCodes;
    const total = Object.values(statusCodes).reduce((a, b) => a + b, 0);
    const successRate = total ? Math.round((statusCodes['200'] || 0) / total * 100) : 100;

    document.getElementById('healthScore').textContent = `${successRate}%`;
    document.getElementById('status2xx').textContent = 
        `2xx: ${Object.entries(statusCodes)
            .filter(([code]) => code.startsWith('2'))
            .reduce((sum, [_, count]) => sum + count, 0)}`;
    document.getElementById('status4xx').textContent = 
        `4xx: ${Object.entries(statusCodes)
            .filter(([code]) => code.startsWith('4'))
            .reduce((sum, [_, count]) => sum + count, 0)}`;
    document.getElementById('status5xx').textContent = 
        `5xx: ${Object.entries(statusCodes)
            .filter(([code]) => code.startsWith('5'))
            .reduce((sum, [_, count]) => sum + count, 0)}`;
}

function updateEndpointsList(endpoints) {
    const container = document.getElementById('recentEndpoints');
    const recentEndpoints = Array.from(endpoints.entries())
        .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
        .slice(0, 5);

    container.innerHTML = recentEndpoints
        .map(([url, data]) => `
            <div class="endpoint-item">
                <span class="method method-${data.method}">${data.method}</span>
                <span class="endpoint-url">${url}</span>
                <span class="endpoint-count">${data.count}x</span>
            </div>
        `)
        .join('');
}