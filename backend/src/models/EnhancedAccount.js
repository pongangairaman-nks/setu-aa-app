const mongoose = require('mongoose');
const { COMPLIANCE_CONFIG } = require('../../src/config/compliance');

const enhancedAccountSchema = new mongoose.Schema({
  // Basic Account Information
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
    required: true,
    encrypted: true // Mark for encryption
  },
  bankName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: [
      'SAVINGS', 'CURRENT', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 
      'LOAN', 'CREDIT_CARD', 'DEMAT', 'PPF', 'EPF', 'NPS',
      'MUTUAL_FUND', 'INSURANCE', 'GOLD_BOND', 'EQUITY'
    ],
    required: true
  },
  fiType: {
    type: String,
    enum: [
      'DEPOSIT', 'MUTUAL_FUNDS', 'INSURANCE_POLICIES', 'EQUITIES',
      'EPF', 'PPF', 'NPS', 'GOLD', 'FIXED_DEPOSITS', 'RECURRING_DEPOSITS'
    ],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED', 'MATURED'],
    default: 'ACTIVE'
  },

  // Enhanced Account Details
  ifscCode: {
    type: String,
    encrypted: true
  },
  branchName: {
    type: String
  },
  accountHolderName: {
    type: String,
    encrypted: true
  },
  maskedAccountNumber: {
    type: String
  },
  interestRate: {
    type: Number
  },
  minimumBalance: {
    type: Number
  },
  overdraftLimit: {
    type: Number
  },
  accountOpeningDate: {
    type: Date
  },
  maturityDate: {
    type: Date
  },
  kycStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING'
  },

  // Investment Specific Fields
  units: {
    type: Number
  },
  nav: {
    type: Number
  },
  currentValue: {
    type: Number
  },
  investmentAmount: {
    type: Number
  },
  schemeName: {
    type: String
  },
  schemeCode: {
    type: String
  },
  folioNumber: {
    type: String,
    encrypted: true
  },
  amcName: {
    type: String
  },
  fundHouse: {
    type: String
  },

  // Insurance Specific Fields
  policyNumber: {
    type: String,
    encrypted: true
  },
  policyType: {
    type: String
  },
  insurerName: {
    type: String
  },
  sumAssured: {
    type: Number
  },
  premiumAmount: {
    type: Number
  },
  premiumFrequency: {
    type: String
  },
  nextDueDate: {
    type: Date
  },

  // Equity Specific Fields
  dematAccountNumber: {
    type: String,
    encrypted: true
  },
  stockSymbol: {
    type: String
  },
  quantity: {
    type: Number
  },
  averagePrice: {
    type: Number
  },
  currentPrice: {
    type: Number
  },
  marketValue: {
    type: Number
  },
  dpId: {
    type: String
  },
  clientId: {
    type: String
  },
  brokerName: {
    type: String
  },

  // EPF/PPF Specific Fields
  epfAccountNumber: {
    type: String,
    encrypted: true
  },
  uanNumber: {
    type: String,
    encrypted: true
  },
  employerName: {
    type: String
  },
  employeeContribution: {
    type: Number
  },
  employerContribution: {
    type: Number
  },
  interestEarned: {
    type: Number
  },
  lastContributionDate: {
    type: Date
  },

  // NPS Specific Fields
  pranNumber: {
    type: String,
    encrypted: true
  },
  totalContribution: {
    type: Number
  },
  currentNav: {
    type: Number
  },
  fundManager: {
    type: String
  },
  schemeDetails: {
    type: mongoose.Schema.Types.Mixed
  },

  // Gold Investment Fields
  goldType: {
    type: String
  },
  purchasePrice: {
    type: Number
  },
  purchaseDate: {
    type: Date
  },
  issuerName: {
    type: String
  },
  bondNumber: {
    type: String,
    encrypted: true
  },

  // Fixed Deposit Fields
  fdNumber: {
    type: String,
    encrypted: true
  },
  principalAmount: {
    type: Number
  },
  maturityAmount: {
    type: Number
  },
  autoRenewal: {
    type: Boolean,
    default: false
  },

  // Recurring Deposit Fields
  rdNumber: {
    type: String,
    encrypted: true
  },
  monthlyAmount: {
    type: Number
  },
  totalContribution: {
    type: Number
  },

  // Nominee Details
  nomineeDetails: {
    name: {
      type: String,
      encrypted: true
    },
    relationship: {
      type: String
    },
    percentage: {
      type: Number
    }
  },

  // Joint Holder Details
  jointHolderDetails: [{
    name: {
      type: String,
      encrypted: true
    },
    relationship: {
      type: String
    },
    percentage: {
      type: Number
    }
  }],

  // Account Features
  accountFeatures: [{
    feature: {
      type: String
    },
    enabled: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],

  // Compliance and Audit Fields
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    required: true
  },
  fipId: {
    type: String,
    required: true
  },
  fipName: {
    type: String,
    required: true
  },
  consentExpiryDate: {
    type: Date,
    required: true,
    index: true
  },
  dataLifeExpiryDate: {
    type: Date,
    required: true,
    index: true
  },

  // Security and Encryption
  encryptionVersion: {
    type: String,
    default: 'v1'
  },
  dataIntegrityHash: {
    type: String
  },

  // TTL indexes for automatic deletion
  deleteAt: {
    type: Date,
    default: function() {
      const deleteDate = new Date();
      deleteDate.setDate(deleteDate.getDate() + COMPLIANCE_CONFIG.DATA_RETENTION.MANDATORY_PERIODS.ACCOUNT_DATA);
      return deleteDate;
    },
    index: { expireAfterSeconds: 0 }
  },

  // Consent expiry TTL
  consentExpiryDeleteAt: {
    type: Date,
    default: function() {
      return this.consentExpiryDate;
    },
    index: { expireAfterSeconds: 0 }
  },

  // Data life expiry TTL
  dataLifeExpiryDeleteAt: {
    type: Date,
    default: function() {
      return this.dataLifeExpiryDate;
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: 'enhanced_accounts'
});

