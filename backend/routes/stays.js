const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');

// Get all stays
router.get('/', async (req, res) => {
  try {
    const { destination, isPremium } = req.query;
    const query = {};
    
    if (destination) {
      query.destination = destination;
    }
    
    if (isPremium === 'true') {
      query.isPremium = true;
    }
    
    const stays = await Stay.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      stays: stays,
      total: stays.length
    });
  } catch (error) {
    console.error('Error fetching stays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stays',
      error: error.message
    });
  }
});

// Get single stay by ID
router.get('/:id', async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    
    if (!stay) {
      return res.status(404).json({
        success: false,
        message: 'Stay not found'
      });
    }
    
    res.json({
      success: true,
      stay: stay
    });
  } catch (error) {
    console.error('Error fetching stay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stay',
      error: error.message
    });
  }
});

// Create new stay
router.post('/', async (req, res) => {
  try {
    const stay = new Stay(req.body);
    await stay.save();
    
    res.status(201).json({
      success: true,
      message: 'Stay created successfully',
      stay: stay
    });
  } catch (error) {
    console.error('Error creating stay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stay',
      error: error.message
    });
  }
});

// Update stay
router.put('/:id', async (req, res) => {
  try {
    const stay = await Stay.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!stay) {
      return res.status(404).json({
        success: false,
        message: 'Stay not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Stay updated successfully',
      stay: stay
    });
  } catch (error) {
    console.error('Error updating stay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stay',
      error: error.message
    });
  }
});

// Delete stay
router.delete('/:id', async (req, res) => {
  try {
    const stay = await Stay.findByIdAndDelete(req.params.id);
    
    if (!stay) {
      return res.status(404).json({
        success: false,
        message: 'Stay not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Stay deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete stay',
      error: error.message
    });
  }
});

module.exports = router;

