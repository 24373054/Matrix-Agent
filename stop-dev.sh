#!/bin/bash

# Matrix Agent Stop Script (Development Mode)
# Usage: ./stop-dev.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🛑 Stopping Matrix Agent (Development Mode)..."

# Check if PID file exists
if [ -f "logs/app.pid" ]; then
    PID=$(cat logs/app.pid)
    
    # Check if process is running
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Killing process (PID: $PID)..."
        kill -15 $PID
        
        # Wait for graceful shutdown
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️  Force killing process..."
            kill -9 $PID
        fi
        
        echo "✅ Process stopped successfully"
    else
        echo "ℹ️  Process not running (PID: $PID)"
    fi
    
    rm -f logs/app.pid
else
    echo "ℹ️  No PID file found"
fi

# Also kill any process on port 3119
PID_PORT=$(lsof -ti:3119 || true)
if [ ! -z "$PID_PORT" ]; then
    echo "⚠️  Killing process on port 3119 (PID: $PID_PORT)"
    kill -9 $PID_PORT
fi

echo "✅ Development server stopped"
