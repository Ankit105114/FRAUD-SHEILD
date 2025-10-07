import mongoose from 'mongoose';
import { TRANSACTION_STATUS, TRANSACTION_CHANNELS } from '../config/constants.js';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID/Email is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  merchant: {
    type: String,
    required: [true, 'Merchant is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  ipAddress: {
    type: String,
    required: [true, 'IP Address is required'],
    trim: true,
    match: [/^(\d{1,3}\.){3}\d{1,3}$/, 'Please provide a valid IP address']
  },
  channel: {
    type: String,
    enum: Object.values(TRANSACTION_CHANNELS),
    default: TRANSACTION_CHANNELS.WEB_APP
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    default: TRANSACTION_STATUS.NEW
  },
  fraudReasons: [{
    type: String
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  metadata: {
    deviceType: String,
    browser: String,
    os: String
  }
}, {
  timestamps: true
});

// Indexes for performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ riskScore: -1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
