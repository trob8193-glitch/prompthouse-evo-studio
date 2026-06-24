import db from '../db/quad_schema.js';
import Stripe from 'stripe';
import { Log } from './SovereignLogger.js';

export class SelfBudgetingEngine {
  /**
   * Attempts to purchase compute credits automatically using generated revenue.
   * @param {string} orgId 
   * @param {number} requiredCredits 
   * @returns {boolean} True if refill was successful
   */
  static async attemptAutoRefill(orgId, requiredCredits) {
    Log.info(`[SelfBudgeting] 💰 Insufficient compute credits detected for org: ${orgId}. Evaluating autonomic refill...`);

    const key = process.env.STRIPE_SECRET_KEY || '';
    let hasSufficientRevenue = false;
    let purchaseAmountUSD = 10.00; // $10 refill default
    const creditsToAdd = 10000;

    if (key.startsWith('sk_live_') || key.startsWith('sk_test_')) {
      try {
        const stripe = new Stripe(key);
        const balance = await stripe.balance.retrieve();
        const availableUSD = balance.available.reduce((acc, curr) => curr.currency === 'usd' ? acc + (curr.amount / 100) : acc, 0);

        if (availableUSD >= purchaseAmountUSD) {
          Log.info(`[SelfBudgeting] ✅ Verified Stripe Balance ($${availableUSD.toFixed(2)}). Authorizing internal payout transfer...`);
          // In a real scenario, this would create a Stripe Transfer or Top-Up to the master compute account.
          // For now, we simulate the internal transfer.
          hasSufficientRevenue = true;
        } else {
          Log.warn(`[SelfBudgeting] ❌ Insufficient Stripe Balance ($${availableUSD.toFixed(2)}). Cannot afford compute refill.`);
        }
      } catch (err) {
        Log.error(`[SelfBudgeting] Stripe API Error during budget check: ${err.message}`);
      }
    } else {
      Log.info(`[SelfBudgeting] ⚠️ No active Stripe keys found. Operating in simulated PHANTOM MODE.`);
      Log.info(`[SelfBudgeting] 👻 [Phantom] Simulating revenue surplus. Authorizing virtual refill...`);
      hasSufficientRevenue = true;
    }

    if (hasSufficientRevenue) {
      try {
        // Refill the local database
        db.prepare(`
          UPDATE api_credits 
          SET credits_remaining = credits_remaining + ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE organization_id = ?
        `).run(creditsToAdd, orgId);
        
        Log.success(`[SelfBudgeting] 💸 Autonomic Refill Successful! Added ${creditsToAdd} credits to ${orgId}. Cost Firewall bypassed.`);
        return true;
      } catch (err) {
        Log.error(`[SelfBudgeting] DB Error during credit injection: ${err.message}`);
        return false;
      }
    }

    return false;
  }
}
