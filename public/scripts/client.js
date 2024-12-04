const socket = io();
const logsDiv = document.getElementById('logs');
let isDarkMode = false;

// Socket connection handlers
socket.on('connect', () => {
    document.getElementById('status').className = 'status-active';
    document.getElementById('status').textContent = 'Connected';
});

socket.on('disconnect', () => {
    document.getElementById('status').className = 'status-inactive';
    document.getElementById('status').textContent = 'Disconnected';
});

// Stats update handler
socket.on('stats', (stats) => {
    // Update basic stats
    document.getElementById('totalRequests').textContent = stats.totalRequests;
    document.getElementById('jsonRequests').textContent = stats.jsonRequests;
    document.getElementById('xmlRequests').textContent = stats.xmlRequests;

    // Update uptime
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    document.getElementById('uptime').textContent = 
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update status codes
    if (stats.statusCodes) {
        document.getElementById('status2xx').textContent = `2xx: ${stats.statusCodes['2xx'] || 0}`;
        document.getElementById('status4xx').textContent = `4xx: ${stats.statusCodes['4xx'] || 0}`;
        document.getElementById('status5xx').textContent = `5xx: ${stats.statusCodes['5xx'] || 0}`;
    }
});

// Request handler
socket.on('request', (data) => {
    addRequestToLog(data);
});

function formatPayload(payload, type) {
    try {
        if (!payload) return '';
        
        if (type === 'xml') {
            // Format XML with indentation and line breaks
            let formatted = payload.replace(/></g, '>\n<');
            let depth = 0;
            let lines = formatted.split('\n');
            
            formatted = lines.map(line => {
                let indent = ' '.repeat(depth * 2);
                if (line.match(/<\//)) depth--; // Closing tag
                indent = ' '.repeat(depth * 2);
                if (line.match(/<[^/].*[^/]>$/)) depth++; // Opening tag
                return indent + line;
            }).join('\n');
            
            // Color-code the XML
            return formatted
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(&lt;\/?\w+)([^&]*?)(&gt;)/g, '<span class="xml-tag">$1</span><span class="xml-attr">$2</span><span class="xml-tag">$3</span>')
                .replace(/"([^"]*)"/g, '"<span class="xml-value">$1</span>"');
        } 
        else if (type === 'json') {
            const obj = JSON.parse(payload);
            return JSON.stringify(obj, null, 2)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(".*?"):/g, '<span class="json-key">$1</span>:')
                .replace(/: (".*?")/g, ': <span class="json-string">$1</span>')
                .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
                .replace(/: (true|false|null)/g, ': <span class="json-boolean">$1</span>');
        }
        return payload
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    } catch (e) {
        console.error('Error formatting payload:', e);
        return payload
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

function addRequestToLog(data) {
    const requestDiv = document.createElement('div');
    requestDiv.className = 'request';
    
    const content = `
        <div class="request-header">
            <div>
                <span class="method method-${data.method}">${data.method}</span>
                <span class="url" title="${data.url}">${data.url}</span>
                ${data.type !== 'unknown' ? 
                    `<span class="payload-type ${data.type}-type">${data.type.toUpperCase()}</span>` : 
                    ''}
                <span class="response-status status-${Math.floor(data.statusCode/100)}xx">
                    ${data.statusCode} - ${data.responseMessage}
                </span>
            </div>
            <div class="request-actions">
                <span class="timestamp">${data.timestamp}</span>
                <span class="response-time">${data.responseTime}ms</span>
                <button class="copy-btn" onclick='copyRequestDetails(this, ${JSON.stringify(data)
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/'/g, "\\'")}'>
                    Copy
                </button>
            </div>
        </div>
        ${data.body ? `<pre class="code-block ${data.type}-content">${formatPayload(data.body, data.type)}</pre>` : ''}
    `;
    
    requestDiv.innerHTML = content;
    logsDiv.insertBefore(requestDiv, logsDiv.firstChild);

    // Auto-cleanup old requests if there are too many
    while (logsDiv.children.length > 100) {
        logsDiv.removeChild(logsDiv.lastChild);
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

Payload:
${data.body || 'No payload'}`;
    
    navigator.clipboard.writeText(details)
        .then(() => {
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#2ecc71';
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

function filterRequests() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterType').value.toLowerCase();
    const requests = document.getElementsByClassName('request');
    
    Array.from(requests).forEach(request => {
        const text = request.textContent.toLowerCase();
        const type = request.querySelector('.payload-type')?.textContent.toLowerCase() || '';
        
        const matchesSearch = text.includes(searchValue);
        const matchesType = filterType === 'all' || type === filterType;
        
        request.style.display = matchesSearch && matchesType ? '' : 'none';
    });
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function clearLogs() {
    logsDiv.innerHTML = '';
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
    }
});