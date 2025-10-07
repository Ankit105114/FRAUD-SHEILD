import { ref, set, onValue, push, get } from 'firebase/database';
import { getFirebaseDatabase } from '../config/firebase.js';

class RealtimeSyncService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  initialize() {
    try {
      this.db = getFirebaseDatabase();
      this.isInitialized = true;
      console.log('✅ RealtimeSyncService initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Realtime DB:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Sync transaction updates to Firebase for real-time dashboard
   */
  async syncTransactionUpdate(transaction) {
    if (!this.isInitialized || !this.db) {
      console.warn('RealtimeSyncService not initialized');
      return;
    }

    try {
      const transactionRef = ref(this.db, `transactions/${transaction._id}`);
      await set(transactionRef, {
        id: transaction._id,
        transactionId: transaction.transactionId,
        userId: transaction.userId,
        amount: transaction.amount,
        merchant: transaction.merchant,
        location: transaction.location,
        ipAddress: transaction.ipAddress,
        channel: transaction.channel,
        riskScore: transaction.riskScore,
        status: transaction.status,
        fraudReasons: transaction.fraudReasons,
        createdAt: transaction.createdAt,
        reviewedAt: transaction.reviewedAt,
        reviewedBy: transaction.reviewedBy
      });

      console.log(`✅ Transaction ${transaction.transactionId} synced to Firebase`);
    } catch (error) {
      console.error('Error syncing transaction to Firebase:', error);
    }
  }

  /**
   * Sync dashboard statistics to Firebase
   */
  async syncDashboardStats(stats) {
    if (!this.isInitialized || !this.db) {
      console.warn('RealtimeSyncService not initialized');
      return;
    }

    try {
      const statsRef = ref(this.db, 'dashboard/stats');
      await set(statsRef, {
        ...stats,
        lastUpdated: new Date().toISOString()
      });

      console.log('✅ Dashboard stats synced to Firebase');
    } catch (error) {
      console.error('Error syncing dashboard stats to Firebase:', error);
    }
  }

  /**
   * Send fraud alert notification
   */
  async sendAlert(alertData) {
    if (!this.isInitialized || !this.db) {
      console.warn('RealtimeSyncService not initialized');
      return;
    }

    try {
      const alertsRef = ref(this.db, 'alerts');
      const newAlertRef = push(alertsRef);

      await set(newAlertRef, {
        id: newAlertRef.key,
        type: alertData.type,
        message: alertData.message,
        severity: alertData.severity,
        transactionId: alertData.transactionId,
        timestamp: new Date().toISOString(),
        read: false
      });

      console.log(`🚨 Fraud alert sent: ${alertData.message}`);
    } catch (error) {
      console.error('Error sending alert to Firebase:', error);
    }
  }

  /**
   * Subscribe to real-time updates for dashboard
   */
  subscribeToUpdates(updateCallback) {
    if (!this.isInitialized || !this.db) {
      console.warn('RealtimeSyncService not initialized');
      return null;
    }

    try {
      const updatesRef = ref(this.db, 'updates');

      return onValue(updatesRef, (snapshot) => {
        const data = snapshot.val();
        if (data && updateCallback) {
          updateCallback(data);
        }
      });
    } catch (error) {
      console.error('Error subscribing to updates:', error);
      return null;
    }
  }

  /**
   * Subscribe to fraud alerts
   */
  subscribeToAlerts(alertCallback) {
    if (!this.isInitialized || !this.db) {
      console.warn('RealtimeSyncService not initialized');
      return null;
    }

    try {
      const alertsRef = ref(this.db, 'alerts');

      return onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && alertCallback) {
          // Convert object to array and filter unread alerts
          const alerts = Object.values(data).filter(alert => !alert.read);
          alertCallback(alerts);
        }
      });
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      return null;
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId) {
    if (!this.isInitialized || !this.db) {
      console.warn('RealtimeSyncService not initialized');
      return;
    }

    try {
      const alertRef = ref(this.db, `alerts/${alertId}`);
      await set(alertRef, { read: true }, { merge: true });
      console.log(`✅ Alert ${alertId} marked as read`);
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  /**
   * Get current system status for dashboard
   */
  async getSystemStatus() {
    if (!this.isInitialized || !this.db) {
      return { status: 'disconnected', message: 'Realtime service not available' };
    }

    try {
      const statusRef = ref(this.db, '.info/connected');
      const snapshot = await get(statusRef);
      const isConnected = snapshot.val();

      return {
        status: isConnected ? 'connected' : 'disconnected',
        message: isConnected ? 'Realtime sync active' : 'Realtime sync unavailable',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking system status:', error);
      return { status: 'error', message: 'Status check failed' };
    }
  }
}

const realtimeSyncService = new RealtimeSyncService();

// Initialize when module loads
realtimeSyncService.initialize();

export default realtimeSyncService;