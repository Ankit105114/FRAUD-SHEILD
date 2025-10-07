import Transaction from '../models/Transaction.js';
import fraudDetectionEngine from '../services/fraudDetectionEngine.js';
import realtimeSyncService from '../services/realtimeSync.js';
import { TRANSACTION_STATUS } from '../config/constants.js';

/**
 * @route   POST /api/transactions/submit
 * @desc    Submit new transaction for fraud analysis
 * @access  Private (User role)
 */
export const submitTransaction = async (req, res) => {
  try {
    const { transactionId, userId, amount, merchant, location, ipAddress, channel } = req.body;

    // Check if transaction ID already exists
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (existingTransaction) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction ID already exists'
      });
    }

    // Analyze transaction using fraud detection engine
    const fraudAnalysis = await fraudDetectionEngine.analyzeTransaction({
      transactionId,
      userId,
      amount,
      merchant,
      location,
      ipAddress,
      channel: channel || 'Web App'
    });

    // Create transaction in database
    const transaction = await Transaction.create({
      transactionId,
      userId,
      amount,
      merchant,
      location,
      ipAddress,
      channel: channel || 'Web App',
      riskScore: fraudAnalysis.riskScore,
      status: fraudAnalysis.status,
      fraudReasons: fraudAnalysis.fraudReasons
    });

    // Add to priority queue if needs review
    if (fraudAnalysis.status === TRANSACTION_STATUS.UNDER_REVIEW || 
        fraudAnalysis.status === TRANSACTION_STATUS.FRAUD) {
      fraudDetectionEngine.addToReviewQueue(transaction);
    }

    // Sync to Firebase for real-time dashboard updates
    await realtimeSyncService.syncTransactionUpdate(transaction);

    // Send alert if fraud detected
    if (fraudAnalysis.status === TRANSACTION_STATUS.FRAUD) {
      await realtimeSyncService.sendAlert({
        type: 'fraud_detected',
        message: `High-risk transaction detected: ${transactionId}`,
        severity: 'high',
        transactionId: transaction.transactionId
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Transaction submitted successfully',
      data: {
        transaction: {
          id: transaction._id,
          transactionId: transaction.transactionId,
          status: transaction.status,
          riskScore: transaction.riskScore,
          fraudReasons: transaction.fraudReasons
        },
        analysis: fraudAnalysis.analysis
      }
    });
  } catch (error) {
    console.error('Submit transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit transaction',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions (with filters)
 * @access  Private (Admin role)
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { status, limit = 50, page = 1, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const transactions = await Transaction.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get transactions',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get transaction',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/transactions/:id/review
 * @desc    Review and update transaction status
 * @access  Private (Admin role)
 */
export const reviewTransaction = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Update transaction
    transaction.status = status;
    transaction.reviewedBy = req.user._id;
    transaction.reviewedAt = new Date();
    
    if (notes) {
      transaction.fraudReasons.push(notes);
    }

    await transaction.save();

    // Sync to Firebase
    await realtimeSyncService.syncTransactionUpdate(transaction);

    res.status(200).json({
      status: 'success',
      message: 'Transaction reviewed successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Review transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to review transaction',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/transactions/queue/next
 * @desc    Get next high-risk transaction for review
 * @access  Private (Admin role)
 */
export const getNextForReview = async (req, res) => {
  try {
    const transaction = fraudDetectionEngine.getNextForReview();

    if (!transaction) {
      return res.status(200).json({
        status: 'success',
        message: 'No transactions pending review',
        data: { transaction: null }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    console.error('Get next review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get next transaction',
      error: error.message
    });
  }
};
