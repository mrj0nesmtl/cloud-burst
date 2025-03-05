#!/bin/bash

# Exit on error
set -e

echo "🚀 Deploying Cloud Burst in Development Mode"
echo "============================================"

# Make sure we're in development mode
export NODE_ENV=development

# Update .replit file to use development mode
echo "📝 Updating .replit configuration..."
cat > .replit << EOL
modules = ["nodejs-20", "web", "bash"]
run = "npm run dev"

[nix]
channel = "stable-24_05"

[env]
NODE_ENV = "development"
NEXT_TELEMETRY_DISABLED = "1"

[deployment]
run = ["sh", "-c", "npm run dev"]
deploymentTarget = "cloudrun"
ignorePorts = false
build = ["sh", "-c", "echo 'Skipping build step'"]

[[ports]]
localPort = 3000
externalPort = 80
EOL

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Deploy to Replit
echo "🚀 Deploying to Replit..."
echo "Note: This is a DEVELOPMENT MODE deployment and should not be used for production."
echo "This deployment bypasses type checking, authentication, and other security features."

# Deploy using Replit's UI or API
echo "✅ Setup complete! Now click the Deploy button in the Replit UI."
echo "============================================"
echo "🔗 After deployment, your app will be available at: https://cb-beta.replit.app"
echo "⚠️  REMEMBER: This is a development mode deployment for demo purposes only!" 