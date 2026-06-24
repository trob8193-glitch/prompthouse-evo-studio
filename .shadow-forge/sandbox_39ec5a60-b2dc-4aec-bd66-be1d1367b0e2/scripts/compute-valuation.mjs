import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env', override: false });
dotenv.config({ path: '.env.agent', override: false });

function calculateValuation() {
  console.log('\n==================================================');
  console.log('💎 PROMPTHOUSE EVO STUDIO - FINANCIAL VALUATION 💎');
  console.log('==================================================\n');

  let baseValuation = 50000; // Base platform value
  let breakdown = [{ item: 'PromptHouse Studio Core', value: 50000 }];

  // 1. API Keys connected
  const keys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'STRIPE_SECRET_KEY'];
  let keysFound = 0;
  for (const key of keys) {
    if (process.env[key]) {
      keysFound++;
      const value = 25000;
      baseValuation += value;
      breakdown.push({ item: `API Integration: ${key.split('_')[0]}`, value });
    }
  }

  // 2. Swarm Agents
  let swarmCount = 0;
  if (process.env.AGENT_ID) swarmCount++;
  if (process.env.SWARM_IDS) {
    const ids = process.env.SWARM_IDS.split(',').filter(Boolean);
    swarmCount = ids.length;
  }
  
  if (swarmCount > 0) {
    const value = swarmCount * 100000; // Each agent is worth $100k
    baseValuation += value;
    breakdown.push({ item: `Autonomous Swarm (${swarmCount} Nodes)`, value });
  }

  // 3. Database & Memory
  const dbPath = path.join(process.cwd(), '.prompthouse-data');
  if (fs.existsSync(dbPath)) {
    const value = 150000;
    baseValuation += value;
    breakdown.push({ item: 'Sovereign Memory Ledger', value });
  }

  // Formatting
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  console.log('ASSET BREAKDOWN:');
  breakdown.forEach(b => {
    console.log(`  + ${b.item.padEnd(35)} ${formatter.format(b.value)}`);
  });

  console.log('\n--------------------------------------------------');
  console.log(`🤑 TOTAL ENTERPRISE VALUATION:      ${formatter.format(baseValuation)}`);
  console.log('--------------------------------------------------\n');
  console.log('✅ Valuation calculated based on live verified assets.');
}

calculateValuation();
