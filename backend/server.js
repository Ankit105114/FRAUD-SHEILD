import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
import { initializeFirebase } from './config/firebase.js';

// Import routes
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

// Import middleware
import {
  securityHeaders,
  requestLogger,
  requestTimeout,
  corsConfig,
  errorHandler
} from './middleware/security.js';
import { authRateLimit, apiRateLimit, adminRateLimit } from './middleware/security.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Security Middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(requestTimeout);

// CORS configuration
app.use(cors(corsConfig));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to routes
app.use('/api/auth', authRateLimit);
app.use('/api/transactions', apiRateLimit);
app.use('/api/analytics', apiRateLimit);
app.use('/api/admin', adminRateLimit);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FraudShield API is running',
    timestamp: new Date().toISOString()
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDatabase();
    console.log('✅ MongoDB connected successfully');

    await initializeFirebase();
    console.log('✅ Firebase initialized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;