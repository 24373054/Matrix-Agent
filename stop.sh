#!/bin/bash

# Matrix Agent Stop Script
# Usage: ./stop.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "ℹ️  Matrix Agent (Production Mode)"
echo ""
echo "Static files are served directly by Nginx."
echo "No background process to stop."
echo ""
echo "To rebuild and redeploy: ./start.sh"
echo "To start dev server: ./start-dev.sh"
