const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'professional', 'researcher', 'reviewer', 'editor', 'admin', 'indigenous_representative'],
    default: 'user'
  },
  
  // Professional/Academic Information
  profile: {
    firstName: String,
    lastName: String,
    affiliation: String,
    institution: String,
    department: String,
    position: String,
    credentials: [String],
    orcid: String,
    specialization: [String],
    bio: String,
    website: String,
    phoneNumber: String
  },
  
  // Permissions and Access
  permissions: {
    canReview: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canApprove: {
      type: Boolean,
      default: false
    },
    canAccessRestrictedKnowledge: {
      type: Boolean,
      default: false
    },
    canManageIPR: {
      type: Boolean,
      default: false
    }
  },
  
  // For Indigenous Representatives
  indigenousAffiliation: {
    community: String,
    indigenousGroup: String,
    role: String,
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected']
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    ncipCertificate: String // URL to NCIP verification document
  },
  
  // Research Activity
  contributions: {
    total: {
      type: Number,
      default: 0
    },
    approved: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    }
  },
  reviews: {
    total: {
      type: Number,
      default: 0
    },
    averageRating: Number
  },
  
  // Expertise Areas
  expertise: {
    plantFamilies: [String],
    regions: [String],
    topics: [String],
    languages: [String]
  },
  
  // Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    newContributions: {
      type: Boolean,
      default: false
    },
    reviewRequests: {
      type: Boolean,
      default: true
    },
    approvals: {
      type: Boolean,
      default: true
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);