const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  // TTL index for automatic deletion after 6 months of inactivity
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 15768000 } // 6 months in seconds
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

// Pre-save middleware to hash password
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

// Pre-save middleware to update lastActivityAt
userSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users by creation date range
userSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to update preferences
userSchema.methods.updatePreferences = function(preferences) {
  this.preferences = { ...this.preferences, ...preferences };
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to verify email
userSchema.methods.verifyEmail = function() {
  this.isEmailVerified = true;
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to verify phone
userSchema.methods.verifyPhone = function() {
  this.isPhoneVerified = true;
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to deactivate account
userSchema.methods.deactivateAccount = function() {
  this.isActive = false;
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to reactivate account
userSchema.methods.reactivateAccount = function() {
  this.isActive = true;
  this.lastActivityAt = new Date();
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.username;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for account status
userSchema.virtual('accountStatus').get(function() {
  if (!this.isActive) return 'DEACTIVATED';
  if (this.isLocked()) return 'LOCKED';
  return 'ACTIVE';
});

// Virtual for days since last login
userSchema.virtual('daysSinceLastLogin').get(function() {
  if (!this.lastLoginAt) return null;
  
  const now = new Date();
  const diffTime = now - this.lastLoginAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days since last activity
userSchema.virtual('daysSinceLastActivity').get(function() {
  const now = new Date();
  const diffTime = now - this.lastActivityAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

userSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema); 