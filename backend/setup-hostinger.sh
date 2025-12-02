#!/bin/bash

# Hostinger VPS Setup Script for Startup Village County Backend
# Run this script on your Hostinger VPS after SSH login

echo "🚀 Setting up Startup Village County Backend for Hostinger VPS..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root. Run as your user account.${NC}"
   exit 1
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}📁 Project directory: $PROJECT_DIR${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
echo ""

# Step 2: Check npm
echo -e "${YELLOW}Step 2: Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm version: $NPM_VERSION${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}Step 3: Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Create upload directories
echo -e "${YELLOW}Step 4: Creating upload directories...${NC}"
mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}
chmod -R 755 uploads
echo -e "${GREEN}✅ Upload directories created${NC}"
echo ""

# Step 5: Check .env file
echo -e "${YELLOW}Step 5: Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file and set:${NC}"
        echo -e "${YELLOW}   - PORT (get from Hostinger panel)${NC}"
        echo -e "${YELLOW}   - MONGODB_URI${NC}"
        echo -e "${YELLOW}   - JWT_SECRET${NC}"
        echo -e "${YELLOW}   - FRONTEND_URL${NC}"
        echo ""
        echo -e "${YELLOW}   Run: nano .env${NC}"
    else
        echo -e "${RED}❌ env.example not found. Please create .env manually.${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    # Check if PORT is set
    if ! grep -q "PORT=" .env; then
        echo -e "${YELLOW}⚠️  PORT not set in .env. Please add it.${NC}"
    fi
fi
echo ""

# Step 6: Install PM2
echo -e "${YELLOW}Step 6: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install PM2${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✅ PM2 already installed (version: $PM2_VERSION)${NC}"
fi
echo ""

# Step 7: Create logs directory
echo -e "${YELLOW}Step 7: Creating logs directory...${NC}"
cd "$PROJECT_DIR"
mkdir -p logs
chmod 755 logs
echo -e "${GREEN}✅ Logs directory created${NC}"
echo ""

# Step 8: Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Edit .env file:"
echo "   cd $SCRIPT_DIR"
echo "   nano .env"
echo "   - Set PORT (from Hostinger panel)"
echo "   - Set MONGODB_URI"
echo "   - Set JWT_SECRET"
echo "   - Set FRONTEND_URL"
echo ""
echo "2. Start backend with PM2:"
echo "   cd $PROJECT_DIR"
echo "   pm2 start ecosystem.config.js --env production"
echo ""
echo "3. Save PM2 configuration:"
echo "   pm2 save"
echo ""
echo "4. Setup PM2 to start on boot:"
echo "   pm2 startup"
echo "   (Follow the command it outputs)"
echo ""
echo "5. Check if backend is running:"
echo "   pm2 status"
echo "   pm2 logs startup-village-backend"
echo ""
echo "6. Test backend:"
echo "   curl http://localhost:YOUR_PORT/api/health"
echo ""
echo -e "${GREEN}For detailed instructions, see: HOSTINGER_DEPLOYMENT_GUIDE.md${NC}"
echo ""

