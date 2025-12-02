# Fix MongoDB Error and Restart Backend

## 🔧 Step 1: Fix MongoDB Connection Error

The error `option buffermaxentries is not supported` is because `bufferMaxEntries` is deprecated in newer MongoDB drivers.

**On your server, edit the production-server.js file:**

```bash
cd /root/startup-village-county/backend
nano production-server.js
```

**Find this section (around line 148-156):**
```javascript
await mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,  // ← REMOVE THIS LINE
  bufferCommands: false,
})
```

**Change it to:**
```javascript
await mongoose.connect(mongoURI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
})
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 🚀 Step 2: Restart Backend

```bash
# Restart the backend
pm2 restart startup-village-backend

# Check if it's running
pm2 status

# Check logs to see if MongoDB connects
pm2 logs startup-village-backend --lines 20
```

---

## ✅ Step 3: Verify Everything Works

```bash
# Test backend
curl http://localhost:5000/api/health

# Test through NGINX
curl https://villagecounty.in/api/health
```

You should see MongoDB connection success in the logs!

---

## 🎯 Quick Fix Command (Alternative)

If you want to fix it quickly with sed:

```bash
cd /root/startup-village-county/backend
sed -i '/bufferMaxEntries: 0,/d' production-server.js
sed -i '/useNewUrlParser: true,/d' production-server.js
sed -i '/useUnifiedTopology: true,/d' production-server.js
pm2 restart startup-village-backend
pm2 logs startup-village-backend --lines 10
```

