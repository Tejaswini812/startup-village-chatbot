#!/bin/bash

# Deployment Script for villagecounty.in ONLY
# This script is isolated and won't affect other projects

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Deploying villagecounty.in ONLY${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${YELLOW}⚠️  Running as non-root. Some commands may need sudo.${NC}"
   SUDO="sudo"
else
   SUDO=""
fi

# Project directory
PROJECT_DIR="/var/www/villagecounty/startup-village-county"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${YELLOW}📁 Project directory: $PROJECT_DIR${NC}"
echo ""

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    echo -e "${YELLOW}Please upload your project first!${NC}"
    exit 1
fi

# Step 1: Install backend dependencies
echo -e "${YELLOW}Step 1: Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Create upload directories
echo -e "${YELLOW}Step 2: Creating upload directories...${NC}"
mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}
chmod -R 755 uploads
echo -e "${GREEN}✅ Upload directories created${NC}"
echo ""

# Step 3: Check .env file
echo -e "${YELLOW}Step 3: Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with:${NC}"
    echo -e "${YELLOW}  - PORT (from Hostinger panel)${NC}"
    echo -e "${YELLOW}  - MONGODB_URI${NC}"
    echo -e "${YELLOW}  - JWT_SECRET${NC}"
    echo -e "${YELLOW}  - FRONTEND_URL${NC}"
    exit 1
fi

# Check if PORT is set
if ! grep -q "PORT=" .env; then
    echo -e "${RED}❌ PORT not set in .env file!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Step 4: Install PM2 if not installed
echo -e "${YELLOW}Step 4: Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✅ PM2 already installed (version: $PM2_VERSION)${NC}"
fi
echo ""

# Step 5: Stop existing villagecounty-backend if running
echo -e "${YELLOW}Step 5: Managing PM2 process...${NC}"
cd "$PROJECT_DIR"

if pm2 list | grep -q "villagecounty-backend"; then
    echo -e "${YELLOW}Stopping existing villagecounty-backend...${NC}"
    pm2 stop villagecounty-backend
    pm2 delete villagecounty-backend
fi

# Step 6: Start backend with PM2
echo -e "${YELLOW}Step 6: Starting backend with PM2...${NC}"
pm2 start ecosystem.config.js --env production --name villagecounty-backend
pm2 save

echo -e "${GREEN}✅ Backend started with PM2${NC}"
echo ""

# Step 7: Check status
echo -e "${YELLOW}Step 7: Checking backend status...${NC}"
sleep 2
pm2 status villagecounty-backend

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Check backend logs:"
echo "   pm2 logs villagecounty-backend"
echo ""
echo "2. Test backend:"
echo "   curl http://localhost:YOUR_PORT/api/health"
echo ""
echo "3. Configure NGINX (if not done):"
echo "   sudo nano /etc/nginx/sites-available/villagecounty.in"
echo "   sudo ln -s /etc/nginx/sites-available/villagecounty.in /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. Build frontend:"
echo "   cd $PROJECT_DIR"
echo "   npm install"
echo "   npm run build"
echo ""
echo -e "${GREEN}Your villagecounty.in backend is now running! 🎉${NC}"
echo ""


