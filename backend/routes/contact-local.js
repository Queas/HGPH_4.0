const express = require('express');
const router = express.Router();
const db = require('../config/local-db');

// @route   POST /api/contact
// @desc    Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    const contactData = {
      name,
      email,
      message,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const contact = await db.contacts.insert(contactData);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const contacts = await db.contacts.find({})
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/contact/:id/read
// @desc    Mark contact message as read
router.put('/:id/read', async (req, res) => {
  try {
    const numUpdated = await db.contacts.update(
      { _id: req.params.id },
      { $set: { isRead: true, updatedAt: new Date() } },
      { returnUpdatedDocs: false }
    );
    
    if (numUpdated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    const contact = await db.contacts.findOne({ _id: req.params.id });
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Update failed'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
router.delete('/:id', async (req, res) => {
  try {
    const numRemoved = await db.contacts.remove({ _id: req.params.id });
    
    if (numRemoved === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
});

module.exports = router;
