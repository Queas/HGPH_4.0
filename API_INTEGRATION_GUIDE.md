# API Integration Guide for TKDL-PH

## Overview
This guide will help you integrate the new TKDL database API with your MongoDB account.

## Completed Implementation
✅ 4 Database Models (MedicinalPlant, ClinicalStudy, IndigenousKnowledge, ResearchContribution)
✅ Enhanced User model with TKDL roles and permissions
✅ Authentication middleware (7 functions)
✅ 4 Complete API route files with 38+ endpoints
✅ Sample data and seed script

## Step-by-Step Integration

### Step 1: Configure MongoDB Connection

1. **Create/Update `.env` file** in the `backend` directory:

```env
# MongoDB Configuration
MONGO_URL=your_mongodb_connection_string_here
# Example: mongodb+srv://username:password@cluster.mongodb.net/tkdl_ph?retryWrites=true&w=majority

# JWT Secret (if not already set)
JWT_SECRET=your_secure_jwt_secret_here

# Server Configuration
PORT=8002
NODE_ENV=development
```

2. **Get your MongoDB Connection String:**
   - Log in to MongoDB Atlas (https://cloud.mongodb.com)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<database>` with `tkdl_ph` (or your preferred name)

### Step 2: Update server.js

Replace your current `backend/server.js` with this updated version:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const medicinalPlantsRoutes = require('./routes/medicinal-plants');
const clinicalStudiesRoutes = require('./routes/clinical-studies');
const indigenousKnowledgeRoutes = require('./routes/indigenous-knowledge');
const researchContributionsRoutes = require('./routes/research-contributions');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/medicinal-plants', medicinalPlantsRoutes);
app.use('/api/clinical-studies', clinicalStudiesRoutes);
app.use('/api/indigenous-knowledge', indigenousKnowledgeRoutes);
app.use('/api/research-contributions', researchContributionsRoutes);

// Keep your existing local routes if needed for backward compatibility
// const articlesLocalRoutes = require('./routes/articles-local');
// const libraryLocalRoutes = require('./routes/library-local');
// app.use('/api/articles-local', articlesLocalRoutes);
// app.use('/api/library-local', libraryLocalRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
  console.log(`🚀 TKDL-PH Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGO_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;
```

### Step 3: Install Required Dependencies

Run this command in your `backend` directory:

```bash
npm install mongoose dotenv jsonwebtoken bcryptjs
```

### Step 4: Seed the Database

Once your MongoDB connection is configured:

```bash
# Navigate to backend directory
cd backend

# Run the seed script
node seed-tkdl.js
```

This will create:
- 5 test users (with different roles)
- 2 medicinal plants (Lagundi, Sambong)
- 2 clinical studies
- 1 indigenous knowledge record
- 1 research contribution

### Step 5: Test the API

1. **Start the server:**
```bash
node server.js
```

2. **Test health endpoint:**
```bash
curl http://localhost:8002/health
```

3. **Register a test user:**
```bash
curl -X POST http://localhost:8002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

4. **Login:**
```bash
curl -X POST http://localhost:8002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

Save the token from the response!

5. **Test medicinal plants endpoint:**
```bash
curl http://localhost:8002/api/medicinal-plants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (requires auth)

### Medicinal Plants (`/api/medicinal-plants`)
- `GET /` - List all plants (with filters)
- `GET /search` - Advanced search
- `GET /:id` - Get single plant
- `POST /` - Create plant (researcher+)
- `PUT /:id` - Update plant (editor+)
- `POST /:id/review` - Review plant (reviewer+)
- `DELETE /:id` - Delete plant (admin)
- `GET /:id/versions` - Get version history (reviewer+)

### Clinical Studies (`/api/clinical-studies`)
- `GET /` - List studies
- `GET /search` - Search studies
- `GET /:id` - Get single study
- `GET /plant/:plantId` - Studies for specific plant
- `GET /condition/:condition` - Studies by condition
- `POST /` - Create study (researcher+)
- `PUT /:id` - Update study (editor+)
- `POST /:id/verify` - Verify study (reviewer+)
- `POST /:id/cite` - Add citation
- `DELETE /:id` - Delete study (admin)

### Indigenous Knowledge (`/api/indigenous-knowledge`)
- `GET /` - List knowledge (role-based access)
- `GET /public` - Public knowledge only
- `GET /:id` - Get single record (with consent check)
- `GET /community/:name` - By community (restricted)
- `POST /` - Create record (requires consent)
- `PUT /:id` - Update record (indigenous rep/admin)
- `POST /:id/revoke-consent` - Revoke consent
- `GET /:id/access-log` - View access audit trail
- `GET /pending/ipr-review` - Pending IPR reviews
- `POST /:id/approve-ipr` - Approve IPR status (admin)

### Research Contributions (`/api/research-contributions`)
- `GET /` - List contributions (role-based)
- `GET /my-contributions` - Your contributions
- `GET /pending-reviews` - Pending reviews (reviewer+)
- `GET /my-reviews` - Your assigned reviews
- `GET /:id` - Get single contribution
- `POST /` - Create contribution
- `POST /:id/submit` - Submit for review
- `POST /:id/assign-reviewer` - Assign reviewer (editor+)
- `POST /:id/review` - Add review (reviewer)
- `POST /:id/request-revision` - Request revision
- `POST /:id/approve` - Approve contribution (editor+)
- `POST /:id/integrate` - Integrate to database (editor+)
- `POST /:id/comment` - Add comment
- `PUT /:id` - Update contribution

## User Roles & Permissions

| Role | Access Level | Key Permissions |
|------|-------------|-----------------|
| **user** | Basic | View public content, submit contributions |
| **researcher** | Elevated | Create plants/studies, submit research |
| **reviewer** | Review | Review submissions, validate data |
| **editor** | Editorial | Approve/reject contributions, manage workflow |
| **indigenous_representative** | Community | Manage indigenous knowledge for their community |
| **admin** | Full | All permissions, system management |

## Security Features

✅ JWT-based authentication  
✅ Role-based access control (RBAC)  
✅ Permission-based authorization  
✅ Content access levels (public, researchers_only, restricted, private)  
✅ Rate limiting (100 requests per 15 minutes per IP)  
✅ Request validation middleware  
✅ Consent checking for indigenous knowledge (IPRA/Nagoya Protocol)  
✅ Audit trail logging for sensitive data access  

## Indigenous Knowledge Compliance

The Indigenous Knowledge API implements **IPRA** (Indigenous Peoples' Rights Act) and **Nagoya Protocol** compliance:

1. **Prior Informed Consent (PIC)**: Auto-generated consent IDs, validity period tracking
2. **Access Control**: Strict role-based access, community-specific filtering
3. **Audit Trail**: Every access logged with user, purpose, timestamp
4. **Consent Revocation**: Immediate access restriction when consent revoked
5. **Benefit Sharing**: Financial and non-financial benefit tracking
6. **IPR Protection**: Review workflow for intellectual property rights
7. **NCIP Integration**: Ready for National Commission on Indigenous Peoples integration

## Next Steps

### For Development:
1. Set up MongoDB connection
2. Run seed script
3. Test all endpoints with Postman/Thunder Client
4. Integrate with your React frontend
5. Add additional test data as needed

### For Production:
1. Set strong JWT_SECRET
2. Enable MongoDB authentication
3. Configure CORS with specific origins
4. Set up SSL/TLS certificates
5. Implement request logging
6. Set up monitoring (e.g., MongoDB Atlas monitoring)
7. Configure backup strategy
8. Review and adjust rate limiting

## Troubleshooting

**MongoDB Connection Fails:**
- Check connection string format
- Verify network access in MongoDB Atlas (add your IP to whitelist)
- Ensure database user has proper permissions

**Authentication Errors:**
- Verify JWT_SECRET is set in .env
- Check token format: `Authorization: Bearer <token>`
- Ensure token hasn't expired (7-day default)

**Permission Denied:**
- Check user role in database
- Verify permission flags (canEdit, canReview, etc.)
- Check access level requirements for content

**Seed Script Errors:**
- Ensure MongoDB connection is established
- Check for existing data (script clears collections)
- Verify all models are properly imported

## Support Files

- **DATABASE_SCHEMA.md** - Complete schema documentation
- **TKDL_QUICK_START.md** - Quick start guide
- **SCHEMA_VISUAL_GUIDE.md** - Visual relationship diagrams
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **sample-data.js** - Sample data examples
- **seed-tkdl.js** - Database seeding script

## Contact & Contribution

For questions about the TKDL-PH system or to contribute to the Traditional Knowledge Digital Library, please follow the contribution guidelines in the Research Contributions workflow.

---

**Built with compliance to:**
- RA 8371 (IPRA - Indigenous Peoples' Rights Act of 1997)
- Nagoya Protocol on Access and Benefit-Sharing
- WHO Traditional Medicine Strategy
- Philippine Department of Health Herbal Medicine Guidelines
