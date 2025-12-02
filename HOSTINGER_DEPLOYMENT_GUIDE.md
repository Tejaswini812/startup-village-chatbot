# Hostinger VPS MERN Stack Deployment Guide

## 🚨 CRITICAL: MERN Subscription Alone is NOT Enough!

You MUST configure everything correctly for your backend to work.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ Hostinger MERN Stack VPS subscription
- ✅ SSH access to your VPS
- ✅ Domain name (villagecounty.in) pointing to your VPS
- ✅ MongoDB Atlas account OR MongoDB installed on VPS
- ✅ Node.js installed (check with `node -v`)

---

## 🔧 Step 1: Get Your Hostinger Node.js Port

**IMPORTANT:** Hostinger assigns a specific port for your Node.js app. You MUST use this port.

### How to Find Your Port:

1. Log into **Hostinger hPanel**
2. Go to **Node.js** section
3. Look for **"App Port"** or **"Port"** - it might be something like:
   - `3000`
   - `8080`
   - `5000`
   - Or a custom port Hostinger assigned

4. **Note this port number** - you'll need it!

---

## 📝 Step 2: Update Environment Variables

Create/update `.env` file in `backend/` directory:

```bash
cd startup-village-county/backend
nano .env
```

Add these variables (replace with YOUR values):

```env
# Server Configuration
PORT=YOUR_HOSTINGER_PORT  # ⚠️ Use the port from Step 1!
NODE_ENV=production

# Database Configuration
# Option 1: MongoDB Atlas (Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-village-county?retryWrites=true&w=majority

# Option 2: Local MongoDB (if installed on VPS)
# MONGODB_URI=mongodb://localhost:27017/startup-village-county

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://villagecounty.in

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Email Configuration (Gmail)
EMAIL_USER=villagecounty2025@gmail.com
EMAIL_PASS=Startup@12345

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## 🚀 Step 3: Install Dependencies

```bash
cd startup-village-county/backend
npm install
```

---

## 📁 Step 4: Create Upload Directories

```bash
# Create upload directories with proper permissions
mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}

# Set proper permissions (important for file uploads!)
chmod -R 755 uploads
```

---

## 🔄 Step 5: Install and Configure PM2

PM2 keeps your backend running 24/7.

```bash
# Install PM2 globally
npm install -g pm2

# Start your backend with PM2
cd startup-village-county
pm2 start ecosystem.config.js --env production

# Save PM2 configuration (so it restarts on server reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually something like: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u yourusername --hp /home/yourusername)
```

### PM2 Useful Commands:

```bash
# Check if backend is running
pm2 status

# View logs
pm2 logs startup-village-backend

# Restart backend
pm2 restart startup-village-backend

# Stop backend
pm2 stop startup-village-backend

# View real-time logs
pm2 logs startup-village-backend --lines 50
```

---

## 🌐 Step 6: Configure NGINX Reverse Proxy

NGINX forwards `/api` requests to your Node.js backend.

### Update NGINX Configuration:

```bash
sudo nano /etc/nginx/sites-available/villagecounty.in
```

**Replace the content with** (update PORT with your Hostinger port):

```nginx
server {
    listen 80;
    server_name villagecounty.in www.villagecounty.in;
    
    # Frontend (React build files)
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes - Proxy to backend
    # ⚠️ IMPORTANT: Replace YOUR_PORT with your Hostinger Node.js port!
    location /api/ {
        proxy_pass http://localhost:YOUR_PORT;
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
        alias /path/to/your/project/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Save and test:**

```bash
# Test NGINX configuration
sudo nginx -t

# If test passes, reload NGINX
sudo systemctl reload nginx
```

---

## 📦 Step 7: Deploy Frontend

```bash
# Build frontend
cd startup-village-county
npm install
npm run build

# Copy build files to web root
sudo cp -r dist/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## ✅ Step 8: Test Your Backend

### Test 1: Check if backend is running

```bash
# SSH into your VPS
curl http://localhost:YOUR_PORT/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Startup Village County API is running",
  ...
}
```

### Test 2: Test through NGINX

```bash
curl https://villagecounty.in/api/health
```

### Test 3: Test from browser

Open: `https://villagecounty.in/api/health`

---

## 🐛 Troubleshooting

### Problem 1: Backend not starting

**Check PM2 logs:**
```bash
pm2 logs startup-village-backend
```

**Common issues:**
- ❌ Wrong PORT in `.env` → Check Hostinger panel for correct port
- ❌ MongoDB not connected → Check `MONGODB_URI` in `.env`
- ❌ Missing dependencies → Run `npm install` in backend folder

### Problem 2: 404 errors on API calls

**Check:**
1. Is backend running? `pm2 status`
2. Is NGINX proxy correct? Check `/etc/nginx/sites-available/villagecounty.in`
3. Is the port in NGINX matching your backend port?

### Problem 3: 500 errors on API calls

**Check backend logs:**
```bash
pm2 logs startup-village-backend --lines 100
```

**Common causes:**
- MongoDB connection failed
- Missing upload directories
- File permission issues

### Problem 4: File uploads not working

**Fix permissions:**
```bash
cd startup-village-county/backend
chmod -R 755 uploads
chown -R $USER:$USER uploads
```

### Problem 5: CORS errors

**Check:**
1. `FRONTEND_URL` in `.env` matches your domain
2. CORS settings in `production-server.js` allow your domain

---

## 🔒 Security Checklist

- [ ] Changed `JWT_SECRET` to a strong random string
- [ ] MongoDB password is strong
- [ ] `.env` file is not committed to git (add to `.gitignore`)
- [ ] Firewall is configured (only allow necessary ports)
- [ ] SSL certificate is installed (Let's Encrypt)

---

## 📞 Quick Reference

### Backend Commands:
```bash
# Start
pm2 start ecosystem.config.js --env production

# Stop
pm2 stop startup-village-backend

# Restart
pm2 restart startup-village-backend

# Logs
pm2 logs startup-village-backend

# Status
pm2 status
```

### NGINX Commands:
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx
```

---

## 🎯 Final Checklist

Before considering deployment complete:

- [ ] Backend running on PM2 (`pm2 status` shows "online")
- [ ] Backend accessible at `http://localhost:YOUR_PORT/api/health`
- [ ] NGINX proxy working (`https://villagecounty.in/api/health` works)
- [ ] Frontend deployed to `/var/www/html`
- [ ] MongoDB connected (check backend logs)
- [ ] File uploads working (test by uploading a hotel/property)
- [ ] Signup/Login working
- [ ] All API endpoints responding

---

## 💡 Important Notes

1. **PORT is Critical:** Hostinger assigns a specific port. You MUST use it in:
   - `.env` file (`PORT=YOUR_PORT`)
   - NGINX proxy (`proxy_pass http://localhost:YOUR_PORT`)
   - PM2 ecosystem config

2. **PM2 is Required:** Without PM2, your backend stops when you close SSH. Always use PM2!

3. **NGINX is Required:** Without NGINX reverse proxy, frontend cannot reach backend.

4. **MongoDB:** Use MongoDB Atlas (cloud) for production. Local MongoDB on VPS can cause issues.

5. **File Permissions:** Upload directories must be writable. Use `chmod 755`.

---

## 🆘 Still Having Issues?

1. Check PM2 logs: `pm2 logs startup-village-backend`
2. Check NGINX logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -u nginx -f`
4. Verify MongoDB connection: Check backend logs for connection errors
5. Test backend directly: `curl http://localhost:YOUR_PORT/api/health`

---

**Good luck with your deployment! 🚀**

