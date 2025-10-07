import Transaction from '../models/Transaction.js';
import { TRANSACTION_STATUS } from '../config/constants.js';
import fraudDetectionEngine from '../services/fraudDetectionEngine.js';
import realtimeSyncService from '../services/realtimeSync.js';
import { getFirebaseAuth } from '../config/firebase.js';

// Example usage
const auth = getFirebaseAuth();

/**
 * @route   GET /api/analytics/summary
 * @desc    Get comprehensive analytics summary
 * @access  Private (Admin/Analyst)
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalTransactions,
      fraudDetected,
      safeTransactions,
      underReview,
      avgRiskScore,
      topMerchants,
      recentAlerts
    ] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.FRAUD, createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.SAFE, createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.UNDER_REVIEW, createdAt: { $gte: startDate } }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
      ]),
      Transaction.aggregate([
        { $match: { status: TRANSACTION_STATUS.FRAUD, createdAt: { $gte: startDate } } },
        { $group: { _id: '$merchant', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Get recent alerts count (this would need an Alerts model, for now return 0)
      Promise.resolve(0)
    ]);

    const detectionRate = totalTransactions > 0 ? (fraudDetected / totalTransactions) * 100 : 0;
    const averageRiskScore = avgRiskScore.length > 0 ? parseFloat(avgRiskScore[0].avgRisk.toFixed(2)) : 0;

    const summary = {
      overview: {
        totalTransactions,
        fraudDetected,
        safeTransactions,
        underReview,
        detectionRate: parseFloat(detectionRate.toFixed(2)),
        averageRiskScore
      },
      topFraudMerchants: topMerchants,
      alerts: {
        recent: recentAlerts,
        unread: 0 // Would need alerts model
      },
      trends: {
        period: `${days} days`,
        dataFreshness: new Date().toISOString()
      }
    };

    // Sync to Firebase for real-time dashboard
    await realtimeSyncService.syncDashboardStats(summary);

    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics summary',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/risk-distribution
 * @desc    Get risk score distribution
 * @access  Private (Admin/Analyst)
 */
export const getRiskDistribution = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const riskDistribution = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $bucket: {
          groupBy: '$riskScore',
          boundaries: [0, 25, 50, 75, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            transactions: { $push: '$$ROOT' }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: riskDistribution
    });
  } catch (error) {
    console.error('Error fetching risk distribution:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch risk distribution',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/velocity-analysis
 * @desc    Get velocity-based fraud analysis
 * @access  Private (Admin/Analyst)
 */
export const getVelocityAnalysis = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const velocityData = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            userId: '$userId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          transactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgRiskScore: { $avg: '$riskScore' }
        }
      },
      {
        $match: { 'transactions': { $gte: 3 } } // Users with 3+ transactions per day
      },
      {
        $group: {
          _id: '$_id.date',
          suspiciousUsers: { $sum: 1 },
          totalTransactions: { $sum: '$transactions' },
          avgDailyAmount: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: velocityData
    });
  } catch (error) {
    console.error('Error fetching velocity analysis:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch velocity analysis',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/alerts
 * @desc    Get system alerts and notifications
 * @access  Private (Admin/Analyst)
 */
export const getAlerts = async (req, res) => {
  try {
    // Get recent fraud alerts from realtime service
    const alerts = await new Promise((resolve) => {
      realtimeSyncService.subscribeToAlerts((alertData) => {
        resolve(alertData || []);
      });

      // Timeout after 2 seconds if no data
      setTimeout(() => resolve([]), 2000);
    });

    res.status(200).json({
      status: 'success',
      data: {
        alerts,
        total: alerts.length,
        unread: alerts.filter(alert => !alert.read).length
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/analytics/alerts/:id/read
 * @desc    Mark alert as read
 * @access  Private (Admin/Analyst)
 */
export const markAlertAsRead = async (req, res) => {
  try {
    await realtimeSyncService.markAlertAsRead(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Alert marked as read'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/fraud-funnel
 * @desc    Get fraud detection funnel data
 * @access  Private (Admin/Analyst)
 */
export const getFraudFunnel = async (req, res) => {
  try {
    const funnelData = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: funnelData
    });
  } catch (error) {
    console.error('Error fetching fraud funnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fraud funnel',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/fraud-by-region
 * @desc    Get fraud distribution by region
 * @access  Private (Admin/Analyst)
 */
export const getFraudByRegion = async (req, res) => {
  try {
    const regionData = await Transaction.aggregate([
      { $match: { status: TRANSACTION_STATUS.FRAUD } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: regionData
    });
  } catch (error) {
    console.error('Error fetching fraud by region:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fraud by region',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/channel-analysis
 * @desc    Get fraud analysis by channel
 * @access  Private (Admin/Analyst)
 */
export const getChannelAnalysis = async (req, res) => {
  try {
    const channelData = await Transaction.aggregate([
      {
        $group: {
          _id: '$channel',
          total: { $sum: 1 },
          fraudCount: {
            $sum: { $cond: [{ $eq: ['$status', TRANSACTION_STATUS.FRAUD] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          channel: '$_id',
          total: 1,
          fraudCount: 1,
          fraudRate: { $multiply: [{ $divide: ['$fraudCount', '$total'] }, 100] }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: channelData
    });
  } catch (error) {
    console.error('Error fetching channel analysis:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch channel analysis',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/time-trend
 * @desc    Get fraud trends over time
 * @access  Private (Admin/Analyst)
 */
export const getTimeTrend = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    let dateFormat = '%Y-%m-%d'; // Default to daily

    if (period === 'week') {
      dateFormat = '%Y-%U'; // Weekly
    } else if (period === 'month') {
      dateFormat = '%Y-%m'; // Monthly
    } else if (period === 'hour') {
      dateFormat = '%Y-%m-%dT%H:00:00Z'; // Hourly
    }

    const timeTrend = await Transaction.aggregate([
      {
        $match: {
          status: TRANSACTION_STATUS.FRAUD,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: timeTrend
    });
  } catch (error) {
    console.error('Error fetching time trend:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch time trend',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/analytics/fraud-network
 * @desc    Get fraud network statistics
 * @access  Private (Admin)
 */
export const getFraudNetworkStats = async (req, res) => {
  try {
    const networkStats = await Transaction.aggregate([
      { $match: { status: TRANSACTION_STATUS.FRAUD } },
      {
        $group: {
          _id: null,
          uniqueIPs: { $addToSet: '$ipAddress' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          uniqueIPs: { $size: '$uniqueIPs' },
          uniqueUsers: { $size: '$uniqueUsers' },
          totalFraudTransactions: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: networkStats[0] || { uniqueIPs: 0, uniqueUsers: 0, totalFraudTransactions: 0 }
    });
  } catch (error) {
    console.error('Error fetching fraud network stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fraud network stats',
      error: error.message
    });
  }
};