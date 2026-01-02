#!/bin/bash

# Matrix Agent Start Script (Development Mode)
# Usage: ./start-dev.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starting Matrix Agent (Development Mode)..."

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

# Kill any existing process on port 3119
echo "🔍 Checking for existing processes on port 3119..."
PID=$(lsof -ti:3119 || true)
if [ ! -z "$PID" ]; then
    echo "⚠️  Killing existing process on port 3119 (PID: $PID)"
    kill -9 $PID
    sleep 2
fi

# Start the application in background
echo "✨ Starting development server on port 3119..."
nohup npm run dev > logs/app.log 2>&1 &
APP_PID=$!

# Save PID to file
mkdir -p logs
echo $APP_PID > logs/app.pid

echo "✅ Matrix Agent started successfully!"
echo "📝 PID: $APP_PID"
echo "🌐 Local: http://localhost:3119"
echo "🌐 Network: http://$(hostname -I | awk '{print $1}'):3119"
echo "📋 Logs: tail -f logs/app.log"
echo ""
echo "To stop: ./stop.sh"
