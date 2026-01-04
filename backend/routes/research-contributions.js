const express = require('express');
const router = express.Router();
const { ResearchContribution, MedicinalPlant, ClinicalStudy, IndigenousKnowledge } = require('../models');
const { 
  authenticate, 
  authorize,
  checkPermission
} = require('../middleware/auth');

/**
 * @route   GET /api/research-contributions
 * @desc    Get all research contributions (filtered by user role)
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      contributionType,
      priority,
      page = 1,
      limit = 20
    } = req.query;

    let query = {
      isActive: true
    };

    // Filter based on user role
    if (req.user.role === 'researcher' || req.user.role === 'user') {
      // Users see only their own contributions
      query['contributor.user'] = req.user._id;
    } else if (req.user.role === 'reviewer') {
      // Reviewers see contributions assigned to them
      query.$or = [
        { 'reviewers.reviewer': req.user._id },
        { status: { $in: ['submitted', 'under_review'] } }
      ];
    }
    // Editors and admins see all

    // Filters
    if (status) {
      query.status = status;
    }

    if (contributionType) {
      query.contributionType = contributionType;
    }

    if (priority) {
      query.priority = priority;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contributions, total] = await Promise.all([
      ResearchContribution.find(query)
        .populate('contributor.user', 'username profile')
        .populate('reviewers.reviewer', 'profile.firstName profile.lastName')
        .populate('relatedPlant', 'names.scientific names.commonNames')
        .populate('relatedStudy', 'title publicationDate')
        .select('-contributionData -attachments') // Reduce payload
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ submittedAt: -1 })
        .lean(),
      ResearchContribution.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: contributions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contributions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/research-contributions/my-contributions
 * @desc    Get current user's contributions
 * @access  Private
 */
