import { body, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Registration validation rules
 */
export const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Invalid role'),
  
  handleValidationErrors
];

/**
 * Login validation rules
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Transaction submission validation rules
 */
export const validateTransaction = [
  body('transactionId')
    .trim()
    .notEmpty().withMessage('Transaction ID is required'),
  
  body('userId')
    .trim()
    .notEmpty().withMessage('User ID/Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  
  body('merchant')
    .trim()
    .notEmpty().withMessage('Merchant is required'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  
  body('ipAddress')
    .trim()
    .notEmpty().withMessage('IP Address is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}$/).withMessage('Please provide a valid IP address'),
  
  body('channel')
    .optional()
    .isIn(['Web App', 'Mobile App', 'API']).withMessage('Invalid channel'),

  handleValidationErrors
];

/**
 * Profile update validation rules
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  handleValidationErrors
];

/**
 * Password change validation rules
 */
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),

  handleValidationErrors
];
