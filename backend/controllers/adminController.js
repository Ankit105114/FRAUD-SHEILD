import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { USER_ROLES, TRANSACTION_STATUS } from '../config/constants.js';
import realtimeSyncService from '../services/realtimeSync.js';

/**
 * @route   GET /api/admin/system-status
 * @desc    Get overall system status
 * @access  Private (Admin only)
 */
export const getSystemStatus = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      pendingReviews,
      systemHealth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.UNDER_REVIEW }),
      realtimeSyncService.getSystemStatus()
    ]);

    const systemStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      transactions: {
        total: totalTransactions,
        pendingReviews
      },
      system: {
        status: systemHealth.status,
        message: systemHealth.message,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    res.status(200).json({
      status: 'success',
      data: systemStats
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system status',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/dashboard-metrics
 * @desc    Get admin dashboard metrics
 * @access  Private (Admin only)
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const hours = parseInt(period.replace('h', ''));
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [
      recentTransactions,
      fraudAlerts,
      systemLoad,
      topRiskyMerchants
    ] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: startDate } }),
      Transaction.countDocuments({
        status: TRANSACTION_STATUS.FRAUD,
        createdAt: { $gte: startDate }
      }),
      // Simulate system load (in real app, get from monitoring service)
      Promise.resolve({
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        disk: Math.floor(Math.random() * 60) + 10
      }),
      Transaction.aggregate([
        { $match: { status: TRANSACTION_STATUS.FRAUD, createdAt: { $gte: startDate } } },
        { $group: { _id: '$merchant', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const metrics = {
      transactions: {
        recent: recentTransactions,
        fraudAlerts,
        trend: 'up' // Would calculate based on historical data
      },
      system: {
        load: systemLoad,
        status: 'healthy'
      },
      alerts: {
        critical: fraudAlerts > 10 ? 1 : 0,
        warning: fraudAlerts > 5 ? 1 : 0,
        info: 0
      },
      topRiskyMerchants
    };

    res.status(200).json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard metrics',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/admin/broadcast
 * @desc    Send system-wide broadcast message
 * @access  Private (Admin only)
 */
export const sendBroadcast = async (req, res) => {
  try {
    const { message, type = 'info', targetUsers = 'all' } = req.body;

    // In a real application, this would send notifications to users
    // For now, we'll just log it and send to Firebase
    await realtimeSyncService.sendAlert({
      type: 'broadcast',
      message,
      severity: type,
      targetUsers
    });

    res.status(200).json({
      status: 'success',
      message: 'Broadcast sent successfully'
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send broadcast',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/activity-logs
 * @desc    Get system activity logs
 * @access  Private (Admin only)
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, userId } = req.query;

    // In a real application, this would fetch from an activity logging system
    // For now, we'll return mock data
    const mockLogs = [
      {
        id: '1',
        type: 'user_login',
        userId: 'user123',
        description: 'User logged in',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1'
      },
      {
        id: '2',
        type: 'transaction_flagged',
        userId: 'user123',
        description: 'High-risk transaction flagged for review',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        logs: mockLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockLogs.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/admin/maintenance-mode
 * @desc    Toggle maintenance mode
 * @access  Private (Admin only)
 */
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message = 'System is under maintenance. Please try again later.' } = req.body;

    // In a real application, this would update a system configuration
    // For now, we'll just send a broadcast
    if (enabled) {
      await realtimeSyncService.sendAlert({
        type: 'maintenance',
        message,
        severity: 'warning'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: { enabled, message }
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle maintenance mode',
      error: error.message
    });
  }
};
