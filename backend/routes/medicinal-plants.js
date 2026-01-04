const express = require('express');
const router = express.Router();
const { MedicinalPlant, ClinicalStudy, User } = require('../models');
const { 
  authenticate, 
  optionalAuth,
  authorize, 
  checkPermission,
  rateLimit 
} = require('../middleware/auth');

/**
 * @route   GET /api/medicinal-plants
 * @desc    Get all published medicinal plants with filters
 * @access  Public (with optional authentication for more data)
 */
router.get('/', optionalAuth, rateLimit(100), async (req, res) => {
  try {
    const {
      // Search & Filter
      search,
      condition,
      region,
      name,
      scientificName,
      family,
      language,
      // Safety filters
      toxicityLevel,
      dohApproved,
      // Pagination
      page = 1,
      limit = 20,
      // Sorting
      sort = 'names.scientific',
      order = 'asc'
    } = req.query;

    // Build query
    let query = {
      isActive: true
    };

    // Only show published plants to non-authenticated users
    if (!req.user || !['admin', 'editor', 'reviewer'].includes(req.user.role)) {
      query.validationStatus = 'published';
    }

    // Access level filtering
    if (!req.user) {
      query.accessLevel = 'public';
    } else if (req.user.role === 'user' || req.user.role === 'professional') {
      query.accessLevel = { $in: ['public', 'registered'] };
    } else if (req.user.role === 'researcher') {
      query.accessLevel = { $in: ['public', 'registered', 'researcher'] };
    }
    // Admin, editor, reviewer can see all

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by condition
    if (condition) {
      query['traditionalUses.condition'] = new RegExp(condition, 'i');
    }

    // Filter by region
    if (region) {
      query['distribution.regions'] = region;
    }

    // Filter by name (common or scientific)
    if (name) {
      query.$or = [
        { 'names.scientific': new RegExp(name, 'i') },
        { 'names.commonNames.name': new RegExp(name, 'i') }
      ];
    }

    // Filter by scientific name only
    if (scientificName) {
      query['names.scientific'] = new RegExp(scientificName, 'i');
    }

    // Filter by family
    if (family) {
      query['names.family'] = new RegExp(family, 'i');
    }

    // Filter by language of common name
    if (language && name) {
      query.$or = [
        { 
          'names.commonNames': {
            $elemMatch: {
              language: language,
              name: new RegExp(name, 'i')
            }
          }
        }
      ];
    }

    // Filter by toxicity level
    if (toxicityLevel) {
      query['safety.toxicity.level'] = toxicityLevel;
    }

    // Filter by DOH approval
    if (dohApproved === 'true') {
      query['regulatoryStatus.dohApproved'] = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }

    // Execute query
    const [plants, total] = await Promise.all([
      MedicinalPlant.find(query)
        .select('-previousVersions -reviewHistory') // Exclude large fields
        .limit(parseInt(limit))
        .skip(skip)
        .sort(sortObj)
        .lean(),
      MedicinalPlant.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: plants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        search,
        condition,
        region,
        name,
        toxicityLevel,
        dohApproved
      }
    });

  } catch (error) {
    console.error('Error fetching medicinal plants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicinal plants',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/medicinal-plants/search
 * @desc    Advanced search with multiple criteria
 * @access  Public
 */
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      q, // General query
      conditions,
      regions,
      families,
      minEvidenceLevel,
      hasImages,
      page = 1,
      limit = 20
    } = req.query;

    let query = {
      validationStatus: 'published',
      isActive: true
    };

    // Access control
    if (!req.user) {
      query.accessLevel = 'public';
    }

    // General text search
    if (q) {
      query.$text = { $search: q };
    }

    // Multiple conditions (comma-separated)
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim());
      query['traditionalUses.condition'] = { 
        $in: conditionArray.map(c => new RegExp(c, 'i')) 
      };
    }

    // Multiple regions
    if (regions) {
      const regionArray = regions.split(',').map(r => r.trim());
      query['distribution.regions'] = { $in: regionArray };
    }

    // Multiple families
    if (families) {
      const familyArray = families.split(',').map(f => f.trim());
      query['names.family'] = { $in: familyArray };
    }

    // Filter by evidence level
    if (minEvidenceLevel) {
      const levels = ['Level I', 'Level II', 'Level III', 'Level IV', 'Level V'];
      const minIndex = levels.indexOf(minEvidenceLevel);
      if (minIndex >= 0) {
        query['clinicalEvidence.evidenceLevel'] = { $in: levels.slice(0, minIndex + 1) };
      }
    }

    // Has images
    if (hasImages === 'true') {
      query['images.0'] = { $exists: true };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [plants, total] = await Promise.all([
      MedicinalPlant.find(query)
        .select('names distribution tags safety.toxicity regulatoryStatus images')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ score: { $meta: 'textScore' } })
        .lean(),
      MedicinalPlant.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: plants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/medicinal-plants/:id
 * @desc    Get single medicinal plant by ID
 * @access  Public (with access level check)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const plant = await MedicinalPlant.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('contributors.user', 'profile.firstName profile.lastName profile.affiliation')
      .populate('clinicalEvidence.studyReference', 'title journal publicationDate doi')
      .populate('phytochemicals.references', 'title authors');

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Medicinal plant not found'
      });
    }

    // Check access level
    if (plant.accessLevel !== 'public' && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this plant'
      });
    }

    // Validate user access level
    const accessHierarchy = {
      'public': true,
      'registered': req.user !== undefined,
      'researcher': req.user && ['researcher', 'reviewer', 'editor', 'admin'].includes(req.user.role),
      'restricted': req.user && (req.user.permissions?.canAccessRestrictedKnowledge || req.user.role === 'admin')
    };

    if (!accessHierarchy[plant.accessLevel]) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient access level for this plant',
        required: plant.accessLevel
      });
    }

    res.json({
      success: true,
      data: plant
    });

  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plant',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/medicinal-plants
 * @desc    Create new medicinal plant
 * @access  Private (Researcher, Editor, Admin)
 */
