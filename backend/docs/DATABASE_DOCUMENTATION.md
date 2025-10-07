# Database Documentation for FraudShield

## Overview
FraudShield uses **MongoDB** for persistent data storage and **Firebase** for real-time synchronization. This hybrid setup ensures data durability (MongoDB) and live updates (Firebase). Below is a from-scratch explanation.

## 1. MongoDB: Persistent Storage
- **What It Is**: A NoSQL database for storing structured data in JSON-like documents. Handles user accounts, transactions, and fraud patterns.
- **Role in FraudShield**: Stores all backend data permanently, allowing queries, updates, and historical analysis.
- **Connection**: Via Mongoose (ODM) in `server.js`; URI: `mongodb://localhost:27017/fraudshield` (from `.env`).
- **Collections** (Tables in SQL terms):
  - **Users**: User profiles (e.g., name, email, hashed password, role).
  - **Transactions**: Analyzed transactions (e.g., amount, risk score, status).
  - **IPNetworks**: IP-based fraud tracking (e.g., linked transactions, flags).

### How Live Data is Stored in MongoDB
- **Data Flow**:
  1. User submits data (e.g., via API or frontend form).
  2. Backend processes it (e.g., fraud analysis).
  3. Mongoose saves to MongoDB (e.g., `await transaction.save()`).
- **Example**: When a transaction is submitted, it's inserted into the `Transactions` collection with fields like `riskScore` and `status`.
- **Where to Input Data**:
  - **Web Page/Frontend**: Forms in `realtime-demo.html` or React app (e.g., transaction submission form at `/submit`).
  - **API**: Use Postman/curl for `/api/transactions/submit`.
- **How to View Data**:
  - **MongoDB Shell**: Run `mongo fraudshield` and query (e.g., `db.transactions.find().pretty()`).
  - **Tools**: Use MongoDB Compass (GUI) to connect and browse collections visually.
  - **Backend Logs**: Check server console for insert/update confirmations.

## 2. Firebase: Real-Time Storage
- **What It Is**: Google's real-time database for instant data sync across devices. Stores data as JSON trees.
- **Role in FraudShield**: Handles live updates (e.g., dashboard stats, alerts) without page refreshes.
- **Connection**: Via Firebase SDK in `firebase.js`; configured in `.env` (e.g., `FIREBASE_DATABASE_URL`).
- **Structure**:
  - **transactions**: Live transaction nodes (e.g., `transaction_id: {riskScore, status}`).
  - **dashboard**: Aggregated stats (e.g., `totalTransactions`, `averageRiskScore`).
  - **alerts**: Notifications (e.g., high-risk flags).

### How Live Data is Stored in Firebase
- **Data Flow**:
  1. Backend updates MongoDB (e.g., new transaction).
  2. Sync service (e.g., in `realtimeSync.js`) pushes changes to Firebase.
  3. Frontend listeners (e.g., in `realtime-demo.html`) detect updates and refresh UI instantly.
- **Example**: A new transaction triggers `firebase.database().ref('transactions/' + id).set(data)`, updating the dashboard in real-time.
- **Where to Input Data**:
  - **Web Page/Frontend**: Actions like submitting transactions in the demo page automatically sync.
  - **Backend**: Automated via code (e.g., after MongoDB insert, call Firebase update).
- **How to View Data**:
  - **Firebase Console**: Log in to Firebase project, go to Realtime Database, and view JSON tree (e.g., expand `transactions`).
  - **Web Page**: Open `realtime-demo.html` in browser; see live updates in the dashboard section.
  - **Tools**: Use Firebase SDK in console for queries (e.g., `firebase.database().ref('dashboard/stats').once('value')`).

## 3. User Authentication
- **How It Works** (From Scratch):
  1. **Registration**: User submits data via POST `/api/auth/register` (e.g., name, email, password).
  2. **Password Hashing**: Backend uses bcrypt to hash password (e.g., 10 salt rounds in `middleware/auth.js`).
  3. **Storage**: Hashed password + profile saved to MongoDB `Users` collection.
  4. **JWT Token**: On success, server generates JWT (jsonwebtoken library) with user ID/claims, signed with secret from `.env`.
  5. **Login**: User submits credentials; backend verifies hash and issues new JWT.
  6. **Protected Routes**: Middleware (e.g., `authenticate` in `auth.js`) checks JWT in `Authorization` header. If valid, attaches user to request; else, 401 error.
- **Real-Time Aspect**: No direct Firebase role; authentication is MongoDB-based for persistence.
- **Security**: JWT expires (e.g., 7 days), preventing long-term access.

## 4. Real-Time Explained
- **What It Means**: Data updates instantly across users/devices without manual refresh (e.g., live dashboard changes when a transaction is flagged).
- **How It Works**:
  1. **Event-Driven**: Backend listens for changes (e.g., new transaction in MongoDB).
  2. **Firebase Sync**: Pushes to Firebase Realtime DB.
  3. **Frontend Listeners**: JavaScript (e.g., in `realtime-demo.html`) uses `firebase.database().ref().on('value')` to detect changes and update DOM.
- **Storage Location**: Firebase Realtime Database (cloud-hosted JSON tree); not in MongoDB.
- **Benefits**: Enables live alerts (e.g., "High-risk transaction detected") and stats updates.
- **From Scratch Example**:
  - Submit transaction → MongoDB insert → Firebase update → Frontend re-renders dashboard.

## Interaction Guide
- **View MongoDB Data**: Use Compass or shell (e.g., `db.users.find({email: "test@example.com"})`).
- **View Firebase Data**: Firebase Console or console logs in demo page.
- **Test Live Sync**: Submit a transaction and watch dashboard update in real-time.

This setup ensures secure, scalable data handling. For code examples, check `server.js`, `firebase.js`, and `realtimeSync.js`.




┌─────────────┐    API Call    ┌─────────────┐    Database    ┌─────────────┐
│  Frontend   │ ──────────────▶ │   Backend   │ ──────────────▶ │  MongoDB    │
│   Forms     │                │    API      │                │   Storage   │
└─────────────┘   JWT Token    └─────────────┘   Validation   └─────────────┘
       │                          │                      │
       │                          │                      │
       └──────────────────────────┼──────────────────────┘
                                  │
                       Real-time Sync
                                  ▼
                         ┌─────────────┐
                         │   Firebase  │
                         │ Real-time DB│
                         └─────────────┘
