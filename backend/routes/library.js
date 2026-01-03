const express = require('express');
const router = express.Router();
const { LibraryItem } = require('../models');
const { requireProfessional } = require('./auth');

// @route   GET /api/library
// @desc    Get all library items (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const items = await LibraryItem.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching library items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/library/stats
// @desc    Get library statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await LibraryItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const formattedStats = {
      plants: 0,
      marine: 0,
      practices: 0,
      healers: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/library/:id
// @desc    Get single library item
router.get('/:id', async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/library
// @desc    Create new library item
router.post('/', requireProfessional, async (req, res) => {
  try {
    const item = await LibraryItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
});

// @route   PUT /api/library/:id
// @desc    Update library item
router.put('/:id', requireProfessional, async (req, res) => {
  try {
    const item = await LibraryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
});

// @route   DELETE /api/library/:id
// @desc    Delete library item
router.delete('/:id', async (req, res) => {
  try {
    const item = await LibraryItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Item deleted'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
