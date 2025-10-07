/**
 * FRAUD DETECTION ENGINE
 * 
 * This engine combines multiple DSA algorithms:
 * 1. Priority Queue - Orders transactions by risk score
 * 2. HashSet - O(1) blacklist checking
 * 3. Graph DFS/BFS - Detects fraud networks
 * 4. Sliding Window - Velocity checks for rapid transactions
 * 
 * The engine calculates a risk score (0-100) based on multiple factors
 * and automatically flags suspicious transactions.
 */

import PriorityQueue from './priorityQueue.js';
import blacklistService from './blacklistService.js';
import FraudNetworkGraph from './graphAnalyzer.js';
import Transaction from '../models/Transaction.js';
import IPNetwork from '../models/IPNetwork.js';
import { TRANSACTION_STATUS, FRAUD_THRESHOLDS, VELOCITY_CHECK } from '../config/constants.js';

class FraudDetectionEngine {
  constructor() {
    this.transactionQueue = new PriorityQueue();
    this.fraudGraph = new FraudNetworkGraph();
    this.velocityTracker = new Map(); // Sliding window for velocity checks
  }

  /**
   * MAIN FRAUD DETECTION METHOD
   * Analyzes a transaction and returns risk assessment
   */
  async analyzeTransaction(transactionData) {
    const riskFactors = [];
    let riskScore = 0;

    // 1. BLACKLIST CHECK (O(1) using HashSet)
    const blacklistCheck = this.checkBlacklist(transactionData);
    if (blacklistCheck.isBlacklisted) {
      riskScore += 50;
      riskFactors.push(...blacklistCheck.reasons);
    }

    // 2. AMOUNT ANALYSIS
    const amountRisk = this.analyzeAmount(transactionData.amount);
    riskScore += amountRisk.score;
    if (amountRisk.reason) riskFactors.push(amountRisk.reason);

    // 3. VELOCITY CHECK (Sliding Window Algorithm)
    const velocityRisk = await this.checkVelocity(transactionData.userId, transactionData.ipAddress);
    riskScore += velocityRisk.score;
    if (velocityRisk.reason) riskFactors.push(velocityRisk.reason);

    // 4. IP NETWORK ANALYSIS (Graph-based)
    const networkRisk = await this.analyzeIPNetwork(transactionData.ipAddress, transactionData.userId);
    riskScore += networkRisk.score;
    if (networkRisk.reason) riskFactors.push(networkRisk.reason);

    // 5. LOCATION ANOMALY
    const locationRisk = this.analyzeLocation(transactionData.location);
    riskScore += locationRisk.score;
    if (locationRisk.reason) riskFactors.push(locationRisk.reason);

    // 6. TIME-BASED PATTERNS
    const timeRisk = this.analyzeTimePattern();
    riskScore += timeRisk.score;
    if (timeRisk.reason) riskFactors.push(timeRisk.reason);

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine status based on risk score
    let status = TRANSACTION_STATUS.SAFE;
    if (riskScore >= FRAUD_THRESHOLDS.HIGH) {
      status = TRANSACTION_STATUS.FRAUD;
    } else if (riskScore >= FRAUD_THRESHOLDS.MEDIUM) {
      status = TRANSACTION_STATUS.UNDER_REVIEW;
    }

    return {
      riskScore,
      status,
      fraudReasons: riskFactors,
      analysis: {
        blacklistCheck,
        amountRisk,
        velocityRisk,
        networkRisk,
        locationRisk,
        timeRisk
      }
    };
  }

  /**
   * BLACKLIST CHECK using HashSet (O(1))
   */
  checkBlacklist(transactionData) {
    const reasons = [];
    let isBlacklisted = false;

    if (blacklistService.isUserBlacklisted(transactionData.userId)) {
      reasons.push('User is blacklisted');
      isBlacklisted = true;
    }

    if (blacklistService.isIPBlacklisted(transactionData.ipAddress)) {
      reasons.push('IP address is blacklisted');
      isBlacklisted = true;
    }

    if (blacklistService.isMerchantBlacklisted(transactionData.merchant)) {
      reasons.push('Merchant is blacklisted');
      isBlacklisted = true;
    }

    return { isBlacklisted, reasons };
  }

  /**
   * AMOUNT ANALYSIS
   */
  analyzeAmount(amount) {
    let score = 0;
    let reason = null;

    if (amount > 10000) {
      score = 30;
      reason = 'Unusually high transaction amount';
    } else if (amount > 5000) {
      score = 15;
      reason = 'High transaction amount';
    } else if (amount < 1) {
      score = 10;
      reason = 'Suspiciously low amount';
    }

    return { score, reason };
  }