router.get('/my-contributions', authenticate, async (req, res) => {
  try {
    const contributions = await ResearchContribution.getByContributor(req.user._id)
      .populate('relatedPlant', 'names')
      .populate('relatedStudy', 'title');

    res.json({
      success: true,
      data: contributions,
      count: contributions.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your contributions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/research-contributions/pending-reviews
 * @desc    Get contributions pending review
 * @access  Private (Reviewer, Editor, Admin)
 */
router.get('/pending-reviews',
  authenticate,
  checkPermission('canReview'),
  async (req, res) => {
    try {
      const pending = await ResearchContribution.getPendingReviews()
        .populate('contributor.user', 'username profile')
        .populate('relatedPlant', 'names');

      res.json({
        success: true,
        data: pending,
        count: pending.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending reviews',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/research-contributions/my-reviews
 * @desc    Get contributions assigned to current user for review
 * @access  Private (Reviewer)
 */
router.get('/my-reviews',
  authenticate,
  checkPermission('canReview'),
  async (req, res) => {
    try {
      const reviews = await ResearchContribution.getAwaitingReview(req.user._id)
        .populate('contributor.user', 'username profile')
        .populate('relatedPlant', 'names');

      res.json({
        success: true,
        data: reviews,
        count: reviews.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your reviews',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/research-contributions/:id
 * @desc    Get single contribution by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const contribution = await ResearchContribution.findById(req.params.id)
      .populate('contributor.user', 'username profile')
      .populate('reviewers.reviewer', 'profile')
      .populate('reviews.reviewer', 'profile')
      .populate('relatedPlant', 'names')
      .populate('relatedStudy', 'title authors')
      .populate('editorDecision.editor', 'profile');

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }

    // Access control
    const canView =
      contribution.contributor.user._id.toString() === req.user._id.toString() ||
      contribution.reviewers.some(r => r.reviewer._id.toString() === req.user._id.toString()) ||
      ['reviewer', 'editor', 'admin'].includes(req.user.role);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this contribution'
      });
    }

    // Filter internal comments for non-staff
    if (!['editor', 'admin'].includes(req.user.role)) {
      contribution.comments = contribution.comments.filter(c => !c.isInternal);
    }

    res.json({
      success: true,
      data: contribution
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contribution',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/research-contributions
 * @desc    Create new research contribution
 * @access  Private (Authenticated users)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const contributionData = {
      ...req.body,
      contributor: {
        user: req.user._id,
        name: req.user.profile?.firstName && req.user.profile?.lastName 
          ? `${req.user.profile.firstName} ${req.user.profile.lastName}`
          : req.user.username,
        email: req.user.email,
        affiliation: req.user.profile?.affiliation,
        credentials: req.user.profile?.credentials,
        expertise: req.user.expertise?.topics || []
      },
      status: 'draft'
    };

    const contribution = new ResearchContribution(contributionData);
    await contribution.save();

    // Update user contribution count
    if (req.user.contributions) {
      req.user.contributions.total += 1;
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Contribution created successfully',
      data: contribution
    });

  } catch (error) {
    console.error('Error creating contribution:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create contribution',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/research-contributions/:id/submit
 * @desc    Submit contribution for review
 * @access  Private (Contribution owner)
 */
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const contribution = await ResearchContribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }

    // Check ownership
    if (contribution.contributor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Can only submit your own contributions'
      });
    }

    // Check if already submitted
    if (contribution.status !== 'draft' && contribution.status !== 'revised') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit contribution with status: ${contribution.status}`
      });
    }

    await contribution.submit();

    // Update user stats
    if (req.user.contributions) {
      req.user.contributions.pending += 1;
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Contribution submitted for review',
      data: contribution
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to submit contribution',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/research-contributions/:id/assign-reviewer
 * @desc    Assign reviewer to contribution
 * @access  Private (Editor, Admin)
 */
router.post('/:id/assign-reviewer',
  authenticate,
  authorize(['editor', 'admin']),
  async (req, res) => {
    try {
      const { reviewerId } = req.body;

      if (!reviewerId) {
        return res.status(400).json({
          success: false,
          message: 'reviewerId is required'
        });
      }

      const contribution = await ResearchContribution.findById(req.params.id);

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: 'Contribution not found'
        });
      }

      await contribution.assignReviewer(reviewerId);

      res.json({
        success: true,
        message: 'Reviewer assigned successfully',
        data: contribution
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to assign reviewer',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/research-contributions/:id/review
 * @desc    Add review to contribution
 * @access  Private (Assigned reviewer)
 */
router.post('/:id/review',
  authenticate,
  checkPermission('canReview'),
  async (req, res) => {
    try {
      const contribution = await ResearchContribution.findById(req.params.id);

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: 'Contribution not found'
        });
      }

      // Check if user is assigned as reviewer
      const isAssigned = contribution.reviewers.some(
        r => r.reviewer.toString() === req.user._id.toString()
      );

      if (!isAssigned && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned as a reviewer for this contribution'
        });
      }

      const reviewData = {
        decision: req.body.decision,
        rating: req.body.rating,
        comments: req.body.comments,
        suggestions: req.body.suggestions,
        privateNotes: req.body.privateNotes,
        concerns: req.body.concerns
      };

      await contribution.addReview(req.user._id, reviewData);

      // Update user review stats
      if (req.user.reviews) {
        req.user.reviews.total += 1;
        await req.user.save();
      }

      res.json({
        success: true,
        message: 'Review submitted successfully',
        data: contribution
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to submit review',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/research-contributions/:id/request-revision
 * @desc    Request revision from contributor
 * @access  Private (Reviewer, Editor, Admin)
 */
router.post('/:id/request-revision',
  authenticate,
  checkPermission('canReview'),
  async (req, res) => {
    try {
      const contribution = await ResearchContribution.findById(req.params.id);

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: 'Contribution not found'
        });
      }

      const { comments } = req.body;

      if (!comments) {
        return res.status(400).json({
          success: false,
          message: 'Comments are required when requesting revision'
        });
      }

      await contribution.requestRevision(comments);

      res.json({
        success: true,
        message: 'Revision requested from contributor',
        data: contribution
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to request revision',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/research-contributions/:id/approve
 * @desc    Approve contribution
 * @access  Private (Editor, Admin)
 */
router.post('/:id/approve',
  authenticate,
  authorize(['editor', 'admin']),
  async (req, res) => {
    try {
      const contribution = await ResearchContribution.findById(req.params.id);

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: 'Contribution not found'
        });
      }

      // Check if sufficient reviews
      if (contribution.reviews.length < 2 && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'At least 2 reviews required before approval'
        });
      }

      await contribution.approve(req.user._id);

      // Update contributor stats
      const contributor = await require('../models').User.findById(contribution.contributor.user);
      if (contributor && contributor.contributions) {
        contributor.contributions.approved += 1;
        contributor.contributions.pending -= 1;
        await contributor.save();
      }

      res.json({
        success: true,
        message: 'Contribution approved successfully',
        data: contribution
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to approve contribution',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/research-contributions/:id/integrate
 * @desc    Integrate contribution into main database
 * @access  Private (Editor, Admin)
 */
router.post('/:id/integrate',
  authenticate,
  authorize(['editor', 'admin']),
  async (req, res) => {
    try {
      const contribution = await ResearchContribution.findById(req.params.id)
        .populate('relatedPlant')
        .populate('relatedStudy');

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: 'Contribution not found'
        });
      }

      if (contribution.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Contribution must be approved before integration'
        });
      }

      // Integration logic depends on contribution type
      // This is a placeholder - implement actual integration logic

      await contribution.integrate(req.user._id);

      res.json({
        success: true,
        message: 'Contribution integrated successfully',
        data: contribution
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to integrate contribution',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/research-contributions/:id/comment
 * @desc    Add comment to contribution
 * @access  Private
 */
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const contribution = await ResearchContribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }

    // Check access
    const canComment =
      contribution.contributor.user.toString() === req.user._id.toString() ||
      contribution.reviewers.some(r => r.reviewer.toString() === req.user._id.toString()) ||
      ['editor', 'admin'].includes(req.user.role);

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Cannot comment on this contribution'
      });
    }

    const { text, isInternal } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Only staff can post internal comments
    const internal = isInternal && ['editor', 'admin'].includes(req.user.role);

    await contribution.addComment(req.user._id, text, internal);

    res.json({
      success: true,
      message: 'Comment added successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/research-contributions/:id
 * @desc    Update contribution (by owner)
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const contribution = await ResearchContribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }

    // Check ownership
    if (contribution.contributor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Can only update your own contributions'
      });
    }

    // Can only update if draft or revision_requested
    if (!['draft', 'revision_requested'].includes(contribution.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update contribution with status: ${contribution.status}`
      });
    }

    // Update allowed fields
    const { title, description, contributionData, sources } = req.body;
    
    if (title) contribution.title = title;
    if (description) contribution.description = description;
    if (contributionData) contribution.contributionData = contributionData;
    if (sources) contribution.sources = sources;

    // If updating after revision request, change status to revised
    if (contribution.status === 'revision_requested') {
      contribution.status = 'revised';
      
      // Add to revisions history
      contribution.revisions.push({
        versionNumber: contribution.revisions.length + 1,
        data: contribution.contributionData,
        revisedBy: req.user._id,
        revisedAt: new Date(),
        changesSummary: req.body.changesSummary || 'Revision'
      });
    }

    await contribution.save();

    res.json({
      success: true,
      message: 'Contribution updated successfully',
      data: contribution
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update contribution',
      error: error.message
    });
  }
});

module.exports = router;
