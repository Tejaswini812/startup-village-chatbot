const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// Import routes
const authRoutes = require('./routes/auth')
const hotelRoutes = require('./routes/hotels')
const propertyRoutes = require('./routes/properties')
const landPropertyRoutes = require('./routes/landProperties')
const productRoutes = require('./routes/products')
const accessoryRoutes = require('./routes/accessories')
const eventRoutes = require('./routes/events')
const adminRoutes = require('./routes/admin')
const carsRoutes = require('./routes/cars')
const packagesRoutes = require('./routes/packages')
const staysRoutes = require('./routes/stays')
const userRoutes = require('./routes/users')
const bookingExcelAuthRoutes = require('./routes/bookingExcelAuth')
const notificationRoutes = require('./routes/notifications')
const { ensurePortalExcelFilesExist } = require('./utils/portalExcel')

dotenv.config()
try {
  ensurePortalExcelFilesExist()
} catch (e) {
  console.error('⚠️ Portal Excel init:', e.message)
}

const app = express()
// Hostinger provides PORT via environment variable - use it!
// If not set, fallback to 5000 for local development
const PORT = process.env.PORT || process.env.NODE_PORT || 5000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
app.use(limiter)

// CORS configuration - Allow all origins in production for now
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:5173',
      'https://localhost:5173',
      'https://villagecounty.in',
      'http://villagecounty.in',
      'https://www.villagecounty.in',
      'http://www.villagecounty.in',
      'https://*.villagecounty.in',
      'http://*.villagecounty.in'
    ].filter(Boolean)
    
    // Allow all origins in production (you can restrict this later)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true)
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all for now - change to callback(new Error(...)) to restrict
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}
app.use(cors(corsOptions))

// Handle preflight requests
app.options('*', cors(corsOptions))

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}))

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || 'uploads'
const uploadDirs = [
  uploadDir,
  path.join(uploadDir, 'documents'),
  path.join(uploadDir, 'hotels'),
  path.join(uploadDir, 'properties'),
  path.join(uploadDir, 'events'),
  path.join(uploadDir, 'cars'),
  path.join(uploadDir, 'land-properties'),
  path.join(uploadDir, 'packages'),
  path.join(uploadDir, 'products'),
  path.join(uploadDir, 'accessories')
]

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created upload directory: ${dir}`)
  }
})

// Static files - serve uploads with CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(uploadDir))

// Serve public images
app.use('/images', express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../public')))

// Trust proxy (important for production)
app.set('trust proxy', 1)

// Database connection with retry logic
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-village-county'
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    })
    
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000)
  }
}

// Connect to database
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/hotels', hotelRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/land-properties', landPropertyRoutes)
app.use('/api/products', productRoutes)
app.use('/api/accessories', accessoryRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/cars', carsRoutes)
app.use('/api/packages', packagesRoutes)
app.use('/api/stays', staysRoutes)
app.use('/api/user', userRoutes)
app.use('/api/booking-excel-auth', bookingExcelAuthRoutes)
app.use('/api', notificationRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Startup Village County API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    mongoose.connection.close()
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    mongoose.connection.close()
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: 'Request not allowed from this origin'
    })
  }
  
  // Handle rate limit errors
  if (err.status === 429) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later'
    })
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 API URL: http://localhost:${PORT}/api`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err)
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`)
  }
})

module.exports = app
