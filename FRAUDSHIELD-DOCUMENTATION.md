# 🚀 FraudShield - Real-Time Fraud Detection System

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Database Design](#database-design)
4. [API Documentation](#api-documentation)
5. [Real-Time Features](#real-time-features)
6. [Security Implementation](#security-implementation)
7. [Fraud Detection System](#fraud-detection-system)
8. [Business Model](#business-model)
9. [Setup & Installation](#setup--installation)
10. [Usage Guide](#usage-guide)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is FraudShield?
FraudShield is an advanced **real-time AI-powered fraud detection system** designed to analyze financial transactions instantly and provide risk scoring from 0-100. The system uses multiple detection algorithms including priority queues, graph networks, and sliding window analysis to identify fraudulent activities.

### Core Features
- ✅ **Real-time transaction analysis** with sub-100ms response time
- ✅ **Multi-layered fraud detection** using IP tracking, behavioral analysis, and pattern recognition
- ✅ **Live dashboard** with real-time updates via Firebase
- ✅ **Role-based user management** (User, Analyst, Admin)
- ✅ **Comprehensive analytics** and reporting for administrators
- ✅ **Real-time alerts** and notifications for suspicious activities
- ✅ **RESTful API** with JWT authentication and rate limiting

### Target Users
- **Financial Institutions** (Banks, Credit Unions)
- **E-commerce Platforms** (Online marketplaces)
- **Payment Processors** (Payment gateways)
- **Government Agencies** (Tax and benefit systems)

---

## 🏗️ Architecture & Tech Stack

### Backend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │   MongoDB       │    │   Firebase      │
│   Server        │◄──►│   Database      │◄──►│   Real-time DB  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JWT Auth      │    │   Fraud Engine  │    │   Real-time     │
│   Middleware    │    │   Algorithms    │    │   Sync Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend (Node.js Ecosystem)
- **Runtime:** Node.js 22.x
- **Framework:** Express.js (REST API)
- **Database:** MongoDB (Persistent storage)
- **Real-time DB:** Firebase Real-time Database
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Custom validation middleware
- **CORS:** Configurable cross-origin setup

#### Frontend (Web-based)
- **HTML5 + CSS3** (Responsive design)
- **Vanilla JavaScript** (ES6+ modules)
- **Firebase SDK** (Real-time data sync)
- **Real-time Listeners** (Live updates)

#### Development Tools
- **Package Manager:** npm
- **Process Manager:** Built-in (Node.js cluster)
- **Environment:** .env configuration
- **Code Quality:** ESLint (configurable)

### System Architecture

#### 1. Request Flow
```
Client Request → Express Server → Authentication Middleware →
Business Logic → Database Operations → Response → Client
```

#### 2. Real-Time Flow
```
Transaction → Fraud Analysis → MongoDB Storage →
Firebase Sync → Real-time Listeners → Live Dashboard Updates
```

#### 3. Authentication Flow
```
User Login → Password Verification → JWT Generation →
Token Validation → Protected Route Access → User Session
```

---

## 💾 Database Design

### MongoDB Collections

#### 1. Users Collection
```javascript
{
  "_id": "ObjectId",
  "name": "String (required, 2-100 chars)",
  "email": "String (required, unique, email format)",
  "password": "String (required, hashed with bcrypt)",
  "role": "String (enum: user, analyst, admin)",
  "registrationDate": "Date (default: now)",
  "lastLogin": "Date (updated on login)",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### 2. Transactions Collection
```javascript
{
  "_id": "ObjectId",
  "transactionId": "String (required, unique)",
  "userId": "String (required, links to user email)",
  "amount": "Number (required, transaction amount)",
  "merchant": "String (required, merchant name)",
  "location": "String (required, transaction location)",
  "ipAddress": "String (required, client IP)",
  "channel": "String (enum: Web App, Mobile App, POS, ATM)",
  "riskScore": "Number (0-100, fraud risk score)",
  "status": "String (enum: NEW, UNDER_REVIEW, SAFE, FRAUD)",
  "fraudReasons": "Array (list of fraud indicators)",
  "createdAt": "Date",
  "reviewedAt": "Date (when reviewed)",
  "reviewedBy": "String (admin who reviewed)"
}
```

#### 3. IPNetworks Collection
```javascript
{
  "_id": "ObjectId",
  "ipAddress": "String (required, unique)",
  "linkedUserIds": "Array (users from this IP)",
  "linkedTransactionIds": "Array (transactions from this IP)",
  "isFlagged": "Boolean (default: false)",
  "flagReason": "String (reason for flagging)",
  "firstSeen": "Date (first transaction from IP)",
  "lastSeen": "Date (last transaction from IP)",
  "transactionCount": "Number (total transactions)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Firebase Real-Time Database Structure
```javascript
{
  "transactions": {
    "transaction_id": {
      "id": "transaction_id",
      "transactionId": "TXN_123",
      "riskScore": 75,
      "status": "UNDER_REVIEW",
      "createdAt": "ISO Date"
    }
  },
  "dashboard": {
    "stats": {
      "totalTransactions": 150,
      "safeTransactions": 140,
      "flaggedTransactions": 10,
      "averageRiskScore": 15.5,
      "lastUpdated": "ISO Date"
    }
  },
  "alerts": {
    "alert_id": {
      "type": "HIGH_RISK",
      "message": "Suspicious transaction detected",
      "severity": "HIGH",
      "read": false,
      "timestamp": "ISO Date"
    }
  }
}
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "jwt_token_here",
    "nextSteps": { "dashboard": "/dashboard", "firstAction": "Submit transaction" }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "John Doe", "role": "user" },
    "token": "jwt_token_here",
    "dashboard": {
      "url": "/dashboard",
      "endpoints": {
        "profile": "/api/auth/dashboard",
        "activity": "/api/auth/activity"
      }
    }
  }
}
```

#### Get User Dashboard
```http
GET /api/auth/dashboard
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "statistics": {
      "period": "30 days",
      "totalTransactions": 25,
      "safeTransactions": 23,
      "flaggedTransactions": 2,
      "averageRiskScore": 12.5,
      "safetyRate": "92.00"
    },
    "recentActivity": [ /* Recent transactions */ ],
    "systemStatus": { "lastUpdated": "ISO Date", "apiVersion": "1.0.0" }
  }
}
```

### Transaction Endpoints

#### Submit Transaction for Analysis
```http
POST /api/transactions/submit
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "transactionId": "TXN_123456",
  "userId": "john@example.com",
  "amount": 1500.00,
  "merchant": "Online Store",
  "location": "New York, US",
  "ipAddress": "192.168.1.1",
  "channel": "Web App"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "transactionId": "TXN_123456",
    "riskScore": 25,
    "status": "SAFE",
    "fraudReasons": [],
    "analysisTime": "45ms"
  }
}
```

### Analytics Endpoints (Admin Only)

#### Get Analytics Summary
```http
GET /api/analytics/summary
Authorization: Bearer admin_jwt_token_here
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalTransactions": 1000,
    "fraudRate": "3.5%",
    "averageRiskScore": 18.2,
    "topFraudLocations": ["Unknown", "Proxy IP", "VPN"],
    "systemHealth": "GOOD"
  }
}
```

---

## ⚡ Real-Time Features

### Firebase Integration

#### Real-Time Data Synchronization
- **WebSocket Connections:** Automatic Firebase listeners
- **Live Dashboard Updates:** Statistics update instantly
- **Real-Time Alerts:** Fraud notifications appear immediately
- **Activity Feed:** Recent transactions update automatically

#### Implementation
```javascript
// Frontend real-time listener
const statsRef = ref(database, 'dashboard/stats');
onValue(statsRef, (snapshot) => {
    const stats = snapshot.val();
    // Update DOM instantly - no refresh needed
    updateDashboardStats(stats);
});
```

### Real-Time Dashboard Features
- **Live Statistics:** Transaction counts update in real-time
- **Activity Feed:** New transactions appear instantly
- **Alert System:** High-risk transactions trigger immediate alerts
- **Connection Status:** Visual indicator for Firebase connection

---

## 🔒 Security Implementation

### Authentication & Authorization

#### JWT Authentication
- **Token Generation:** 7-day expiration with secure signing
- **Password Hashing:** bcrypt with 10 salt rounds
- **Session Management:** Automatic cleanup on logout

#### Role-Based Access Control (RBAC)
```javascript
// Middleware for route protection
const authenticate = async (req, res, next) => {
  // Verify JWT token
  // Check user exists and is active
  // Attach user to request object
};

const authorize = (...roles) => (req, res, next) => {
  // Check if user role is authorized
  // Deny access if not authorized
};
```

#### Security Middleware
- **Rate Limiting:** Prevents brute force attacks
- **CORS:** Configurable cross-origin policies
- **Input Validation:** Sanitizes all user inputs
- **Error Handling:** Prevents information leakage

### Data Security
- **Password Hashing:** bcrypt with salt rounds
- **JWT Secrets:** Environment variable storage
- **Input Sanitization:** XSS and injection prevention
- **Session Security:** Secure token storage

---

## 🧠 Fraud Detection System

### Multi-Layered Detection Approach

#### 1. Priority Queue Algorithm
**Purpose:** Real-time risk scoring and alert prioritization
```javascript
// Higher risk = Higher priority for immediate review
class PriorityQueue {
  enqueue(transaction, riskScore) {
    // Add to queue sorted by risk score
    // High-risk transactions processed first
  }
}
```

#### 2. Graph Network Analysis
**Purpose:** Detect fraud rings and network patterns
```javascript
// Build network of IP addresses and users
class FraudNetwork {
  addConnection(ip1, ip2, user1, user2) {
    // Create graph edges between suspicious connections
    // Detect fraud rings and coordinated attacks
  }
}
```

#### 3. Sliding Window Algorithm
**Purpose:** Detect velocity and frequency anomalies
```javascript
// Track transaction patterns over time windows
class SlidingWindow {
  constructor(windowSize) {
    this.window = [];
  }

  addTransaction(transaction) {
    // Maintain rolling window of recent transactions
    // Detect sudden spikes in activity
  }
}
```

### Risk Scoring Factors
- **Amount Analysis:** Unusual transaction amounts
- **IP Geolocation:** Suspicious locations (VPN, proxies)
- **Behavioral Patterns:** Deviation from normal user behavior
- **Network Analysis:** Connections to known fraud IPs
- **Velocity Checks:** Too many transactions too quickly

---

## 💼 Business Model

### Market Analysis

#### Target Market Size
- **Global FinTech Market:** $200B+ (growing 20% annually)
- **Fraud Detection Market:** $50B+ by 2025
- **Real-Time Analytics:** High-growth segment

#### Customer Segments
1. **Enterprise** (500+ employees): Full-featured solution
2. **Mid-Market** (50-500 employees): Core fraud detection
3. **Small Business** (10-50 employees): Essential monitoring
4. **Individual Users:** Basic transaction alerts

### Revenue Streams
- **SaaS Subscriptions:** $99-$999/month per tier
- **Transaction Fees:** $0.01-$0.10 per analyzed transaction
- **Setup Services:** $5,000-$50,000 one-time implementation
- **Premium Support:** $500-$2,000/month

### Competitive Advantages
- **Real-Time Processing:** Sub-100ms vs competitors' batch processing
- **Multi-Algorithm Approach:** Higher accuracy than single ML models
- **Cost-Effective:** No expensive ML infrastructure needed
- **Easy Integration:** Simple REST API integration

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js:** 18.x or higher
- **MongoDB:** 5.x or higher
- **Firebase Account:** For real-time features

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd fraudshield-backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your values
MONGODB_URI=mongodb://localhost:27017/fraudshield
JWT_SECRET=your-super-secret-jwt-key-here
FIREBASE_API_KEY=your-firebase-api-key
```

#### 4. Database Setup
```bash
# MongoDB should be running on default port 27017
# Collections will be created automatically on first use
```

#### 5. Start Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

#### 6. Verify Installation
```bash
# Check server status
curl http://localhost:3001/health

# Should return: {"status":"success","message":"FraudShield API is running"}
```

### Frontend Setup
```bash
# Open the real-time demo
open realtime-demo.html

# Or serve with any static file server
npx serve .
```

---

## 📱 Usage Guide

### User Registration & Login

#### 1. Create Account
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Transaction Analysis

#### Submit Transaction
```bash
curl -X POST http://localhost:3001/api/transactions/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN_123456",
    "userId": "john@example.com",
    "amount": 1500.00,
    "merchant": "Online Store",
    "location": "New York, US",
    "ipAddress": "192.168.1.1",
    "channel": "Web App"
  }'
```

#### Check Dashboard
```bash
curl -X GET http://localhost:3001/api/auth/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Real-Time Features

#### Monitor Live Updates
1. Open `realtime-demo.html` in browser
2. Login with your credentials
3. Submit transactions and watch dashboard update in real-time
4. See live connection status indicator

#### Test Real-Time Functionality
- Use the "Test Real-time Updates" button in the demo
- Submit multiple transactions to see live statistics changes
- Monitor the activity feed for instant updates

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <process_id>

# Check MongoDB connection
mongo --eval "db.stats()"
```

#### 2. Authentication Errors
```bash
# Verify JWT_SECRET in .env
echo $JWT_SECRET

# Check user exists in database
mongo fraudshield --eval "db.users.find().pretty()"
```

#### 3. Real-Time Not Working
```bash
# Check Firebase configuration
# Verify firebase.js has correct project credentials

# Test Firebase connection
curl -X POST https://fraud-detection-system-1c685.firebaseio.com/test.json \
  -d '{"test": "connection"}'
```

#### 4. Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB if needed
sudo systemctl restart mongod

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### Debug Mode
```bash
# Start with debug logging
DEBUG=* npm start

# Check application logs
tail -f logs/app.log
```

### Performance Monitoring
```bash
# Monitor memory usage
node --expose-gc server.js

# Check database performance
mongo fraudshield --eval "db.stats()"
```

---

## 📊 API Reference Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | ❌ |
| POST | `/api/auth/login` | User authentication | ❌ |
| GET | `/api/auth/dashboard` | Get user dashboard | ✅ |
| GET | `/api/auth/me` | Get current user profile | ✅ |
| POST | `/api/transactions/submit` | Submit transaction for analysis | ✅ |
| GET | `/api/analytics/summary` | Get analytics summary | ✅ (Admin) |

## 🎯 Next Steps & Enhancements

### Potential Improvements
1. **Machine Learning Integration** - TensorFlow.js for pattern recognition
2. **Advanced Analytics** - More detailed fraud pattern analysis
3. **Mobile App** - React Native mobile application
4. **Multi-language Support** - International fraud detection
5. **Blockchain Integration** - Cryptocurrency transaction analysis

### Scalability Considerations
- **Load Balancing** - Multiple server instances
- **Database Sharding** - Horizontal scaling
- **Caching Layer** - Redis for performance
- **CDN Integration** - Global content delivery

---

## 📞 Support & Contact

For technical support, feature requests, or business inquiries, please refer to the project documentation or contact the development team.

**FraudShield v1.0.0** - Real-Time Fraud Detection System
Built with ❤️ using Node.js, MongoDB, and Firebase
