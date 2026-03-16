const express = require('express')
const multer = require('multer')
const path = require('path')
const Car = require('../models/Car')
const { compressUploadedImages } = require('../utils/compressImages')
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cars/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Create new car (defaults for missing required: location, seller)
router.post('/', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const {
      make,
      model,
      year,
      price,
      mileage,
      fuelType,
      transmission,
      color,
      condition,
      location,
      description,
      seller,
      contactInfo
    } = req.body

    const imagePaths = req.files ? req.files.map(file => file.path) : []

    const car = new Car({
      make: (make || 'Make').trim(),
      model: (model || 'Model').trim(),
      year: parseInt(year, 10) || new Date().getFullYear(),
      price: parseInt(price, 10) || 0,
      mileage: parseInt(mileage, 10) || 0,
      fuelType: (fuelType || 'petrol').toLowerCase(),
      transmission: (transmission || 'manual').toLowerCase(),
      color: (color || 'N/A').trim(),
      condition: (condition || 'good').toLowerCase(),
      location: (location || 'Location TBD').trim(),
      description: (description || 'No description').trim(),
      seller: (seller || 'Seller').trim(),
      contactInfo: (contactInfo || 'Contact not provided').trim(),
      images: imagePaths,
      createdAt: new Date()
    })

    await car.save()
    res.status(201).json({ message: 'Car created successfully', car })
  } catch (error) {
    console.error('Error creating car:', error)
    res.status(500).json({ error: 'Error creating car', details: error.message })
  }
})

// Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 })
    res.json(cars)
  } catch (error) {
    console.error('Error fetching cars:', error)
    res.status(500).json({ error: 'Error fetching cars' })
  }
})

// Get car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    if (!car) {
      return res.status(404).json({ error: 'Car not found' })
    }
    res.json(car)
  } catch (error) {
    console.error('Error fetching car:', error)
    res.status(500).json({ error: 'Error fetching car' })
  }
})

// Update car
router.put('/:id', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    if (!car) {
      return res.status(404).json({ error: 'Car not found' })
    }

    const updateData = { ...req.body }
    if (req.files && req.files.length > 0) {
      updateData.images = [...car.images, ...req.files.map(file => file.path)]
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({ message: 'Car updated successfully', car: updatedCar })
  } catch (error) {
    console.error('Error updating car:', error)
    res.status(500).json({ error: 'Error updating car' })
  }
})

// Delete car
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id)
    if (!car) {
      return res.status(404).json({ error: 'Car not found' })
    }
    res.json({ message: 'Car deleted successfully' })
  } catch (error) {
    console.error('Error deleting car:', error)
    res.status(500).json({ error: 'Error deleting car' })
  }
})

module.exports = router