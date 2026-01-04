require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/local-db');
const libraryRoutes = require('./routes/library-local');
const articleRoutes = require('./routes/articles-local');
const contactRoutes = require('./routes/contact-local');
const authLocalRoutes = require('./routes/auth-local');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'HalamangGaling API is running',
      database: 'Local file storage (NeDB)',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/library', libraryRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/auth', authLocalRoutes);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  });

  // Serve frontend static files in production
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/build');
    app.use(express.static(frontendPath));
    
    // Handle React Router - send all non-API requests to index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

const PORT = process.env.PORT || 8002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌿 HalamangGaling API Server running on port ${PORT}`);
  console.log(`📁 Database: Local file storage (NeDB)`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Library API: http://localhost:${PORT}/api/library`);
  console.log(`📰 Articles API: http://localhost:${PORT}/api/articles`);
  console.log(`✉️  Contact API: http://localhost:${PORT}/api/contact`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth\n`);
});
