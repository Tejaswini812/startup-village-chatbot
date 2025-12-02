# ⚡ Quick Deploy Commands for villagecounty.in

## 🚨 IMPORTANT: This ONLY affects villagecounty.in, NOT your other projects!

---

## 📋 Step-by-Step Commands

### 1. SSH into Server
```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

### 2. Create Project Directory
```bash
mkdir -p /var/www/villagecounty
cd /var/www/villagecounty
```

### 3. Upload Your Project
**From your local machine (Windows):**
```powershell
# Using SCP (in PowerShell)
scp -r startup-village-county root@31.97.233.176:/var/www/villagecounty/
```

**OR use FileZilla/WinSCP:**
- Host: `31.97.233.176`
- User: `root`
- Password: `Startup8093@123`
- Upload to: `/var/www/villagecounty/`

### 4. Get Hostinger Port
- Login to Hostinger hPanel
- Go to Node.js section
- Find villagecounty.in app
- Note the **Port** number (e.g., `3000`, `5000`, `8080`)

### 5. Configure Backend
```bash
cd /var/www/villagecounty/startup-village-county/backend
nano .env
```

**Set these (replace YOUR_PORT):**
```env
PORT=YOUR_PORT
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-village-county
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://villagecounty.in
UPLOAD_PATH=/var/www/villagecounty/startup-village-county/backend/uploads
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### 6. Run Deployment Script
```bash
cd /var/www/villagecounty/startup-village-county/backend
chmod +x deploy-villagecounty.sh
./deploy-villagecounty.sh
```

**OR manually:**
```bash
# Install dependencies
cd /var/www/villagecounty/startup-village-county/backend
npm install

# Create upload directories
mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}
chmod -R 755 uploads

# Install PM2 (if not installed)
npm install -g pm2

# Start backend
cd /var/www/villagecounty/startup-village-county
pm2 start ecosystem.config.js --env production --name villagecounty-backend
pm2 save
```

### 7. Configure NGINX (Isolated Config)
```bash
sudo nano /etc/nginx/sites-available/villagecounty.in
```

**Paste this (replace YOUR_PORT):**
```nginx
server {
    listen 80;
    server_name villagecounty.in www.villagecounty.in;
    
    location / {
        root /var/www/villagecounty/startup-village-county/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:YOUR_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads/ {
        alias /var/www/villagecounty/startup-village-county/backend/uploads/;
    }
}
```

**Enable and reload:**
```bash
sudo ln -s /etc/nginx/sites-available/villagecounty.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Build Frontend
```bash
cd /var/www/villagecounty/startup-village-county
npm install
npm run build
```

### 9. Test
```bash
# Test backend
curl http://localhost:YOUR_PORT/api/health

# Test through domain
curl http://villagecounty.in/api/health
```

### 10. Setup SSL (Optional)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d villagecounty.in -d www.villagecounty.in
```

---

## ✅ Verify Everything Works

```bash
# Check PM2 (should see villagecounty-backend)
pm2 list

# Check backend logs
pm2 logs villagecounty-backend

# Check NGINX
sudo systemctl status nginx

# Test endpoints
curl http://villagecounty.in/api/health
curl http://villagecounty.in/api/hotels
```

---

## 🔄 Update Commands

**When you make changes:**
```bash
cd /var/www/villagecounty/startup-village-county
git pull  # or upload new files
npm run build
pm2 restart villagecounty-backend
```

---

## 🐛 Quick Fixes

**Backend not starting?**
```bash
pm2 logs villagecounty-backend
```

**404 errors?**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**File uploads not working?**
```bash
cd /var/www/villagecounty/startup-village-county/backend
chmod -R 755 uploads
```

---

**That's it! Your villagecounty.in is deployed! 🎉**


