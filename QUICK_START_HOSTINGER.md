# 🚀 Quick Start Guide - Hostinger VPS

## ⚠️ CRITICAL: 3 Things You MUST Do

### 1️⃣ Get Your Hostinger Port Number

1. Login to **Hostinger hPanel**
2. Go to **Node.js** section
3. Find **"App Port"** or **"Port"** (e.g., `3000`, `5000`, `8080`)
4. **Write it down!** You'll need it in 2 places.

---

### 2️⃣ Update .env File

```bash
cd startup-village-county/backend
nano .env
```

**Set these (replace YOUR_PORT with port from step 1):**

```env
PORT=YOUR_PORT
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-village-county
JWT_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=https://villagecounty.in
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### 3️⃣ Update NGINX Config

```bash
sudo nano /etc/nginx/sites-available/villagecounty.in
```

**Find this line:**
```nginx
proxy_pass http://localhost:5000;
```

**Change `5000` to YOUR_PORT from step 1:**
```nginx
proxy_pass http://localhost:YOUR_PORT;
```

**Test and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚀 Deploy Backend

```bash
# 1. Install dependencies
cd startup-village-county/backend
npm install

# 2. Create upload folders
mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}
chmod -R 755 uploads

# 3. Install PM2 (if not installed)
npm install -g pm2

# 4. Start backend
cd ..
pm2 start ecosystem.config.js --env production

# 5. Save PM2 config
pm2 save

# 6. Setup auto-start on boot
pm2 startup
# (Follow the command it shows)
```

---

## ✅ Test

```bash
# Test backend directly
curl http://localhost:YOUR_PORT/api/health

# Test through NGINX
curl https://villagecounty.in/api/health
```

**Should return:**
```json
{"status":"OK","message":"Startup Village County API is running",...}
```

---

## 🐛 If It's Not Working

### Check Backend:
```bash
pm2 status
pm2 logs startup-village-backend
```

### Check NGINX:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Common Issues:

❌ **500 Error** → Check PM2 logs, MongoDB connection  
❌ **404 Error** → Check NGINX proxy_pass port matches backend PORT  
❌ **CORS Error** → Check FRONTEND_URL in .env  

---

## 📖 Full Guide

See `HOSTINGER_DEPLOYMENT_GUIDE.md` for complete instructions.

---

## 🎯 Checklist

- [ ] Got port number from Hostinger panel
- [ ] Updated PORT in `.env` file
- [ ] Updated port in NGINX config
- [ ] Backend running on PM2 (`pm2 status` shows online)
- [ ] NGINX reloaded (`sudo systemctl reload nginx`)
- [ ] Test passed (`curl https://villagecounty.in/api/health`)

---

**That's it! Your backend should now work! 🎉**

