const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const path = require('path')

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
const notificationRoutes = require('./routes/notifications')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS first so preflight (OPTIONS) gets correct headers before helmet/rate-limit
const allowedOrigins = [
  'https://villagecounty.in',
  'https://www.villagecounty.in',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]
const corsOptions = {
  origin: (origin, cb) => {
    const allowed = !origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    cb(null, allowed)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// Rate limiting: higher limit so login works after heavy use (100 was causing 429 on logout then login)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // per IP; avoids 429 when using app then logging in again
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files - serve uploads with CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static('uploads'))

app.use('/images', express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../public')))

// Database connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-village-county'

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err)
  // Try fallback to local MongoDB if cloud fails
  if (mongoURI.includes('mongodb+srv://')) {
    console.log('🔄 Trying local MongoDB fallback...')
    mongoose.connect('mongodb://localhost:27017/startup-village-county', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Local MongoDB connected successfully'))
    .catch(localErr => console.error('❌ Local MongoDB also failed:', localErr))
  }
})

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
// Handle invalid /api/other/:id before notification router (avoids 404)
app.get('/api/other/:id', (req, res) => {
  res.status(400).json({ message: 'Invalid API resource. Use /api/stays, /api/events, /api/properties, etc.' })
})
app.use('/api', notificationRoutes)

// API root - avoids 404 when hitting GET /api
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'Village County API', docs: '/api/health' })
})

// Catch invalid /api/:resource/:id (e.g. other, electronics) - return 400 so no 404
app.get('/api/:resource/:id', (req, res) => {
  res.status(400).json({ message: 'Invalid API resource. Use a valid path (e.g. /api/products/:id, /api/events/:id).' })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Startup Village County API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 API URL: http://localhost:${PORT}/api`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})
