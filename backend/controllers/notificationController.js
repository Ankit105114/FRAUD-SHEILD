import User from '../models/User.js';
import realtimeSyncService from '../services/realtimeSync.js';

/**
 * @route   POST /api/notifications/send
 * @desc    Send notification to users
 * @access  Private (Admin only)
 */
export const sendNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', targetUsers = 'all', priority = 'normal' } = req.body;

    let users = [];

    if (targetUsers === 'all') {
      users = await User.find({ isActive: true }).select('email name');
    } else if (targetUsers === 'admins') {
      users = await User.find({ role: 'admin', isActive: true }).select('email name');
    } else if (Array.isArray(targetUsers)) {
      users = await User.find({ _id: { $in: targetUsers }, isActive: true }).select('email name');
    }

    // Send real-time notification via Firebase
    const notificationData = {
      title,
      message,
      type,
      priority,
      timestamp: new Date().toISOString(),
      sender: req.user.name
    };

    await realtimeSyncService.sendAlert({
      type: 'notification',
      message: `${title}: ${message}`,
      severity: priority,
      data: notificationData
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: {
        recipients: users.length,
        notification: notificationData
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Get notifications from realtime service
    const notifications = await new Promise((resolve) => {
      realtimeSyncService.subscribeToAlerts((alertData) => {
        resolve(alertData || []);
      });

      // Timeout after 2 seconds if no data
      setTimeout(() => resolve([]), 2000);
    });

    // Filter for user's notifications (in real app, would filter by user ID)
    let userNotifications = notifications;

    if (unreadOnly === 'true') {
      userNotifications = notifications.filter(n => !n.read);
    }

    // Paginate
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedNotifications = userNotifications.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userNotifications.length,
          pages: Math.ceil(userNotifications.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    await realtimeSyncService.markAlertAsRead(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/notifications/bulk-read
 * @desc    Mark multiple notifications as read
 * @access  Private
 */
export const markBulkNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'notificationIds must be an array'
      });
    }

    // Mark each notification as read
    const promises = notificationIds.map(id => realtimeSyncService.markAlertAsRead(id));
    await Promise.all(promises);

    res.status(200).json({
      status: 'success',
      message: `${notificationIds.length} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking bulk notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private
 */
export const getNotificationStats = async (req, res) => {
  try {
    const notifications = await new Promise((resolve) => {
      realtimeSyncService.subscribeToAlerts((alertData) => {
        resolve(alertData || []);
      });

      // Timeout after 2 seconds if no data
      setTimeout(() => resolve([]), 2000);
    });

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {}),
      byPriority: notifications.reduce((acc, notification) => {
        acc[notification.severity] = (acc[notification.severity] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notification stats',
      error: error.message
    });
  }
};
