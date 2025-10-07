import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { getFirebaseAuth } from '../config/firebase.js';
import { TRANSACTION_STATUS } from '../config/constants.js';


// Example usage
const auth = getFirebaseAuth();

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    // Generate token
    const token = generateToken(user._id);

    // Try to create Firebase user (optional)
    try {
      await getFirebaseAuth().createUser({
        email: user.email,
        password: password,
        displayName: user.name
      });
    } catch (firebaseError) {
      console.warn('Firebase user creation failed:', firebaseError.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token,
        nextSteps: {
          message: 'Welcome! Your account has been created successfully.',
          dashboard: {
            url: '/dashboard',
            description: 'Access your personal dashboard to view transactions and analytics'
          },
          firstAction: {
            title: 'Submit Your First Transaction',
            description: 'Start by analyzing your first transaction for fraud detection',
            endpoint: '/api/transactions/submit'
          }
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token,
        dashboard: {
          url: '/dashboard',
          endpoints: {
            profile: '/api/auth/dashboard',
            activity: '/api/auth/activity',
            transactions: '/api/transactions'
          }
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};

/**
 * @route   GET /api/auth/dashboard
 * @desc    Get user dashboard with profile and stats
 * @access  Private
 */
export const getUserDashboard = async (req, res) => {
  try {
    const user = req.user;
    const { period = '30d' } = req.query;

    // Calculate date range
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get user's transaction statistics
    const [
      totalTransactions,
      safeTransactions,
      flaggedTransactions,
      avgRiskScore,
      recentTransactions
    ] = await Promise.all([
      Transaction.countDocuments({ userId: user.email, createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ userId: user.email, status: TRANSACTION_STATUS.SAFE, createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ userId: user.email, status: { $in: [TRANSACTION_STATUS.FRAUD, TRANSACTION_STATUS.UNDER_REVIEW] }, createdAt: { $gte: startDate } }),
      Transaction.aggregate([
        { $match: { userId: user.email, createdAt: { $gte: startDate } } },
        { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
      ]),
      Transaction.find({ userId: user.email })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('transactionId amount status riskScore createdAt merchant')
    ]);

    const averageRiskScore = avgRiskScore.length > 0 ? parseFloat(avgRiskScore[0].avgRisk.toFixed(2)) : 0;

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        memberSince: user.createdAt,
        profileComplete: !!(user.name && user.email)
      },
      statistics: {
        period: `${days} days`,
        totalTransactions,
        safeTransactions,
        flaggedTransactions,
        averageRiskScore,
        safetyRate: totalTransactions > 0 ? ((safeTransactions / totalTransactions) * 100).toFixed(2) : 0
      },
      recentActivity: recentTransactions.map(tx => ({
        id: tx._id,
        transactionId: tx.transactionId,
        amount: tx.amount,
        merchant: tx.merchant,
        status: tx.status,
        riskScore: tx.riskScore,
        date: tx.createdAt
      })),
      quickActions: [
        {
          title: 'Submit New Transaction',
          description: 'Analyze a new transaction for fraud',
          endpoint: '/api/transactions/submit',
          method: 'POST'
        },
        {
          title: 'View All Transactions',
          description: 'See complete transaction history',
          endpoint: '/api/transactions',
          method: 'GET'
        },
        {
          title: 'Update Profile',
          description: 'Manage your account settings',
          endpoint: '/api/auth/profile',
          method: 'PATCH'
        }
      ],
      systemStatus: {
        lastUpdated: new Date().toISOString(),
        apiVersion: '1.0.0'
      }
    };

    res.status(200).json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load dashboard',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/activity
 * @desc    Get user activity history
 * @access  Private
 */
export const getUserActivity = async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'all' } = req.query;

    const query = { userId: req.user.email };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let transactions = [];

    if (type === 'all' || type === 'transactions') {
      transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('transactionId amount merchant status riskScore createdAt');
    }

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        activities: transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          type,
          availableTypes: ['all', 'transactions', 'logins']
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get activity',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/auth/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
export const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to deactivate account',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin role)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/auth/users/:id/status
 * @desc    Update user status (Admin only)
 * @access  Private (Admin role)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private (Admin role)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: error.message
    });
  }
};
