import express from 'express';
import {
  register,
  login,
  getProfile,
  logout,
  updateProfile,
  changePassword,
  deactivateAccount,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getUserDashboard,
  getUserActivity
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRegistration, validateLogin, validateProfileUpdate, validatePasswordChange } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes (require authentication)
router.get('/me', authenticate, getProfile);
router.get('/dashboard', authenticate, getUserDashboard);
router.get('/activity', authenticate, getUserActivity);
router.patch('/profile', authenticate, validateProfileUpdate, updateProfile);
router.patch('/password', authenticate, validatePasswordChange, changePassword);
router.patch('/deactivate', authenticate, deactivateAccount);
router.post('/logout', authenticate, logout);

// Admin-only routes
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.patch('/users/:id/status', authenticate, authorize(['admin']), updateUserStatus);
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);

export default router;
