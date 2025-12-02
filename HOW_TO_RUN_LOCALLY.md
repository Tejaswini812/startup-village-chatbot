# 🚀 How to Run Project Locally

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas connection string)

---

## 📦 Step 1: Install Dependencies

### Option A: Install All at Once (Recommended)

```bash
cd startup-village-county
npm run install:all
```

### Option B: Install Separately

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## ⚙️ Step 2: Setup Environment Variables

### Backend Environment (.env file)

Create `backend/.env` file:

```bash
cd backend
touch .env
```

Add these variables to `backend/.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/startup-village-county
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-village-county

# Server Port
PORT=5000
NODE_PORT=5000

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key-here

# Environment
NODE_ENV=development
```

---

## 🎯 Step 3: Run the Project

### Option A: Run Both Frontend & Backend Together (Easiest)

```bash
# From project root directory
npm start
```

This will:
- Start backend on `http://localhost:5000`
- Start frontend on `http://localhost:5173` (Vite default)

---

### Option B: Run Separately (Two Terminals)

#### Terminal 1 - Backend:

```bash
# Navigate to backend
cd backend

# Run backend in development mode (with auto-reload)
npm run dev

# OR run in production mode
npm start
```

Backend will run on: `http://localhost:5000`

#### Terminal 2 - Frontend:

```bash
# From project root directory
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 📝 Available Commands

### Frontend Commands (from project root):

```bash
npm run dev          # Start frontend development server
npm run build        # Build frontend for production
npm run preview      # Preview production build
```

### Backend Commands (from backend directory):

```bash
npm start            # Start backend server
npm run dev          # Start backend with nodemon (auto-reload)
```

### Combined Commands (from project root):

```bash
npm start            # Run both frontend & backend together
npm run install:all  # Install all dependencies (frontend + backend)
```

---

## 🔧 Troubleshooting

### Port Already in Use

If port 5000 is already in use:

1. **Find and kill the process:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Or change port in backend/.env
   PORT=3000
   ```

2. **Or use a different port:**
   - Update `backend/.env`: `PORT=3000`
   - Update `src/config/api.js` to use `http://localhost:3000/api`

### MongoDB Connection Error

1. **If using local MongoDB:**
   - Make sure MongoDB is running: `mongod`
   - Check connection string in `backend/.env`

2. **If using MongoDB Atlas:**
   - Get connection string from MongoDB Atlas dashboard
   - Update `MONGODB_URI` in `backend/.env`

### Frontend Can't Connect to Backend

1. Check backend is running on correct port
2. Check `src/config/api.js` has correct API URL:
   ```javascript
   API_BASE_URL: 'http://localhost:5000/api'
   ```

---

## ✅ Quick Start (All Commands)

```bash
# 1. Navigate to project
cd startup-village-county

# 2. Install all dependencies
npm run install:all

# 3. Create backend/.env file (see Step 2 above)

# 4. Run both frontend and backend
npm start
```

---

## 🎉 Success!

If everything works, you should see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ MongoDB connected
- ✅ Browser opens to http://localhost:5173

---

**Note**: Make sure MongoDB is running before starting the backend!

