const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Schema for tracking indigenous community contributions and IPR
const indigenousKnowledgeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  
  // Community Information
  community: {
    name: {
      type: String,
      required: true
    },
    indigenousGroup: {
      type: String,
      required: true
    },
    location: {
      region: String,
      province: String,
      municipality: String,
      barangay: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  
  // Knowledge Details
  knowledgeType: {
    type: String,
    required: true,
    enum: ['Medicinal Use', 'Preparation Method', 'Cultural Practice', 'Spiritual Use', 'Agricultural Practice', 'Conservation Method', 'Other']
  },
  
  plants: [{
    type: String,
    ref: 'MedicinalPlant'
  }],
  
  traditionalKnowledge: {
    description: {
      type: String,
      required: true
    },
    usage: String,
    preparation: String,
    rituals: String,
    prohibitions: String,
    seasonality: String,
    transmissionMethod: String // How knowledge is passed down
  },
  
  // Prior Informed Consent (PIC) - CRITICAL for Nagoya Protocol Compliance
  consent: {
    obtained: {
      type: Boolean,
      required: true,
      default: false
    },
    consentId: {
      type: String,
      unique: true,
      sparse: true
    },
    consentDate: Date,
    expiryDate: Date,
    scopeOfUse: [{
      type: String,
      enum: ['Research', 'Education', 'Publication', 'Commercial', 'Database Inclusion', 'Public Display']
    }],
    consentDocument: String, // URL to signed consent form
    witnesses: [{
      name: String,
      role: String,
      signature: String // URL to signature image
    }],
    restrictions: String,
    revocable: {
      type: Boolean,
      default: true
    },
    revokedAt: Date,
    revokedReason: String
  },
  
  // Intellectual Property Rights
  ipr: {
    status: {
      type: String,
      required: true,
      enum: ['public_domain', 'protected', 'proprietary', 'restricted', 'pending_assessment'],
      default: 'pending_assessment'
    },
    registrationNumber: String,
    registeredWith: String, // e.g., NCIP, WIPO
    registrationDate: Date,
    protectionLevel: {
      type: String,
      enum: ['None', 'Community', 'National', 'International']
    },
    rightHolders: [{
      name: String,
      relationship: String,
      contactInfo: String
    }]
  },
  
  // Benefit Sharing - For Nagoya Protocol
  benefitSharing: {
    applicable: {
      type: Boolean,
      default: false
    },
    agreementId: String,
    agreementDate: Date,
    terms: String,
    benefits: [{
      type: {
        type: String,
        enum: ['Monetary', 'Non-monetary', 'Technology Transfer', 'Capacity Building', 'Joint Research', 'Royalty', 'Other']
      },
      description: String,
      value: String
    }],
    disbursementSchedule: String,
    communityContact: String
  },
  
  // Documentation
  recordedBy: {
    name: {
      type: String,
      required: true
    },
    affiliation: String,
    role: String,
    contactInfo: String
  },
  recordingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  methodology: String, // How the knowledge was documented
  
  // Elders and Knowledge Holders
  knowledgeHolders: [{
    name: String,
    age: Number,
    role: String, // e.g., healer, elder, practitioner
    yearsOfPractice: Number,
    lineage: String,
    consentGiven: Boolean,
    anonymous: {
      type: Boolean,
      default: false
    }
  }],
  
  // Validation and Verification
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'community_verified', 'expert_verified', 'disputed'],
      default: 'unverified'
    },
    verifiedBy: [{
      name: String,
      role: String,
      date: Date,
      notes: String
    }],
    communityApproved: Boolean,
    communityApprovalDate: Date
  },
  
  // Access Control
  accessLevel: {
    type: String,
    required: true,
    enum: ['public', 'registered_users', 'researchers_only', 'community_only', 'restricted', 'private'],
    default: 'restricted'
  },
  accessRestrictions: String,
  
  // Sensitivity Classification
  sensitivity: {
    level: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Sacred'],
      default: 'Medium'
    },
    reason: String,
    culturalSignificance: String
  },
  
  // Media
  media: [{
    type: {
      type: String,
      enum: ['Photo', 'Video', 'Audio', 'Document']
    },
    url: String,
    description: String,
    consentForUse: Boolean,
    watermarked: Boolean
  }],
  
  // Related Records
  relatedStudies: [{
    type: String,
    ref: 'ClinicalStudy'
  }],
  
  // Audit Trail
  accessLog: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessDate: Date,
    purpose: String,
    approved: Boolean
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: Date,
  archiveReason: String,
  
  // Compliance Flags
  compliance: {
    ipraCompliant: Boolean, // Indigenous Peoples Rights Act
    nagoyaCompliant: Boolean, // Nagoya Protocol
    ncipApproved: Boolean, // National Commission on Indigenous Peoples
    lastReviewDate: Date,
    nextReviewDate: Date
  }
  
}, {
  timestamps: true,
  collection: 'indigenous_knowledge'
});

// Indexes
indigenousKnowledgeSchema.index({ 'community.name': 1 });
indigenousKnowledgeSchema.index({ 'community.indigenousGroup': 1 });
indigenousKnowledgeSchema.index({ plants: 1 });
indigenousKnowledgeSchema.index({ 'ipr.status': 1 });
indigenousKnowledgeSchema.index({ accessLevel: 1 });
indigenousKnowledgeSchema.index({ 'consent.obtained': 1 });
indigenousKnowledgeSchema.index({ 'verification.status': 1 });

// Text search
indigenousKnowledgeSchema.index({
  'community.name': 'text',
  'traditionalKnowledge.description': 'text',
  'knowledgeType': 'text'
});

// Middleware - Auto-generate consent ID if obtained
indigenousKnowledgeSchema.pre('save', function(next) {
  if (this.consent.obtained && !this.consent.consentId) {
    this.consent.consentId = `PIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Methods
indigenousKnowledgeSchema.methods.revokeConsent = function(reason) {
  this.consent.obtained = false;
  this.consent.revokedAt = new Date();
  this.consent.revokedReason = reason;
  this.accessLevel = 'private';
  return this.save();
};

indigenousKnowledgeSchema.methods.grantAccess = function(userId, purpose) {
  this.accessLog.push({
    user: userId,
    accessDate: new Date(),
    purpose: purpose,
    approved: true
  });
  return this.save();
};

indigenousKnowledgeSchema.methods.checkConsentValidity = function() {
  if (!this.consent.obtained) return false;
  if (this.consent.revokedAt) return false;
  if (this.consent.expiryDate && new Date() > this.consent.expiryDate) return false;
  return true;
};

// Statics
indigenousKnowledgeSchema.statics.findByCommunity = function(communityName) {
  return this.find({
    'community.name': new RegExp(communityName, 'i'),
    isActive: true
  });
};

indigenousKnowledgeSchema.statics.findPublicKnowledge = function() {
  return this.find({
    accessLevel: 'public',
    'consent.obtained': true,
    'ipr.status': { $in: ['public_domain', 'protected'] },
    isActive: true
  });
};

indigenousKnowledgeSchema.statics.requiresIPRReview = function() {
  return this.find({
    'ipr.status': 'pending_assessment',
    'consent.obtained': true,
    isActive: true
  });
};

module.exports = mongoose.model('IndigenousKnowledge', indigenousKnowledgeSchema);
