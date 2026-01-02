#!/bin/bash

# Matrix Agent One-Click Deployment Script
# Usage: sudo ./deploy.sh

set -e

echo "🚀 Matrix Agent Deployment Script"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires root privileges for SSL setup"
    echo "Please run: sudo ./deploy.sh"
    exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Step 1: Check environment variables
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo "Creating template..."
    cat > .env.local << EOF
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
EOF
    echo "❌ Please edit .env.local with your API keys and run again"
    exit 1
fi

# Check if API keys are set
if grep -q "your_.*_api_key_here" .env.local; then
    echo "⚠️  Please update API keys in .env.local"
    exit 1
fi

echo "✅ Environment configuration OK"

# Step 2: Install Node.js dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Step 3: Setup SSL and Nginx
echo ""
echo "🔐 Step 3: Setting up SSL certificate and Nginx..."
read -p "Do you want to setup SSL certificate for agent.matrixlab.work? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./setup-ssl.sh
else
    echo "⏭️  Skipping SSL setup"
fi

# Step 4: Start the application
echo ""
echo "▶️  Step 4: Starting application..."
sudo -u $SUDO_USER ./start.sh

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Access your application:"
echo "   Local:  http://localhost:3119"
echo "   Domain: https://agent.matrixlab.work"
echo ""
echo "📝 Useful commands:"
echo "   View logs:  tail -f logs/app.log"
echo "   Stop app:   ./stop.sh"
echo "   Restart:    ./stop.sh && ./start.sh"
echo ""
