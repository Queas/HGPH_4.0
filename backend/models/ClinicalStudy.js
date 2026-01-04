const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  affiliation: String,
  email: String,
  orcid: String
}, { _id: false });

const clinicalStudySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  
  // Study Identification
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: [authorSchema],
  institution: {
    type: String,
    required: true
  },
  
  // Study Details
  studyType: {
    type: String,
    required: true,
    enum: [
      'In vitro',
      'In vivo - Animal',
      'Phase I Clinical Trial',
      'Phase II Clinical Trial',
      'Phase III Clinical Trial',
      'Phase IV Clinical Trial',
      'Case Study',
      'Observational Study',
      'Systematic Review',
      'Meta-analysis',
      'Literature Review',
      'Ethnobotanical Survey'
    ]
  },
  methodology: {
    type: String,
    required: true
  },
  sampleSize: Number,
  duration: String,
  location: String,
  
  // Related Plants
  plants: [{
    type: String,
    ref: 'MedicinalPlant'
  }],
  plantParts: [String],
  extractType: String,
  
  // Findings
  abstract: String,
  objectives: String,
  results: {
    type: String,
    required: true
  },
  conclusion: String,
  statisticalSignificance: String,
  
  // Clinical Relevance
  conditions: [String],
  bioactivities: [String],
  efficacy: {
    type: String,
    enum: ['Proven', 'Promising', 'Inconclusive', 'Not Effective', 'Adverse']
  },
  evidenceLevel: {
    type: String,
    enum: ['Level I', 'Level II', 'Level III', 'Level IV', 'Level V']
  },
  
  // Safety Data
  adverseEvents: [String],
  safetyProfile: String,
  
  // Publication Info
  journal: String,
  volume: String,
  issue: String,
  pages: String,
  publicationDate: Date,
  doi: String,
  pmid: String,
  url: String,
  
  // Keywords and Classification
  keywords: [String],
  meshTerms: [String], // Medical Subject Headings
  
  // Files and Supplementary Material
  fullTextUrl: String,
  pdfUrl: String,
  supplementaryMaterials: [{
    title: String,
    url: String,
    type: String
  }],
  
  // Funding and Ethics
  funding: [{
    source: String,
    grantNumber: String
  }],
  ethicsApproval: {
    obtained: Boolean,
    approvalNumber: String,
    institution: String
  },
  conflictOfInterest: String,
  
  // Quality Assessment
  qualityScore: Number,
  riskOfBias: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Unclear']
  },
  
  // Validation
  validationStatus: {
    type: String,
    enum: ['pending', 'verified', 'published', 'retracted'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  
  // Citations
  citationCount: {
    type: Number,
    default: 0
  },
  citedBy: [String], // Array of study IDs that cite this study
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'clinical_studies'
});

// Indexes
clinicalStudySchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
clinicalStudySchema.index({ plants: 1 });
clinicalStudySchema.index({ studyType: 1 });
clinicalStudySchema.index({ validationStatus: 1 });
clinicalStudySchema.index({ publicationDate: -1 });
clinicalStudySchema.index({ doi: 1 });
clinicalStudySchema.index({ conditions: 1 });

// Virtual for citation format (APA style)
clinicalStudySchema.virtual('citationAPA').get(function() {
  const authors = this.authors.map(a => a.name).join(', ');
  const year = this.publicationDate ? new Date(this.publicationDate).getFullYear() : 'n.d.';
  return `${authors} (${year}). ${this.title}. ${this.journal}, ${this.volume}(${this.issue}), ${this.pages}.`;
});

// Methods
clinicalStudySchema.methods.addCitation = function(studyId) {
  this.citedBy.push(studyId);
  this.citationCount += 1;
  return this.save();
};

clinicalStudySchema.methods.verify = function(userId) {
  this.validationStatus = 'verified';
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
  return this.save();
};

// Statics
clinicalStudySchema.statics.findByPlant = function(plantId) {
  return this.find({
    plants: plantId,
    validationStatus: 'published',
    isActive: true
  }).sort({ publicationDate: -1 });
};

clinicalStudySchema.statics.findByCondition = function(condition) {
  return this.find({
    conditions: new RegExp(condition, 'i'),
    validationStatus: 'published',
    isActive: true
  }).sort({ publicationDate: -1 });
};

module.exports = mongoose.model('ClinicalStudy', clinicalStudySchema);
