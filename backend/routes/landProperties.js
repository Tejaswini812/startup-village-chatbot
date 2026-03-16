const express = require('express')
const multer = require('multer')
const path = require('path')
const LandProperty = require('../models/LandProperty')
const { compressUploadedImages } = require('../utils/compressImages')
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/land-properties/')
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

// Create new land property (frontend sends size; model has area, purpose, ownership)
router.post('/', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      address,
      city,
      state,
      landType,
      area,
      size,
      unit,
      purpose,
      ownership,
      contactInfo
    } = req.body

    const imagePaths = req.files ? req.files.map(file => file.path) : []
    const areaNum = parseFloat(area || size) || 0
    const locationStr = [location, address, city, state].filter(Boolean).join(', ') || location || 'Location TBD'

    const landProperty = new LandProperty({
      title: (title || 'Untitled Land').trim(),
      description: (description || 'No description').trim(),
      price: parseInt(price, 10) || 0,
      location: (locationStr || 'Location TBD').trim(),
      landType: (landType || 'residential').toLowerCase().replace(/\s+/g, '-'),
      area: areaNum,
      unit: (unit || 'sqft').toLowerCase(),
      purpose: (purpose || 'sale').toLowerCase(),
      ownership: (ownership || 'freehold').toLowerCase(),
      contactInfo: (contactInfo || 'Contact not provided').trim(),
      images: imagePaths,
      createdAt: new Date()
    })

    await landProperty.save()
    res.status(201).json({ message: 'Land property created successfully', landProperty })
  } catch (error) {
    console.error('Error creating land property:', error)
    res.status(500).json({ error: 'Error creating land property', details: error.message })
  }
})

// Get all land properties
router.get('/', async (req, res) => {
  try {
    const landProperties = await LandProperty.find().sort({ createdAt: -1 })
    res.json(landProperties)
  } catch (error) {
    console.error('Error fetching land properties:', error)
    res.status(500).json({ error: 'Error fetching land properties' })
  }
})

// Get land property by ID
router.get('/:id', async (req, res) => {
  try {
    const landProperty = await LandProperty.findById(req.params.id)
    if (!landProperty) {
      return res.status(404).json({ error: 'Land property not found' })
    }
    res.json(landProperty)
  } catch (error) {
    console.error('Error fetching land property:', error)
    res.status(500).json({ error: 'Error fetching land property' })
  }
})

// Update land property
router.put('/:id', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const landProperty = await LandProperty.findById(req.params.id)
    if (!landProperty) {
      return res.status(404).json({ error: 'Land property not found' })
    }

    const updateData = { ...req.body }
    if (req.files && req.files.length > 0) {
      updateData.images = [...landProperty.images, ...req.files.map(file => file.path)]
    }

    const updatedLandProperty = await LandProperty.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({ message: 'Land property updated successfully', landProperty: updatedLandProperty })
  } catch (error) {
    console.error('Error updating land property:', error)
    res.status(500).json({ error: 'Error updating land property' })
  }
})

// Delete land property
router.delete('/:id', async (req, res) => {
  try {
    const landProperty = await LandProperty.findByIdAndDelete(req.params.id)
    if (!landProperty) {
      return res.status(404).json({ error: 'Land property not found' })
    }
    res.json({ message: 'Land property deleted successfully' })
  } catch (error) {
    console.error('Error deleting land property:', error)
    res.status(500).json({ error: 'Error deleting land property' })
  }
})

module.exports = router
