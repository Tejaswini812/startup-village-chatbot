#!/bin/bash

# Fix Hosting Issues Script for Startup Village County
# This script addresses common hosting problems

echo "🔧 Fixing hosting issues for Startup Village County..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# 1. Fix file permissions
print_status "Fixing file permissions..."
sudo chown -R $USER:$USER /home/$USER/startup-village-county
chmod -R 755 /home/$USER/startup-village-county
chmod +x /home/$USER/startup-village-county/fix-hosting.sh

# 2. Create necessary directories
print_status "Creating necessary directories..."
mkdir -p /home/$USER/startup-village-county/logs
mkdir -p /home/$USER/startup-village-county/backend/uploads/documents
mkdir -p /home/$USER/startup-village-county/dist

# 3. Fix MongoDB connection issues
print_status "Checking MongoDB status..."
if ! systemctl is-active --quiet mongodb; then
    print_warning "MongoDB is not running, starting it..."
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
else
    print_status "MongoDB is running"
fi

# 4. Fix Node.js and PM2 issues
print_status "Checking Node.js version..."
node_version=$(node --version 2>/dev/null)
if [ $? -ne 0 ]; then
    print_error "Node.js is not installed"
    exit 1
else
    print_status "Node.js version: $node_version"
fi

# 5. Install/update PM2
print_status "Installing/updating PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    print_status "PM2 is already installed"
fi

# 6. Fix environment file
print_status "Checking environment configuration..."
if [ ! -f /home/$USER/startup-village-county/backend/.env ]; then
    print_warning "Environment file not found, creating from example..."
    cp /home/$USER/startup-village-county/backend/env.example /home/$USER/startup-village-county/backend/.env
    print_warning "Please edit backend/.env with your configuration"
fi

# 7. Fix Nginx configuration
print_status "Checking Nginx configuration..."
if [ ! -f /etc/nginx/sites-available/startup-village ]; then
    print_warning "Nginx configuration not found, creating it..."
    sudo cp /home/$USER/startup-village-county/nginx.conf /etc/nginx/sites-available/startup-village
    sudo ln -sf /etc/nginx/sites-available/startup-village /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# 8. Test Nginx configuration
print_status "Testing Nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
    sudo systemctl reload nginx
else
    print_error "Nginx configuration has errors"
    exit 1
fi

# 9. Install dependencies
print_status "Installing/updating dependencies..."
cd /home/$USER/startup-village-county
npm run install:all

# 10. Build frontend
print_status "Building frontend..."
npm run build

# 11. Fix PM2 process
print_status "Managing PM2 process..."
pm2 delete startup-village-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# 12. Check all services
print_status "Checking all services..."

echo "=== MongoDB Status ==="
sudo systemctl status mongodb --no-pager -l

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l

echo "=== PM2 Status ==="
pm2 status

echo "=== Application Health Check ==="
sleep 5
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "✅ Application is running and healthy"
else
    print_warning "⚠️  Application health check failed"
    print_warning "Check logs with: pm2 logs startup-village-backend"
fi

# 13. Show final status
print_status "🎉 Hosting issues fix completed!"
print_status "Your application should now be accessible at:"
print_status "- Frontend: http://your-domain.com"
print_status "- API: http://your-domain.com/api"
print_status "- Health check: http://your-domain.com/api/health"

print_warning "If you still have issues:"
print_warning "1. Check logs: pm2 logs startup-village-backend"
print_warning "2. Verify environment: cat backend/.env"
print_warning "3. Test API: curl http://localhost:5000/api/health"
print_warning "4. Check Nginx: sudo nginx -t"

echo "📞 For support: connect01@startupvillagecounty.in"
