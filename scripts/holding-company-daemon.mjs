import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, '.prompthouse-data');
const LEDGER_PATH = path.join(DATA_DIR, 'holding_company_ledger.json');
const CANDIDATE_PATHS = [
  path.join(DATA_DIR, 'holding_company_candidates.json'),
  path.join(DATA_DIR, 'generated_artifacts.json'),
  path.join(DATA_DIR, 'portfolio.json')
];
const HOLDING_COMPANY_INTERVAL_MS = Number(process.env.HOLDING_COMPANY_INTERVAL_MS || 86400_000);

console.log('[Holding Company] Monetization daemon online.');

function readJson(filepath, fallback) {
  if (!existsSync(filepath)) return fallback;
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

function normalizeLedger(value) {
  if (Array.isArray(value)) {
    return { portfolio: value, mrr: 0, last_run: null, cycles: [] };
  }
  return {
    portfolio: Array.isArray(value?.portfolio) ? value.portfolio : [],
    mrr: Number(value?.mrr || 0),
    last_run: value?.last_run || null,
    cycles: Array.isArray(value?.cycles) ? value.cycles : []
  };
}

function loadLedger() {
  return normalizeLedger(readJson(LEDGER_PATH, {}));
}

function saveLedger(ledger) {
  ensureDataDir();
  writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf-8');
}

function extractCandidates(sourceValue, sourcePath) {
  const records = Array.isArray(sourceValue)
    ? sourceValue
    : [
        ...(Array.isArray(sourceValue?.candidates) ? sourceValue.candidates : []),
        ...(Array.isArray(sourceValue?.artifacts) ? sourceValue.artifacts : []),
        ...(Array.isArray(sourceValue?.portfolio) ? sourceValue.portfolio : [])
      ];

  return records
    .map((record, index) => ({
      id: record.id || record.projectId || record.slug || `${path.basename(sourcePath, '.json')}_${index}`,
      name: record.name || record.title || record.projectName || `Verified app ${index + 1}`,
      status: record.status || record.truthState || 'unknown',
      publicUrl: record.publicUrl || record.deploymentUrl || record.url || record.previewUrl || null,
      priceCents: Number(record.priceCents || record.price || 1500),
      sourcePath
    }))
    .filter((record) => record.id && record.name);
}

function discoverCandidates() {
  return CANDIDATE_PATHS.flatMap((candidatePath) => extractCandidates(readJson(candidatePath, []), candidatePath));
}

function isCandidateReady(candidate) {
  const status = String(candidate.status || '').toLowerCase();
  return Boolean(candidate.publicUrl) && ['verified', 'ready', 'deployed', 'published'].some((label) => status.includes(label));
}

function getStripeClient() {
  return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
}

async function createPaymentLink(stripe, candidate) {
  const product = await stripe.products.create({
    name: candidate.name,
    description: `PromptHouse app listing: ${candidate.publicUrl}`,
    metadata: {
      candidate_id: candidate.id,
      public_url: candidate.publicUrl
    }
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: candidate.priceCents,
    currency: 'usd',
    recurring: { interval: 'month' }
  });
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: {
      candidate_id: candidate.id,
      public_url: candidate.publicUrl
    }
  });
  return {
    productId: product.id,
    priceId: price.id,
    paymentLink: link.url
  };
}

export async function monetizeCycle() {
  console.log(`\n[Holding Company] Scanning verified app candidates at ${new Date().toISOString()}`);

  const ledger = loadLedger();
  const existingIds = new Set(ledger.portfolio.map((item) => item.id));
  const candidates = discoverCandidates().filter((candidate) => !existingIds.has(candidate.id));
  const readyCandidates = candidates.filter(isCandidateReady);
  const stripe = getStripeClient();
  const cycle = {
    at: new Date().toISOString(),
    truthState: 'SCAN_COMPLETE',
    candidatesFound: candidates.length,
    readyCandidates: readyCandidates.length,
    monetized: 0,
    blockers: []
  };

  if (readyCandidates.length === 0) {
    cycle.truthState = 'NO_VERIFIED_APPS_READY';
    cycle.blockers.push('No candidate with a verified status and public URL was found.');
  }

  if (readyCandidates.length > 0 && !stripe) {
    cycle.truthState = 'STRIPE_SECRET_KEY_REQUIRED';
    cycle.blockers.push('STRIPE_SECRET_KEY is required to create payment links.');
  }

  if (stripe) {
    for (const candidate of readyCandidates) {
      const commerce = await createPaymentLink(stripe, candidate);
      ledger.portfolio.push({
        ...candidate,
        ...commerce,
        truthState: process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
          ? 'STRIPE_LIVE_PAYMENT_LINK_CREATED'
          : 'STRIPE_TEST_PAYMENT_LINK_CREATED',
        monetizedAt: new Date().toISOString(),
        revenue: 0
      });
      cycle.monetized += 1;
    }
    if (cycle.monetized > 0) cycle.truthState = 'MONETIZATION_LINKS_CREATED';
  }

  ledger.last_run = cycle.at;
  ledger.cycles.push(cycle);
  saveLedger(ledger);

  console.log(`[Holding Company] Cycle complete: ${cycle.truthState}. Monetized ${cycle.monetized}.`);
  return cycle;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  monetizeCycle().catch((error) => {
    console.error('[Holding Company] Cycle failed:', error.message);
    process.exitCode = 1;
  });
  if (process.env.HOLDING_COMPANY_RUN_ONCE !== 'true') {
    setInterval(() => {
      monetizeCycle().catch((error) => console.error('[Holding Company] Cycle failed:', error.message));
    }, HOLDING_COMPANY_INTERVAL_MS);
  }
}
