import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { evaluateCostedRequest } from '../src/core/gateway/index.js';
import dotenv from 'dotenv';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('marketing-singularity-daemon');

dotenv.config({ override: true });
dotenv.config({ path: '.env.agent', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LEDGER_PATH = path.join(DATA_DIR, 'holding_company_ledger.json');
const MARKETING_LOG_PATH = path.join(DATA_DIR, 'marketing_campaigns.json');
const MARKETING_INTERVAL_MS = Number(process.env.MARKETING_INTERVAL_MS || 15_000);

const adaptor = new UniversalAIAdaptor();

const c = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m", bold: "\x1b[1m"
};

console.log(`
${c.cyan}${c.bold}==================================================
MARKETBRAIN SINGULARITY DAEMON v3.0 (AI-Driven)
==================================================${c.reset}
${c.magenta}Mode:${c.reset} Autonomous Campaign Generation via GPT-4o
${c.magenta}Routing:${c.reset} Universal AI Adaptor
${c.cyan}${c.bold}==================================================${c.reset}
`);

function generateProofReceipt(payload) {
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return `proof_mkt_${hash.substring(0, 16)}`;
}

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

function getPortfolioApps() {
  const ledger = readJson(LEDGER_PATH, {});
  const apps = Array.isArray(ledger) ? ledger : ledger.portfolio || [];
  return apps
    .map((app) => ({
      id: app.id || app.projectId || app.slug,
      name: app.name || app.title || app.projectName,
      publicUrl: app.publicUrl || app.deploymentUrl || app.url || app.previewUrl,
      paymentLink: app.paymentLink || null,
      truthState: app.truthState || app.status || 'UNKNOWN',
      isPremiumTier: false
    }))
    .filter((app) => app.id && app.name);
}

function getPremiumTiers() {
  return [
    {
      id: 'premium_seed_investor',
      name: 'Seed Investor Tier ($50,000/yr)',
      publicUrl: 'https://prompthouse.dev/pricing',
      paymentLink: 'https://prompthouse.dev/pricing',
      truthState: 'HIGH_TICKET_ACTIVE',
      isPremiumTier: true,
      targetAudience: 'VCs, Angel Investors, Syndicates',
      angle: 'Direct dashboard access to studio metrics and automated profit streams.'
    },
    {
      id: 'premium_enterprise_whitelabel',
      name: 'Enterprise White-Label ($25,000/mo)',
      publicUrl: 'https://prompthouse.dev/pricing',
      paymentLink: 'https://prompthouse.dev/pricing',
      truthState: 'HIGH_TICKET_ACTIVE',
      isPremiumTier: true,
      targetAudience: 'CTOs, Corporate Innovation Labs, Agencies',
      angle: 'Rebrand and resell the entire studio as your own internal corporate AI platform.'
    },
    {
      id: 'premium_sovereign_agi',
      name: 'Sovereign AGI Core ($250,000)',
      publicUrl: 'https://prompthouse.dev/pricing',
      paymentLink: 'https://prompthouse.dev/pricing',
      truthState: 'HIGH_TICKET_ACTIVE',
      isPremiumTier: true,
      targetAudience: 'Defense, Hedge Funds, High-Security Enterprises',
      angle: 'Fully detached neural topology for an offline, air-gapped corporate install with lifetime autonomous drift.'
    }
  ];
}

function publishingReadiness() {
  const channels = [];
  if (process.env.X_API_KEY || process.env.TWITTER_BEARER_TOKEN) channels.push('x');
  if (process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY) channels.push('email');
  return { ready: channels.length > 0, channels };
}

// AI-driven copy generation
async function buildCampaign(app) {
  const productUrl = app.publicUrl || 'https://prompthouse.dev/pending';
  const paymentLine = app.paymentLink || 'Subscription pending.';

  const isAllowed = evaluateCostedRequest({
    endpoint: 'marketing-campaign/gpt-4o',
    estimatedCost: 0.01,
    reason: `AI Copywriting for ${app.name}`,
    rootDir: path.join(__dirname, '..')
  });

  if (!isAllowed) {
    console.log(`${c.yellow}[MarketBrain] ⛔ Cost Firewall blocked AI Copywriting for ${app.name}.${c.reset}`);
    return {
      x_thread: "Marketing generation deferred due to cost limits. " + productUrl,
      cold_email: "Launch pending cost approval. " + productUrl
    };
  }

  let prompt = `Write high-converting, edgy marketing copy for a new software product named "${app.name}".
Output exactly a JSON object with two keys:
1. "x_thread": A viral, concise Twitter thread announcing the launch (include ${productUrl}).
2. "cold_email": A direct, B2B-style cold email funneling users to ${paymentLine}.
Do not output markdown block formatting. Output raw JSON.`;

  if (app.isPremiumTier) {
    prompt = `Write highly persuasive, high-ticket outbound B2B sales copy for our studio's premium offering: "${app.name}".
Target Audience: ${app.targetAudience}
Value Angle: ${app.angle}
Output exactly a JSON object with two keys:
1. "x_thread": A high-authority, thought-leadership Twitter thread announcing this tier (include ${productUrl}).
2. "cold_email": A direct, professional B2B cold email aimed at decision makers funneling them to ${paymentLine}.
Do not output markdown block formatting. Output raw JSON.`;
  }

  const result = await adaptor.routeRequest(prompt, { model: 'gpt-4o', temperature: 0.9 });
  
  if (result.success) {
    try {
      let clean = result.message.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const parsed = JSON.parse(clean);
      return {
        x_thread: parsed.x_thread || "Fallback X Thread. URL: " + productUrl,
        cold_email: parsed.cold_email || "Fallback Cold Email. Payment: " + paymentLine
      };
    } catch(e) {
      console.log(`${c.red}[MarketBrain] Failed to parse AI copy output.${c.reset}`);
    }
  }

  return {
    x_thread: `Launch Sequence Initiated: ${app.name}. ${productUrl}`,
    cold_email: `Subject: Immediate Access: ${app.name}\n\n${productUrl}\n\n${paymentLine}`
  };
}

async function routeToTwitter(thread) {
  console.log(`${c.cyan}[Router:X] Tethering payload to Twitter...${c.reset}`);
  return { routed: true, timestamp: new Date().toISOString() };
}

async function routeToEmail(emailText) {
  console.log(`${c.cyan}[Router:Email] Tethering payload to Email Gateway...${c.reset}`);
  return { routed: true, timestamp: new Date().toISOString() };
}

export async function runMarketingCycle() {
  console.log(`${c.green}[MarketBrain] Initiating ledger scan and AI campaign formulation...${c.reset}`);
  
  const apps = [...getPortfolioApps(), ...getPremiumTiers()];
  const campaigns = readJson(MARKETING_LOG_PATH, []);
  const readiness = publishingReadiness();
  let created = 0;

  for (const app of apps) {
    if (campaigns.find((campaign) => campaign.appId === app.id)) continue;

    console.log(`${c.magenta}[MarketBrain] AI Forging Campaign for: ${app.name}${c.reset}`);
    const campaign = await buildCampaign(app);
    const proofPayload = { appId: app.id, name: app.name, timestamp: Date.now() };
    
    if (readiness.channels.includes('x')) await routeToTwitter(campaign.x_thread);
    if (readiness.channels.includes('email')) await routeToEmail(campaign.cold_email);

    campaigns.push({
      id: `mkt_${Date.now()}_${created}`,
      appId: app.id,
      appName: app.name,
      ...campaign,
      status: readiness.ready ? 'DRAFT_READY_FOR_PROVIDER' : 'LOCAL_DRAFT_READY',
      truthState: readiness.ready ? 'PUBLISHING_PROVIDER_CONFIGURED' : 'PUBLISHING_PROVIDER_REQUIRED',
      providerChannels: readiness.channels,
      proofReceipt: generateProofReceipt(proofPayload),
      metrics: { clicks: 0, conversions: 0 },
      createdAt: new Date().toISOString()
    });
    created += 1;
  }

  saveJson(MARKETING_LOG_PATH, campaigns);
  
  if (created > 0) {
    console.log(`${c.green}${c.bold}[MarketBrain] Cycle complete. ${created} AI campaigns tethered to the ledger.${c.reset}`);
  } else {
    console.log(`${c.green}[MarketBrain] Cycle complete. Ecosystem equilibrium maintained (0 new drafts).${c.reset}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMarketingCycle().catch((error) => {
    console.error(`${c.red}${c.bold}[MarketBrain] FATAL EXCEPTION: ${error.message}${c.reset}`);
    process.exitCode = 1;
  });
  if (process.env.MARKETING_RUN_ONCE !== 'true') {
    setInterval(() => {
      runMarketingCycle().catch((error) => console.error(`${c.red}[MarketBrain] CYCLE FAULT: ${error.message}${c.reset}`));
    }, MARKETING_INTERVAL_MS);
  }
}
