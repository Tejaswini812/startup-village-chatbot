const express = require('express')
const multer = require('multer')
const path = require('path')
const Property = require('../models/Property')
const { compressUploadedImages } = require('../utils/compressImages')
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/properties/')
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

// Test route without file uploads
router.post('/test', async (req, res) => {
  try {
    console.log('=== TEST PROPERTY SUBMISSION ===')
    console.log('Request body:', req.body)
    
    const { title, description, price, location, propertyType } = req.body
    
    const property = new Property({
      title: title || 'Test Property',
      description: description || 'Test Description',
      price: parseInt(price) || 0,
      location: location || 'Test Location',
      propertyType: propertyType || 'apartment',
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      amenities: '',
      contactInfo: '',
      images: [],
      createdAt: new Date()
    })

    await property.save()
    res.status(201).json({ message: 'Test property created successfully', property })
  } catch (error) {
    console.error('Error creating test property:', error)
    res.status(500).json({ error: 'Error creating test property', message: error.message })
  }
})

// Create new property
router.post('/', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    console.log('=== PROPERTY SUBMISSION REQUEST ===')
    console.log('Request body:', req.body)
    console.log('Request files:', req.files)
    
    const {
      title,
      description,
      price,
      location,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      amenities,
      contactInfo
    } = req.body

    console.log('Parsed fields:')
    console.log('- title:', title)
    console.log('- description:', description)
    console.log('- price:', price, typeof price)
    console.log('- location:', location)
    console.log('- propertyType:', propertyType)

    const imagePaths = req.files ? req.files.map(file => file.path) : []
    console.log('- imagePaths:', imagePaths)

    const property = new Property({
      title: title || 'Untitled Property',
      description: description || 'No description provided',
      price: parseInt(price) || 0,
      location: location || 'Location not specified',
      propertyType: propertyType || 'apartment',
      bedrooms: bedrooms ? parseInt(bedrooms) : 0,
      bathrooms: bathrooms ? parseInt(bathrooms) : 0,
      area: area ? parseInt(area) : 0,
      amenities: amenities || '',
      contactInfo: contactInfo || '',
      images: imagePaths,
      status: 'approved',
      createdAt: new Date()
    })

    await property.save()
    res.status(201).json({ message: 'Property listed successfully', property })
  } catch (error) {
    console.error('Error creating property:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    res.status(500).json({ 
      error: 'Error creating property',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Get all properties (all listed live – no approval filter)
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 })
    res.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    res.status(500).json({ error: 'Error fetching properties' })
  }
})

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }
    res.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    res.status(500).json({ error: 'Error fetching property' })
  }
})

// Update property
router.put('/:id', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    const updateData = { ...req.body }
    if (req.files && req.files.length > 0) {
      updateData.images = [...property.images, ...req.files.map(file => file.path)]
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({ message: 'Property updated successfully', property: updatedProperty })
  } catch (error) {
    console.error('Error updating property:', error)
    res.status(500).json({ error: 'Error updating property' })
  }
})

// Delete property
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }
    res.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    res.status(500).json({ error: 'Error deleting property' })
  }
})

module.exports = router