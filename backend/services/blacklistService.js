/**
 * BLACKLIST SERVICE (HASHSET IMPLEMENTATION)
 * 
 * Data Structure: JavaScript Set (Hash-based)
 * Purpose: Rapid O(1) lookup for known fraudulent entities
 * 
 * Time Complexity:
 * - Add: O(1)
 * - Check: O(1)
 * - Delete: O(1)
 * 
 * This service maintains blacklists of fraudulent users, IPs, and cards
 * for instant fraud detection without database queries.
 */

class BlacklistService {
  constructor() {
    // HashSets for O(1) lookup
    this.blacklistedUsers = new Set();
    this.blacklistedIPs = new Set();
    this.blacklistedCards = new Set();
    this.blacklistedMerchants = new Set();
  }

  // Add to blacklist (O(1))
  addUser(userId) {
    this.blacklistedUsers.add(userId.toLowerCase().trim());
  }

  addIP(ipAddress) {
    this.blacklistedIPs.add(ipAddress.trim());
  }

  addCard(cardNumber) {
    this.blacklistedCards.add(cardNumber.trim());
  }

  addMerchant(merchant) {
    this.blacklistedMerchants.add(merchant.toLowerCase().trim());
  }

  // Check if blacklisted (O(1))
  isUserBlacklisted(userId) {
    return this.blacklistedUsers.has(userId.toLowerCase().trim());
  }

  isIPBlacklisted(ipAddress) {
    return this.blacklistedIPs.has(ipAddress.trim());
  }

  isCardBlacklisted(cardNumber) {
    return this.blacklistedCards.has(cardNumber.trim());
  }

  isMerchantBlacklisted(merchant) {
    return this.blacklistedMerchants.has(merchant.toLowerCase().trim());
  }

  // Remove from blacklist (O(1))
  removeUser(userId) {
    return this.blacklistedUsers.delete(userId.toLowerCase().trim());
  }

  removeIP(ipAddress) {
    return this.blacklistedIPs.delete(ipAddress.trim());
  }

  removeCard(cardNumber) {
    return this.blacklistedCards.delete(cardNumber.trim());
  }

  removeMerchant(merchant) {
    return this.blacklistedMerchants.delete(merchant.toLowerCase().trim());
  }

  // Get all blacklisted entities
  getAllBlacklisted() {
    return {
      users: Array.from(this.blacklistedUsers),
      ips: Array.from(this.blacklistedIPs),
      cards: Array.from(this.blacklistedCards),
      merchants: Array.from(this.blacklistedMerchants)
    };
  }

  // Get counts
  getCounts() {
    return {
      users: this.blacklistedUsers.size,
      ips: this.blacklistedIPs.size,
      cards: this.blacklistedCards.size,
      merchants: this.blacklistedMerchants.size,
      total: this.blacklistedUsers.size + this.blacklistedIPs.size + 
             this.blacklistedCards.size + this.blacklistedMerchants.size
    };
  }

  // Clear all blacklists
  clearAll() {
    this.blacklistedUsers.clear();
    this.blacklistedIPs.clear();
    this.blacklistedCards.clear();
    this.blacklistedMerchants.clear();
  }
}

// Singleton instance
const blacklistService = new BlacklistService();

// Pre-populate with some known fraudulent entities (example)
blacklistService.addIP('192.168.1.100');
blacklistService.addUser('fraud@example.com');

export default blacklistService;
