import mongoose from 'mongoose';

const ipNetworkSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  linkedUserIds: [{
    type: String,
    trim: true
  }],
  linkedTransactionIds: [{
    type: String,
    trim: true
  }],
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }, 
  transactionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for quick lookups
ipNetworkSchema.index({ isFlagged: 1 });

const IPNetwork = mongoose.model('IPNetwork', ipNetworkSchema);

export default IPNetwork;
