#!/bin/bash

# SSL Certificate Setup Script for agent.matrixlab.work
# This script uses Let's Encrypt certbot to obtain SSL certificates

set -e

DOMAIN="agent.matrixlab.work"
EMAIL="admin@matrixlab.work"  # Change this to your email

echo "🔐 Setting up SSL certificate for $DOMAIN"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root (use sudo)"
    exit 1
fi

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    
    # Detect OS and install accordingly
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y certbot python3-certbot-nginx
    else
        echo "⚠️  Unsupported OS. Please install certbot manually."
        exit 1
    fi
fi

# Stop nginx temporarily if running
if systemctl is-active --quiet nginx; then
    echo "⏸️  Stopping nginx temporarily..."
    systemctl stop nginx
    NGINX_WAS_RUNNING=true
else
    NGINX_WAS_RUNNING=false
fi

# Obtain certificate using standalone mode
echo "📜 Obtaining SSL certificate..."
certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Copy nginx configuration
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

if [ ! -d "$NGINX_CONF_DIR" ]; then
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
fi

echo "📝 Installing nginx configuration..."
cp nginx.conf "$NGINX_CONF_DIR/agent.matrixlab.work.conf"

# Enable site if using sites-available/sites-enabled structure
if [ "$NGINX_CONF_DIR" = "/etc/nginx/sites-available" ]; then
    ln -sf "$NGINX_CONF_DIR/agent.matrixlab.work.conf" "$NGINX_ENABLED_DIR/agent.matrixlab.work.conf"
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t

# Start or reload nginx
if [ "$NGINX_WAS_RUNNING" = true ]; then
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
else
    echo "▶️  Starting nginx..."
    systemctl start nginx
fi

# Enable nginx to start on boot
systemctl enable nginx

# Setup auto-renewal
echo "⏰ Setting up automatic certificate renewal..."
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
fi

echo ""
echo "✅ SSL certificate setup complete!"
echo "🌐 Your site is now available at: https://$DOMAIN"
echo "📜 Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo "🔄 Auto-renewal configured (runs daily at 3 AM)"
echo ""
echo "Next steps:"
echo "1. Make sure port 80 and 443 are open in your firewall"
echo "2. Ensure DNS A record for $DOMAIN points to this server"
echo "3. Start the application: ./start.sh"
