const express = require('express');
const router = express.Router();
const { ClinicalStudy, MedicinalPlant } = require('../models');
const { 
  authenticate, 
  optionalAuth,
  authorize,
  checkPermission
} = require('../middleware/auth');

/**
 * @route   GET /api/clinical-studies
 * @desc    Get all published clinical studies
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      plantId,
      condition,
      studyType,
      evidenceLevel,
      efficacy,
      year,
      page = 1,
      limit = 20,
      sort = 'publicationDate',
      order = 'desc'
    } = req.query;

    let query = {
      isActive: true
    };

    // Show only verified studies to public
    if (!req.user || !['admin', 'editor', 'reviewer'].includes(req.user?.role)) {
      query.validationStatus = 'published';
    }

    // Filter by plant
    if (plantId) {
      query.plants = plantId;
    }

    // Filter by condition
    if (condition) {
      query.conditions = new RegExp(condition, 'i');
    }

    // Filter by study type
    if (studyType) {
      query.studyType = studyType;
    }

    // Filter by evidence level
    if (evidenceLevel) {
      query.evidenceLevel = evidenceLevel;
    }

    // Filter by efficacy
    if (efficacy) {
      query.efficacy = efficacy;
    }

    // Filter by publication year
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.publicationDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const [studies, total] = await Promise.all([
      ClinicalStudy.find(query)
        .populate('plants', 'names.scientific names.commonNames')
        .select('-supplementaryMaterials -verifiedBy')
        .limit(parseInt(limit))
        .skip(skip)
        .sort(sortObj)
        .lean(),
      ClinicalStudy.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: studies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinical studies',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/clinical-studies/:id
 * @desc    Get single clinical study by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const study = await ClinicalStudy.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('plants', 'names')
      .populate('verifiedBy', 'profile.firstName profile.lastName profile.affiliation');

    if (!study) {
      return res.status(404).json({
        success: false,
        message: 'Clinical study not found'
      });
    }

    res.json({
      success: true,
      data: study
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/clinical-studies/plant/:plantId
 * @desc    Get all studies for a specific plant
 * @access  Public
 */
router.get('/plant/:plantId', async (req, res) => {
  try {
    const studies = await ClinicalStudy.findByPlant(req.params.plantId);

    res.json({
      success: true,
      data: studies,
      count: studies.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studies for plant',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/clinical-studies/condition/:condition
 * @desc    Get all studies for a specific condition
 * @access  Public
 */
router.get('/condition/:condition', async (req, res) => {
  try {
    const studies = await ClinicalStudy.findByCondition(req.params.condition);

    res.json({
      success: true,
      data: studies,
      count: studies.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studies for condition',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/clinical-studies
 * @desc    Create new clinical study
 * @access  Private (Researcher, Editor, Admin)
 */
router.post('/',
  authenticate,
  authorize(['researcher', 'editor', 'admin']),
  async (req, res) => {
    try {
      const studyData = {
        ...req.body,
        validationStatus: 'pending'
      };

      const study = new ClinicalStudy(studyData);
      await study.save();

      res.status(201).json({
        success: true,
        message: 'Clinical study created successfully',
        data: study
      });

    } catch (error) {
      console.error('Error creating study:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create clinical study',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/clinical-studies/:id
 * @desc    Update clinical study
 * @access  Private (Editor, Admin)
 */
router.put('/:id',
  authenticate,
  authorize(['editor', 'admin']),
  async (req, res) => {
    try {
      const study = await ClinicalStudy.findById(req.params.id);

      if (!study) {
        return res.status(404).json({
          success: false,
          message: 'Study not found'
        });
      }

      // Update fields
      const { _id, verifiedBy, verifiedAt, ...updateData } = req.body;
      Object.assign(study, updateData);

      await study.save();

      res.json({
        success: true,
        message: 'Study updated successfully',
        data: study
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update study',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/clinical-studies/:id/verify
 * @desc    Verify a clinical study
 * @access  Private (Reviewer, Editor, Admin)
 */
router.post('/:id/verify',
  authenticate,
  checkPermission('canReview'),
  async (req, res) => {
    try {
      const study = await ClinicalStudy.findById(req.params.id);

      if (!study) {
        return res.status(404).json({
          success: false,
          message: 'Study not found'
        });
      }

      await study.verify(req.user._id);

      res.json({
        success: true,
        message: 'Study verified successfully',
        data: study
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to verify study',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/clinical-studies/:id/cite
 * @desc    Add citation reference to a study
 * @access  Private (Researcher, Editor, Admin)
 */
router.post('/:id/cite',
  authenticate,
  authorize(['researcher', 'editor', 'admin']),
  async (req, res) => {
    try {
      const { citingStudyId } = req.body;

      if (!citingStudyId) {
        return res.status(400).json({
          success: false,
          message: 'citingStudyId is required'
        });
      }

      const study = await ClinicalStudy.findById(req.params.id);

      if (!study) {
        return res.status(404).json({
          success: false,
          message: 'Study not found'
        });
      }

      await study.addCitation(citingStudyId);

      res.json({
        success: true,
        message: 'Citation added successfully',
        data: {
          citationCount: study.citationCount
        }
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to add citation',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/clinical-studies/:id
 * @desc    Soft delete clinical study
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res) => {
    try {
      const study = await ClinicalStudy.findById(req.params.id);

      if (!study) {
        return res.status(404).json({
          success: false,
          message: 'Study not found'
        });
      }

      study.isActive = false;
      await study.save();

      res.json({
        success: true,
        message: 'Study deactivated successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete study',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/clinical-studies/stats/summary
 * @desc    Get statistics about clinical studies
 * @access  Public
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const [
      totalStudies,
      byType,
      byEvidenceLevel,
      byEfficacy
    ] = await Promise.all([
      ClinicalStudy.countDocuments({ validationStatus: 'published', isActive: true }),
      ClinicalStudy.aggregate([
        { $match: { validationStatus: 'published', isActive: true } },
        { $group: { _id: '$studyType', count: { $sum: 1 } } }
      ]),
      ClinicalStudy.aggregate([
        { $match: { validationStatus: 'published', isActive: true } },
        { $group: { _id: '$evidenceLevel', count: { $sum: 1 } } }
      ]),
      ClinicalStudy.aggregate([
        { $match: { validationStatus: 'published', isActive: true } },
        { $group: { _id: '$efficacy', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalStudies,
        byType,
        byEvidenceLevel,
        byEfficacy
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
