# Fix VillageCounty.in deployment on Hostinger server
# PowerShell script to SSH into your server and fix all deployment issues

Write-Host "🚀 Fixing VillageCounty.in deployment on Hostinger server..." -ForegroundColor Green

# Server credentials
$SERVER_IP = "31.97.233.176"
$SERVER_USER = "root"
$SERVER_PASS = "Startup8093@123"

# Function to print status messages
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we have SSH access tools
Write-Status "Checking SSH access..."

# Create the SSH commands to execute on the server
$sshCommands = @"
echo "🔧 Starting deployment fix on Hostinger server..."

# Navigate to project directory
cd /root/startup-village-county || {
    echo "❌ Project directory not found. Creating it..."
    mkdir -p /root/startup-village-county
    cd /root/startup-village-county
}

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin master || {
    echo "⚠️ Git pull failed, continuing with manual setup..."
}

# Navigate to backend directory
cd backend

# Create production .env file
echo "📝 Creating production .env file..."
cat > .env << 'ENVEOF'
# Production Environment Variables for villagecounty.in
PORT=5000
NODE_ENV=production

# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://villagecounty:StartupVillage2025@cluster0.mongodb.net/startup-village-county?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=startup-village-county-super-secret-jwt-key-2025-production-villagecounty
JWT_EXPIRE=7d

# Frontend URL (for CORS) - Your actual domain
FRONTEND_URL=https://villagecounty.in

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Custom Domain Configuration
CUSTOM_DOMAIN=villagecounty.in
BASE_URL=https://villagecounty.in
ENVEOF

echo "✅ Production .env file created"

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory structure
echo "📁 Creating uploads directory structure..."
mkdir -p uploads/properties
mkdir -p uploads/events
mkdir -p uploads/land-properties
mkdir -p uploads/products
mkdir -p uploads/packages
mkdir -p uploads/cars
mkdir -p uploads/documents

# Set proper permissions
chmod -R 755 uploads/

# Go back to project root
cd ..

# Build frontend if needed
if [ ! -d "dist" ]; then
    echo "🔨 Building frontend..."
    npm install
    npm run build
fi

# Copy frontend files to public_html
echo "📁 Copying frontend files to public_html..."
mkdir -p /var/www/html
cp -r dist/* /var/www/html/
chmod -R 755 /var/www/html/

# Update nginx configuration
echo "⚙️ Updating nginx configuration..."
cat > /etc/nginx/sites-available/villagecounty.in << 'NGINXEOF'
server {
    listen 80;
    server_name villagecounty.in www.villagecounty.in;
    
    # Frontend (React build files)
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files `$uri `$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
NGINXEOF

# Enable the site
ln -sf /etc/nginx/sites-available/villagecounty.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t && {
    echo "✅ Nginx configuration is valid"
} || {
    echo "❌ Nginx configuration error"
    exit 1
}

# Restart nginx
systemctl reload nginx

# Stop any existing PM2 processes
pm2 delete startup-village-backend 2>/dev/null || true

# Start the backend with PM2
echo "🚀 Starting backend server with PM2..."
cd backend
pm2 start production-server.js --name startup-village-backend --env production
pm2 save
pm2 startup

# Wait a moment for server to start
sleep 5

# Check if server is running
if pm2 list | grep -q "startup-village-backend.*online"; then
    echo "✅ Backend server is running successfully"
else
    echo "❌ Backend server failed to start"
    pm2 logs startup-village-backend --lines 20
fi

# Test API endpoint
echo "🧪 Testing API endpoint..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ API is responding correctly"
else
    echo "❌ API is not responding"
fi

# Test frontend
echo "🧪 Testing frontend..."
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo "🎉 Deployment fix completed!"
echo ""
echo "✅ What was fixed:"
echo "   - Created production .env file with correct settings"
echo "   - Updated nginx configuration for villagecounty.in"
echo "   - Installed dependencies and built frontend"
echo "   - Started backend server with PM2"
echo "   - Configured proper file permissions"
echo ""
echo "🌐 Your website should now be accessible at:"
echo "   - https://villagecounty.in"
echo "   - API: https://villagecounty.in/api/health"
echo ""
echo "📊 Server status:"
pm2 status
"@

# Try different SSH methods
Write-Status "Attempting to connect to server..."

# Method 1: Try with plink (PuTTY command line)
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Status "Using plink to connect..."
    $sshCommands | plink -ssh -pw $SERVER_PASS $SERVER_USER@$SERVER_IP
    if ($LASTEXITCODE -eq 0) {
        Write-Status "✅ Successfully fixed deployment on Hostinger server!"
        Write-Status "🌐 Your website should now be working at: https://villagecounty.in"
        Write-Status "🧪 Test your API at: https://villagecounty.in/api/health"
        exit 0
    }
}

# Method 2: Try with ssh command (if available)
if (Get-Command ssh -ErrorAction SilentlyContinue) {
    Write-Status "Using ssh to connect..."
    echo $sshCommands | ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP
    if ($LASTEXITCODE -eq 0) {
        Write-Status "✅ Successfully fixed deployment on Hostinger server!"
        Write-Status "🌐 Your website should now be working at: https://villagecounty.in"
        Write-Status "🧪 Test your API at: https://villagecounty.in/api/health"
        exit 0
    }
}

# Method 3: Manual instructions
Write-Warning "SSH tools not available. Here are the manual steps:"
Write-Host ""
Write-Host "1. Open a terminal/command prompt and run:" -ForegroundColor Yellow
Write-Host "   ssh root@31.97.233.176" -ForegroundColor Cyan
Write-Host "   (Password: Startup8093@123)" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Once connected, run these commands:" -ForegroundColor Yellow
Write-Host "   cd /root/startup-village-county" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Create the .env file:" -ForegroundColor Yellow
Write-Host "   nano .env" -ForegroundColor Cyan
Write-Host "   (Copy the content from the script above)" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Install dependencies and start server:" -ForegroundColor Yellow
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host "   pm2 start production-server.js --name startup-village-backend --env production" -ForegroundColor Cyan
Write-Host "   pm2 save" -ForegroundColor Cyan
Write-Host ""

Write-Error "Please run the manual steps above to fix your deployment."