router.post('/', 
  authenticate, 
  authorize(['researcher', 'editor', 'admin']),
  async (req, res) => {
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

      // Update user contribution count
      if (req.user.contributions) {
        req.user.contributions.total += 1;
        req.user.contributions.pending += 1;
        await req.user.save();
      }

      res.status(201).json({
        success: true,
        message: 'Medicinal plant created successfully',
        data: plant
      });

    } catch (error) {
      console.error('Error creating plant:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create plant',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/medicinal-plants/:id
 * @desc    Update medicinal plant
 * @access  Private (Editor, Admin)
 */
router.put('/:id',
  authenticate,
  authorize(['editor', 'admin']),
  async (req, res) => {
    try {
      const plant = await MedicinalPlant.findById(req.params.id);

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found'
        });
      }

      // Create version snapshot before updating
      await plant.createVersion(req.user._id, req.body.changeLog || 'Update');

      // Update fields (except protected ones)
      const { _id, previousVersions, reviewHistory, ...updateData } = req.body;
      Object.assign(plant, updateData);

      // Add contributor
      plant.contributors.push({
        user: req.user._id,
        role: 'editor',
        contribution: req.body.changeLog || 'Update',
        contributedAt: new Date()
      });

      await plant.save();

      res.json({
        success: true,
        message: 'Plant updated successfully',
        data: plant
      });

    } catch (error) {
      console.error('Error updating plant:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update plant',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/medicinal-plants/:id/review
 * @desc    Update validation status (review workflow)
 * @access  Private (Reviewer, Editor, Admin)
 */
router.post('/:id/review',
  authenticate,
  checkPermission('canReview'),
  async (req, res) => {
    try {
      const plant = await MedicinalPlant.findById(req.params.id);

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found'
        });
      }

      const { status, comments } = req.body;

      const validStatuses = ['draft', 'pending_review', 'under_review', 'approved', 'published', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      await plant.updateValidationStatus(status, req.user._id, comments);

      res.json({
        success: true,
        message: 'Validation status updated',
        data: plant
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update status',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/medicinal-plants/:id
 * @desc    Soft delete medicinal plant
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const plant = await MedicinalPlant.findById(req.params.id);

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found'
        });
      }

      // Soft delete
      plant.isActive = false;
      await plant.save();

      res.json({
        success: true,
        message: 'Plant deactivated successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete plant',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/medicinal-plants/:id/versions
 * @desc    Get version history of a plant
 * @access  Private (Reviewer, Editor, Admin)
 */
router.get('/:id/versions',
  authenticate,
  authorize(['reviewer', 'editor', 'admin']),
  async (req, res) => {
    try {
      const plant = await MedicinalPlant.findById(req.params.id)
        .select('previousVersions version names')
        .populate('previousVersions.updatedBy', 'profile.firstName profile.lastName');

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found'
        });
      }

      res.json({
        success: true,
        data: {
          currentVersion: plant.version,
          plant: plant.names,
          history: plant.previousVersions
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch version history',
        error: error.message
      });
    }
  }
);

module.exports = router;
