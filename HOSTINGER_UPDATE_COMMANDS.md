# 🚀 Update villagecounty.in on Hostinger - Complete Commands

## ⚠️ SAFE: Only affects villagecounty.in, NOT your other websites!

---

## Step 1: Connect to Server

```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

---

## Step 2: Update from GitHub (If Repository is Unarchived)

```bash
cd /root/startup-village-county
git pull origin master
```

**OR if you need to upload files manually:**

```bash
# Option: Upload files via SCP from your local machine
# From your Windows machine:
scp -r startup-village-county root@31.97.233.176:/root/
```

---

## Step 3: Update Backend

```bash
cd /root/startup-village-county/backend

# Install any new dependencies
npm install

# Restart backend
cd ..
pm2 restart startup-village-backend

# Check it's running
pm2 status startup-village-backend
pm2 logs startup-village-backend --lines 10
```

---

## Step 4: Build and Deploy Frontend

```bash
cd /root/startup-village-county

# Install frontend dependencies
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

## Step 5: Clear Old Logs (Optional)

```bash
# Clear PM2 logs for clean start
pm2 flush startup-village-backend
```

---

## Step 6: Verify Everything

```bash
# Test backend API
curl https://villagecounty.in/api/health

# Test other endpoints
curl https://villagecounty.in/api/hotels
curl https://villagecounty.in/api/events

# Check PM2 (should show startup-village-backend online)
pm2 status

# Check NGINX
sudo systemctl status nginx
```

---

## 🎯 Quick All-in-One Update Command

```bash
# After SSH connection, run this:
cd /root/startup-village-county && \
git pull origin master 2>/dev/null || echo "Git pull skipped (repo may be archived)" && \
cd backend && npm install && cd .. && \
npm install && \
npm run build && \
sudo cp -r dist/* /var/www/html/ && \
sudo chown -R www-data:www-data /var/www/html && \
pm2 restart startup-village-backend && \
echo "✅ Update complete! Testing..." && \
curl https://villagecounty.in/api/health
```

---

## 📝 Manual Update (If Git Doesn't Work)

If GitHub is archived, you can manually upload files:

**From your local Windows machine:**

```powershell
# Upload entire project
scp -r startup-village-county root@31.97.233.176:/root/

# Or upload specific files/folders
scp -r startup-village-county/backend root@31.97.233.176:/root/startup-village-county/
scp -r startup-village-county/src root@31.97.233.176:/root/startup-village-county/
```

**Then on server:**

```bash
cd /root/startup-village-county
cd backend && npm install && cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/html/
pm2 restart startup-village-backend
```

---

## ✅ What Gets Updated

- ✅ Backend code (production-server.js, all routes)
- ✅ Frontend code (all components with API fixes)
- ✅ Configuration files
- ✅ Frontend build files

---

## ⚠️ What Stays Safe

- ✅ Other PM2 processes (semiconventures, ventures-backend) - NOT TOUCHED
- ✅ Other NGINX configs - NOT TOUCHED  
- ✅ Other project directories - NOT TOUCHED
- ✅ System settings - NOT TOUCHED

---

**Your other 3 websites are completely safe!** 🎉

