# How to Get Your Environment Credentials

Use this guide to fill in your `.env` file. Never commit `.env` or share these values.

---

## 1. MONGODB_URI

**Option A – MongoDB Atlas (free cloud)**  
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create an account.  
2. Create a **free cluster** (e.g. M0).  
3. Create a **database user**: Database Access → Add New → set username/password (save the password).  
4. **Network Access**: Add IP (e.g. `0.0.0.0` for “allow from anywhere” during dev).  
5. **Get connection string**: Clusters → **Connect** → **Drivers** → copy the URI.  
6. Replace `<password>` in the URI with your database user password.

Example:  
`MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/villagecounty?retryWrites=true&w=majority`

**Option B – Local MongoDB**  
If MongoDB is installed locally:  
`MONGODB_URI=mongodb://localhost:27017/villagecounty`

---

## 2. JWT_SECRET (min 32 characters)

Generate a random secret and use it only in `.env` (never in code or git).

**PowerShell:**  
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**Or in Node:**  
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into:  
`JWT_SECRET=<paste-here>`

---

## 3. EMAIL_USER and EMAIL_PASS (Gmail)

Use the Gmail account that should send emails (e.g. `villagecounty2025@gmail.com`).

- **EMAIL_USER** = that Gmail address  
- **EMAIL_PASS** = a **Gmail App Password** (not your normal Gmail password)

**Get a Gmail App Password:**  
1. Sign in to [Google Account](https://myaccount.google.com).  
2. Turn on **2-Step Verification**: Security → How you sign in to Google → 2-Step Verification.  
3. Open [App Passwords](https://myaccount.google.com/apppasswords) (or search “App passwords” in your Google Account).  
4. Select app: **Mail**, device: **Other** (e.g. “Village County”), then **Generate**.  
5. Copy the **16-character password** (you can remove spaces).  
6. In `.env`:  
   - `EMAIL_USER=villagecounty2025@gmail.com`  
   - `EMAIL_PASS=xxxxxxxxxxxxxxxx` (the 16-character app password)

---

## 4. UPLOAD_PATH

- **Production (Linux server):**  
  `UPLOAD_PATH=/var/www/villagecounty/startup-village-county/backend/uploads`  
  Ensure this folder exists and the app has read/write permission.

- **Local (Windows):**  
  Use an absolute path, e.g.  
  `UPLOAD_PATH=C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county\backend\uploads`  
  or a path relative to how your app resolves paths (check the backend code).

---

## Example .env (template)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-generated-secret-min-32-chars
FRONTEND_URL=https://villagecounty.in
UPLOAD_PATH=/var/www/villagecounty/startup-village-county/backend/uploads

ADMIN_EMAIL=villagecounty2025@gmail.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=villagecounty2025@gmail.com
EMAIL_PASS=your-16-char-app-password
```

Replace each placeholder with the value you obtained using the steps above.
