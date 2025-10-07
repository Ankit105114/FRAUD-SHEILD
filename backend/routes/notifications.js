import express from 'express';
import {
  sendNotification,
  getNotifications,
  markNotificationAsRead,
  markBulkNotificationsAsRead,
  getNotificationStats
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.patch('/:id/read', markNotificationAsRead);
router.post('/bulk-read', markBulkNotificationsAsRead);

// Admin-only routes
router.post('/send', authorize(['admin']), sendNotification);

export default router;
