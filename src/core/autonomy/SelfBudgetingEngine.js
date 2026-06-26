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
          Log.info(`[SelfBudgeting] ✅ Verified Stripe Balance ($${availableUSD.toFixed(2)}). Authorizing physical top-up transfer...`);
          // Execute physical Stripe Top-Up
          const topup = await stripe.topups.create({
            amount: purchaseAmountUSD * 100,
            currency: 'usd',
            description: 'Autonomic Compute Refill',
            statement_descriptor: 'EVO_COMPUTE_REFILL'
          });
          Log.success(`[SelfBudgeting] 💸 Physical Top-Up successful! TX_ID: ${topup.id}`);
          hasSufficientRevenue = true;
        } else {
          Log.warn(`[SelfBudgeting] ❌ Insufficient Stripe Balance ($${availableUSD.toFixed(2)}). Cannot afford compute refill.`);
        }
      } catch (err) {
        Log.error(`[SelfBudgeting] Stripe API Error during budget check/transfer: ${err.message}`);
      }
    } else {
      Log.error(`[SelfBudgeting] ⚠️ No active Stripe keys found. Cannot execute physical compute refill. Autonomy halted.`);
      hasSufficientRevenue = false;
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
