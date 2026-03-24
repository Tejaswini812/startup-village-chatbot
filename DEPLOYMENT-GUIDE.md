# Startup Village County – Deployment Guide

Use this guide to deploy **startup-village-county** (not the chatbot) on your server.

**Server:** `31.97.233.176`  
**SSH:** `ssh root@31.97.233.176`  
**Password:** (use your own)

---

## Step 1: Connect to server

```bash
ssh root@31.97.233.176
# Enter password when prompted
```

---

## Step 2: Update system and install dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Git
apt install git -y

# Install UFW firewall
apt install ufw -y
```

---

## Step 3: Configure firewall

```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 5000
ufw --force enable
```

---

## Step 4: Clone the project

Your code is in: `https://github.com/Tejaswini812/startup-village-chatbot.git`

```bash
cd /var/www

# Create directory and clone (project is in startup-village-chatbot repo)
mkdir -p villagecounty
cd villagecounty
git clone https://github.com/Tejaswini812/startup-village-chatbot.git startup-village-county
cd startup-village-county
```

This clones the repo into a folder named `startup-village-county` so paths match the rest of the guide.

---

## Step 5: Backend setup

```bash
cd /var/www/villagecounty/startup-village-county/backend

# Install dependencies
npm install

# Create .env (use nano or vi)
nano .env
```

**Paste this into `.env`** (use your real MongoDB password):

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://tejaswinigowdateju1438_db_user:YOUR_MONGODB_PASSWORD@cluster0.mbpshry.mongodb.net/startup-village-county?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=96b4c51598cdc349aa7d3e65fdcc9d5db6dea3d37f1b5b08527806d76f4c0fcb
FRONTEND_URL=https://villagecounty.in
UPLOAD_PATH=/var/www/villagecounty/startup-village-county/backend/uploads
```

Save (Ctrl+O, Enter, Ctrl+X in nano).

**Create upload directories:**

```bash
mkdir -p uploads/documents uploads/hotels uploads/properties uploads/events uploads/cars uploads/land-properties uploads/packages uploads/products uploads/accessories
chmod -R 755 uploads
```

---

## Step 6: Test backend, then start with PM2

```bash
# From project root (not backend)
cd /var/www/villagecounty/startup-village-county

# Quick test (Ctrl+C to stop)
node backend/production-server.js

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save and enable on boot
pm2 save
pm2 startup
# Run the command it prints (e.g. sudo env PATH=... pm2 startup systemd -u root --hp /root)
```

Check: `pm2 status` and `curl http://localhost:5000/api/health`

---

## Step 7: Build frontend

```bash
cd /var/www/villagecounty/startup-village-county

# Install frontend dependencies
npm install

# Build for production (creates dist/)
npm run build
```

---

## Step 8: Configure Nginx

Create site config:

```bash
nano /etc/nginx/sites-available/villagecounty
```

**Paste this** (replace `31.97.233.176` with your domain if you have one, e.g. `villagecounty.in`):

```nginx
server {
    listen 80;
    server_name 31.97.233.176 villagecounty.in www.villagecounty.in;

    # Frontend (React build)
    root /var/www/villagecounty/startup-village-county/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
```

Enable and reload:

```bash
ln -sf /etc/nginx/sites-available/villagecounty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## Step 9: Test deployment

```bash
# Backend
curl http://localhost:5000/api/health

# Via Nginx (frontend + API)
curl -I http://31.97.233.176
curl http://31.97.233.176/api/health
```

Open in browser: `http://31.97.233.176` (or `https://villagecounty.in` after SSL).

---

## Optional: Use deploy script

After the project is at `/var/www/villagecounty/startup-village-county` and `backend/.env` is set:

```bash
cd /var/www/villagecounty/startup-village-county
chmod +x backend/deploy-villagecounty.sh
./backend/deploy-villagecounty.sh
```

Then build frontend and configure Nginx as in Steps 7–8.

---

## MongoDB Atlas

- In **Network Access**, add your server IP or “Allow access from anywhere” (`0.0.0.0/0`) so the server can connect.

---

## Push updates to GitHub (from your PC)

When you make changes and want to redeploy:

```bash
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county
git add .
git commit -m "Your commit message"
git push origin master
```

Then on the server: `cd /var/www/villagecounty/startup-village-county && git pull` and restart: `pm2 restart villagecounty-backend`.

---

## Differences from your chatbot steps

| Item            | Chatbot (your notes)   | Startup Village County (this guide)   |
|----------------|------------------------|----------------------------------------|
| Repo           | startup-village-chatbot| startup-village-county                 |
| App port       | 3000                   | 5000 (backend)                         |
| Entry point    | server.js               | backend/production-server.js (PM2)     |
| Frontend       | None                    | Build `npm run build` → serve `dist/`  |
| Nginx          | Proxy all to :3000      | Serve `dist/` + proxy `/api` to :5000  |
| .env location  | Project root            | backend/.env                            |

---

## Useful commands

- Backend logs: `pm2 logs villagecounty-backend`
- Restart backend: `pm2 restart villagecounty-backend`
- Status: `pm2 status`
