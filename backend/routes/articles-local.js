const express = require('express');
const router = express.Router();
const db = require('../config/local-db');

// @route   GET /api/articles
// @desc    Get all articles
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    let query = { isPublished: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const articles = await db.articles.find(query);
      
      // Manual filtering for search
      const filtered = articles.filter(article => {
        return searchRegex.test(article.title) ||
               searchRegex.test(article.excerpt) ||
               searchRegex.test(article.content) ||
               (article.tags && article.tags.some(tag => searchRegex.test(tag)));
      });
      
      const limited = filtered.slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        count: limited.length,
        data: limited
      });
    }
    
    const articles = await db.articles.find(query)
      .sort({ publishedAt: -1 })
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
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/articles/:id
// @desc    Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await db.articles.findOne({ _id: req.params.id });
    
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
router.post('/', async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (articleData.isPublished && !articleData.publishedAt) {
      articleData.publishedAt = new Date();
    }
    
    const article = await db.articles.insert(articleData);
    
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
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Update publishedAt if publishing for the first time
    if (updateData.isPublished && !req.body.publishedAt) {
      updateData.publishedAt = new Date();
    }
    
    const numUpdated = await db.articles.update(
      { _id: req.params.id },
      { $set: updateData },
      { returnUpdatedDocs: false }
    );
    
    if (numUpdated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    const article = await db.articles.findOne({ _id: req.params.id });
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(400).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
router.delete('/:id', async (req, res) => {
  try {
    const numRemoved = await db.articles.remove({ _id: req.params.id });
    
    if (numRemoved === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
});

module.exports = router;
