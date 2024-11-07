const socket = io();
const logsDiv = document.getElementById('logs');
let isDarkMode = false;

socket.on('connect', () => {
    document.getElementById('status').className = 'status-active';
    document.getElementById('status').textContent = 'Connected';
});

socket.on('disconnect', () => {
    document.getElementById('status').className = 'status-inactive';
    document.getElementById('status').textContent = 'Disconnected';
});

socket.on('configUpdated', (config) => {
    document.getElementById('hostname').value = config.host;
    document.getElementById('port').value = config.port;
    document.getElementById('currentConfig').textContent = 
        `http://${config.host}:${config.port}`;
});

socket.on('stats', (stats) => {
    // Update basic stats
    document.getElementById('totalRequests').textContent = stats.totalRequests;
    document.getElementById('jsonRequests').textContent = stats.jsonRequests;
    document.getElementById('xmlRequests').textContent = stats.xmlRequests;
    
    // Update uptime
    const uptime = Math.floor(stats.uptime / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    document.getElementById('uptime').textContent = 
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update response times
    if (stats.responseTimes) {
        document.getElementById('currentResponseTime').textContent = stats.responseTimes.current;
        document.getElementById('avgResponseTime').textContent = `${stats.responseTimes.average}ms`;
        document.getElementById('minResponseTime').textContent = `${stats.responseTimes.min}ms`;
        document.getElementById('maxResponseTime').textContent = `${stats.responseTimes.max}ms`;
    }

    // Update status codes
    if (stats.statusCodes) {
        const codes = stats.statusCodes.categories;
        document.getElementById('status2xx').textContent = `2xx: ${codes['2xx'] || 0}`;
        document.getElementById('status4xx').textContent = `4xx: ${codes['4xx'] || 0}`;
        document.getElementById('status5xx').textContent = `5xx: ${codes['5xx'] || 0}`;
    }


// In the socket.on('stats') handler, update the endpoints section:

    // Update endpoints
    if (stats.endpoints && stats.endpoints.recent) {
        const endpointsList = document.getElementById('recentEndpoints');
        endpointsList.innerHTML = stats.endpoints.recent
            .map(endpoint => `
                <div class="endpoint-item">
                    <span class="method method-${endpoint.method}">${endpoint.method}</span>
                    <span class="endpoint-url" title="${endpoint.url}">${endpoint.url}</span>
                    <span class="endpoint-count">${endpoint.count}×</span>
                </div>
            `)
            .join('');
    }
});

socket.on('request', (data) => {
    addRequestToLog(data);
});

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

function copyRequestDetails(button, data) {
    const details = `Request Details
=============================
Endpoint: ${data.url}
Method: ${data.method}
Content-Type: ${data.contentType || 'Not specified'}
Type: ${data.type.toUpperCase()}
Status: ${data.statusCode}
Response Time: ${data.responseTime}ms
Size: ${Math.round(data.body.length / 1024)} KB

Payload:
${data.body}`;
    
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

function addRequestToLog(data) {
    const requestDiv = document.createElement('div');
    requestDiv.className = 'request';
    
    const stringifiedData = JSON.stringify(data)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, "\\'");
    
    const content = `
        <div class="request-header">
            <div>
                <span class="method method-${data.method}">${data.method}</span>
                <span class="url" title="${data.url}">${data.url}</span>
                ${data.type !== 'unknown' ? 
                    `<span class="payload-type ${data.type}-type">${data.type.toUpperCase()}</span>` : 
                    ''}
                <span class="status-code status-${Math.floor(data.statusCode/100)}xx">
                    ${data.statusCode}
                </span>
            </div>
            <div class="request-actions">
                <span class="response-time">${data.responseTime}ms</span>
                <span class="timestamp">${data.timestamp}</span>
                <button class="copy-btn" onclick='copyRequestDetails(this, ${stringifiedData})'>
                    Copy
                </button>
            </div>
        </div>
        <pre><code class="language-${data.type}">${formatPayload(data.body, data.type)}</code></pre>
    `;
    
    requestDiv.innerHTML = content;
    logsDiv.insertBefore(requestDiv, logsDiv.firstChild);
    Prism.highlightAll();
}

function filterRequests() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    const requests = document.getElementsByClassName('request');
    
    Array.from(requests).forEach(request => {
        const text = request.textContent.toLowerCase();
        const type = request.querySelector('.payload-type')?.textContent.toLowerCase() || '';
        
        const matchesSearch = text.includes(searchValue);
        const matchesType = filterType === 'all' || type.includes(filterType);
        
        request.style.display = matchesSearch && matchesType ? '' : 'none';
    });
}

function updateConfig() {
    const config = {
        hostname: document.getElementById('hostname').value,
        port: parseInt(document.getElementById('port').value)
    };
    socket.emit('updateConfig', config);
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function clearLogs() {
    logsDiv.innerHTML = '';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
    }
});