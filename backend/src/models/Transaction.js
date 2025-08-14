const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accountId: {
    type: String,
    required: true,
    index: true
  },
  consentId: {
    type: String,
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true
  },
  transactionDate: {
    type: Date,
    required: true,
    index: true
  },
  balance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED'],
    default: 'SUCCESS'
  },
  category: {
    type: String
  },
  merchantName: {
    type: String
  },
  referenceNumber: {
    type: String
  },
  currency: {
    type: String,
    default: 'INR'
  },
  transactionMode: {
    type: String
  },
  upiId: {
    type: String
  },
  chequeNumber: {
    type: String
  },
  narration: {
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

// Compound index for unique transaction per user
transactionSchema.index({ userId: 1, transactionId: 1 }, { unique: true });

// Indexes for better query performance
transactionSchema.index({ userId: 1, accountId: 1 });
transactionSchema.index({ userId: 1, transactionType: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, transactionDate: 1 });
transactionSchema.index({ consentId: 1 });
transactionSchema.index({ accountId: 1, transactionDate: 1 });

// Pre-save middleware to update deleteAt when createdAt changes
transactionSchema.pre('save', function(next) {
  if (this.isNew) {
    const deleteDate = new Date(this.createdAt);
    deleteDate.setMonth(deleteDate.getMonth() + 6);
    this.deleteAt = deleteDate;
  }
  next();
});

// Static method to find transactions by user
transactionSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.accountId) query.accountId = options.accountId;
  if (options.transactionType) query.transactionType = options.transactionType;
  if (options.status) query.status = options.status;
  if (options.category) query.category = options.category;
  
  if (options.fromDate || options.toDate) {
    query.transactionDate = {};
    if (options.fromDate) query.transactionDate.$gte = new Date(options.fromDate);
    if (options.toDate) query.transactionDate.$lte = new Date(options.toDate);
  }
  
  const sort = options.sort || { transactionDate: -1 };
  const limit = options.limit || 50;
  const skip = options.skip || 0;
  
  return this.find(query).sort(sort).skip(skip).limit(limit);
};

// Static method to find transactions by account
transactionSchema.statics.findByAccount = function(userId, accountId, options = {}) {
  const query = { userId, accountId };
  
  if (options.fromDate || options.toDate) {
    query.transactionDate = {};
    if (options.fromDate) query.transactionDate.$gte = new Date(options.fromDate);
    if (options.toDate) query.transactionDate.$lte = new Date(options.toDate);
  }
  
  return this.find(query).sort({ transactionDate: -1 });
};

// Static method to get transaction summary
transactionSchema.statics.getTransactionSummary = function(userId, options = {}) {
  const match = { userId };
  
  if (options.accountId) match.accountId = options.accountId;
  if (options.fromDate || options.toDate) {
    match.transactionDate = {};
    if (options.fromDate) match.transactionDate.$gte = new Date(options.fromDate);
    if (options.toDate) match.transactionDate.$lte = new Date(options.toDate);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'CREDIT'] }, '$amount', 0]
          }
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'DEBIT'] }, '$amount', 0]
          }
        },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Static method to get transactions by category
transactionSchema.statics.getTransactionsByCategory = function(userId, options = {}) {
  const match = { userId };
  
  if (options.fromDate || options.toDate) {
    match.transactionDate = {};
    if (options.fromDate) match.transactionDate.$gte = new Date(options.fromDate);
    if (options.toDate) match.transactionDate.$lte = new Date(options.toDate);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// Static method to get monthly transaction summary
transactionSchema.statics.getMonthlySummary = function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        userId,
        transactionDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          day: { $dayOfMonth: '$transactionDate' }
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'CREDIT'] }, '$amount', 0]
          }
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'DEBIT'] }, '$amount', 0]
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.day': 1 } }
  ]);
};

// Instance method to check if transaction is credit
transactionSchema.methods.isCredit = function() {
  return this.transactionType === 'CREDIT';
};

// Instance method to check if transaction is debit
transactionSchema.methods.isDebit = function() {
  return this.transactionType === 'DEBIT';
};

// Instance method to get formatted amount
transactionSchema.methods.getFormattedAmount = function() {
  const sign = this.isCredit() ? '+' : '-';
  return `${sign}${new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency || 'INR'
  }).format(this.amount)}`;
};

// Virtual for transaction age in days
transactionSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = now - this.transactionDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days since last fetch
transactionSchema.virtual('daysSinceLastFetch').get(function() {
  const now = new Date();
  const diffTime = now - this.lastFetched;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted transaction date
transactionSchema.virtual('formattedDate').get(function() {
  return this.transactionDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for formatted time
transactionSchema.virtual('formattedTime').get(function() {
  return this.transactionDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for net amount (positive for credit, negative for debit)
transactionSchema.virtual('netAmount').get(function() {
  return this.isCredit() ? this.amount : -this.amount;
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema); 