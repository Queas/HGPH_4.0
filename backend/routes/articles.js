const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const { requireProfessional } = require('./auth');

// @route   GET /api/articles
// @desc    Get all articles
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/articles/:id
// @desc    Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/articles
// @desc    Create new article
router.post('/', requireProfessional, async (req, res) => {
  try {
    const article = await Article.create(req.body);
    
    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
router.put('/:id', requireProfessional, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid data'
    });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Article deleted'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
