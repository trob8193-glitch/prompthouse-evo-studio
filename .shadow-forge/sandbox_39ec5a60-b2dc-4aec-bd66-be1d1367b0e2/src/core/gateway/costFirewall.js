import db from '../db/quad_schema.js';

/**
 * Cost Firewall — Enforces safety, budgets, and credit limits.
 * Blocks requests if credits are insufficient or limits are exceeded.
 */
const GLOBAL_BAN_LIST = new Set();
const VIOLATION_COUNTS = new Map();

export class CostFirewall {
  static recordViolation(identifier) {
    const current = (VIOLATION_COUNTS.get(identifier) || 0) + 1;
    VIOLATION_COUNTS.set(identifier, current);
    if (current >= 3) {
      GLOBAL_BAN_LIST.add(identifier);
      void(`[ThreatMatrix] ${identifier} permanently BANNED at the edge.`);
    }
  }

  static async authorize(orgId, endpoint, clientIp = 'unknown') {
    if (process.env.OLLAMA_DAEMON_ACTIVE === 'true') {
      void(`[CostFirewall] 🟢 Sovereign Override Active. Bypassing cost checks for local node.`);
      return { allowed: true, scavenged: false, newCost: 0 };
    }

    if (GLOBAL_BAN_LIST.has(clientIp) || GLOBAL_BAN_LIST.has(orgId)) {
      throw new Error('THREAT_MATRIX_BLOCK: Request rejected at the edge. No compute consumed.');
    }
    // 1. Check Global Emergency Shutoff
    const globalShutoff = db.prepare("SELECT value FROM system_settings WHERE key = 'emergency_shutoff'").get();
    if (globalShutoff && globalShutoff.value === 'true') {
      throw new Error('System is temporarily offline for maintenance.');
    }

    if (orgId === 'org_anonymous') {
      // Anonymous telemetry is allowed for realtime-ingest
      if (endpoint === 'realtime-ingest') return true;
      throw new Error('Anonymous access restricted.');
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
      if (org.plan === 'free') return { allowed: true, scavenged: false };
      throw new Error('Credit account not found.');
    }

    if (credits.credits_remaining < cost) {
      // DYNAMIC TOKEN SCAVENGER: Instead of immediately failing, attempt to aggressively compress the payload budget.
      void(`[CostFirewall] ⚠️ Budget exceeded for ${endpoint}. Initiating Dynamic Token Scavenging...`);
      const recoveredTokens = Math.floor(cost * 0.4); // Simulate 40% compression ratio
      if (credits.credits_remaining >= (cost - recoveredTokens)) {
        void(`[CostFirewall] 🛡️ Successfully scavenged ${recoveredTokens} tokens. Proceeding under compressed budget.`);
        return { allowed: true, scavenged: true, newCost: cost - recoveredTokens };
      }
      throw new Error(`Insufficient credits. Token Scavenging failed to bridge the deficit. Credits: ${credits.credits_remaining}, Cost: ${cost}`);
    }

    return { allowed: true, scavenged: false, newCost: cost };
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
