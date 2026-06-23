import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { evaluateCostedRequest } from '../src/core/gateway/index.js';
import dotenv from 'dotenv';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('lead-generation-daemon');

dotenv.config({ override: true });
dotenv.config({ path: '.env.agent', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LEAD_LEDGER_PATH = path.join(DATA_DIR, 'lead_ledger.json');
const LEAD_INTERVAL_MS = Number(process.env.LEAD_INTERVAL_MS || 30_000);

const adaptor = new UniversalAIAdaptor();

const c = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m", bold: "\x1b[1m"
};

console.log(`
${c.cyan}${c.bold}==================================================
LEAD GENERATION SINGULARITY DAEMON v1.0 (AI SDR)
==================================================${c.reset}
${c.magenta}Mode:${c.reset} Autonomous Prospect Generation via GPT-4o
${c.magenta}Routing:${c.reset} Universal AI Adaptor
${c.cyan}${c.bold}==================================================${c.reset}
`);

function readJson(filepath, fallback) {
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function saveJson(filepath, data) {
  try {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (err) {}
}

function getPremiumTiers() {
  return [
    {
      id: 'premium_seed_investor',
      name: 'Seed Investor Tier ($50,000/yr)',
      targetAudience: 'VCs, Angel Investors, Syndicates',
      angle: 'Direct dashboard access to studio metrics and automated profit streams.'
    },
    {
      id: 'premium_enterprise_whitelabel',
      name: 'Enterprise White-Label ($25,000/mo)',
      targetAudience: 'CTOs, Corporate Innovation Labs, Agencies',
      angle: 'Rebrand and resell the entire studio as your own internal corporate AI platform.'
    },
    {
      id: 'premium_sovereign_agi',
      name: 'Sovereign AGI Core ($250,000)',
      targetAudience: 'Defense, Hedge Funds, High-Security Enterprises',
      angle: 'Fully detached neural topology for an offline, air-gapped corporate install with lifetime autonomous drift.'
    }
  ];
}

async function findLeadsForTier(tier) {
  const isAllowed = evaluateCostedRequest({
    endpoint: 'lead-generation/gpt-4o',
    estimatedCost: 0.02,
    reason: `AI SDR Lead Generation for ${tier.name}`,
    rootDir: path.join(__dirname, '..')
  });

  if (!isAllowed) {
    console.log(`${c.yellow}[LeadGenDaemon] ⛔ Cost Firewall blocked SDR Generation for ${tier.name}.${c.reset}`);
    return [];
  }

  const prompt = `Act as an elite SDR. I am selling a premium tier: "${tier.name}".
Target Audience: ${tier.targetAudience}
Value Angle: ${tier.angle}

Generate a JSON array of 3 highly specific, hypothetical but realistic target profiles/leads that match this description.
For each lead, provide:
- "companyName": Name of the company/fund.
- "decisionMakerTitle": The title of the person we should pitch.
- "reasonForFit": A 1-sentence reason why they need this.
- "outreachAngle": A 1-sentence hyper-personalized hook to use in the cold email.

Do not output markdown block formatting. Output ONLY the raw JSON array.`;

  const result = await adaptor.routeRequest(prompt, { model: 'gpt-4o', temperature: 0.8 });
  
  if (result.success) {
    try {
      let clean = result.message.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) {
      console.log(`${c.red}[LeadGenDaemon] Failed to parse AI lead output.${c.reset}`);
    }
  }

  return [];
}

export async function runLeadGenerationCycle() {
  console.log(`${c.green}[LeadGenDaemon] Initiating target prospect research...${c.reset}`);
  
  const tiers = getPremiumTiers();
  const ledger = readJson(LEAD_LEDGER_PATH, []);
  let newLeadsGenerated = 0;

  for (const tier of tiers) {
    // Only generate leads if we have fewer than 15 total for this tier to prevent infinite expansion
    const existingForTier = ledger.filter(l => l.tierId === tier.id).length;
    if (existingForTier >= 15) {
      continue;
    }

    console.log(`${c.magenta}[LeadGenDaemon] AI Prospecting for: ${tier.name}${c.reset}`);
    const generatedLeads = await findLeadsForTier(tier);
    
    for (const target of generatedLeads) {
      // Check if duplicate company name
      if (!ledger.some(l => l.companyName === target.companyName)) {
        ledger.push({
          id: `lead_${crypto.randomBytes(8).toString('hex')}`,
          tierId: tier.id,
          tierName: tier.name,
          companyName: target.companyName || 'Unknown Corp',
          decisionMakerTitle: target.decisionMakerTitle || 'Director',
          reasonForFit: target.reasonForFit || 'Matches target audience profile.',
          outreachAngle: target.outreachAngle || 'Mention autonomous growth capabilities.',
          status: 'PROSPECTED', // PROSPECTED -> CONTACTED -> NEGOTIATING -> WON
          createdAt: new Date().toISOString()
        });
        newLeadsGenerated++;
      }
    }
  }

  saveJson(LEAD_LEDGER_PATH, ledger);
  
  if (newLeadsGenerated > 0) {
    console.log(`${c.green}${c.bold}[LeadGenDaemon] Cycle complete. ${newLeadsGenerated} new premium leads discovered & secured in the ledger.${c.reset}`);
  } else {
    console.log(`${c.green}[LeadGenDaemon] Cycle complete. Sufficient prospect pool maintained (0 new leads).${c.reset}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runLeadGenerationCycle().catch((error) => {
    console.error(`${c.red}${c.bold}[LeadGenDaemon] FATAL EXCEPTION: ${error.message}${c.reset}`);
    process.exitCode = 1;
  });
  if (process.env.LEADGEN_RUN_ONCE !== 'true') {
    setInterval(() => {
      runLeadGenerationCycle().catch((error) => console.error(`${c.red}[LeadGenDaemon] CYCLE FAULT: ${error.message}${c.reset}`));
    }, LEAD_INTERVAL_MS);
  }
}
