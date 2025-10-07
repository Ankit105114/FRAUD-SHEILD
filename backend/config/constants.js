export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const TRANSACTION_STATUS = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  SAFE: 'Safe',
  FRAUD: 'Fraud'
};

export const TRANSACTION_CHANNELS = {
  WEB_APP: 'Web App',
  MOBILE_APP: 'Mobile App',
  API: 'API'
};

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const FRAUD_THRESHOLDS = {
  HIGH: parseInt(process.env.FRAUD_RISK_THRESHOLD_HIGH) || 75,
  MEDIUM: parseInt(process.env.FRAUD_RISK_THRESHOLD_MEDIUM) || 50
};

export const VELOCITY_CHECK = {
  WINDOW_MS: parseInt(process.env.FRAUD_VELOCITY_WINDOW_MS) || 300000,
  MAX_TRANSACTIONS: parseInt(process.env.FRAUD_VELOCITY_MAX_TRANSACTIONS) || 5
};
