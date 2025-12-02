# 🚀 Update GitHub and Hostinger - Complete Commands

## 📦 Part 1: Update GitHub (From Your Local Machine)

### Step 1: Check Status
```powershell
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county
git status
```

### Step 2: Add All Changes
```powershell
git add .
```

### Step 3: Commit Changes
```powershell
git commit -m "Update: Added local run guide and latest improvements"
```

### Step 4: Push to GitHub
```powershell
git push origin master
```

### Step 5: Verify
```powershell
git status
git log --oneline -3
```

---

## 🌐 Part 2: Update Hostinger Server

### Step 1: Connect to Server
```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

### Step 2: Pull Latest Code from GitHub
```bash
cd /root/startup-village-county
git pull origin master
```

### Step 3: Update Backend
```bash
cd backend
npm install
cd ..
```

### Step 4: Restart Backend
```bash
pm2 restart startup-village-backend
```

### Step 5: Build and Deploy Frontend
```bash
# Install frontend dependencies (if needed)
npm install

# Build frontend
npm run build

# Deploy to web root
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### Step 6: Reload NGINX
```bash
sudo systemctl reload nginx
```

### Step 7: Verify Everything
```bash
# Test backend
curl https://villagecounty.in/api/health

# Check PM2 status
pm2 status

# Check latest logs
pm2 logs startup-village-backend --lines 5 --nostream
```

---

## 🎯 Quick All-in-One Commands

### GitHub Update (PowerShell):
```powershell
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county; git add .; git commit -m "Update: Latest changes"; git push origin master
```

### Hostinger Update (SSH):
```bash
cd /root/startup-village-county && git pull origin master && cd backend && npm install && cd .. && npm install && npm run build && sudo rm -rf /var/www/html/* && sudo cp -r dist/* /var/www/html/ && sudo chown -R www-data:www-data /var/www/html && pm2 restart startup-village-backend && sudo systemctl reload nginx && echo "✅ Update complete!" && curl -s https://villagecounty.in/api/health
```

---

## ✅ Complete Workflow

### 1. Update GitHub (Local Machine):
```powershell
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county
git add .
git commit -m "Update: Latest changes and improvements"
git push origin master
```

### 2. Update Hostinger (SSH):
```bash
ssh root@31.97.233.176
cd /root/startup-village-county
git pull origin master
cd backend && npm install && cd ..
npm install
npm run build
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
pm2 restart startup-village-backend
sudo systemctl reload nginx
curl https://villagecounty.in/api/health
```

---

## 🔍 Verification Checklist

After updating, verify:

- [ ] GitHub: `git status` shows "up to date with origin/master"
- [ ] Hostinger: `git pull` shows "Already up to date"
- [ ] Backend: `curl https://villagecounty.in/api/health` returns OK
- [ ] Frontend: Website loads at https://villagecounty.in
- [ ] PM2: `pm2 status` shows startup-village-backend as "online"
- [ ] Logs: `pm2 logs startup-village-backend --lines 5` shows no errors

---

**Your other 3 websites remain completely untouched!** 🎉

