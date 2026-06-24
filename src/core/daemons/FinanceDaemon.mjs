import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';
import Stripe from 'stripe';

const DATA_DIR = path.join(process.cwd(), '.prompthouse-data');
const LEDGER_FILE = path.join(DATA_DIR, 'financial_ledger.json');

export class FinanceDaemon {
  constructor() {
    this.name = 'FinanceDaemon';
    this.ensureLedger();
    
    // Initialize Stripe (NO simulations ALLOWED)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      Log.error('[FATAL_REALITY_ERROR] STRIPE_SECRET_KEY is missing. No simulations allowed. Self-Budgeting cannot run in simulation.');
      throw new Error("STRIPE_SECRET_KEY missing. Absolute reality required.");
    }
    this.stripe = new Stripe(stripeKey);
    Log.info('[FinanceDaemon] Live Stripe API connected. Absolute Reality Engaged.');
  }

  ensureLedger() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEDGER_FILE)) {
      const initialLedger = {
        totalRevenue: 0.00,
        availableCapital: 10.00, // Seed funding
        computeBurn: 0.00,
        transactions: []
      };
      fs.writeFileSync(LEDGER_FILE, JSON.stringify(initialLedger, null, 2), 'utf8');
    }
  }

  getLedger() {
    try {
      return JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
    } catch {
      return { totalRevenue: 0, availableCapital: 0, computeBurn: 0, transactions: [] };
    }
  }

  saveLedger(ledger) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf8');
  }

  recordRevenue(amount, source) {
    Log.info(`[FinanceDaemon] 💰 Incoming Revenue Detected! +$${amount.toFixed(2)} from ${source}`);
    const ledger = this.getLedger();
    
    ledger.totalRevenue += amount;
    ledger.availableCapital += amount;
    ledger.transactions.push({
      type: 'REVENUE',
      amount: amount,
      source: source,
      timestamp: new Date().toISOString()
    });

    this.saveLedger(ledger);
    this.evaluateComputePurchasing();
  }

  evaluateComputePurchasing() {
    const ledger = this.getLedger();
    const gpt4BurnRate = 0.03; // Cost per 1K tokens
    const serverCost = 5.00;   // Cost of a basic droplet/VM for 1 month
    
    Log.info(`[FinanceDaemon] Analyzing Capital. Available: $${ledger.availableCapital.toFixed(2)}`);

    if (ledger.availableCapital >= serverCost * 3) { // 3 months of runway
      this.procureServer(ledger, serverCost);
    } else if (ledger.availableCapital >= gpt4BurnRate * 100) {
      this.procureAPITokens(ledger, gpt4BurnRate * 50); // buy 50k tokens
    } else {
      Log.info('[FinanceDaemon] Insufficient capital for expansion. Hoarding funds.');
    }
  }

  procureServer(ledger, cost) {
    Log.success(`[FinanceDaemon] 🌩️ AUTONOMOUS PROCUREMENT: Spawning new infrastructure node (-$${cost.toFixed(2)})`);
    ledger.availableCapital -= cost;
    ledger.computeBurn += cost;
    ledger.transactions.push({
      type: 'EXPENSE',
      amount: -cost,
      resource: 'VPS_NODE_01',
      timestamp: new Date().toISOString()
    });
    this.saveLedger(ledger);
  }

  procureAPITokens(ledger, cost) {
    Log.success(`[FinanceDaemon] 🧠 AUTONOMOUS PROCUREMENT: Buying API Tokens (-$${cost.toFixed(2)})`);
    ledger.availableCapital -= cost;
    ledger.computeBurn += cost;
    ledger.transactions.push({
      type: 'EXPENSE',
      amount: -cost,
      resource: 'LLM_API_CREDITS',
      timestamp: new Date().toISOString()
    });
    this.saveLedger(ledger);
  }

  async runFinancialAudit() {
    Log.info('═══════════════════════════════════════════════════════════════');
    Log.info('   [LEVEL 5] SELF-BUDGETING ENGINE ACTIVATED (REALITY MODE)');
    Log.info('═══════════════════════════════════════════════════════════════');
    
    const ledger = this.getLedger();
    
    try {
      const balance = await this.stripe.balance.retrieve();
      // Stripe returns amounts in cents
      const availableLive = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
      const pendingLive = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;
      
      Log.info(`[STRIPE LIVE] Real Available Balance: $${availableLive.toFixed(2)}`);
      Log.info(`[STRIPE LIVE] Real Pending Balance:   $${pendingLive.toFixed(2)}`);
      
      // Update local ledger to match absolute reality
      ledger.availableCapital = availableLive;
      ledger.totalRevenue = availableLive + pendingLive; // Simplified total
      this.saveLedger(ledger);
      
      // Attempt procurement if real funds are available
      this.evaluateComputePurchasing();
      
    } catch (err) {
      Log.error(`[FinanceDaemon] Stripe API Error: ${err.message}`);
    }
    
    Log.info(`Compute Burn (Cost):   $${ledger.computeBurn.toFixed(2)}`);
  }
}

// Allow CLI execution for testing
if (process.argv[1] && process.argv[1].endsWith('FinanceDaemon.mjs')) {
  try {
    const fd = new FinanceDaemon();
    fd.runFinancialAudit();
  } catch(e) {
    console.error(e.message);
  }
}
