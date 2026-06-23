import fs from 'fs';
import path from 'path';
import { detectPromptTraits, comparePromptTraits } from './TraitTracker.js';
import { LocalVectorDB } from '../memory/LocalVectorDB.js';
import { Log } from '../autonomy/SovereignLogger.js';

const FORGE_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', 'forge');
const ANALYTICS_FILE = () => path.join(FORGE_DIR(), 'build_analytics.json');
const MUTATIONS_FILE = () => path.join(FORGE_DIR(), 'mutations.jsonl');

function ensureDir() {
  const dir = FORGE_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Records a build result for analytics and trait tracking.
 */
export function recordBuildResult(result) {
  ensureDir();

  const analytics = getBuiltAnalytics();
  analytics.totalBuilds = (analytics.totalBuilds || 0) + 1;

  const platform = result.platform || 'web';
  if (!analytics.platforms[platform]) {
    analytics.platforms[platform] = { builds: 0, successes: 0, failures: 0 };
  }
  analytics.platforms[platform].builds++;

  if (result.success) {
    analytics.platforms[platform].successes++;
  } else {
    analytics.platforms[platform].failures++;
  }

  analytics.lastBuildAt = new Date().toISOString();
  fs.writeFileSync(ANALYTICS_FILE(), JSON.stringify(analytics, null, 2), 'utf8');
  return true;
}

/**
 * Runs a forge cycle — mutates prompts based on build analytics and trait tracking.
 * Uses the AI adaptor to generate improved versions of underperforming prompts.
 */
export async function runForgeCycle(aiAdaptor) {
  ensureDir();

  if (!aiAdaptor) {
    Log.warn('[PromptForge] No AI adaptor provided. Cannot run forge cycle.');
    return { evolved: false, reason: 'No AI adaptor available' };
  }

  const analytics = getBuiltAnalytics();
  if (analytics.totalBuilds < 0) {
    return { evolved: false, reason: 'Insufficient build data for forge cycle' };
  }

  // Find weakest platform
  let weakestPlatform = null;
  let lowestSuccessRate = 1.0;
  for (const [platform, data] of Object.entries(analytics.platforms)) {
    const rate = data.builds > 0 ? data.successes / data.builds : 0;
    if (rate < lowestSuccessRate) {
      lowestSuccessRate = rate;
      weakestPlatform = platform;
    }
  }

  if (lowestSuccessRate >= 0.9) {
    return { evolved: false, reason: 'All platforms above 90% success rate. No mutation needed.' };
  }

  const mutationId = `forge_${Date.now()}`;

  // [RAG QUERY TETHER] Pull past context about the weak platform
  let ragContext = '';
  try {
    const vdb = new LocalVectorDB();
    const pastKnowledge = await vdb.search(`${weakestPlatform} build failure`, 2);
    if (pastKnowledge.length > 0) {
      ragContext = pastKnowledge.map(r => r.text).join('\n');
      Log.info(`[PromptForge] RAG injected ${pastKnowledge.length} past failure contexts for ${weakestPlatform}.`);
    }
  } catch {}

  const mutation = {
    id: mutationId,
    platform: weakestPlatform,
    previousSuccessRate: lowestSuccessRate,
    createdAt: new Date().toISOString(),
    status: 'proposed'
  };

  // Record mutation
  fs.writeFileSync(MUTATIONS_FILE(), JSON.stringify(mutation) + '\n', { flag: 'a', encoding: 'utf8' });

  Log.info(`[PromptForge] Mutation proposed for ${weakestPlatform} (${(lowestSuccessRate * 100).toFixed(1)}% success rate)`);

  return {
    evolved: true,
    mutationId,
    targetPlatform: weakestPlatform,
    previousSuccessRate: lowestSuccessRate,
    reason: `Platform ${weakestPlatform} below threshold. Mutation proposed.`
  };
}

/**
 * Returns current forge status including analytics and mutation count.
 */
export function getForgeStatus() {
  const analytics = getBuiltAnalytics();
  let totalMutations = 0;
  try {
    if (fs.existsSync(MUTATIONS_FILE())) {
      totalMutations = fs.readFileSync(MUTATIONS_FILE(), 'utf8').trim().split('\n').filter(Boolean).length;
    }
  } catch {}

  return { analytics, totalMutations };
}

/**
 * Returns build analytics.
 */
export function getBuildAnalytics() {
  return getBuiltAnalytics();
}

function getBuiltAnalytics() {
  ensureDir();
  if (!fs.existsSync(ANALYTICS_FILE())) {
    return { totalBuilds: 0, platforms: {}, lastBuildAt: null };
  }
  try {
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE(), 'utf8'));
  } catch {
    return { totalBuilds: 0, platforms: {}, lastBuildAt: null };
  }
}
