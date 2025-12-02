# 🚀 Complete Update Guide - GitHub First, Then Hostinger

## 📦 Part 1: Update GitHub (Run on Your Local Machine)

### Step 1: Check Status
```powershell
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county
git status
```

### Step 2: Add All Changes
```powershell
git add .
```

### Step 3: Commit
```powershell
git commit -m "Update: Latest changes and fixes"
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

## 🌐 Part 2: Update Hostinger Server (Run via SSH)

### Step 1: Connect to Server
```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

### Step 2: Complete Update Commands (Copy and Paste All)
```bash
cd /root/startup-village-county

# Pull latest code from GitHub
git fetch origin master
git reset --hard origin/master

# Update backend dependencies
cd backend
npm install
cd ..

# Build frontend
npm install
npm run build

# Deploy frontend (remove old, copy new)
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Restart backend
pm2 restart startup-village-backend

# Reload NGINX
sudo systemctl reload nginx

# Verify everything
echo "=== Backend Test ==="
curl -s https://villagecounty.in/api/health
echo ""
echo "=== Frontend Test ==="
curl -I https://villagecounty.in/ 2>&1 | head -3
echo ""
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== File Check ==="
ls -lah /var/www/html/ | head -5
```

---

## 🎯 One-Line Commands

### GitHub Update (PowerShell):
```powershell
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county; git add .; git commit -m "Update: Latest changes"; git push origin master
```

### Hostinger Update (SSH):
```bash
cd /root/startup-village-county && git fetch origin master && git reset --hard origin/master && cd backend && npm install && cd .. && npm install && npm run build && sudo rm -rf /var/www/html/* && sudo cp -r dist/* /var/www/html/ && sudo chown -R www-data:www-data /var/www/html && pm2 restart startup-village-backend && sudo systemctl reload nginx && echo "✅ Done!" && curl -s https://villagecounty.in/api/health
```

---

## 🔍 Troubleshooting: Website Not Updating

If the website still shows old content:

### 1. Check Browser Console
Open browser DevTools (F12) and check:
- Console tab for errors
- Network tab to see API calls
- Check if API calls are going to `https://villagecounty.in/api` or `http://localhost:5000/api`

### 2. Verify Frontend Files on Server
```bash
# On server, check:
ls -lah /var/www/html/
cat /var/www/html/index.html | head -20
```

### 3. Check API Configuration
The frontend should automatically detect production. Verify in browser console:
- Open https://villagecounty.in
- Press F12 → Console tab
- Look for: `🔧 API Configuration: { environment: 'production', apiBaseUrl: 'https://villagecounty.in/api' }`

### 4. Force Browser Cache Clear
- Chrome: `Ctrl + Shift + Delete` → Clear all cached files
- Or use Incognito: `Ctrl + Shift + N`
- Or hard refresh: `Ctrl + F5`

---

## ✅ Verification Checklist

After updating, verify:

- [ ] GitHub: `git status` shows "up to date"
- [ ] Hostinger: `git pull` shows "Already up to date"
- [ ] Backend: `curl https://villagecounty.in/api/health` returns OK
- [ ] Frontend: `curl https://villagecounty.in/` returns HTML
- [ ] PM2: `pm2 status` shows startup-village-backend as "online"
- [ ] Browser: Website loads and API calls work

---

**Your other 3 websites remain completely untouched!** 🎉

