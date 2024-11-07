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

Example:
- Original request: `http://localhost:80/api/endpoint`
- New request: `http://localhost:3000/api/endpoint`

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