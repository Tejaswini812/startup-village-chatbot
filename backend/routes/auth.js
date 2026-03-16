const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compressUploadedImages } = require('../utils/compressImages');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log('File received:', file.fieldname, file.originalname, file.mimetype);
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname, file.mimetype);
      cb(new Error('Only images and PDF files are allowed'), false);
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'villagecounty2025@gmail.com',
    pass: 'Startup@12345'
  }
});

// Register new user
router.post('/register', (req, res, next) => {
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    }
    next();
  });
}, compressUploadedImages, async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Received registration data:', req.body);
    console.log('Received files:', req.files);
    console.log('Request headers:', req.headers);
    
    // Detailed file logging
    if (req.files) {
      console.log('File details:');
      if (req.files.document) {
        console.log('- Document file:', {
          fieldname: req.files.document[0].fieldname,
          originalname: req.files.document[0].originalname,
          mimetype: req.files.document[0].mimetype,
          size: req.files.document[0].size,
          path: req.files.document[0].path
        });
      }
      if (req.files.profilePicture) {
        console.log('- Profile picture file:', {
          fieldname: req.files.profilePicture[0].fieldname,
          originalname: req.files.profilePicture[0].originalname,
          mimetype: req.files.profilePicture[0].mimetype,
          size: req.files.profilePicture[0].size,
          path: req.files.profilePicture[0].path
        });
      }
    } else {
      console.log('No files received');
    }
    
    const { name, email, phone, password, governmentProofType, governmentProofNumber, address: addressString } = req.body;
    
    // Parse address if it's a JSON string
    let address;
    try {
      address = typeof addressString === 'string' ? JSON.parse(addressString) : addressString;
    } catch (error) {
      console.log('Address parsing error:', error);
      address = addressString; // Use as string if parsing fails
    }

    // Validate required fields
    console.log('Validating fields:');
    console.log('- name:', name, typeof name, 'valid:', !!name);
    console.log('- email:', email, typeof email, 'valid:', !!email);
    console.log('- phone:', phone, typeof phone, 'valid:', !!phone);
    console.log('- password:', password ? '***' : 'MISSING', typeof password, 'valid:', !!password);
    console.log('- governmentProofType:', governmentProofType, typeof governmentProofType, 'valid:', !!governmentProofType);
    console.log('- governmentProofNumber:', governmentProofNumber, typeof governmentProofNumber, 'valid:', !!governmentProofNumber);
    console.log('- address:', address, typeof address, 'valid:', !!address);
    console.log('- document file:', req.files?.document ? 'present' : 'missing');
    console.log('- profilePicture file:', req.files?.profilePicture ? 'present' : 'missing');

    const missingFields = [];
    if (!name || !name.trim()) missingFields.push('name');
    if (!email || !email.trim()) missingFields.push('email');
    if (!phone || !phone.trim()) missingFields.push('phone');
    if (!password || !password.trim()) missingFields.push('password');
    if (!governmentProofType || !governmentProofType.trim()) missingFields.push('governmentProofType');
    if (!governmentProofNumber || !governmentProofNumber.trim()) missingFields.push('governmentProofNumber');
    // Document is optional for now
    // if (!req.files?.document) missingFields.push('document');

    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }

    console.log('✅ All required fields present');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Parse address if it's a string
    let addressData = {};
    if (address) {
      try {
        addressData = typeof address === 'string' ? JSON.parse(address) : address;
        console.log('Parsed address data:', addressData);
        
        // Validate address fields
        if (!addressData.street || !addressData.street.trim()) {
          return res.status(400).json({ message: 'Street address is required' });
        }
        if (!addressData.city || !addressData.city.trim()) {
          return res.status(400).json({ message: 'City is required' });
        }
        if (!addressData.state || !addressData.state.trim()) {
          return res.status(400).json({ message: 'State is required' });
        }
        if (!addressData.pincode || !addressData.pincode.trim()) {
          return res.status(400).json({ message: 'Pincode is required' });
        }
      } catch (error) {
        console.error('Error parsing address:', error);
        return res.status(400).json({ message: 'Invalid address format' });
      }
    } else {
      return res.status(400).json({ message: 'Address is required' });
    }

    // Create new user
    const userData = {
      name,
      email,
      phone,
      password: hashedPassword,
      address: addressData,
      profilePicture: req.files && req.files.profilePicture ? req.files.profilePicture[0].path : null,
      governmentProof: {
        type: governmentProofType,
        number: governmentProofNumber,
        document: req.files && req.files.document ? req.files.document[0].path : 'no-document-uploaded'
      }
    };

    console.log('Creating user with data:', {
      ...userData,
      password: '***',
      governmentProof: {
        ...userData.governmentProof,
        document: userData.governmentProof.document ? 'file path present' : 'no file'
      }
    });

    const user = new User(userData);
    
    try {
      await user.save();
      console.log('✅ User created successfully:', user._id);
    } catch (saveError) {
      console.error('❌ User save error:', saveError);
      if (saveError.name === 'ValidationError') {
        console.error('Validation errors:', saveError.errors);
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: Object.keys(saveError.errors).map(key => ({
            field: key,
            message: saveError.errors[key].message
          }))
        });
      }
      throw saveError;
    }

    // Send welcome email to user (optional - don't fail if email fails)
    try {
      const userMailOptions = {
        from: 'villagecounty2025@gmail.com',
        to: email,
        subject: 'Welcome to Startup Village County!',
        html: `
          <h2>Welcome to Startup Village County!</h2>
          <p>Dear ${name},</p>
          <p>Your registration has been completed successfully! Your account is now active and ready to use.</p>
          <p>You can now:</p>
          <ul>
            <li>Host properties</li>
            <li>Launch events</li>
            <li>Access all platform features</li>
          </ul>
          <p>Thank you for choosing Startup Village County!</p>
        `
      };

      await transporter.sendMail(userMailOptions);
      console.log('✅ Welcome email sent successfully');
    } catch (emailError) {
      console.log('⚠️ Email sending failed (non-critical):', emailError.message);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({ 
      message: 'Registration successful! Your account is now active.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB error:', error.message);
      return res.status(500).json({ 
        message: 'Database error', 
        error: error.message
      });
    }
    
    res.status(400).json({ 
      message: 'Registration failed', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Only this email can log in as Admin and access the admin panel
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'villagecounty2025@gmail.com';

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    // If logging in as Admin, only the admin account is allowed
    if (role === 'admin') {
      const adminEmail = (ADMIN_EMAIL || '').trim().toLowerCase();
      if (normalizedEmail !== adminEmail) {
        return res.status(401).json({ message: 'Wrong credentials' });
      }
    }

    // Find user (email normalized to lowercase so login works regardless of casing)
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: role === 'admin' ? 'Wrong credentials' : 'Invalid credentials' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(401).json({
        message: role === 'admin' ? 'Wrong credentials' : 'Account pending approval. Please wait for admin approval.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Wrong credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('properties')
      .populate('events')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        name, 
        phone, 
        address,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;