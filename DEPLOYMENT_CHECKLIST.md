# ✅ Deployment Checklist for villagecounty.in

**Use this checklist when you're ready to deploy to Hostinger VPS**

---

## 📋 Pre-Deployment Checklist

- [ ] Have SSH access to server: `ssh root@31.97.233.176`
- [ ] Have Hostinger hPanel access
- [ ] Know your MongoDB Atlas connection string
- [ ] Have all project files ready

---

## 🚀 Deployment Steps

### Step 1: Get Hostinger Port
- [ ] Login to Hostinger hPanel
- [ ] Go to Node.js section
- [ ] Find villagecounty.in app
- [ ] Note the **Port** number: `___________`

### Step 2: Upload Project
- [ ] Upload project to `/var/www/villagecounty/` on server
- [ ] Verify files are uploaded correctly

### Step 3: Configure Backend
- [ ] SSH into server: `ssh root@31.97.233.176`
- [ ] Navigate to: `cd /var/www/villagecounty/startup-village-county/backend`
- [ ] Create `.env` file with:
  - [ ] `PORT=YOUR_HOSTINGER_PORT`
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI=your-connection-string`
  - [ ] `JWT_SECRET=your-secret-key`
  - [ ] `FRONTEND_URL=https://villagecounty.in`

### Step 4: Deploy Backend
- [ ] Run: `npm install` in backend folder
- [ ] Create upload directories: `mkdir -p uploads/{documents,hotels,properties,events,cars,land-properties,packages,products,accessories}`
- [ ] Set permissions: `chmod -R 755 uploads`
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start backend: `pm2 start ecosystem.config.js --env production --name villagecounty-backend`
- [ ] Save PM2: `pm2 save`

### Step 5: Configure NGINX
- [ ] Create config: `sudo nano /etc/nginx/sites-available/villagecounty.in`
- [ ] Add configuration (see `DEPLOY_VILLAGECOUNTY_ONLY.md`)
- [ ] Update port in `proxy_pass http://localhost:YOUR_PORT`
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/villagecounty.in /etc/nginx/sites-enabled/`
- [ ] Test: `sudo nginx -t`
- [ ] Reload: `sudo systemctl reload nginx`

### Step 6: Build Frontend
- [ ] Navigate to: `cd /var/www/villagecounty/startup-village-county`
- [ ] Install: `npm install`
- [ ] Build: `npm run build`

### Step 7: Test
- [ ] Test backend: `curl http://localhost:YOUR_PORT/api/health`
- [ ] Test domain: `curl http://villagecounty.in/api/health`
- [ ] Test in browser: `http://villagecounty.in/api/health`

### Step 8: SSL (Optional)
- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx -y`
- [ ] Get certificate: `sudo certbot --nginx -d villagecounty.in -d www.villagecounty.in`

---

## ✅ Post-Deployment Testing

- [ ] Signup works
- [ ] Login works
- [ ] File uploads work (hotels, properties, events, cars)
- [ ] All API endpoints respond:
  - [ ] `/api/hotels`
  - [ ] `/api/events`
  - [ ] `/api/properties`
  - [ ] `/api/cars`
  - [ ] `/api/packages`
  - [ ] `/api/accessories`
- [ ] Frontend loads correctly
- [ ] Images display correctly

---

## 📝 Important Notes

1. **Port Number**: Must match Hostinger assigned port
2. **PM2 Name**: Use `villagecounty-backend` (unique, won't conflict)
3. **Directory**: `/var/www/villagecounty/` (isolated from other projects)
4. **NGINX**: Only modify `villagecounty.in` config
5. **MongoDB**: Use MongoDB Atlas connection string

---

## 🆘 If Something Goes Wrong

**Check Backend:**
```bash
pm2 logs villagecounty-backend
pm2 status villagecounty-backend
```

**Check NGINX:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Check Port:**
```bash
netstat -tulpn | grep YOUR_PORT
```

---

## 📚 Reference Files

- `DEPLOY_VILLAGECOUNTY_ONLY.md` - Complete detailed guide
- `QUICK_DEPLOY_COMMANDS.md` - Quick command reference
- `backend/deploy-villagecounty.sh` - Automated deployment script

---

**Good luck with your deployment! 🚀**


