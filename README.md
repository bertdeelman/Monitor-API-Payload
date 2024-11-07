# API Traffic Monitor

A real-time API traffic monitoring tool that captures and displays HTTP requests. It acts as a proxy between your client and target API, monitoring XML and JSON traffic.

## Features

- Real-time request monitoring
- Support for both XML and JSON payloads
- Syntax highlighting for requests
- Request statistics and visualization
- Dark/Light mode with persistence
- Search and filter functionality
- Copy request details
- Response time tracking
- HTTP status monitoring
- Recent endpoints tracking

## Installation Guide for Windows

### Prerequisites
1. Install Node.js:
   - Download Node.js from https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Run the installer (.msi file)
   - Verify installation by opening Command Prompt and typing:
     ```cmd
     node --version
     npm --version
     ```

### Setup Instructions

1. Create the project folder structure:
   ```cmd
   mkdir Monitor API payload
   cd "Monitor API payload"
   mkdir public
   cd public
   mkdir styles
   mkdir scripts
   cd ..
   mkdir views
   mkdir src
   cd src
   mkdir proxy
   mkdir monitors
   cd ..
   ```

2. Initialize the project and install dependencies:
   ```cmd
   npm init -y
   npm install express socket.io moment pretty
   ```

3. File Structure:
   ```
   Monitor API payload/
   ├── src/
   │   ├── proxy/
   │   │   └── proxyHandler.js
   │   ├── monitors/
   │   │   ├── responseTime.js
   │   │   ├── statusCodes.js
   │   │   └── endpoints.js
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

## Running the Application

1. Start the server:
   ```cmd
   node proxy.js
   ```

2. The application will start with:
   - Proxy server on port 3000
   - Web interface on port 9000

## Usage

1. Open the web interface:
   - Open your browser
   - Go to http://localhost:9000

2. Configure your target API:
   - Enter your target API's hostname and port
   - Default is localhost:80
   - Click "Update Configuration"

3. Use the proxy:
   - Instead of sending requests to your API directly
   - Send them to http://localhost:3000
   - The monitor will forward them to your configured target

### Using with Postman

1. Configure Postman:
   - Open your existing Postman collection
   - Change the request URL from your API endpoint to localhost:3000
   - Keep all other settings (headers, body, etc.) the same

2. Example URLs:
   - Original API: `http://localhost:80/api/endpoint`
   - Monitored API: `http://localhost:3000/api/endpoint`

3. Testing steps:
   - Start the monitor (node proxy.js)
   - Open the web interface (http://localhost:9000)
   - Send requests through Postman to port 3000
   - Watch the requests appear in real-time in the monitor

4. Supported request types:
   - XML payloads
   - JSON payloads
   - All HTTP methods (GET, POST, PUT, DELETE)
   - Headers are forwarded automatically

Example Postman setup:
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

The monitor will:
- Show the request in real-time
- Display formatted XML/JSON
- Show response times
- Track status codes
- Allow copying request details

## Monitor Features

### Traffic Overview
- Total request count
- JSON request count
- XML request count
- System uptime

### Response Times
- Current response time
- Average response time
- Minimum response time
- Maximum response time

### Status Codes
- Success (2xx) count
- Client Error (4xx) count
- Server Error (5xx) count

### Recent Endpoints
- Last used endpoints
- Request count per endpoint
- Method type indicators

### Request Details
- HTTP method with color coding
- Complete URL
- Payload type (JSON/XML)
- Response status code
- Response time
- Formatted request body
- Copy functionality

## Troubleshooting

1. Port Conflicts
   ```
   Error: listen EADDRINUSE
   ```
   - Check if ports 3000 or 9000 are in use
   - Close applications using these ports

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
   - Check package.json for dependencies

4. Monitor Shows "Disconnected"
   - Refresh the page
   - Check if proxy server is running
   - Verify browser WebSocket support

## Notes
- The monitor stores data in memory only
- Data is cleared when server restarts
- Designed for development/testing environments
- Console output shows request details

## Version History

### Version 1.0.0 (November 2024)
- Initial release
- Real-time request monitoring
- XML and JSON payload support
- Dark/Light mode
- Response time tracking
- Status code monitoring
- Request copying functionality
- Search and filter capabilities
- Recent endpoints tracking

### Version 0.9.0 (November 2024)
- Beta testing phase
- Core functionality implementation
- Basic UI implementation

### Version 0.5.0 (November 2024)
- Alpha version
- Initial proxy setup
- Basic monitoring capabilities

## Copyright and License

© 2024 Bert Deelman. All rights reserved.

This tool was developed for monitoring API requests, specifically XML and JSON traffic.
- Author: Bert Deelman
- Version: 1.0.0
- Development Date: November 2024

### Usage Information
This tool is provided as-is, without any guarantees or warranty. The author is not responsible for any damage or issues caused by using this tool.

For questions or suggestions, feel free to reach out to the author.