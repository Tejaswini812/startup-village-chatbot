# How to Find Your Correct Port

## Method 1: Check Hostinger Panel
1. Login to Hostinger hPanel
2. Go to **Node.js** section
3. Find your **villagecounty.in** app
4. Look for **"Port"** or **"App Port"** field
5. Note that number (e.g., `3000`, `5000`, `8080`)

## Method 2: Check PM2 Processes
```bash
pm2 list
pm2 describe villagecounty-backend
```
Look for the port in the output.

## Method 3: Check .env File
```bash
cd /var/www/villagecounty/startup-village-county/backend
cat .env | grep PORT
```

## Method 4: Check What's Running
```bash
# See what ports are in use
netstat -tulpn | grep LISTEN

# Or check Node processes
ps aux | grep node
```

## Method 5: Check Backend Logs
```bash
pm2 logs villagecounty-backend
```
Look for a line like: `🚀 Server running on port XXXX`

---

## Once You Find the Port:

Update NGINX config:
```nginx
proxy_pass http://127.0.0.1:YOUR_ACTUAL_PORT;
```

Then test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```


