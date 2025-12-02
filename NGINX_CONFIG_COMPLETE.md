# Complete NGINX Configuration for villagecounty.in

## ⚠️ IMPORTANT: Replace `YOUR_PORT` with your Hostinger assigned port!

---

## Complete NGINX Config

Copy this entire configuration to `/etc/nginx/sites-available/villagecounty.in`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name villagecounty.in www.villagecounty.in;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    server_name villagecounty.in www.villagecounty.in;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/villagecounty.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/villagecounty.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;

    # SECURITY: Block access to sensitive files
    location ~ /\.(env|git|htaccess|htpasswd) {
        deny all;
        return 404;
    }

    # Frontend (React build files)
    location / {
        root /var/www/villagecounty/startup-village-county/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes - Proxy to backend
    # ⚠️ CRITICAL: Replace YOUR_PORT with your Hostinger assigned port!
    location /api/ {
        proxy_pass http://127.0.0.1:YOUR_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/villagecounty/startup-village-county/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

---

## 🔧 What to Change

1. **Line with `proxy_pass`**: 
   - Find: `proxy_pass http://127.0.0.1:YOUR_PORT;`
   - Replace `YOUR_PORT` with your actual Hostinger port (e.g., `3000`, `5000`, `8080`)

2. **Frontend root path** (if you want isolated deployment):
   - Current: `root /var/www/villagecounty/startup-village-county/dist;`
   - If you want to use `/var/www/html` instead, change it

---

## 📝 Steps to Update

1. **In nano editor, find the line:**
   ```nginx
   proxy_pass http://127.0.0.1:5000;
   ```

2. **Change `5000` to your Hostinger port:**
   ```nginx
   proxy_pass http://127.0.0.1:YOUR_ACTUAL_PORT;
   ```

3. **Save and exit:**
   - Press `Ctrl+X`
   - Press `Y` to confirm
   - Press `Enter` to save

4. **Test NGINX:**
   ```bash
   sudo nginx -t
   ```

5. **If test passes, reload:**
   ```bash
   sudo systemctl reload nginx
   ```

---

## ⚠️ Important Notes

- **Port must match**: The port in `proxy_pass` MUST match the PORT in your backend `.env` file
- **Frontend path**: Make sure the `root` path points to where your built frontend files are
- **Uploads path**: Make sure the uploads alias path is correct

---

## 🎯 Quick Fix Command

If you know your port (e.g., `3000`), you can use sed to replace it:

```bash
sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:5000;/proxy_pass http:\/\/127.0.0.1:3000;/g' /etc/nginx/sites-available/villagecounty.in
```

(Replace `3000` with your actual port)

Then test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```


