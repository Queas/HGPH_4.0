# Quick Start Guide - TKDL Database Schema

## Table of Contents
1. [Setup](#setup)
2. [Running the Seed Script](#running-the-seed-script)
3. [Common Query Examples](#common-query-examples)
4. [API Implementation Guidelines](#api-implementation-guidelines)
5. [Best Practices](#best-practices)

---

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Make sure your `.env` file has:
```env
MONGO_URL=mongodb://localhost:27017/halamanggaling
# or for production:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/halamanggaling
```

### 3. Seed the Database
```bash
npm run seed-tkdl
```

This will create:
- 5 sample users (admin, researcher, reviewer, editor, indigenous rep)
- 2 medicinal plants (Lagundi & Sambong)
- 2 clinical studies
- 1 indigenous knowledge record
- 1 research contribution

---

## Running the Seed Script

```bash
cd backend
npm run seed-tkdl
```

**Sample User Accounts Created:**
- **Admin**: username: `admin`, password: `Admin@123`
- **Researcher**: username: `researcher01`, password: `Research@123`
- **Reviewer**: username: `reviewer01`, password: `Review@123`
- **Editor**: username: `editor01`, password: `Editor@123`
- **Indigenous Rep**: username: `tboli_rep`, password: `Tboli@123`

---

## Common Query Examples

### Medicinal Plants

#### 1. Search by Condition/Symptom
```javascript
const plants = await MedicinalPlant.searchByCondition('cough');
```

#### 2. Search by Region
```javascript
const plants = await MedicinalPlant.searchByRegion('Region XII');
```

#### 3. Search by Common Name (any language)
```javascript
const plants = await MedicinalPlant.getByCommonName('lagundi', 'Tagalog');
// or without language filter
const plants = await MedicinalPlant.getByCommonName('lagundi');
```

#### 4. Full Text Search
```javascript
const plants = await MedicinalPlant.find({
  $text: { $search: 'fever asthma' },
  validationStatus: 'published',
  isActive: true
}).sort({ score: { $meta: 'textScore' } });
```

#### 5. Get Plant by Scientific Name
```javascript
const plant = await MedicinalPlant.findOne({
  'names.scientific': 'Vitex negundo L.',
  isActive: true
});
```

#### 6. Advanced Filter
```javascript
const plants = await MedicinalPlant.find({
  'safety.toxicity.level': 'Low',
  'regulatoryStatus.dohApproved': true,
  'distribution.regions': 'Nationwide',
  validationStatus: 'published',
  isActive: true
});
```

### Clinical Studies

#### 1. Find Studies by Plant
```javascript
const studies = await ClinicalStudy.findByPlant(plantId);
```

#### 2. Find Studies by Condition
```javascript
const studies = await ClinicalStudy.findByCondition('diabetes');
```

#### 3. Filter by Study Type
```javascript
const clinicalTrials = await ClinicalStudy.find({
  studyType: { $in: ['Phase II Clinical Trial', 'Phase III Clinical Trial'] },
  validationStatus: 'published'
}).sort({ publicationDate: -1 });
```

#### 4. High Evidence Studies
```javascript
const highEvidence = await ClinicalStudy.find({
  evidenceLevel: { $in: ['Level I', 'Level II'] },
  efficacy: { $in: ['Proven', 'Promising'] }
});
```

### Indigenous Knowledge

#### 1. Check Consent Validity
```javascript
const knowledge = await IndigenousKnowledge.findById(id);
const isValid = knowledge.checkConsentValidity();
```

#### 2. Find Public Knowledge
```javascript
const publicKnowledge = await IndigenousKnowledge.findPublicKnowledge();
```

#### 3. Find by Community
```javascript
const knowledge = await IndigenousKnowledge.findByCommunity("T'boli");
```

#### 4. Find Knowledge Requiring IPR Review
```javascript
const pending = await IndigenousKnowledge.requiresIPRReview();
```

#### 5. Grant Access with Audit Trail
```javascript
await knowledge.grantAccess(userId, 'PhD research on antimicrobial properties');
```

#### 6. Revoke Consent
```javascript
await knowledge.revokeConsent('Community decision after consultation');
```

### Research Contributions

#### 1. Get Pending Reviews
```javascript
const pending = await ResearchContribution.getPendingReviews();
```

#### 2. Get Contributions by User
```javascript
const myContributions = await ResearchContribution.getByContributor(userId);
```

#### 3. Get Reviews Assigned to Reviewer
```javascript
const myReviews = await ResearchContribution.getAwaitingReview(reviewerId);
```

#### 4. Submit Contribution
```javascript
const contribution = new ResearchContribution({...});
await contribution.submit();
```

#### 5. Add Review
```javascript
await contribution.addReview(reviewerId, {
  decision: 'approve',
  rating: {
    accuracy: 5,
    completeness: 4,
    relevance: 5,
    sourceQuality: 5
  },
  comments: 'Excellent work with proper citations'
});
```

#### 6. Approve and Integrate
```javascript
await contribution.approve(editorId);
await contribution.integrate(editorId);
```

---

## API Implementation Guidelines

### Example: Medicinal Plants API Routes

```javascript
// routes/medicinal-plants.js
const express = require('express');
const router = express.Router();
const { MedicinalPlant } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/plants - List all published plants
router.get('/', async (req, res) => {
  try {
    const { 
      condition, 
      region, 
      name, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {
      validationStatus: 'published',
      isActive: true
    };

    // Filter by condition
    if (condition) {
      query['traditionalUses.condition'] = new RegExp(condition, 'i');
    }

    // Filter by region
    if (region) {
      query['distribution.regions'] = region;
    }

    // Filter by name (scientific or common)
    if (name) {
      query.$or = [
        { 'names.scientific': new RegExp(name, 'i') },
        { 'names.commonNames.name': new RegExp(name, 'i') }
      ];
    }

    const plants = await MedicinalPlant.find(query)
      .select('-previousVersions -reviewHistory')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'names.scientific': 1 });

    const count = await MedicinalPlant.countDocuments(query);

    res.json({
      plants,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plants/:id - Get plant details
router.get('/:id', async (req, res) => {
  try {
    const plant = await MedicinalPlant.findById(req.params.id)
      .populate('contributors.user', 'profile.firstName profile.lastName')
      .populate('clinicalEvidence.studyReference');

    if (!plant || !plant.isActive) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Check access level
    if (plant.accessLevel === 'researcher' && !req.user?.role === 'researcher') {
      return res.status(403).json({ error: 'Researcher access required' });
    }

    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plants - Create new plant (authenticated)
router.post('/', authenticate, authorize(['researcher', 'editor', 'admin']), async (req, res) => {
  try {
    const plantData = {
      ...req.body,
      contributors: [{
        user: req.user._id,
        role: 'creator',
        contribution: 'Initial data entry',
        contributedAt: new Date()
      }],
      validationStatus: 'draft'
    };

    const plant = new MedicinalPlant(plantData);
    await plant.save();

    res.status(201).json(plant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/plants/:id - Update plant (authenticated)
router.put('/:id', authenticate, authorize(['editor', 'admin']), async (req, res) => {
  try {
    const plant = await MedicinalPlant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Create version before updating
    await plant.createVersion(req.user._id, req.body.changeLog || 'Update');

    // Update fields
    Object.assign(plant, req.body);
    
    // Add contributor
    plant.contributors.push({
      user: req.user._id,
      role: 'editor',
      contribution: req.body.changeLog || 'Update',
      contributedAt: new Date()
    });

    await plant.save();

    res.json(plant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/plants/:id/review - Update validation status
router.post('/:id/review', authenticate, authorize(['reviewer', 'editor', 'admin']), async (req, res) => {
  try {
    const plant = await MedicinalPlant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const { status, comments } = req.body;
    await plant.updateValidationStatus(status, req.user._id, comments);

    res.json(plant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

### Example: Indigenous Knowledge API Routes

```javascript
// routes/indigenous-knowledge.js
const express = require('express');
const router = express.Router();
const { IndigenousKnowledge } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/indigenous-knowledge - List (with access control)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = { isActive: true };

    // Access control based on user role
    if (!req.user.permissions.canAccessRestrictedKnowledge) {
      query.accessLevel = 'public';
    }

    const knowledge = await IndigenousKnowledge.find(query)
      .select('-accessLog') // Don't expose audit logs
      .populate('plants', 'names.scientific names.commonNames');

    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/indigenous-knowledge/:id - Get with consent check
router.get('/:id', authenticate, async (req, res) => {
  try {
    const knowledge = await IndigenousKnowledge.findById(req.params.id);

    if (!knowledge || !knowledge.isActive) {
      return res.status(404).json({ error: 'Knowledge not found' });
    }

    // Check consent validity
    if (!knowledge.checkConsentValidity()) {
      return res.status(403).json({ 
        error: 'Access denied - consent not valid or expired' 
      });
    }

    // Check access level
    if (knowledge.accessLevel === 'researchers_only' && 
        !['researcher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Researcher access required' });
    }

    // Log access
    await knowledge.grantAccess(req.user._id, req.query.purpose || 'View');

    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/indigenous-knowledge/:id/revoke-consent
router.post('/:id/revoke-consent', 
  authenticate, 
  authorize(['indigenous_representative', 'admin']), 
  async (req, res) => {
    try {
      const knowledge = await IndigenousKnowledge.findById(req.params.id);
      
      if (!knowledge) {
        return res.status(404).json({ error: 'Knowledge not found' });
      }

      await knowledge.revokeConsent(req.body.reason);

      res.json({ 
        message: 'Consent revoked successfully', 
        knowledge 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
```

---

## Best Practices

### 1. Always Use Version Control
```javascript
// Before making significant changes
await plant.createVersion(userId, 'Updated traditional uses with new research');
```

### 2. Check Consent Before Accessing Indigenous Knowledge
```javascript
const knowledge = await IndigenousKnowledge.findById(id);
if (!knowledge.checkConsentValidity()) {
  throw new Error('Consent not valid');
}
```

### 3. Implement Proper Access Control
```javascript
// In your middleware
const checkAccess = (requiredLevel) => {
  return (req, res, next) => {
    if (req.user.permissions[requiredLevel]) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
```

### 4. Use Soft Deletes
```javascript
// Don't use .remove() or .delete()
plant.isActive = false;
await plant.save();
```

### 5. Populate Related Documents Efficiently
```javascript
const plant = await MedicinalPlant.findById(id)
  .populate('contributors.user', 'profile.firstName profile.lastName')
  .populate('clinicalEvidence.studyReference', 'title journal publicationDate')
  .populate({
    path: 'traditionalUses.sources.consent',
    select: 'consentId obtained expiryDate'
  });
```

### 6. Implement Pagination for Large Datasets
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;

const plants = await MedicinalPlant.find(query)
  .limit(limit)
  .skip((page - 1) * limit)
  .sort({ createdAt: -1 });
```

### 7. Use Indexes for Performance
Already implemented in the schemas, but verify with:
```javascript
// Check indexes in MongoDB shell
db.medicinal_plants.getIndexes()
```

### 8. Validate Data Before Saving
```javascript
const validatePlant = (plantData) => {
  const errors = [];
  
  if (!plantData.names?.scientific) {
    errors.push('Scientific name is required');
  }
  
  if (!plantData.safety) {
    errors.push('Safety information is required for publication');
  }
  
  if (plantData.traditionalUses) {
    plantData.traditionalUses.forEach((use, idx) => {
      if (use.iprStatus === 'protected' && !use.sources[0]?.consent?.obtained) {
        errors.push(`Traditional use ${idx + 1} requires consent`);
      }
    });
  }
  
  return errors;
};
```

---

## Next Steps

1. **Run the seed script**: `npm run seed-tkdl`
2. **Test queries** in MongoDB Compass or shell
3. **Implement API routes** following the examples above
4. **Add authentication middleware** for protected routes
5. **Create frontend components** to display the data
6. **Implement search functionality** with filters
7. **Add image upload** for plant photos
8. **Implement workflow** for peer review process

---

## Troubleshooting

### Common Issues

**Issue**: "ValidationError: Scientific name is required"
```javascript
// Solution: Ensure names.scientific is provided
const plant = new MedicinalPlant({
  names: {
    scientific: 'Vitex negundo L.',  // Required!
    commonNames: [...]
  },
  ...
});
```

**Issue**: Consent validation failing
```javascript
// Check consent object structure
const knowledge = await IndigenousKnowledge.findById(id);
console.log(knowledge.consent);
// Ensure: obtained: true, no revokedAt, expiryDate in future
```

**Issue**: Duplicate key error on _id
```javascript
// The _id is auto-generated with UUID
// Don't provide _id unless migrating existing data
const plant = new MedicinalPlant({...}); // Let it auto-generate
```

---

For more details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
