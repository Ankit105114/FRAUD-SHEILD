import express from 'express';
import {
  getAnalyticsSummary,
  getRiskDistribution,
  getVelocityAnalysis,
  getAlerts,
  markAlertAsRead,
  getFraudFunnel,
  getFraudByRegion,
  getChannelAnalysis,
  getTimeTrend,
  getFraudNetworkStats
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication and analyst/admin role
router.use(authenticate);
router.use(authorize(['admin', 'analyst']));

router.get('/summary', getAnalyticsSummary);
router.get('/risk-distribution', getRiskDistribution);
router.get('/velocity-analysis', getVelocityAnalysis);
router.get('/alerts', getAlerts);
router.post('/alerts/:id/read', markAlertAsRead);
router.get('/fraud-funnel', getFraudFunnel);
router.get('/fraud-by-region', getFraudByRegion);
router.get('/channel-analysis', getChannelAnalysis);
router.get('/time-trend', getTimeTrend);
router.get('/fraud-network', getFraudNetworkStats);

export default router;
