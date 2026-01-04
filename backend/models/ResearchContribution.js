const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Schema for managing researcher contributions and peer review workflow
const researchContributionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  
  // Contributor Information
  contributor: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String,
    affiliation: String,
    credentials: String,
    expertise: [String]
  },
  
  // Contribution Type
  contributionType: {
    type: String,
    required: true,
    enum: [
      'New Plant Entry',
      'Traditional Use Addition',
      'Clinical Study Addition',
      'Phytochemical Data',
      'Safety Information',
      'Image Upload',
      'Correction',
      'Translation',
      'Indigenous Knowledge',
      'Review',
      'Other'
    ]
  },
  
  // Related Entities
  relatedPlant: {
    type: String,
    ref: 'MedicinalPlant'
  },
  relatedStudy: {
    type: String,
    ref: 'ClinicalStudy'
  },
  relatedKnowledge: {
    type: String,
    ref: 'IndigenousKnowledge'
  },
  
  // Contribution Data (flexible structure for different types)
  contributionData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Description and Context
  title: {
    type: String,
    required: true
  },
  description: String,
  methodology: String,
  sources: [{
    type: String,
    description: String,
    url: String,
    doi: String,
    accessDate: Date
  }],
  
  // Attached Files
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number,
    uploadDate: Date
  }],
  
  // Submission Status
  status: {
    type: String,
    required: true,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'revision_requested',
      'revised',
      'approved',
      'rejected',
      'integrated',
      'withdrawn'
    ],
    default: 'draft'
  },
  
  submittedAt: Date,
  
  // Peer Review Process
  reviewers: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    acceptedAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'declined', 'in_progress', 'completed']
    }
  }],
  
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    decision: {
      type: String,
      enum: ['approve', 'reject', 'request_revision', 'request_more_info']
    },
    rating: {
      accuracy: {
        type: Number,
        min: 1,
        max: 5
      },
      completeness: {
        type: Number,
        min: 1,
        max: 5
      },
      relevance: {
        type: Number,
        min: 1,
        max: 5
      },
      sourceQuality: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    comments: String,
    suggestions: String,
    privateNotes: String, // Only visible to admin/editors
    concerns: [String]
  }],
  
  // Revision Tracking
  revisions: [{
    versionNumber: Number,
    data: mongoose.Schema.Types.Mixed,
    revisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    revisedAt: Date,
    changesSummary: String,
    addressedComments: [String]
  }],
  
  // Editor Actions
  editorDecision: {
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decision: {
      type: String,
      enum: ['accept', 'reject', 'require_revision', 'pending']
    },
    decisionDate: Date,
    comments: String,
    integratedAt: Date,
    integratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Quality Metrics
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  citationQuality: {
    type: String,
    enum: ['Excellent', 'Good', 'Adequate', 'Poor']
  },
  completenessCheck: {
    hasScientificName: Boolean,
    hasTraditionalUse: Boolean,
    hasSources: Boolean,
    hasSafetyInfo: Boolean,
    hasImages: Boolean
  },
  
  // Priority and Flags
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  flags: [{
    type: {
      type: String,
      enum: ['Duplicate', 'Incomplete', 'Questionable Source', 'Safety Concern', 'IPR Issue', 'Other']
    },
    description: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: Date,
    resolved: Boolean,
    resolvedAt: Date,
    resolution: String
  }],
  
  // Communication
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    postedAt: Date,
    isInternal: Boolean // Not visible to contributor
  }],
  
  // Notifications
  notifications: [{
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    sentAt: Date,
    read: Boolean
  }],
  
  // Attribution and Recognition
  acknowledgment: {
    public: Boolean,
    displayName: String,
    contributionNote: String
  },
  
  // Metadata
  keywords: [String],
  tags: [String],
  category: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true,
  collection: 'research_contributions'
});

// Indexes
researchContributionSchema.index({ 'contributor.user': 1 });
researchContributionSchema.index({ status: 1 });
researchContributionSchema.index({ contributionType: 1 });
researchContributionSchema.index({ relatedPlant: 1 });
researchContributionSchema.index({ submittedAt: -1 });
researchContributionSchema.index({ 'editorDecision.decision': 1 });
researchContributionSchema.index({ priority: 1 });

// Text search
researchContributionSchema.index({
  title: 'text',
  description: 'text',
  'contributor.name': 'text'
});

// Methods
researchContributionSchema.methods.submit = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

researchContributionSchema.methods.assignReviewer = function(reviewerId) {
  this.reviewers.push({
    reviewer: reviewerId,
    assignedAt: new Date(),
    status: 'assigned'
  });
  this.status = 'under_review';
  return this.save();
};

researchContributionSchema.methods.addReview = function(reviewerId, reviewData) {
  this.reviews.push({
    reviewer: reviewerId,
    reviewDate: new Date(),
    ...reviewData
  });
  
  // Calculate average quality score
  if (reviewData.rating) {
    const ratings = Object.values(reviewData.rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    this.qualityScore = (avgRating / 5) * 100;
  }
  
  return this.save();
};

researchContributionSchema.methods.requestRevision = function(comments) {
  this.status = 'revision_requested';
  // Add notification logic here
  return this.save();
};

researchContributionSchema.methods.approve = function(editorId) {
  this.status = 'approved';
  this.editorDecision = {
    editor: editorId,
    decision: 'accept',
    decisionDate: new Date()
  };
  return this.save();
};

researchContributionSchema.methods.integrate = function(editorId) {
  this.status = 'integrated';
  this.editorDecision.integratedAt = new Date();
  this.editorDecision.integratedBy = editorId;
  return this.save();
};

researchContributionSchema.methods.addComment = function(userId, text, isInternal = false) {
  this.comments.push({
    user: userId,
    text,
    postedAt: new Date(),
    isInternal
  });
  return this.save();
};

// Statics
researchContributionSchema.statics.getPendingReviews = function() {
  return this.find({
    status: { $in: ['submitted', 'under_review'] },
    isActive: true
  }).sort({ submittedAt: 1 });
};

researchContributionSchema.statics.getByContributor = function(userId) {
  return this.find({
    'contributor.user': userId,
    isActive: true
  }).sort({ createdAt: -1 });
};

researchContributionSchema.statics.getAwaitingReview = function(reviewerId) {
  return this.find({
    'reviewers.reviewer': reviewerId,
    'reviewers.status': { $in: ['assigned', 'accepted', 'in_progress'] },
    status: 'under_review',
    isActive: true
  });
};

module.exports = mongoose.model('ResearchContribution', researchContributionSchema);
