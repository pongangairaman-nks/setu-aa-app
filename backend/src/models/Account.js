const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  consentId: {
    type: String,
    required: true,
    index: true
  },
  accountId: {
    type: String,
    required: true,
    index: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['SAVINGS', 'CURRENT', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CREDIT_CARD'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'],
    default: 'ACTIVE'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  ifscCode: {
    type: String
  },
  branchName: {
    type: String
  },
  accountHolderName: {
    type: String
  },
  maskedAccountNumber: {
    type: String
  },
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // TTL index for automatic deletion after 6 months
  deleteAt: {
    type: Date,
    default: function() {
      // Set deletion date to 6 months from creation
      const deleteDate = new Date(this.createdAt);
      deleteDate.setMonth(deleteDate.getMonth() + 6);
      return deleteDate;
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Compound index for unique account per user
accountSchema.index({ userId: 1, accountId: 1 }, { unique: true });

// Indexes for better query performance
accountSchema.index({ userId: 1, status: 1 });
accountSchema.index({ userId: 1, bankName: 1 });
accountSchema.index({ userId: 1, accountType: 1 });
accountSchema.index({ consentId: 1 });
accountSchema.index({ lastFetched: 1 });

// Pre-save middleware to update deleteAt when createdAt changes
accountSchema.pre('save', function(next) {
  if (this.isNew) {
    const deleteDate = new Date(this.createdAt);
    deleteDate.setMonth(deleteDate.getMonth() + 6);
    this.deleteAt = deleteDate;
  }
  next();
});

// Static method to find accounts by user
accountSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) query.status = options.status;
  if (options.bankName) query.bankName = options.bankName;
  if (options.accountType) query.accountType = options.accountType;
  
  return this.find(query).sort({ lastFetched: -1 });
};

// Static method to find active accounts
accountSchema.statics.findActiveAccounts = function(userId) {
  return this.find({ userId, status: 'ACTIVE' });
};

// Static method to get account summary
accountSchema.statics.getAccountSummary = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAccounts: { $sum: 1 },
        activeAccounts: {
          $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
        },
        totalBalance: { $sum: '$balance' },
        averageBalance: { $avg: '$balance' }
      }
    }
  ]);
};

// Static method to get accounts by bank
accountSchema.statics.findByBank = function(userId, bankName) {
  return this.find({ userId, bankName }).sort({ lastFetched: -1 });
};

// Instance method to update balance
accountSchema.methods.updateBalance = function(newBalance) {
  this.balance = newBalance;
  this.lastUpdated = new Date();
  this.lastFetched = new Date();
  return this.save();
};

// Instance method to check if account is active
accountSchema.methods.isActive = function() {
  return this.status === 'ACTIVE';
};

// Instance method to get masked account number
accountSchema.methods.getMaskedAccountNumber = function() {
  if (!this.accountNumber) return '';
  
  const length = this.accountNumber.length;
  if (length <= 4) return this.accountNumber;
  
  const masked = '*'.repeat(length - 4);
  const lastFour = this.accountNumber.slice(-4);
  
  return `${masked}${lastFour}`;
};

// Virtual for account age in days
accountSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days since last fetch
accountSchema.virtual('daysSinceLastFetch').get(function() {
  const now = new Date();
  const diffTime = now - this.lastFetched;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted balance
accountSchema.virtual('formattedBalance').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency || 'INR'
  }).format(this.balance);
});

// Ensure virtuals are included in JSON output
accountSchema.set('toJSON', { virtuals: true });
accountSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Account', accountSchema); 