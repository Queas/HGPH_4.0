const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const articleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['Research', 'Health', 'Culture', 'News']
  },
  icon: {
    type: String,
    default: '📰'
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  author: {
    type: String,
    default: 'HalamangGaling Team'
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);
