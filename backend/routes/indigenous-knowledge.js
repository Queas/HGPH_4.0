const express = require('express');
const router = express.Router();
const { IndigenousKnowledge, MedicinalPlant } = require('../models');
const { 
  authenticate, 
  authorize,
  checkPermission
} = require('../middleware/auth');

/**
 * @route   GET /api/indigenous-knowledge
 * @desc    Get indigenous knowledge records (with strict access control)
 * @access  Private (Authenticated users only)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      community,
      indigenousGroup,
      knowledgeType,
      iprStatus,
      consentStatus,
      page = 1,
      limit = 20
    } = req.query;

    let query = {
      isActive: true
    };

    // Access control based on user role and permissions
    if (req.user.role === 'user' || req.user.role === 'professional') {
      // Regular users can only see public knowledge
      query.accessLevel = 'public';
      query['consent.obtained'] = true;
    } else if (req.user.role === 'researcher') {
      // Researchers can see public and researcher-level
      query.accessLevel = { $in: ['public', 'registered_users', 'researchers_only'] };
      query['consent.obtained'] = true;
    } else if (req.user.role === 'indigenous_representative') {
      // Indigenous reps can see their own community's knowledge
      if (req.user.indigenousAffiliation?.community) {
        query['community.name'] = req.user.indigenousAffiliation.community;
      } else {
        return res.status(403).json({
          success: false,
          message: 'No community affiliation found'
        });
      }
    }
    // Admin, editor, reviewer with canAccessRestrictedKnowledge can see all

    // Filters
    if (community) {
      query['community.name'] = new RegExp(community, 'i');
    }

    if (indigenousGroup) {
      query['community.indigenousGroup'] = new RegExp(indigenousGroup, 'i');
    }

    if (knowledgeType) {
      query.knowledgeType = knowledgeType;
    }

    if (iprStatus) {
      query['ipr.status'] = iprStatus;
    }

    if (consentStatus === 'valid') {
      query['consent.obtained'] = true;
      query.$or = [
        { 'consent.expiryDate': { $gt: new Date() } },
        { 'consent.expiryDate': null }
      ];
      query['consent.revokedAt'] = { $exists: false };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [knowledge, total] = await Promise.all([
      IndigenousKnowledge.find(query)
        .select('-accessLog -media') // Don't expose sensitive data
        .populate('plants', 'names.scientific names.commonNames')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean(),
      IndigenousKnowledge.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: knowledge,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching indigenous knowledge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch indigenous knowledge',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/indigenous-knowledge/public
 * @desc    Get only public indigenous knowledge (no auth required)
 * @access  Public
 */