  /**
   * VELOCITY CHECK using Sliding Window Algorithm
   * Tracks transactions within a time window
   */
  async checkVelocity(userId, ipAddress) {
    const now = Date.now();
    const windowMs = VELOCITY_CHECK.WINDOW_MS;
    const maxTransactions = VELOCITY_CHECK.MAX_TRANSACTIONS;

    // Get recent transactions from DB
    const recentTransactions = await Transaction.find({
      $or: [{ userId }, { ipAddress }],
      createdAt: { $gte: new Date(now - windowMs) }
    });

    let score = 0;
    let reason = null;

    if (recentTransactions.length >= maxTransactions) {
      score = 40;
      reason = `${recentTransactions.length} transactions in ${windowMs / 1000}s (velocity limit exceeded)`;
    } else if (recentTransactions.length >= maxTransactions - 1) {
      score = 20;
      reason = 'High transaction velocity detected';
    }

    return { score, reason, count: recentTransactions.length };
  }

  /**
   * IP NETWORK ANALYSIS using Graph DFS/BFS
   * Detects fraud rings through shared IPs
   */
  async analyzeIPNetwork(ipAddress, userId) {
    let score = 0;
    let reason = null;

    // Find or create IP network entry
    let ipNetwork = await IPNetwork.findOne({ ipAddress });
    
    if (!ipNetwork) {
      ipNetwork = await IPNetwork.create({
        ipAddress,
        linkedUserIds: [userId],
        transactionCount: 1
      });
    } else {
      // Update IP network
      if (!ipNetwork.linkedUserIds.includes(userId)) {
        ipNetwork.linkedUserIds.push(userId);
      }
      ipNetwork.transactionCount += 1;
      ipNetwork.lastSeen = new Date();
      await ipNetwork.save();

      // Build fraud graph
      for (const linkedUser of ipNetwork.linkedUserIds) {
        this.fraudGraph.addEdge(userId, linkedUser);
      }

      // Check if IP is flagged
      if (ipNetwork.isFlagged) {
        score = 35;
        reason = `IP address flagged: ${ipNetwork.flagReason}`;
      }

      // Check for suspicious patterns
      if (ipNetwork.linkedUserIds.length > 5) {
        score += 25;
        reason = `IP shared by ${ipNetwork.linkedUserIds.length} users (potential fraud ring)`;
      }

      if (ipNetwork.transactionCount > 50) {
        score += 15;
        reason = `High transaction count from IP: ${ipNetwork.transactionCount}`;
      }
    }

    return { score, reason, networkSize: ipNetwork.linkedUserIds.length };
  }

  /**
   * LOCATION ANALYSIS
   */
  analyzeLocation(location) {
    let score = 0;
    let reason = null;

    // High-risk locations (example)
    const highRiskLocations = ['Unknown', 'Anonymous', 'VPN'];
    
    if (highRiskLocations.some(loc => location.toLowerCase().includes(loc.toLowerCase()))) {
      score = 20;
      reason = 'Transaction from high-risk location';
    }

    return { score, reason };
  }

  /**
   * TIME PATTERN ANALYSIS
   */
  analyzeTimePattern() {
    const hour = new Date().getHours();
    let score = 0;
    let reason = null;

    // Unusual hours (2 AM - 5 AM)
    if (hour >= 2 && hour <= 5) {
      score = 10;
      reason = 'Transaction during unusual hours';
    }

    return { score, reason };
  }

  /**
   * ADD TRANSACTION TO PRIORITY QUEUE
   * High-risk transactions are prioritized for admin review
   */
  addToReviewQueue(transaction) {
    this.transactionQueue.enqueue(transaction);
  }

  /**
   * GET NEXT HIGH-RISK TRANSACTION
   * Admins retrieve highest-risk transaction first
   */
  getNextForReview() {
    return this.transactionQueue.dequeue();
  }

  /**
   * GET ALL PENDING REVIEWS (sorted by risk)
   */
  getAllPendingReviews() {
    return this.transactionQueue.getAll();
  }

  /**
   * GET FRAUD NETWORK STATISTICS
   */
  getFraudNetworkStats() {
    return this.fraudGraph.getNetworkStats();
  }

  /**
   * CHECK IF TWO USERS ARE IN SAME FRAUD RING
   */
  areUsersConnected(userId1, userId2) {
    return this.fraudGraph.areConnected(userId1, userId2);
  }
}

// Singleton instance
const fraudDetectionEngine = new FraudDetectionEngine();

export default fraudDetectionEngine;
