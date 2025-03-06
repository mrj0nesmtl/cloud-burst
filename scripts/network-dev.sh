#!/bin/bash

# Exit on error
set -e

# Get the local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
  # Linux
  LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "🚀 Starting Cloud Burst in Network Development Mode"
echo "=============================================="
echo "✅ Local:            http://localhost:3000"
echo "✅ On Your Network:  http://$LOCAL_IP:3000"
echo "=============================================="
echo "Share the network URL with devices on your local network"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev 