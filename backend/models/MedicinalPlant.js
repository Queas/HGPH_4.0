const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Sub-schemas for embedded documents
const nameSchema = new mongoose.Schema({
  scientific: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  commonNames: [{
    language: {
      type: String,
      required: true,
      enum: ['English', 'Filipino', 'Tagalog', 'Cebuano', 'Ilocano', 'Hiligaynon', 'Waray', 'Kapampangan', 'Bikol', 'Other']
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  }],
  synonyms: [String], // Scientific name synonyms
  family: {
    type: String,
    trim: true
  },
  genus: {
    type: String,
    trim: true
  }
}, { _id: false });

const traditionalUseSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
    trim: true
  },
  preparation: {
    type: String,
    required: true
  },
  administration: String,
  dosage: String,
  sources: [{
    community: String,
    region: String,
    ethnicity: String,
    recordedBy: String,
    recordedDate: Date,
    consent: {
      obtained: Boolean,
      consentId: String,
      expiryDate: Date
    }
  }],
  iprStatus: {
    type: String,
    enum: ['public', 'protected', 'restricted', 'pending'],
    default: 'pending'
  }
}, { _id: true, timestamps: true });

const phytochemicalSchema = new mongoose.Schema({
  compound: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    enum: ['Alkaloid', 'Flavonoid', 'Terpene', 'Phenolic', 'Saponin', 'Glycoside', 'Essential Oil', 'Other']
  },
  concentration: String,
  plantPart: {
    type: String,
    enum: ['Leaf', 'Root', 'Bark', 'Flower', 'Fruit', 'Seed', 'Whole Plant', 'Other']
  },
  bioactivity: [String],
  references: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicalStudy'
  }]
}, { _id: true });

const clinicalEvidenceSchema = new mongoose.Schema({
  studyType: {
    type: String,
    enum: ['In vitro', 'In vivo', 'Clinical Trial', 'Case Study', 'Systematic Review', 'Meta-analysis'],
    required: true
  },
  condition: String,
  findings: {
    type: String,
    required: true
  },
  efficacy: {
    type: String,
    enum: ['Proven', 'Promising', 'Inconclusive', 'Not Effective']
  },
  evidenceLevel: {
    type: String,
    enum: ['Level I', 'Level II', 'Level III', 'Level IV', 'Level V']
  },
  studyReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicalStudy'
  }
}, { _id: true });

const dosageSchema = new mongoose.Schema({
  preparation: {
    type: String,
    required: true,
    enum: ['Decoction', 'Infusion', 'Tincture', 'Extract', 'Powder', 'Fresh', 'Poultice', 'Oil', 'Other']
  },
  amount: String,
  frequency: String,
  duration: String,
  plantPart: {
    type: String,
    enum: ['Leaf', 'Root', 'Bark', 'Flower', 'Fruit', 'Seed', 'Whole Plant', 'Other']
  },
  instructions: String,
  isTraditional: Boolean,
  isStandardized: Boolean,
  ageGroup: {
    type: String,
    enum: ['Adult', 'Child', 'Elderly', 'All']
  }
}, { _id: true });

const safetySchema = new mongoose.Schema({
  contraindications: [String],
  sideEffects: [String],
  interactions: [{
    substance: String,
    effect: String,
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe']
    }
  }],
  toxicity: {
    level: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High', 'Severe']
    },
    details: String,
    ld50: String
  },
  pregnancy: {
    type: String,
    enum: ['Safe', 'Caution', 'Contraindicated', 'Unknown']
  },
  lactation: {
    type: String,
    enum: ['Safe', 'Caution', 'Contraindicated', 'Unknown']
  },
  specialPopulations: [String],
  references: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicalStudy'
  }]
}, { _id: false });

const distributionSchema = new mongoose.Schema({
  regions: [{
    type: String,
    enum: [
      'NCR', 'CAR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B',
      'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X',
      'Region XI', 'Region XII', 'Region XIII', 'BARMM', 'Nationwide'
    ]
  }],
  provinces: [String],
  habitat: String,
  altitude: String,
  climate: String,
  endemic: {
    type: Boolean,
    default: false
  },
  conservationStatus: {
    type: String,
    enum: ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Unknown']
  }
}, { _id: false });

// Main Medicinal Plant Schema
const medicinalPlantSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  names: {
    type: nameSchema,
    required: true
  },
  traditionalUses: [traditionalUseSchema],
  phytochemicals: [phytochemicalSchema],
  clinicalEvidence: [clinicalEvidenceSchema],
  dosage: [dosageSchema],
  safety: safetySchema,
  distribution: distributionSchema,
  
  // Botanical Information
  description: {
    botanical: String,
    morphology: String,
    identification: String
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    plantPart: String,
    credit: String,
    license: String
  }],
  documents: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['PDF', 'DOC', 'Research Paper', 'Report', 'Other']
    },
    description: String
  }],
  
  // Validation and Review
  validationStatus: {
    type: String,
    enum: ['draft', 'pending_review', 'under_review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  reviewHistory: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: String,
    comments: String,
    reviewedAt: Date
  }],
  
  // Metadata
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['creator', 'reviewer', 'editor', 'contributor']
    },
    contribution: String,
    contributedAt: Date
  }],
  sources: [{
    institution: String,
    reference: String,
    url: String,
    accessDate: Date
  }],
  tags: [String],
  
  // Access Control
  accessLevel: {
    type: String,
    enum: ['public', 'registered', 'researcher', 'restricted'],
    default: 'public'
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    versionNumber: Number,
    data: mongoose.Schema.Types.Mixed,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: Date,
    changeLog: String
  }],
  
  // DOH/FDA Approval
  regulatoryStatus: {
    dohApproved: {
      type: Boolean,
      default: false
    },
    fdaApproved: {
      type: Boolean,
      default: false
    },
    approvalNumber: String,
    approvalDate: Date,
    notes: String
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'medicinal_plants'
});

// Indexes for efficient searching
medicinalPlantSchema.index({ 'names.scientific': 1 });
medicinalPlantSchema.index({ 'names.commonNames.name': 1 });
medicinalPlantSchema.index({ 'tags': 1 });
medicinalPlantSchema.index({ 'validationStatus': 1 });
medicinalPlantSchema.index({ 'distribution.regions': 1 });
medicinalPlantSchema.index({ 'traditionalUses.condition': 'text', 'description.botanical': 'text' });

// Text search index
medicinalPlantSchema.index({
  'names.scientific': 'text',
  'names.commonNames.name': 'text',
  'description.botanical': 'text',
  'traditionalUses.condition': 'text',
  'tags': 'text'
});

// Virtual for formatted scientific name
medicinalPlantSchema.virtual('formattedScientificName').get(function() {
  return `<i>${this.names.scientific}</i>`;
});

// Methods
medicinalPlantSchema.methods.addTraditionalUse = function(useData) {
  this.traditionalUses.push(useData);
  return this.save();
};

medicinalPlantSchema.methods.updateValidationStatus = function(status, reviewer, comments) {
  this.validationStatus = status;
  this.reviewHistory.push({
    reviewer,
    status,
    comments,
    reviewedAt: new Date()
  });
  return this.save();
};

medicinalPlantSchema.methods.createVersion = function(userId, changeLog) {
  this.previousVersions.push({
    versionNumber: this.version,
    data: this.toObject(),
    updatedBy: userId,
    updatedAt: new Date(),
    changeLog
  });
  this.version += 1;
  return this.save();
};

// Statics
medicinalPlantSchema.statics.searchByCondition = function(condition) {
  return this.find({
    'traditionalUses.condition': new RegExp(condition, 'i'),
    validationStatus: 'published',
    isActive: true
  });
};

medicinalPlantSchema.statics.searchByRegion = function(region) {
  return this.find({
    'distribution.regions': region,
    validationStatus: 'published',
    isActive: true
  });
};

medicinalPlantSchema.statics.getByCommonName = function(name, language) {
  const query = {
    'names.commonNames': {
      $elemMatch: {
        name: new RegExp(name, 'i')
      }
    },
    validationStatus: 'published',
    isActive: true
  };
  
  if (language) {
    query['names.commonNames'].$elemMatch.language = language;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('MedicinalPlant', medicinalPlantSchema);
