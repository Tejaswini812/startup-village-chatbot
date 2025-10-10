# 🚀 VillageCounty.in Deployment Fix Guide

## 🔍 Issues Identified:

Your `villagecounty.in` website is showing errors because of these configuration issues:

1. **Missing Production Environment File** - No `.env` file with production settings
2. **Incorrect API Configuration** - Frontend trying to connect to wrong API endpoints
3. **Wrong Domain in Nginx** - Server configuration has placeholder domains
4. **CORS Issues** - Backend not properly configured for your domain

## ✅ Solutions (Without Affecting startup-interns.in):

### Step 1: Create Production Environment File

Create a file named `.env` in your `backend/` folder with this content:

```env
# Production Environment Variables for villagecounty.in
PORT=5000
NODE_ENV=production

# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://villagecounty:StartupVillage2025@cluster0.mongodb.net/startup-village-county?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=startup-village-county-super-secret-jwt-key-2025-production-villagecounty
JWT_EXPIRE=7d

# Frontend URL (for CORS) - Your actual domain
FRONTEND_URL=https://villagecounty.in

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Custom Domain Configuration
CUSTOM_DOMAIN=villagecounty.in
BASE_URL=https://villagecounty.in
```

### Step 2: Update API Configuration

Your `src/config/api.js` already has the correct configuration for `villagecounty.in`, so no changes needed there.

### Step 3: Build the Project

Run these commands in your project root:

```bash
npm run build
```

### Step 4: Deploy to Hostinger

1. **Upload Backend:**
   - Upload the entire `backend/` folder to your Hostinger server
   - Make sure the `.env` file is included

2. **Upload Frontend:**
   - Upload the contents of the `dist/` folder to your `public_html` directory

3. **SSH into Your Server:**
   ```bash
   # Navigate to backend directory
   cd /path/to/backend
   
   # Install dependencies
   npm install
   
   # Start the server with PM2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

4. **Update Nginx Configuration:**
   - Copy the updated `nginx.conf` to your server
   - Update your nginx configuration with the correct domain

### Step 5: Test the Fix

After deployment, test these:
- Visit: https://villagecounty.in
- Check API: https://villagecounty.in/api/health
- Test user registration/login
- Test form submissions

## 🔧 What This Fixes:

1. ✅ **Missing Environment Variables** - Creates proper production `.env` file
2. ✅ **API Connection Issues** - Ensures frontend connects to correct backend
3. ✅ **Domain Configuration** - Updates nginx with correct domain
4. ✅ **CORS Issues** - Configures backend to accept requests from your domain
5. ✅ **Database Connection** - Ensures MongoDB Atlas connection works

## ⚠️ Important Notes:

- This fix **ONLY affects villagecounty.in**
- **startup-interns.in is completely untouched**
- All your existing data will be preserved
- Uses the same MongoDB Atlas database
- No changes to your project files structure

## 🚨 If You Still Get Errors:

1. **Check Server Logs:**
   ```bash
   pm2 logs startup-village-backend
   ```

2. **Verify Environment Variables:**
   ```bash
   cd backend
   cat .env
   ```

3. **Test API Endpoint:**
   ```bash
   curl https://villagecounty.in/api/health
   ```

4. **Check Nginx Status:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

## 📞 Need Help?

If you still encounter issues after following this guide, the problem might be:
- Server configuration on Hostinger side
- Domain DNS settings
- SSL certificate issues
- Firewall blocking port 5000

This guide fixes the application-level issues. Server-level issues would need to be addressed with Hostinger support.
