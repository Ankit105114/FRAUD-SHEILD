import express from 'express';
import {
  getSystemStatus,
  getDashboardMetrics,
  sendBroadcast,
  getActivityLogs,
  toggleMaintenanceMode
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/system-status', getSystemStatus);
router.get('/dashboard-metrics', getDashboardMetrics);
router.post('/broadcast', sendBroadcast);
router.get('/activity-logs', getActivityLogs);
router.post('/maintenance-mode', toggleMaintenanceMode);

export default router;
