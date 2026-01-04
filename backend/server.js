require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import MongoDB connection
const connectDB = require('./config/db');

// Import local database for backward compatibility
const db = require('./config/local-db');

// Import TKDL MongoDB routes
const { router: authRoutes } = require('./routes/auth');
const medicinalPlantsRoutes = require('./routes/medicinal-plants');
const clinicalStudiesRoutes = require('./routes/clinical-studies');
const indigenousKnowledgeRoutes = require('./routes/indigenous-knowledge');
const researchContributionsRoutes = require('./routes/research-contributions');

// Import legacy local routes
const libraryRoutes = require('./routes/library-local');
const articleRoutes = require('./routes/articles-local');
const contactRoutes = require('./routes/contact-local');
const authLocalRoutes = require('./routes/auth-local');

const app = express();

// Connect to MongoDB
connectDB();

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
      message: 'HalamangGaling TKDL-PH API is running',
      database: process.env.MONGO_URL ? 'MongoDB Atlas' : 'Local file storage (NeDB)',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });

  // TKDL MongoDB API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/medicinal-plants', medicinalPlantsRoutes);
  app.use('/api/clinical-studies', clinicalStudiesRoutes);
  app.use('/api/indigenous-knowledge', indigenousKnowledgeRoutes);
  app.use('/api/research-contributions', researchContributionsRoutes);

  // Legacy Local Routes (for backward compatibility)
  app.use('/api/library-local', libraryRoutes);
  app.use('/api/articles-local', articleRoutes);
  app.use('/api/contact-local', contactRoutes);
  app.use('/api/auth-local', authLocalRoutes);

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
  console.log(`\n🌿 ========================================`);
  console.log(`   HalamangGaling TKDL-PH API Server`);
  console.log(`========================================`);
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGO_URL ? 'MongoDB Atlas' : 'Local NeDB'}`);
  console.log(`\n📍 Endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   🌿 Medicinal Plants: http://localhost:${PORT}/api/medicinal-plants`);
  console.log(`   🔬 Clinical Studies: http://localhost:${PORT}/api/clinical-studies`);
  console.log(`   🏛️  Indigenous Knowledge: http://localhost:${PORT}/api/indigenous-knowledge`);
  console.log(`   📚 Research Contributions: http://localhost:${PORT}/api/research-contributions`);
  console.log(`\n📦 Legacy Endpoints (Local NeDB):`);
  console.log(`   Library: http://localhost:${PORT}/api/library-local`);
  console.log(`   Articles: http://localhost:${PORT}/api/articles-local`);
  console.log(`========================================\n`);
});
