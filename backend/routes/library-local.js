const express = require('express');
const router = express.Router();
const db = require('../config/local-db');

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
    
    // Search functionality - NeDB style
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const items = await db.libraryItems.find(query);
      
      // Manual filtering for search
      const filtered = items.filter(item => {
        return searchRegex.test(item.title) ||
               searchRegex.test(item.description) ||
               (item.tags && item.tags.some(tag => searchRegex.test(tag)));
      });
      
      const limited = filtered.slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        count: limited.length,
        data: limited
      });
    }
    
    const items = await db.libraryItems.find(query)
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
    const items = await db.libraryItems.find({ isActive: true });
    
    const stats = {
      plants: 0,
      marine: 0,
      practices: 0,
      healers: 0,
      total: 0
    };
    
    items.forEach(item => {
      if (stats.hasOwnProperty(item.category)) {
        stats[item.category]++;
      }
      stats.total++;
    });
    
    res.json({
      success: true,
      data: stats
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
    const item = await db.libraryItems.findOne({ _id: req.params.id });
    
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
router.post('/', async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const item = await db.libraryItems.insert(itemData);
    
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
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const numUpdated = await db.libraryItems.update(
      { _id: req.params.id },
      { $set: updateData },
      { returnUpdatedDocs: false }
    );
    
    if (numUpdated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    const item = await db.libraryItems.findOne({ _id: req.params.id });
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// @route   DELETE /api/library/:id
// @desc    Delete library item
router.delete('/:id', async (req, res) => {
  try {
    const numRemoved = await db.libraryItems.remove({ _id: req.params.id });
    
    if (numRemoved === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
});

module.exports = router;
