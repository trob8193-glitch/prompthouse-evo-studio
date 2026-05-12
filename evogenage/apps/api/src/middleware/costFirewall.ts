import { Request, Response, NextFunction } from 'express';
import { CostEstimator } from './CostEstimator';
import { CreditLedgerService } from './CreditLedgerService';

const estimator = new CostEstimator();
const ledger = new CreditLedgerService();

/**
 * EVOGENAGE — COST FIREWALL (SOVEREIGN SECURITY)
 * ═══════════════════════════════════════════════════════════════
 * Blocks any paid generation if credit reservation fails.
 */

export const costFirewall = async (req: Request, res: Response, next: NextFunction) => {
  const { assetType, steps } = req.body;
  const userId = req.user?.id; // Assumes auth middleware has run

  if (!userId) return res.status(401).json({ error: 'AUTH_REQUIRED' });

  // 1. Estimate Latent Cost
  const estimatedCost = estimator.estimate(assetType, steps);
  req.body.estimatedCost = estimatedCost;

  try {
    // 2. Attempt Physical Credit Reservation
    // This will throw if balance is insufficient
    await ledger.reserveCredits(userId, estimatedCost, 'pending_job_id');
    
    console.log(`✅ [CostFirewall] Reserved ${estimatedCost} credits for user ${userId}`);
    next();
  } catch (error) {
    console.error(`❌ [CostFirewall] Blocked: ${error.message}`);
    return res.status(402).json({ 
      error: 'INSUFFICIENT_CREDITS', 
      message: 'Your wallet cannot cover the latent cost of this denoising pass.',
      estimatedCost 
    });
  }
};
