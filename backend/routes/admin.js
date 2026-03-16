const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const nodemailer = require('nodemailer');
const auth = require('./auth');

const router = express.Router();

// Only this admin account can approve/reject/edit properties (must be logged in with this email)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'villagecounty2025@gmail.com';

const authenticateToken = auth.authenticateToken;
function requireAdmin(req, res, next) {
  if (req.user && req.user.email === ADMIN_EMAIL) return next();
  return res.status(403).json({ message: 'Admin access only. Use the admin account to approve or reject properties.' });
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'villagecounty2025@gmail.com',
    pass: 'Startup@12345'
  }
});

// Get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Failed to fetch pending users', error: error.message });
  }
});

// Approve user
router.post('/approve/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isApproved: true, 
        approvalDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send approval email to user
    const mailOptions = {
      from: 'villagecounty2025@gmail.com',
      to: user.email,
      subject: 'Account Approved - Welcome to Startup Village County!',
      html: `
        <h2>Congratulations ${user.name}!</h2>
        <p>Your account has been approved by our admin team.</p>
        <p>You can now access all features including:</p>
        <ul>
          <li>Host Properties</li>
          <li>Launch Events</li>
          <li>Manage your dashboard</li>
        </ul>
        <p>Please log in to your account to get started.</p>
        <p>Welcome to Startup Village County!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Failed to approve user', error: error.message });
  }
});

// Reject user
router.post('/reject/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send rejection email to user
    const mailOptions = {
      from: 'villagecounty2025@gmail.com',
      to: user.email,
      subject: 'Account Registration - Additional Information Required',
      html: `
        <h2>Dear ${user.name},</h2>
        <p>Thank you for your interest in Startup Village County.</p>
        <p>We need additional information to complete your registration:</p>
        <p><strong>Reason:</strong> ${reason || 'Please provide valid government proof document'}</p>
        <p>Please contact our support team or resubmit your registration with the required documents.</p>
        <p>Thank you for your understanding.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Optionally delete the user or mark as rejected
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User rejected and notified via email' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Failed to reject user', error: error.message });
  }
});

// Get all users (for admin dashboard)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('properties')
      .populate('events')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const approvedUsers = await User.countDocuments({ isApproved: true });
    const pendingUsers = await User.countDocuments({ isApproved: false });
    
    const totalProperties = await Property.countDocuments();
    const pendingPropertiesCount = await Property.countDocuments({ status: 'pending' });
    const totalEvents = await require('../models/Event').countDocuments();

    res.json({
      totalUsers,
      approvedUsers,
      pendingUsers,
      totalProperties,
      pendingPropertiesCount,
      totalEvents
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

// ========== Property approval (only admin – villagecounty2025@gmail.com) ==========

// Get all pending properties
router.get('/pending-properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const properties = await Property.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    res.status(500).json({ message: 'Failed to fetch pending properties', error: error.message });
  }
});

// Approve property
router.put('/approve-property/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', updatedAt: new Date() },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json({ message: 'Property approved', property });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ message: 'Failed to approve property', error: error.message });
  }
});

// Reject property
router.put('/reject-property/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', updatedAt: new Date() },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json({ message: 'Property rejected', property });
  } catch (error) {
    console.error('Error rejecting property:', error);
    res.status(500).json({ message: 'Failed to reject property', error: error.message });
  }
});

// Admin edit property (only admin can edit after submission)
router.put('/edit-property/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, location, propertyType, bedrooms, bathrooms, area, amenities, contactInfo, images } = req.body;
    const updateData = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (location !== undefined) updateData.location = location;
    if (propertyType !== undefined) updateData.propertyType = propertyType;
    if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms);
    if (area !== undefined) updateData.area = Number(area);
    if (amenities !== undefined) updateData.amenities = amenities;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (Array.isArray(images)) updateData.images = images;

    const property = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json({ message: 'Property updated', property });
  } catch (error) {
    console.error('Error editing property:', error);
    res.status(500).json({ message: 'Failed to edit property', error: error.message });
  }
});

module.exports = router;