router.get('/public', async (req, res) => {
  try {
    const knowledge = await IndigenousKnowledge.findPublicKnowledge()
      .select('-accessLog -consent.consentDocument -consent.witnesses')
      .populate('plants', 'names.scientific names.commonNames')
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: knowledge,
      count: knowledge.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public knowledge',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/indigenous-knowledge/:id
 * @desc    Get single indigenous knowledge record (with consent check)
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const knowledge = await IndigenousKnowledge.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('plants', 'names')
      .populate('relatedStudies', 'title authors publicationDate');

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Indigenous knowledge not found'
      });
    }

    // Check consent validity
    if (!knowledge.checkConsentValidity()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - consent not valid or expired',
        consentStatus: {
          obtained: knowledge.consent.obtained,
          expired: knowledge.consent.expiryDate ? new Date() > knowledge.consent.expiryDate : false,
          revoked: !!knowledge.consent.revokedAt
        }
      });
    }

    // Check access level
    const canAccess = 
      knowledge.accessLevel === 'public' ||
      (knowledge.accessLevel === 'registered_users' && req.user) ||
      (knowledge.accessLevel === 'researchers_only' && ['researcher', 'reviewer', 'editor', 'admin'].includes(req.user.role)) ||
      (knowledge.accessLevel === 'community_only' && req.user.indigenousAffiliation?.community === knowledge.community.name) ||
      req.user.role === 'admin' ||
      (req.user.permissions && req.user.permissions.canAccessRestrictedKnowledge);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient access level for this knowledge',
        required: knowledge.accessLevel,
        userRole: req.user.role
      });
    }

    // Log access (audit trail)
    const purpose = req.query.purpose || 'View';
    await knowledge.grantAccess(req.user._id, purpose);

    res.json({
      success: true,
      data: knowledge
    });

  } catch (error) {
    console.error('Error fetching knowledge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch indigenous knowledge',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/indigenous-knowledge/community/:name
 * @desc    Get knowledge by community name
 * @access  Private
 */
router.get('/community/:name', authenticate, async (req, res) => {
  try {
    // Access control
    const canView = 
      req.user.role === 'admin' ||
      (req.user.permissions && req.user.permissions.canAccessRestrictedKnowledge) ||
      (req.user.indigenousAffiliation?.community === req.params.name);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to community knowledge'
      });
    }

    const knowledge = await IndigenousKnowledge.findByCommunity(req.params.name)
      .populate('plants', 'names');

    res.json({
      success: true,
      data: knowledge,
      count: knowledge.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community knowledge',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/indigenous-knowledge
 * @desc    Create new indigenous knowledge record
 * @access  Private (Researcher, Indigenous Rep, Admin)
 */
router.post('/',
  authenticate,
  authorize(['researcher', 'indigenous_representative', 'admin']),
  async (req, res) => {
    try {
      // Validate consent data
      if (!req.body.consent || !req.body.consent.obtained) {
        return res.status(400).json({
          success: false,
          message: 'Prior Informed Consent (PIC) is required for indigenous knowledge'
        });
      }

      // Indigenous reps can only create for their own community
      if (req.user.role === 'indigenous_representative') {
        if (req.user.indigenousAffiliation?.community !== req.body.community?.name) {
          return res.status(403).json({
            success: false,
            message: 'Can only create knowledge for your own community'
          });
        }
      }

      const knowledgeData = {
        ...req.body,
        recordedBy: {
          name: req.user.profile?.firstName && req.user.profile?.lastName 
            ? `${req.user.profile.firstName} ${req.user.profile.lastName}`
            : req.user.username,
          affiliation: req.user.profile?.affiliation || req.user.indigenousAffiliation?.community || 'HalamangGaling',
          role: req.user.role
        },
        recordingDate: new Date(),
        accessLevel: req.body.accessLevel || 'restricted', // Default to restricted
        compliance: {
          ipraCompliant: false, // Needs review
          nagoyaCompliant: false, // Needs review
          ncipApproved: false,
          lastReviewDate: new Date()
        }
      };

      const knowledge = new IndigenousKnowledge(knowledgeData);
      await knowledge.save();

      res.status(201).json({
        success: true,
        message: 'Indigenous knowledge created successfully. Pending NCIP review.',
        data: knowledge
      });

    } catch (error) {
      console.error('Error creating knowledge:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create indigenous knowledge',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/indigenous-knowledge/:id
 * @desc    Update indigenous knowledge record
 * @access  Private (Indigenous Rep for own community, Admin)
 */
router.put('/:id',
  authenticate,
  async (req, res) => {
    try {
      const knowledge = await IndigenousKnowledge.findById(req.params.id);

      if (!knowledge) {
        return res.status(404).json({
          success: false,
          message: 'Knowledge not found'
        });
      }

      // Access control
      const canEdit = 
        req.user.role === 'admin' ||
        (req.user.role === 'indigenous_representative' && 
         req.user.indigenousAffiliation?.community === knowledge.community.name);

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Cannot edit this knowledge record'
        });
      }

      // Update fields
      const { _id, consent, ipr, compliance, ...updateData } = req.body;
      Object.assign(knowledge, updateData);

      await knowledge.save();

      res.json({
        success: true,
        message: 'Knowledge updated successfully',
        data: knowledge
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update knowledge',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/indigenous-knowledge/:id/revoke-consent
 * @desc    Revoke consent for indigenous knowledge
 * @access  Private (Indigenous Rep for own community, Admin)
 */
router.post('/:id/revoke-consent',
  authenticate,
  async (req, res) => {
    try {
      const knowledge = await IndigenousKnowledge.findById(req.params.id);

      if (!knowledge) {
        return res.status(404).json({
          success: false,
          message: 'Knowledge not found'
        });
      }

      // Only indigenous rep or admin can revoke
      const canRevoke = 
        req.user.role === 'admin' ||
        (req.user.role === 'indigenous_representative' && 
         req.user.indigenousAffiliation?.community === knowledge.community.name) ||
        (req.user.permissions && req.user.permissions.canManageIPR);

      if (!canRevoke) {
        return res.status(403).json({
          success: false,
          message: 'Cannot revoke consent for this knowledge'
        });
      }

      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Reason for revocation is required'
        });
      }

      await knowledge.revokeConsent(reason);

      res.json({
        success: true,
        message: 'Consent revoked successfully',
        data: {
          consentStatus: knowledge.consent,
          accessLevel: knowledge.accessLevel
        }
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to revoke consent',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/indigenous-knowledge/:id/access-log
 * @desc    Get access log for knowledge record (audit trail)
 * @access  Private (Indigenous Rep for own community, Admin)
 */
router.get('/:id/access-log',
  authenticate,
  async (req, res) => {
    try {
      const knowledge = await IndigenousKnowledge.findById(req.params.id)
        .populate('accessLog.user', 'username profile.firstName profile.lastName profile.affiliation');

      if (!knowledge) {
        return res.status(404).json({
          success: false,
          message: 'Knowledge not found'
        });
      }

      // Access control
      const canView = 
        req.user.role === 'admin' ||
        (req.user.role === 'indigenous_representative' && 
         req.user.indigenousAffiliation?.community === knowledge.community.name) ||
        (req.user.permissions && req.user.permissions.canManageIPR);

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Cannot view access log'
        });
      }

      res.json({
        success: true,
        data: {
          community: knowledge.community,
          accessLog: knowledge.accessLog,
          totalAccesses: knowledge.accessLog.length
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch access log',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/indigenous-knowledge/pending/ipr-review
 * @desc    Get knowledge records requiring IPR review
 * @access  Private (Admin, Users with canManageIPR)
 */
router.get('/pending/ipr-review',
  authenticate,
  checkPermission('canManageIPR'),
  async (req, res) => {
    try {
      const pending = await IndigenousKnowledge.requiresIPRReview()
        .populate('plants', 'names');

      res.json({
        success: true,
        data: pending,
        count: pending.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending IPR reviews',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/indigenous-knowledge/:id/approve-ipr
 * @desc    Approve IPR status for knowledge record
 * @access  Private (Admin, Users with canManageIPR)
 */
router.post('/:id/approve-ipr',
  authenticate,
  checkPermission('canManageIPR'),
  async (req, res) => {
    try {
      const knowledge = await IndigenousKnowledge.findById(req.params.id);

      if (!knowledge) {
        return res.status(404).json({
          success: false,
          message: 'Knowledge not found'
        });
      }

      const { 
        iprStatus, 
        registrationNumber, 
        protectionLevel,
        ncipApproved 
      } = req.body;

      // Update IPR status
      if (iprStatus) {
        knowledge.ipr.status = iprStatus;
      }
      if (registrationNumber) {
        knowledge.ipr.registrationNumber = registrationNumber;
        knowledge.ipr.registeredWith = 'National Commission on Indigenous Peoples';
        knowledge.ipr.registrationDate = new Date();
      }
      if (protectionLevel) {
        knowledge.ipr.protectionLevel = protectionLevel;
      }

      // Update compliance
      knowledge.compliance.ipraCompliant = true;
      knowledge.compliance.nagoyaCompliant = true;
      knowledge.compliance.ncipApproved = ncipApproved !== undefined ? ncipApproved : true;
      knowledge.compliance.lastReviewDate = new Date();
      knowledge.compliance.nextReviewDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

      await knowledge.save();

      res.json({
        success: true,
        message: 'IPR status approved successfully',
        data: {
          ipr: knowledge.ipr,
          compliance: knowledge.compliance
        }
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to approve IPR',
        error: error.message
      });
    }
  }
);

module.exports = router;
