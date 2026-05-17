import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ override: true });

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';
const MASTER_KEY = process.env.PH_EVO_MASTER_KEY || '';
const INTERVAL_MINUTES = Number.parseInt(process.env.NIGHTFORGE_INTERVAL_MINUTES || '3', 10);
const INTERVAL_MS = Math.max(1, INTERVAL_MINUTES) * 60 * 1000;

const request = async (path, { method = 'GET', body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (MASTER_KEY) headers['x-master-key'] = MASTER_KEY;

  const res = await fetch(`${BRIDGE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload?.error || payload?.message || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return payload;
};

async function syncProviderKeys() {
  const keys = {};
  if (process.env.OPENAI_API_KEY) keys.openai = process.env.OPENAI_API_KEY;
  if (process.env.GEMINI_API_KEY) keys.gemini = process.env.GEMINI_API_KEY;
  if (process.env.STRIPE_SECRET_KEY) keys.stripe = process.env.STRIPE_SECRET_KEY;
  if (Object.keys(keys).length === 0) return;

  try {
    await request('/api/config/keys', { method: 'POST', body: { keys } });
    console.log(`🔐 [AI_Daemon] Synced ${Object.keys(keys).join(', ')} key(s) to live studio bridge.`);
  } catch (err) {
    console.warn(`⚠️ [AI_Daemon] Key sync skipped: ${err.message}`);
  }
}

async function runCycle() {
  console.log(`\n🔔 [AI_Daemon] NightForge cycle at ${new Date().toISOString()}`);
  await syncProviderKeys();

  const result = await request('/api/nightforge/cycle', {
    method: 'POST',
    body: {
      includeProviders: ['evo_lm', 'openai', 'gemini'],
      train: true,
      useLiveStudio: true,
      mode: 'cost_guarded',
      scanLimit: 60,
    },
  });

  const cycle = result?.result;
  const summary = cycle?.diagnostics?.summary || {};
  const cost = cycle?.costSummary || {};

  console.log(`✅ [AI_Daemon] Cycle ${cycle?.id || 'unknown'} complete.`);
  console.log(`   Modules=${summary.modules_scanned ?? 'n/a'} Errors=${summary.modules_error ?? 'n/a'} Warnings=${summary.modules_warning ?? 'n/a'}`);
  console.log(`   Providers ext=${cost.externalCalls ?? 'n/a'} cache=${cost.cacheHits ?? 'n/a'} local=${cost.localCalls ?? 'n/a'} credits=${cost.creditsUsed ?? 'n/a'}`);
  console.log(`   Cost guard estimated saved tokens=${cost.estimatedSavedTokens ?? 0}`);

  try {
    const training = await request('/api/training/stats');
    console.log(`   Training set size=${training.total ?? 0} examples (${training.sizeBytes ?? 0} bytes)`);
  } catch (err) {
    console.warn(`   Training stats unavailable: ${err.message}`);
  }
}

console.log('🌌 [AI_Daemon] Starting NightForge real-time evolution daemon...');
console.log(`🌉 Bridge: ${BRIDGE_URL}`);
console.log(`⏱️ Interval: ${INTERVAL_MINUTES} minute(s)`);

runCycle().catch((err) => {
  console.error(`❌ [AI_Daemon] Initial cycle failed: ${err.message}`);
});

setInterval(() => {
  runCycle().catch((err) => {
    console.error(`❌ [AI_Daemon] Cycle failed: ${err.message}`);
  });
}, INTERVAL_MS);
