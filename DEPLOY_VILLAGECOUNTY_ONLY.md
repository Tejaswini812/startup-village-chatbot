# 🎯 Deploy villagecounty.in ONLY (Isolated from Other Projects)

## ⚠️ IMPORTANT: This guide ONLY affects villagecounty.in
**We will NOT touch your other 3 projects on the server!**

---

## 📋 Pre-Deployment Checklist

Before starting, verify:
- ✅ SSH access: `ssh root@31.97.233.176`
- ✅ Password: `Startup8093@123`
- ✅ Other projects are running fine (don't touch them!)
- ✅ You have the Hostinger Node.js port for villagecounty.in

---

## 🔍 Step 1: Check Current Server Status

**SSH into your server:**
```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

**Check what's already running:**
```bash
# Check PM2 processes (see all running apps)
pm2 list

# Check NGINX sites
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check what ports are in use
netstat -tulpn | grep LISTEN
```

**⚠️ DO NOT STOP OR MODIFY ANY EXISTING PROCESSES!**

---

## 📁 Step 2: Create Isolated Project Directory

**Create a dedicated directory for villagecounty.in:**
```bash
# Create project directory (isolated from other projects)
mkdir -p /var/www/villagecounty
cd /var/www/villagecounty

# Set ownership
chown -R $USER:$USER /var/www/villagecounty
```

---

## 📦 Step 3: Upload Your Project

**Option A: Using Git (Recommended)**
```bash
cd /var/www/villagecounty
git clone YOUR_REPO_URL .
# OR if you have the files locally, use SCP:
```

**Option B: Using SCP from your local machine:**
```bash
# From your LOCAL machine (Windows PowerShell or CMD)
# Navigate to your project folder, then:
scp -r startup-village-county root@31.97.233.176:/var/www/villagecounty/
```

**Option C: Manual Upload via FileZilla/WinSCP**
- Connect to: `31.97.233.176`
- Username: `root`
- Password: `Startup8093@123`
- Upload `startup-village-county` folder to `/var/www/villagecounty/`

---

## 🔧 Step 4: Get Hostinger Port for villagecounty.in

**In Hostinger hPanel:**
1. Go to **Node.js** section
2. Find your **villagecounty.in** app
3. Note the **Port** number (e.g., `3000`, `5000`, `8080`)
4. **Write it down!** We'll call it `YOUR_VILLAGECOUNTY_PORT`

---

## ⚙️ Step 5: Configure Backend (.env)

```bash
cd /var/www/villagecounty/startup-village-county/backend
nano .env
```

**Set these values (replace YOUR_VILLAGECOUNTY_PORT with actual port):**
```env
# Server Configuration
PORT=YOUR_VILLAGECOUNTY_PORT
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-village-county?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=https://villagecounty.in

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/villagecounty/startup-village-county/backend/uploads

# Email Configuration
EMAIL_USER=villagecounty2025@gmail.com
EMAIL_PASS=Startup@12345

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 📦 Step 6: Install Dependencies & Setup

```bash
cd /var/www/villagecounty/startup-village-county/backend

# Install dependencies
npm install

# Create upload directories
mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}

# Set permissions (important for file uploads!)
chmod -R 755 uploads
chown -R $USER:$USER uploads
```

---

## 🚀 Step 7: Start Backend with PM2 (Isolated Name)

**Use a unique PM2 name so it doesn't conflict with other projects:**
```bash
cd /var/www/villagecounty/startup-village-county

# Start with unique name
pm2 start ecosystem.config.js --env production --name villagecounty-backend

# Save PM2 config
pm2 save

# Check it's running
pm2 status

# View logs
pm2 logs villagecounty-backend
```

**✅ You should see `villagecounty-backend` in the PM2 list, separate from your other projects!**

---

## 🌐 Step 8: Configure NGINX (Isolated Config)

**Create a NEW NGINX config ONLY for villagecounty.in:**
```bash
sudo nano /etc/nginx/sites-available/villagecounty.in
```

**Add this configuration (replace YOUR_VILLAGECOUNTY_PORT):**
```nginx
server {
    listen 80;
    server_name villagecounty.in www.villagecounty.in;
    
    # Frontend (React build files)
    location / {
        root /var/www/villagecounty/startup-village-county/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes - Proxy to backend
    # ⚠️ Replace YOUR_VILLAGECOUNTY_PORT with actual port from Hostinger
    location /api/ {
        proxy_pass http://localhost:YOUR_VILLAGECOUNTY_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Serve uploaded files
    location /uploads/ {
        alias /var/www/villagecounty/startup-village-county/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Enable the site:**
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/villagecounty.in /etc/nginx/sites-enabled/

# Test NGINX configuration
sudo nginx -t

# If test passes, reload NGINX (this won't affect other sites)
sudo systemctl reload nginx
```

---

## 📦 Step 9: Build and Deploy Frontend

```bash
cd /var/www/villagecounty/startup-village-county

# Install frontend dependencies
npm install

# Build for production
npm run build

# The dist/ folder is already configured in NGINX above
# No need to copy files - NGINX serves from dist/ directly
```

---

## ✅ Step 10: Test Everything

**Test 1: Backend Health Check**
```bash
# Test backend directly
curl http://localhost:YOUR_VILLAGECOUNTY_PORT/api/health
```

**Test 2: Through NGINX**
```bash
curl http://villagecounty.in/api/health
```

**Test 3: From Browser**
- Open: `http://villagecounty.in/api/health`
- Should see: `{"status":"OK","message":"Startup Village County API is running",...}`

---

## 🔒 Step 11: Setup SSL (Let's Encrypt)

**Install Certbot:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

**Get SSL Certificate:**
```bash
sudo certbot --nginx -d villagecounty.in -d www.villagecounty.in
```

**Follow prompts:**
- Enter email
- Agree to terms
- Choose redirect HTTP to HTTPS

**Auto-renewal (already configured):**
```bash
sudo certbot renew --dry-run
```

---

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
# Check PM2
pm2 status
pm2 logs villagecounty-backend --lines 50

# Check if port is in use
netstat -tulpn | grep YOUR_VILLAGECOUNTY_PORT
```

### 404 Errors on API?
```bash
# Check NGINX config
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass port matches backend PORT
cat /etc/nginx/sites-available/villagecounty.in | grep proxy_pass
```

### 500 Errors?
```bash
# Check backend logs
pm2 logs villagecounty-backend

# Common issues:
# - MongoDB connection failed → Check MONGODB_URI in .env
# - File permission issues → Run: chmod -R 755 uploads
# - Missing dependencies → Run: npm install
```

### File Uploads Not Working?
```bash
# Fix permissions
cd /var/www/villagecounty/startup-village-county/backend
chmod -R 755 uploads
chown -R $USER:$USER uploads

# Check if directory exists
ls -la uploads/
```

### Signup/Login Not Working?
```bash
# Check MongoDB connection in logs
pm2 logs villagecounty-backend | grep -i mongo

# Test MongoDB connection
# (If using MongoDB Atlas, check connection string)
```

---

## 📊 Monitoring Commands

**Check Backend Status:**
```bash
pm2 status villagecounty-backend
pm2 logs villagecounty-backend --lines 20
```

**Check NGINX Status:**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Check Disk Space:**
```bash
df -h
```

**Check Memory:**
```bash
free -h
```

---

## 🔄 Update/Deploy New Version

**When you make changes:**
```bash
cd /var/www/villagecounty/startup-village-county

# Pull latest code (if using git)
git pull

# Rebuild frontend
npm run build

# Restart backend
pm2 restart villagecounty-backend

# Check logs
pm2 logs villagecounty-backend --lines 20
```

---

## ⚠️ Important Notes

1. **Isolated from Other Projects:**
   - PM2 name: `villagecounty-backend` (unique)
   - Directory: `/var/www/villagecounty/` (separate)
   - NGINX config: `villagecounty.in` (domain-specific)
   - Port: Your assigned Hostinger port (separate from other projects)

2. **Don't Touch:**
   - Other PM2 processes
   - Other NGINX configs
   - Other project directories
   - System-wide settings

3. **File Permissions:**
   - Uploads must be writable: `chmod 755 uploads`
   - Frontend files: `chmod 755 dist/`

4. **MongoDB:**
   - Use MongoDB Atlas (cloud) for production
   - Don't use local MongoDB if other projects use it

---

## ✅ Final Checklist

- [ ] Project uploaded to `/var/www/villagecounty/`
- [ ] `.env` file configured with correct PORT
- [ ] Dependencies installed (`npm install`)
- [ ] Upload directories created with correct permissions
- [ ] Backend running on PM2 (`pm2 status` shows `villagecounty-backend`)
- [ ] NGINX config created for `villagecounty.in` only
- [ ] NGINX reloaded (`sudo systemctl reload nginx`)
- [ ] Frontend built (`npm run build`)
- [ ] Health check works (`curl http://villagecounty.in/api/health`)
- [ ] SSL certificate installed (optional but recommended)
- [ ] Signup/Login tested
- [ ] File uploads tested

---

## 🆘 Need Help?

**Check logs:**
```bash
# Backend logs
pm2 logs villagecounty-backend

# NGINX logs
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

**Test endpoints:**
```bash
# Health check
curl http://localhost:YOUR_VILLAGECOUNTY_PORT/api/health

# Test hotels endpoint
curl http://localhost:YOUR_VILLAGECOUNTY_PORT/api/hotels

# Test events endpoint
curl http://localhost:YOUR_VILLAGECOUNTY_PORT/api/events
```

---

**Your villagecounty.in is now deployed and isolated from other projects! 🎉**


