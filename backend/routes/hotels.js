const express = require('express')
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const Hotel = require('../models/Hotel')
const { compressUploadedImages } = require('../utils/compressImages')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/hotels/')
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

// @route   GET /api/hotels
// @desc    Get all hotels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true })
      .populate('host', 'name userId')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: hotels,
      count: hotels.length
    })
  } catch (error) {
    console.error('Get hotels error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotels'
    })
  }
})

// @route   GET /api/hotels/:id
// @desc    Get single hotel
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('host', 'name userId email phone')
      .populate('reviews.user', 'name userId')

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      })
    }

    res.json({
      success: true,
      data: hotel
    })
  } catch (error) {
    console.error('Get hotel error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel'
    })
  }
})

// @route   POST /api/hotels
// @desc    Create new hotel (multipart with files)
// @access  Private
router.post('/', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    console.log('=== HOTEL CREATION REQUEST ===')
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

    // Map property form data to hotel schema
    const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : []
    
    // Ensure we have required fields
    const hotelName = title || 'Property'
    const hotelLocation = location || 'Location TBD'
    const hotelType = propertyType || 'Property'
    
    // Better price handling - convert to string and validate
    let hotelPrice = '1000' // Default price
    if (price && price !== '0' && price !== 0 && price !== '' && price !== null && price !== undefined) {
      hotelPrice = String(price).trim()
      // If it's still empty or just whitespace, use default
      if (hotelPrice === '' || hotelPrice === '0') {
        hotelPrice = '1000'
      }
    }
    
    // Use uploaded image if available, otherwise use default
    const hotelImage = imagePaths[0] || 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'
    const hotelDescription = description || 'Property description'
    const hotelAmenities = amenities ? (Array.isArray(amenities) ? amenities : [amenities]) : []
    
    // Debug: Log the received data
    console.log('=== RECEIVED FORM DATA (MULTIPART) ===')
    console.log('Title:', title)
    console.log('Price:', price, 'Type:', typeof price, 'Final Price:', hotelPrice)
    console.log('Location:', location)
    console.log('Description:', description)
    console.log('Property Type:', propertyType)
    console.log('Amenities:', amenities)
    console.log('Uploaded Files:', req.files)
    console.log('Image Paths:', imagePaths)
    console.log('Final Image:', hotelImage)
    
    console.log('Creating hotel with data:', {
      name: hotelName,
      location: hotelLocation,
      type: hotelType,
      price: hotelPrice,
      image: hotelImage,
      description: hotelDescription,
      amenities: hotelAmenities
    })
    
    const hotel = new Hotel({
      name: hotelName,
      location: hotelLocation,
      type: hotelType,
      price: hotelPrice,
      image: hotelImage,
      description: hotelDescription,
      amenities: hotelAmenities,
      host: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // Valid ObjectId for demo
    })

    await hotel.save()

    console.log('Hotel created successfully:', hotel._id)
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    })
  } catch (error) {
    console.error('Create hotel error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({
      success: false,
      message: 'Server error while creating hotel',
      error: error.message
    })
  }
})

// @route   POST /api/hotels/json
// @desc    Create new hotel (JSON data only)
// @access  Private
router.post('/json', async (req, res) => {
  try {
    console.log('=== HOTEL CREATION REQUEST (JSON) ===')
    console.log('Request body:', req.body)
    
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

    // Ensure we have required fields
    const hotelName = title || 'Property'
    const hotelLocation = location || 'Location TBD'
    const hotelType = propertyType || 'Property'
    // Better price handling - convert to string and validate
    let hotelPrice = '1000' // Default price
    if (price && price !== '0' && price !== 0 && price !== '' && price !== null && price !== undefined) {
      hotelPrice = String(price).trim()
      // If it's still empty or just whitespace, use default
      if (hotelPrice === '' || hotelPrice === '0') {
        hotelPrice = '1000'
      }
    }
    const hotelImage = 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'
    const hotelDescription = description || 'Property description'
    const hotelAmenities = amenities ? (Array.isArray(amenities) ? amenities : [amenities]) : []
    
    // Debug: Log the received data
    console.log('=== RECEIVED FORM DATA ===')
    console.log('Title:', title)
    console.log('Price:', price, 'Type:', typeof price)
    console.log('Location:', location)
    console.log('Description:', description)
    console.log('Property Type:', propertyType)
    console.log('Amenities:', amenities)
    
    console.log('Creating hotel with data:', {
      name: hotelName,
      location: hotelLocation,
      type: hotelType,
      price: hotelPrice,
      image: hotelImage,
      description: hotelDescription,
      amenities: hotelAmenities
    })

    const hotel = new Hotel({
      name: hotelName,
      location: hotelLocation,
      type: hotelType,
      price: hotelPrice,
      image: hotelImage,
      description: hotelDescription,
      amenities: hotelAmenities,
      host: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // Valid ObjectId for demo
    })

    await hotel.save()

    console.log('Hotel created successfully:', hotel._id)
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    })
  } catch (error) {
    console.error('Create hotel error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({
      success: false,
      message: 'Server error while creating hotel',
      error: error.message
    })
  }
})

// @route   PUT /api/hotels/:id
// @desc    Update hotel
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      })
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: updatedHotel
    })
  } catch (error) {
    console.error('Update hotel error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating hotel'
    })
  }
})

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      })
    }

    hotel.isActive = false
    await hotel.save()

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    })
  } catch (error) {
    console.error('Delete hotel error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting hotel'
    })
  }
})

// @route   PATCH /api/hotels/fix-prices
// @desc    Fix hotels with price 0
// @access  Public
router.patch('/fix-prices', async (req, res) => {
  try {
    const result = await Hotel.updateMany(
      { price: '0' },
      { $set: { price: '1000' } }
    )
    
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} hotels with price 0`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Error fixing hotel prices:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fixing prices',
      error: error.message
    })
  }
})

module.exports = router
