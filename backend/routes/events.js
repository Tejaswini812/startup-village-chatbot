const express = require('express')
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const Event = require('../models/Event')
const { compressUploadedImages } = require('../utils/compressImages')
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/')
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

// Create new event (accepts frontend format: category, location/dateTime/contactInfo as JSON strings)
router.post('/', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location: locationRaw,
      eventType,
      category: categoryRaw,
      date,
      time,
      duration,
      capacity,
      contactInfo: contactInfoRaw
    } = req.body

    const category = (categoryRaw || eventType || 'Other').trim() || 'Other'

    let location = {
      venue: 'Venue TBD',
      address: 'Address TBD',
      city: 'City TBD',
      state: 'State TBD'
    }
    if (locationRaw) {
      try {
        const parsed = typeof locationRaw === 'string' ? JSON.parse(locationRaw) : locationRaw
        if (parsed && typeof parsed === 'object') {
          location = {
            venue: parsed.venue || location.venue,
            address: parsed.address || parsed.venue || location.address,
            city: parsed.city || location.city,
            state: parsed.state || location.state
          }
        } else {
          location = { venue: locationRaw, address: locationRaw, city: locationRaw, state: locationRaw }
        }
      } catch (_) {
        location = { venue: locationRaw, address: locationRaw, city: locationRaw, state: locationRaw }
      }
    }

    let dateTime = { start: new Date(), end: new Date(Date.now() + 2 * 60 * 60 * 1000) }
    const dateTimeRaw = req.body.dateTime
    if (dateTimeRaw) {
      try {
        const parsed = typeof dateTimeRaw === 'string' ? JSON.parse(dateTimeRaw) : dateTimeRaw
        if (parsed?.start) dateTime.start = new Date(parsed.start)
        if (parsed?.end) dateTime.end = new Date(parsed.end)
      } catch (_) {}
    } else if (date && time) {
      const start = new Date(date + ' ' + time)
      if (!isNaN(start.getTime())) {
        dateTime.start = start
        dateTime.end = new Date(start.getTime() + (parseInt(duration, 10) || 2) * 60 * 60 * 1000)
      }
    }

    let contactInfo = {}
    if (contactInfoRaw) {
      try {
        contactInfo = typeof contactInfoRaw === 'string' ? JSON.parse(contactInfoRaw) : contactInfoRaw
        if (typeof contactInfo !== 'object' || contactInfo === null) contactInfo = {}
      } catch (_) {
        contactInfo = { phone: contactInfoRaw, email: '' }
      }
    }

    const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : []

    const event = new Event({
      title: (title || 'Untitled Event').trim(),
      description: (description || 'No description').trim(),
      price: parseFloat(price) || 0,
      category,
      location,
      dateTime,
      capacity: parseInt(capacity, 10) || 100,
      organizer: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      contactInfo,
      images: imagePaths
    })

    await event.save()
    res.status(201).json({ message: 'Event created successfully', event })
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({
      error: 'Error creating event',
      details: error.message
    })
  }
})

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 })
    res.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ error: 'Error fetching events' })
  }
})

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    res.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    res.status(500).json({ error: 'Error fetching event' })
  }
})

// Update event
router.put('/:id', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const updateData = { ...req.body }
    if (req.files && req.files.length > 0) {
      updateData.images = [...event.images, ...req.files.map(file => file.path)]
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({ message: 'Event updated successfully', event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({ error: 'Error updating event' })
  }
})

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ error: 'Error deleting event' })
  }
})

module.exports = router