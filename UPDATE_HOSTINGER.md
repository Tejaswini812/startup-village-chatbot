# Update villagecounty.in on Hostinger Server

## ⚠️ IMPORTANT: This ONLY affects villagecounty.in, NT your other websites!

---

## Step 1: Connect to Server

```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

---

## Step 2: Navigate to Project Directory

```bash
cd /root/startup-village-county
```

---

## Step 3: Pull Latest Code from GitHub

```bash
# Pull latest changes
git pull origin master

# If you get conflicts, use:
# git fetch origin master
# git reset --hard origin/master
```

---

## Step 4: Update Backend

```bash
# Navigate to backend
cd backend

# Install any new dependencies
npm install

# Restart backend with PM2
cd ..
pm2 restart startup-village-backend

# Check logs
pm2 logs startup-village-backend --lines 10
```

---

## Step 5: Build and Deploy Frontend

```bash
# Make sure you're in project root
cd /root/startup-village-county

# Install frontend dependencies (if needed)
npm install

# Build frontend
npm run build

# Deploy to web root
sudo cp -r dist/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## Step 6: Verify Everything Works

```bash
# Test backend
curl https://villagecounty.in/api/health

# Test frontend
curl https://villagecounty.in/ | head -20

# Check PM2 status
pm2 status

# Check NGINX
sudo systemctl status nginx
```

---

## Quick Update Script (All-in-One)

```bash
# Connect to server first, then run:
cd /root/startup-village-county
git pull origin master
cd backend && npm install && cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
pm2 restart startup-village-backend
pm2 logs startup-village-backend --lines 5
curl https://villagecounty.in/api/health
```

---

## ✅ What This Updates

- ✅ Backend code (all routes, fixes)
- ✅ Frontend code (all components, API calls)
- ✅ Configuration files
- ✅ Deployment scripts

---

## ⚠️ What This Does NOT Touch

- ❌ Other PM2 processes (semiconventures, ventures-backend)
- ❌ Other NGINX configs
- ❌ Other project directories
- ❌ System-wide settings

---

**Your other 3 websites remain completely untouched!** 🎉

