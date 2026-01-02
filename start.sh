#!/bin/bash

# Matrix Agent Start Script (Production Build)
# Usage: ./start.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Building Matrix Agent (Production Mode)..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "Please create .env.local with your API keys"
    exit 1
fi

# Build the application
echo "🔨 Building production bundle..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Update Nginx configuration
echo "🔄 Updating Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/agent.matrixlab.work.conf

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ Matrix Agent deployed successfully!"
    echo "🌐 Domain: https://agent.matrixlab.work"
    echo "📁 Build: $(du -sh dist | cut -f1)"
    echo ""
    echo "Note: Static files are served directly by Nginx"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi
