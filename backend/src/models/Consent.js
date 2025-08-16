const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  consentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fipId: {
    type: String,
    required: true
  },
  fipName: {
    type: String,
    required: true
  },
  dataLife: {
    type: Number,
    required: true,
    default: 180, // 6 months in days
    min: 1,
    max: 365
  },
  permissions: [{
    type: String,
    enum: ['ACCOUNT', 'TRANSACTIONS', 'PROFILE', 'STATEMENTS'],
    required: true
  }],
  fetchType: {
    type: String,
    enum: ['PERIODIC', 'ONETIME'],
    required: true
  },
  frequency: {
    unit: {
      type: String,
      enum: ['MONTH', 'DAY', 'WEEK']
    },
    value: {
      type: Number,
      min: 1
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  consentUrl: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  webhookReceivedAt: {
    type: Date
  },
  // TTL index for automatic deletion after 6 months
  deleteAt: {
    type: Date,
    default: function() {
      // Set deletion date to 6 months from creation
      const deleteDate = new Date();
      deleteDate.setMonth(deleteDate.getMonth() + 6);
      return deleteDate;
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
consentSchema.index({ userId: 1, status: 1 });
consentSchema.index({ userId: 1, expiresAt: 1 });
consentSchema.index({ status: 1, expiresAt: 1 });

// Pre-save middleware to update deleteAt when createdAt changes
consentSchema.pre('save', function(next) {
  if (this.isNew) {
    const baseDate = this.createdAt || new Date();
    const deleteDate = new Date(baseDate);
    deleteDate.setMonth(deleteDate.getMonth() + 6);
    this.deleteAt = deleteDate;
  }
  next();
});

// Static method to find active consents for a user
consentSchema.statics.findActiveConsents = function(userId) {
  return this.find({
    userId,
    status: 'ACTIVE',
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find expired consents
consentSchema.statics.findExpiredConsents = function() {
  return this.find({
    status: { $in: ['ACTIVE', 'PENDING'] },
    expiresAt: { $lt: new Date() }
  });
};

// Instance method to check if consent is active
consentSchema.methods.isActive = function() {
  return this.status === 'ACTIVE' && this.expiresAt > new Date();
};

// Instance method to check if consent is expired
consentSchema.methods.isExpired = function() {
  return this.expiresAt <= new Date();
};

// Instance method to get days until expiry
consentSchema.methods.getDaysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Instance method to extend consent
consentSchema.methods.extendConsent = function(additionalDays) {
  this.expiresAt = new Date(this.expiresAt.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
  this.dataLife += additionalDays;
  this.deleteAt = new Date(this.createdAt.getTime() + (this.dataLife * 24 * 60 * 60 * 1000));
  return this.save();
};

// Virtual for consent age in days
consentSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for remaining data life
consentSchema.virtual('remainingDataLife').get(function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
});

// Ensure virtuals are included in JSON output
consentSchema.set('toJSON', { virtuals: true });
consentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Consent', consentSchema); 