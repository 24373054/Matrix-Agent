#!/bin/bash

# Matrix Agent Status Check Script

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🔍 Matrix Agent Status Check"
echo "============================"
echo ""

# Check if PID file exists
if [ -f "logs/app.pid" ]; then
    PID=$(cat logs/app.pid)
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Application: RUNNING (PID: $PID)"
        
        # Get process info
        CPU=$(ps -p $PID -o %cpu --no-headers | xargs)
        MEM=$(ps -p $PID -o %mem --no-headers | xargs)
        UPTIME=$(ps -p $PID -o etime --no-headers | xargs)
        
        echo "   CPU Usage: ${CPU}%"
        echo "   Memory Usage: ${MEM}%"
        echo "   Uptime: ${UPTIME}"
    else
        echo "❌ Application: STOPPED (stale PID: $PID)"
    fi
else
    echo "❌ Application: NOT RUNNING (no PID file)"
fi

echo ""

# Check port 3119
PORT_CHECK=$(lsof -ti:3119 || true)
if [ ! -z "$PORT_CHECK" ]; then
    echo "✅ Port 3119: IN USE (PID: $PORT_CHECK)"
else
    echo "❌ Port 3119: FREE"
fi

echo ""

# Check Nginx
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "✅ Nginx: RUNNING"
        
        # Check if our config exists
        if [ -f "/etc/nginx/sites-available/agent.matrixlab.work.conf" ] || [ -f "/etc/nginx/conf.d/agent.matrixlab.work.conf" ]; then
            echo "   Config: INSTALLED"
        else
            echo "   Config: NOT FOUND"
        fi
    else
        echo "⚠️  Nginx: STOPPED"
    fi
else
    echo "ℹ️  Nginx: NOT INSTALLED"
fi

echo ""

# Check SSL certificate
if [ -d "/etc/letsencrypt/live/agent.matrixlab.work" ]; then
    echo "✅ SSL Certificate: INSTALLED"
    
    # Check expiry
    CERT_FILE="/etc/letsencrypt/live/agent.matrixlab.work/cert.pem"
    if [ -f "$CERT_FILE" ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" 2>/dev/null | cut -d= -f2)
        echo "   Expires: $EXPIRY"
    fi
else
    echo "❌ SSL Certificate: NOT FOUND"
fi

echo ""

# Check logs
if [ -f "logs/app.log" ]; then
    LOG_SIZE=$(du -h logs/app.log | cut -f1)
    LOG_LINES=$(wc -l < logs/app.log)
    echo "📋 Log File: logs/app.log"
    echo "   Size: $LOG_SIZE"
    echo "   Lines: $LOG_LINES"
    
    # Show last error if any
    LAST_ERROR=$(grep -i "error" logs/app.log | tail -1 || true)
    if [ ! -z "$LAST_ERROR" ]; then
        echo "   Last Error: ${LAST_ERROR:0:80}..."
    fi
else
    echo "ℹ️  No log file found"
fi

echo ""
echo "============================"

# Quick actions
if [ -f "logs/app.pid" ] && ps -p $(cat logs/app.pid) > /dev/null 2>&1; then
    echo "💡 Quick actions:"
    echo "   View logs:  tail -f logs/app.log"
    echo "   Stop app:   ./stop.sh"
    echo "   Restart:    ./stop.sh && ./start.sh"
else
    echo "💡 Quick actions:"
    echo "   Start app:  ./start.sh"
fi
