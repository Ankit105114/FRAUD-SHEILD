import express from 'express';
import {
  submitTransaction,
  getAllTransactions,
  getTransactionById,
  reviewTransaction,
  getNextForReview
} from '../controllers/transactionController.js';
import { authenticate, adminOnly, userOnly } from '../middleware/auth.js';
import { validateTransaction } from '../middleware/validation.js';

const router = express.Router();

// User routes
router.post('/submit', authenticate, userOnly, validateTransaction, submitTransaction);

// Admin routes
router.get('/', authenticate, adminOnly, getAllTransactions);
router.get('/queue/next', authenticate, adminOnly, getNextForReview);
router.get('/:id', authenticate, getTransactionById);
router.patch('/:id/review', authenticate, adminOnly, reviewTransaction);

export default router;
