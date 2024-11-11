# API Traffic Monitor

A real-time API traffic monitoring tool that acts as a proxy to capture and display HTTP requests, specifically designed for monitoring XML and JSON traffic.

![API Monitor](screenshot.png)

## Features

### Core Functionality
- Real-time request monitoring
- Support for both XML and JSON payloads
- Request forwarding to target API
- Syntax highlighting for payloads
- Dark/Light mode with persistence

### Monitoring Features
- Total request counting
- JSON/XML request tracking
- Status code monitoring (2xx, 4xx, 5xx)
- Response time tracking
- System uptime display

### User Interface
- Modern, clean design
- Real-time updates
- Search functionality
- Request filtering (XML/JSON)
- Copy request details
- Mobile responsive layout

## Installation Guide for Windows

### Prerequisites
1. Install Node.js:
   - Download Node.js LTS from https://nodejs.org/
   - Run the installer
   - Verify installation:
     ```cmd
     node --version
     npm --version
     ```

### Setup
1. Create project structure:
   ```cmd
   mkdir "API Monitor"
   cd "API Monitor"
   mkdir public\styles public\scripts src\proxy src\monitors views
   ```

2. Install dependencies:
   ```cmd
   npm init -y
   npm install express socket.io moment
   ```

3. File Structure:
   ```
   API Monitor/
   ├── src/
   │   ├── proxy/
   │   │   └── proxyHandler.js
   │   └── socketHandler.js
   ├── public/
   │   ├── styles/
   │   │   └── main.css
   │   └── scripts/
   │       └── client.js
   ├── views/
   │   └── index.html
   └── proxy.js
   ```

## Using with Postman

1. Configure Postman:
   - Take your existing Postman collection
   - Change the request URL from your API endpoint to localhost:3000
   - Keep all other settings (headers, body, etc.) the same

2. Example:
   ```
   Original request:
   URL: http://localhost:80/api/products/import
   Method: POST
   Content-Type: application/xml

   Modified request:
   URL: http://localhost:3000/api/products/import
   Method: POST
   Content-Type: application/xml
   (Body remains the same)
   ```

## Running the Application

1. Start the server:
   ```cmd
   node proxy.js
   ```

2. Access the monitor:
   - Open browser: http://localhost:9000
   - Configure target API (default: localhost:80)
   - Start sending requests through port 3000

## Configuration

Default ports:
- Monitor Interface: 9000
- Proxy Server: 3000
- Default Target API: 80

To modify ports, edit the config section in proxy.js.

## Features in Detail

### Request Monitoring
- Real-time request display
- Syntax highlighting for XML/JSON
- Status code indication
- Response time tracking

### Request Details
When copying a request, you get:
- Complete endpoint URL
- HTTP method
- Content-Type header
- Response status
- Response time
- Formatted payload

### Search and Filtering
- Real-time search in requests
- Filter by request type (XML/JSON)
- Clear logs functionality

## Troubleshooting

1. Port Conflicts
   ```
   Error: listen EADDRINUSE
   ```
   - Check if ports 3000 or 9000 are in use
   - Close applications using these ports
   - Or modify ports in config

2. Connection Issues
   ```
   Error: connect ECONNREFUSED
   ```
   - Verify target API is running
   - Check configured hostname and port

3. Missing Dependencies
   ```
   Error: Cannot find module 'xxx'
   ```
   - Run `npm install` again

## Notes
- Monitor stores data in memory only
- Data is cleared when server restarts
- Designed for development/testing environments

## Copyright and License

© 2024 Bert Deelman. All rights reserved.

This tool was developed for monitoring API requests, specifically XML and JSON traffic.
- Author: Bert Deelman
- Version: 1.0.0
- Development Date: November 2024

### Version History

#### Version 1.0.0 (March 2024)
- Initial release
- XML and JSON monitoring
- Status code tracking
- Search and filter functionality
- Copy request details feature
- Dark/Light mode support

### Usage Information
This tool is provided as-is, without any guarantees or warranty. The author is not responsible for any damage or issues caused by using this tool.

🤖 Happily crafted with the help of Claude.ai

For questions or suggestions, feel free to reach out to the author.