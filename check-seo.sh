#!/bin/bash

# Matrix Agent SEO Check Script

echo "🔍 Matrix Agent SEO Verification"
echo "================================="
echo ""

DOMAIN="https://agent.matrixlab.work"

# Check robots.txt
echo "📄 Checking robots.txt..."
if curl -s "$DOMAIN/robots.txt" | grep -q "User-agent"; then
    echo "✅ robots.txt is accessible"
else
    echo "❌ robots.txt not found"
fi

# Check sitemap.xml
echo ""
echo "🗺️  Checking sitemap.xml..."
if curl -s "$DOMAIN/sitemap.xml" | grep -q "urlset"; then
    echo "✅ sitemap.xml is accessible"
else
    echo "❌ sitemap.xml not found"
fi

# Check humans.txt
echo ""
echo "👥 Checking humans.txt..."
if curl -s "$DOMAIN/humans.txt" | grep -q "TEAM"; then
    echo "✅ humans.txt is accessible"
else
    echo "❌ humans.txt not found"
fi

# Check security.txt
echo ""
echo "🔒 Checking security.txt..."
if curl -s "$DOMAIN/.well-known/security.txt" | grep -q "Contact"; then
    echo "✅ security.txt is accessible"
else
    echo "❌ security.txt not found"
fi

# Check manifest
echo ""
echo "📱 Checking manifest..."
if curl -s "$DOMAIN/site.webmanifest" | grep -q "Matrix Agent"; then
    echo "✅ Web manifest is accessible"
else
    echo "❌ Web manifest not found"
fi

# Check meta tags
echo ""
echo "🏷️  Checking meta tags..."
HTML=$(curl -s "$DOMAIN/")

if echo "$HTML" | grep -q "og:title"; then
    echo "✅ Open Graph tags found"
else
    echo "❌ Open Graph tags missing"
fi

if echo "$HTML" | grep -q "twitter:card"; then
    echo "✅ Twitter Card tags found"
else
    echo "❌ Twitter Card tags missing"
fi

if echo "$HTML" | grep -q "application/ld+json"; then
    echo "✅ Schema.org structured data found"
else
    echo "❌ Schema.org structured data missing"
fi

# Check SSL
echo ""
echo "🔐 Checking SSL..."
if curl -I "$DOMAIN" 2>&1 | grep -q "HTTP/2 200"; then
    echo "✅ HTTPS is working"
else
    echo "❌ HTTPS issue detected"
fi

# Check response headers
echo ""
echo "📋 Security Headers:"
HEADERS=$(curl -I -s "$DOMAIN")

if echo "$HEADERS" | grep -q "strict-transport-security"; then
    echo "✅ HSTS enabled"
else
    echo "⚠️  HSTS not found"
fi

if echo "$HEADERS" | grep -q "x-frame-options"; then
    echo "✅ X-Frame-Options set"
else
    echo "⚠️  X-Frame-Options not found"
fi

if echo "$HEADERS" | grep -q "x-content-type-options"; then
    echo "✅ X-Content-Type-Options set"
else
    echo "⚠️  X-Content-Type-Options not found"
fi

echo ""
echo "================================="
echo "✅ SEO Check Complete!"
echo ""
echo "Next steps:"
echo "1. Submit sitemap to Google Search Console"
echo "2. Generate og-image.jpg (1200x630)"
echo "3. Configure Google Analytics"
echo "4. Test with PageSpeed Insights"
echo ""
