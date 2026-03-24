const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
  appendBookingSignup,
  updateBookingLastLogin,
  getBookingUserByEmail
} = require('../utils/portalExcel')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production'
const SALT = 10

// POST /api/booking-excel-auth/signup  { name, phone, email, password }
router.post('/signup', async (req, res) => {
  try {
    const name = (req.body.name || '').trim()
    const phone = (req.body.phone || '').trim()
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'Name, phone, email and password are required' })
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email' })
    }

    const hash = await bcrypt.hash(String(password), SALT)
    try {
      appendBookingSignup({ name, email, phone, passwordHash: hash })
    } catch (e) {
      if (e.code === 'EMAIL_EXISTS') {
        return res.status(400).json({ message: 'An account with this email already exists' })
      }
      throw e
    }

    res.status(201).json({ message: 'Account created. You can log in now.' })
  } catch (err) {
    console.error('booking-excel signup:', err)
    res.status(500).json({ message: 'Signup failed', error: err.message })
  }
})

// POST /api/booking-excel-auth/login  { email, password }
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = getBookingUserByEmail(email)
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    updateBookingLastLogin(email)

    const token = jwt.sign(
      { email: user.email, type: 'booking', userId: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (err) {
    console.error('booking-excel login:', err)
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
})

module.exports = router