// Compound indexes for better query performance
enhancedAccountSchema.index({ userId: 1, accountId: 1 }, { unique: true });
enhancedAccountSchema.index({ userId: 1, status: 1 });
enhancedAccountSchema.index({ userId: 1, fiType: 1 });
enhancedAccountSchema.index({ userId: 1, bankName: 1 });
enhancedAccountSchema.index({ userId: 1, fipId: 1 });
enhancedAccountSchema.index({ consentId: 1 });
enhancedAccountSchema.index({ fipId: 1, lastFetched: 1 });
enhancedAccountSchema.index({ status: 1, consentExpiryDate: 1 });
enhancedAccountSchema.index({ status: 1, dataLifeExpiryDate: 1 });

// Pre-save middleware for TTL management
enhancedAccountSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set deletion dates based on compliance requirements
    const now = new Date();
    
    // Account data deletion after 6 months
    this.deleteAt = new Date(now.getTime() + (COMPLIANCE_CONFIG.DATA_RETENTION.MANDATORY_PERIODS.ACCOUNT_DATA * 24 * 60 * 60 * 1000));
    
    // Consent expiry deletion
    if (this.consentExpiryDate) {
      this.consentExpiryDeleteAt = this.consentExpiryDate;
    }
    
    // Data life expiry deletion
    if (this.dataLifeExpiryDate) {
      this.dataLifeExpiryDeleteAt = this.dataLifeExpiryDate;
    }
  }
  next();
});

// Static methods
enhancedAccountSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) query.status = options.status;
  if (options.fiType) query.fiType = options.fiType;
  if (options.bankName) query.bankName = options.bankName;
  if (options.fipId) query.fipId = options.fipId;
  
  return this.find(query).sort({ lastFetched: -1 });
};

enhancedAccountSchema.statics.findActiveAccounts = function(userId) {
  return this.find({ 
    userId, 
    status: 'ACTIVE',
    consentExpiryDate: { $gt: new Date() },
    dataLifeExpiryDate: { $gt: new Date() }
  });
};

enhancedAccountSchema.statics.findExpiringAccounts = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    status: 'ACTIVE',
    $or: [
      { consentExpiryDate: { $lte: expiryDate } },
      { dataLifeExpiryDate: { $lte: expiryDate } }
    ]
  });
};

enhancedAccountSchema.statics.getAccountSummary = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAccounts: { $sum: 1 },
        activeAccounts: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'ACTIVE'] },
                  { $gt: ['$consentExpiryDate', new Date()] },
                  { $gt: ['$dataLifeExpiryDate', new Date()] }
                ]
              }, 
              1, 
              0 
            ]
          }
        },
        totalBalance: { $sum: '$balance' },
        averageBalance: { $avg: '$balance' },
        accountTypes: { $addToSet: '$accountType' },
        fiTypes: { $addToSet: '$fiType' },
        banks: { $addToSet: '$bankName' }
      }
    }
  ]);
};

// Instance methods
enhancedAccountSchema.methods.isActive = function() {
  return this.status === 'ACTIVE' && 
         this.consentExpiryDate > new Date() && 
         this.dataLifeExpiryDate > new Date();
};

enhancedAccountSchema.methods.isExpiring = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.consentExpiryDate <= expiryDate || this.dataLifeExpiryDate <= expiryDate;
};

enhancedAccountSchema.methods.getDaysUntilExpiry = function() {
  const now = new Date();
  const consentDays = Math.ceil((this.consentExpiryDate - now) / (1000 * 60 * 60 * 24));
  const dataLifeDays = Math.ceil((this.dataLifeExpiryDate - now) / (1000 * 60 * 60 * 24));
  
  return Math.min(consentDays, dataLifeDays);
};

enhancedAccountSchema.methods.updateBalance = function(newBalance) {
  this.balance = newBalance;
  this.lastUpdated = new Date();
  this.lastFetched = new Date();
  return this.save();
};

// Virtuals
enhancedAccountSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

enhancedAccountSchema.virtual('daysSinceLastFetch').get(function() {
  const now = new Date();
  const diffTime = now - this.lastFetched;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

enhancedAccountSchema.virtual('formattedBalance').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency || 'INR'
  }).format(this.balance);
});

// Ensure virtuals are included in JSON output
enhancedAccountSchema.set('toJSON', { virtuals: true });
enhancedAccountSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EnhancedAccount', enhancedAccountSchema);
