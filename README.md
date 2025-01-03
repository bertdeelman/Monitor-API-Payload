# API Traffic Monitor

A real-time API traffic monitoring tool that acts as a transparent proxy to capture and display HTTP requests, specifically designed for monitoring XML and JSON traffic.

![API Monitor](docs/images/screenshot.png)

## Quick Start

```cmd
apimonitor.exe -source 80 -destination 888
```

Monitor interface available at: http://localhost:9000

## How It Works

This tool acts as an API traffic eavesdropper by utilizing port switching:

1. Initial Setup:
   - Your API normally runs on port 80
   - Temporarily change your API port to 888
   - API Monitor takes over port 80

2. Traffic Flow:
```
Client Request → Port 80 (API Monitor) → Port 888 (Your API) → Response
```

3. Example Setup:
   - Original setup: Your API runs on port 80
   - Modified setup:
     ```
     1. Change your API to port 888
     2. Run: apimonitor.exe -source 80 -destination 888
     3. All traffic to port 80 is now monitored and forwarded to 888
     ```

This way, the monitor is completely transparent to clients - they continue to use port 80 while you can inspect all traffic passing through.

### Port Configuration Example

```cmd
# Scenario: Moving IIS from 80 to 888
1. Change IIS binding from 80 to 888
2. Run: apimonitor.exe -source 80 -destination 888
3. Clients continue using port 80
4. Monitor interface available at port 9000
```

All requests are automatically captured and displayed in the monitor interface without any client configuration changes.

## Features

### Core Functionality
- Command-line configurable ports for monitoring and forwarding
- Real-time request monitoring
- Support for both XML and JSON payloads
- Request forwarding to target API
- Syntax highlighting for payloads
- Dark/Light mode with persistence

### Monitoring Features
- Total request counting
- JSON/XML request differentiation
- Status code monitoring (2xx, 3xx, 4xx, 5xx)
- Response time tracking
- System uptime display

### User Interface
- Modern, clean design
- Real-time updates
- Search functionality
- Request filtering (XML/JSON)
- Copy request details
- Mobile responsive layout

## Usage

```cmd
apimonitor.exe -source [port] -destination [port]

Options:
  -source        Port to listen on (default: 3000)
  -destination   Port to forward traffic to (default: 80)
  -h, --help     Show help information

Examples:
  apimonitor.exe                         # Use defaults (3000 -> 80)
  apimonitor.exe -h                      # Show help
  apimonitor.exe -source 80 -destination 888  # Production setup
```

## Monitor Interface

Access the web interface at: http://localhost:9000

The interface shows:
- Total request count
- XML/JSON request counts
- Response status codes
- System uptime
- Detailed request logs

## Notes
- Monitor data is stored in memory only
- Data is cleared when monitor restarts
- Designed for development/testing environments

-------------------------------------------
🚀 API Monitor - Making API testing a breeze
-------------------------------------------

Created with ❤️ by Bert Deelman | 🤖 Happily crafted with the help of Claude.ai