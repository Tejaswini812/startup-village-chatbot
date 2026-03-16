const express = require('express')
const multer = require('multer')
const path = require('path')
const Product = require('../models/Product')
const { compressUploadedImages } = require('../utils/compressImages')
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/')
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

// Create new product (default seller if missing)
router.post('/', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      condition,
      quantity,
      seller,
      contactInfo
    } = req.body

    const imagePaths = req.files ? req.files.map(file => file.path) : []

    const product = new Product({
      name: (name || 'Product').trim(),
      description: (description || 'No description').trim(),
      price: parseInt(price, 10) || 0,
      category: (category || 'other').toLowerCase(),
      brand: (brand || '').trim(),
      condition: (condition || 'good').toLowerCase(),
      quantity: parseInt(quantity, 10) || 1,
      seller: (seller || 'Seller').trim(),
      contactInfo: (contactInfo || 'Contact not provided').trim(),
      images: imagePaths,
      createdAt: new Date()
    })

    await product.save()
    res.status(201).json({ message: 'Product created successfully', product })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ error: 'Error creating product', details: error.message })
  }
})

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Error fetching products' })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Error fetching product' })
  }
})

// Update product
router.put('/:id', upload.array('images', 10), compressUploadedImages, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const updateData = { ...req.body }
    if (req.files && req.files.length > 0) {
      updateData.images = [...product.images, ...req.files.map(file => file.path)]
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({ message: 'Product updated successfully', product: updatedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Error updating product' })
  }
})

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Error deleting product' })
  }
})

module.exports = router
