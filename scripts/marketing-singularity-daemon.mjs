import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LEDGER_PATH = path.join(DATA_DIR, 'holding_company_ledger.json');
const MARKETING_LOG_PATH = path.join(DATA_DIR, 'marketing_campaigns.json');
const MARKETING_INTERVAL_MS = Number(process.env.MARKETING_INTERVAL_MS || 15_000);

console.log(`
==================================================
MARKETING SINGULARITY DAEMON
==================================================
Mode: local campaign draft generation
External publishing: provider-gated
==================================================
`);

function readJson(filepath, fallback) {
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJson(filepath, data) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
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
      truthState: app.truthState || app.status || 'UNKNOWN'
    }))
    .filter((app) => app.id && app.name);
}

function publishingReadiness() {
  const channels = [];
  if (process.env.X_API_KEY || process.env.TWITTER_BEARER_TOKEN) channels.push('x');
  if (process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY) channels.push('email');
  return {
    ready: channels.length > 0,
    channels
  };
}

function buildCampaign(app) {
  const productUrl = app.publicUrl;
  const paymentLine = app.paymentLink ? `Subscribe here: ${app.paymentLink}` : 'Subscription link pending Stripe payment-link proof.';
  return {
    x_thread: [
      `${app.name} is ready for users.`,
      `Built with PromptHouse Evo Studio and backed by a local proof ledger.`,
      `Product: ${productUrl}`,
      paymentLine
    ],
    cold_email: [
      `Subject: ${app.name} is ready for review`,
      '',
      'Hi,',
      `${app.name} is available for a direct product review: ${productUrl}`,
      paymentLine,
      '',
      'Reply if you want the proof pack and pricing details.'
    ].join('\n')
  };
}

export async function runMarketingCycle() {
  console.log('[MarketingBrain] Scanning portfolio ledger...');
  const apps = getPortfolioApps();
  const campaigns = readJson(MARKETING_LOG_PATH, []);
  const readiness = publishingReadiness();
  let created = 0;

  for (const app of apps) {
    if (campaigns.find((campaign) => campaign.appId === app.id)) continue;

    if (!app.publicUrl) {
      campaigns.push({
        id: `mkt_blocked_${app.id}`,
        appId: app.id,
        appName: app.name,
        status: 'BLOCKED_MISSING_PRODUCT_URL',
        truthState: 'MARKETING_PRODUCT_URL_REQUIRED',
        createdAt: new Date().toISOString()
      });
      continue;
    }

    const campaign = buildCampaign(app);
    campaigns.push({
      id: `mkt_${Date.now()}_${created}`,
      appId: app.id,
      appName: app.name,
      ...campaign,
      status: readiness.ready ? 'DRAFT_READY_FOR_PROVIDER' : 'LOCAL_DRAFT_READY',
      truthState: readiness.ready ? 'PUBLISHING_PROVIDER_CONFIGURED' : 'PUBLISHING_PROVIDER_REQUIRED',
      providerChannels: readiness.channels,
      metrics: { clicks: 0, conversions: 0 },
      createdAt: new Date().toISOString()
    });
    created += 1;
  }

  saveJson(MARKETING_LOG_PATH, campaigns);
  console.log(`[MarketingBrain] Cycle complete. Drafts created: ${created}.`);
  return {
    success: true,
    truthState: readiness.ready ? 'PUBLISHING_PROVIDER_CONFIGURED' : 'PUBLISHING_PROVIDER_REQUIRED',
    appsScanned: apps.length,
    draftsCreated: created,
    providerChannels: readiness.channels
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMarketingCycle().catch((error) => {
    console.error('[MarketingBrain] Cycle failed:', error.message);
    process.exitCode = 1;
  });
  if (process.env.MARKETING_RUN_ONCE !== 'true') {
    setInterval(() => {
      runMarketingCycle().catch((error) => console.error('[MarketingBrain] Cycle failed:', error.message));
    }, MARKETING_INTERVAL_MS);
  }
}
