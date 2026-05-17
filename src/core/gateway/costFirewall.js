import db from '../db/quad_schema.js';

/**
 * Cost Firewall — Enforces safety, budgets, and credit limits.
 * Blocks requests if credits are insufficient or limits are exceeded.
 */
export class CostFirewall {
  /**
   * Checks if a request is allowed based on credits and safety rules.
   * @param {string} orgId - The organization ID.
   * @param {string} endpoint - The requested endpoint.
   * @returns {boolean} - True if allowed, throws error otherwise.
   */
  static async authorize(orgId, endpoint) {
    // 1. Check Global Emergency Shutoff
    const globalShutoff = db.prepare("SELECT value FROM system_settings WHERE key = 'emergency_shutoff'").get();
    if (globalShutoff && globalShutoff.value === 'true') {
      throw new Error('System is temporarily offline for maintenance.');
    }

    // 2. Check Organization Status
    const org = db.prepare('SELECT status, plan FROM organizations WHERE id = ?').get(orgId);
    if (!org) {
      throw new Error('Organization not found.');
    }
    if (org.status !== 'active') {
      throw new Error('Organization account is suspended.');
    }

    // 3. Get Endpoint Cost
    const epConfig = db.prepare('SELECT credit_cost FROM api_endpoints WHERE path = ?').get(endpoint);
    const cost = epConfig ? epConfig.credit_cost : 1; // Default cost

    // 4. Check Credits
    const credits = db.prepare('SELECT credits_remaining FROM api_credits WHERE organization_id = ?').get(orgId);
    
    if (!credits) {
      // If no credit record exists, and it's a free plan, maybe allowed?
      if (org.plan === 'free') return true;
      throw new Error('Credit account not found.');
    }

    if (credits.credits_remaining < cost) {
      throw new Error('Insufficient credits. Please upgrade or purchase more credits.');
    }

    // 5. Check daily limits (optional; enable when usage tables exist).
    // const dailyUsage = db.prepare('SELECT SUM(credits_used) FROM api_requests WHERE organization_id = ? AND date(created_at) = date('now')').get(orgId);
    
    return true;
  }

  /**
   * Deducts credits after a successful request.
   * @param {string} orgId - The organization ID.
   * @param {string} endpoint - The requested endpoint.
   * @param {number} creditsUsed - The actual credits used.
   */
  static async deduct(orgId, endpoint, creditsUsed) {
    db.transaction(() => {
      // 1. Update credits table
      db.prepare(`
        UPDATE api_credits 
        SET credits_used = credits_used + ?, 
            credits_remaining = credits_remaining - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ?
      `).run(creditsUsed, creditsUsed, orgId);

      // 2. Log in ledger (optional but good practice)
      db.prepare(`
        INSERT INTO usage_ledger (id, organization_id, event_type, credits_used)
        VALUES (?, ?, 'api_call', ?)
      `).run(`ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, orgId, creditsUsed);
    })();
    
    
  }

  /**
   * Retrieves the remaining credits for an organization.
   */
  static async getRemainingCredits(orgId) {
    const row = db.prepare('SELECT credits_remaining FROM api_credits WHERE organization_id = ?').get(orgId);
    return row ? row.credits_remaining : 0;
  }
}

export default CostFirewall;
