const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const libraryItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  category: {
    type: String,
    required: true,
    enum: ['plants', 'marine', 'practices', 'healers']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  scientific: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '🌿'
  },
  description: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String
  },
  uses: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  region: {
    type: String,
    default: 'Nationwide'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
libraryItemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('LibraryItem', libraryItemSchema);
