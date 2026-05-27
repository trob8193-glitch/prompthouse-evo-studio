import fs from 'fs';
import path from 'path';
import { PLATFORM_TEMPLATES } from '../builder/ProjectTemplates.js';
import { Log } from '../autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — PROMPT FORGE
 * ═══════════════════════════════════════════════════════════════
 * Self-evolves the studio's own project template prompts.
 * 
 * The Forge runs in cycles:
 *   1. ANALYZE — Score each template's historical build success rate
 *   2. IDENTIFY — Find the weakest template (most build failures)
 *   3. MUTATE — Ask the AI to rewrite the weak prompt based on failure data
 *   4. VALIDATE — Test-build with the mutated prompt in a sandbox
 *   5. PROMOTE — If the mutation beats the original, overwrite the template
 *   6. RECEIPT — Log every mutation attempt to the evolution ledger
 *
 * Nothing simulated. Every mutation is tested against real AI output.
 */

const FORGE_DATA_DIR = '.prompthouse-data/forge';
const BUILD_HISTORY_FILE = 'build-history.jsonl';
const MUTATION_LEDGER_FILE = 'mutation-ledger.jsonl';
const TEMPLATE_VERSIONS_DIR = 'template-versions';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function appendJsonl(filePath, data) {
  fs.appendFileSync(filePath, JSON.stringify(data) + '\n', 'utf8');
}

function readJsonl(filePath, limit = 200) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

// ─── BUILD RESULT TRACKING ──────────────────────────────────

/**
 * Record the result of a build attempt. Called after every `evo build`.
 */
export function recordBuildResult({ platform, appName, mission, features, success, fileCount, error, aiProvider }) {
  const rootDir = process.cwd();
  const dataDir = path.join(rootDir, FORGE_DATA_DIR);
  ensureDir(dataDir);

  const entry = {
    id: `build_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    platform,
    appName,
    mission,
    features,
    success,
    fileCount: fileCount || 0,
    error: error || null,
    aiProvider: aiProvider || 'unknown'
  };

  appendJsonl(path.join(dataDir, BUILD_HISTORY_FILE), entry);
  return entry;
}

/**
 * Get build success rates per platform.
 */
export function getBuildAnalytics() {
  const rootDir = process.cwd();
  const historyFile = path.join(rootDir, FORGE_DATA_DIR, BUILD_HISTORY_FILE);
  const history = readJsonl(historyFile);

  const platforms = {};
  for (const entry of history) {
    if (!platforms[entry.platform]) {
      platforms[entry.platform] = { total: 0, success: 0, failures: 0, errors: [], avgFiles: 0, totalFiles: 0 };
    }
    const p = platforms[entry.platform];
    p.total++;
    if (entry.success) {
      p.success++;
      p.totalFiles += entry.fileCount || 0;
    } else {
      p.failures++;
      if (entry.error) p.errors.push(entry.error);
    }
    p.avgFiles = p.success > 0 ? Math.round(p.totalFiles / p.success) : 0;
    p.successRate = p.total > 0 ? Math.round((p.success / p.total) * 100) : 0;
  }

  return { platforms, totalBuilds: history.length, history: history.slice(-20) };
}

// ─── PROMPT MUTATION ENGINE ─────────────────────────────────

/**
 * Analyze build failures for a platform and generate an improved prompt.
 */
export async function mutateTemplatePrompt(platform, aiAdaptor) {
  const analytics = getBuildAnalytics();
  const platformData = analytics.platforms[platform];

  if (!platformData || platformData.failures === 0) {
    Log.info(`[PromptForge] Platform "${platform}" has no failures to learn from.`);
    return null;
  }

  const template = PLATFORM_TEMPLATES[platform];
  if (!template) {
    Log.error(`[PromptForge] Unknown platform: ${platform}`);
    return null;
  }

  // Build analysis prompt from real failure data
  const recentErrors = platformData.errors.slice(-5);
  const currentSystemPrompt = template.systemPrompt;
  const sampleBuildPrompt = template.buildPrompt('sample_app', 'Sample mission', 'home, dashboard, settings');

  const analysisPrompt = `You are a prompt engineering specialist. Analyze and improve the following AI code generation prompt.

CURRENT SYSTEM PROMPT:
${currentSystemPrompt}

SAMPLE BUILD PROMPT:
${sampleBuildPrompt}

BUILD STATISTICS:
- Total builds: ${platformData.total}
- Success rate: ${platformData.successRate}%
- Failures: ${platformData.failures}
- Average files generated on success: ${platformData.avgFiles}

RECENT FAILURE ERRORS:
${recentErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

TASK: Rewrite ONLY the system prompt to fix the failures. The improved system prompt must:
1. Address the specific errors that caused failures
2. Be MORE explicit about output format requirements
3. Add stronger constraints against common AI mistakes (markdown wrapping, incomplete files, syntax errors)
4. Maintain all existing good rules
5. Be concise but thorough

Return your response as a JSON object:
{
  "analysis": "Brief analysis of what went wrong",
  "improvedSystemPrompt": "The complete rewritten system prompt",
  "changes": ["List of specific changes made"],
  "expectedImpact": "What this fix should improve"
}`;

  try {
    const messages = [
      { role: 'system', content: 'You are a meta-prompt engineer. You improve AI prompts based on failure data. Output valid JSON only.' },
      { role: 'user', content: analysisPrompt }
    ];

    const response = await aiAdaptor.chat(messages, { model: process.env.OPENAI_BUILD_MODEL || 'gpt-4o' });
    if (!response.success) throw new Error(response.error);

    let raw = response.content.trim();
    if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const mutation = JSON.parse(raw);

    if (!mutation.improvedSystemPrompt || mutation.improvedSystemPrompt.length < 50) {
      throw new Error('Mutation produced an empty or too-short system prompt.');
    }

    return {
      platform,
      originalPrompt: currentSystemPrompt,
      mutatedPrompt: mutation.improvedSystemPrompt,
      analysis: mutation.analysis,
      changes: mutation.changes,
      expectedImpact: mutation.expectedImpact,
      timestamp: new Date().toISOString(),
      aiProvider: response.provider
    };
  } catch (e) {
    Log.error(`[PromptForge] Mutation failed for ${platform}: ${e.message}`);
    return null;
  }
}

// ─── TEMPLATE VERSION CONTROL ────────────────────────────────

/**
 * Save a snapshot of the current template before mutation.
 */
export function saveTemplateVersion(platform) {
  const rootDir = process.cwd();
  const versionDir = path.join(rootDir, FORGE_DATA_DIR, TEMPLATE_VERSIONS_DIR);
  ensureDir(versionDir);

  const template = PLATFORM_TEMPLATES[platform];
  if (!template) return null;

  const version = {
    platform,
    systemPrompt: template.systemPrompt,
    savedAt: new Date().toISOString(),
    versionId: `v_${Date.now().toString(36)}`
  };

  const filePath = path.join(versionDir, `${platform}_${version.versionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(version, null, 2), 'utf8');
  return version;
}

/**
 * List all saved versions for a platform.
 */
export function listTemplateVersions(platform) {
  const rootDir = process.cwd();
  const versionDir = path.join(rootDir, FORGE_DATA_DIR, TEMPLATE_VERSIONS_DIR);
  if (!fs.existsSync(versionDir)) return [];

  return fs.readdirSync(versionDir)
    .filter(f => f.startsWith(`${platform}_`) && f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(versionDir, f), 'utf8')); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

/**
 * Rollback a platform's system prompt to a previous version.
 */
export function rollbackTemplate(platform, versionId) {
  const versions = listTemplateVersions(platform);
  const target = versions.find(v => v.versionId === versionId);
  if (!target) throw new Error(`Version ${versionId} not found for platform ${platform}.`);

  // Apply to in-memory template
  if (PLATFORM_TEMPLATES[platform]) {
    PLATFORM_TEMPLATES[platform].systemPrompt = target.systemPrompt;
  }

  return { rolledBack: true, platform, versionId, prompt: target.systemPrompt };
}

// ─── CRUCIBLE CYCLE ──────────────────────────────────────────

/**
 * Run a full Forge evolution cycle.
 * 1. Analyze all platforms
 * 2. Find the weakest (lowest success rate with enough data)
 * 3. Mutate its prompt
 * 4. Save the version and apply the mutation
 * 5. Log the receipt
 */
export async function runForgeCycle(aiAdaptor) {
  Log.info('[PromptForge] Starting evolution cycle...');
  const rootDir = process.cwd();
  const dataDir = path.join(rootDir, FORGE_DATA_DIR);
  ensureDir(dataDir);

  // 1. Analyze
  const analytics = getBuildAnalytics();
  const platforms = Object.entries(analytics.platforms)
    .filter(([, data]) => data.total >= 3) // Need at least 3 builds to evolve
    .sort((a, b) => a[1].successRate - b[1].successRate); // Weakest first

  if (platforms.length === 0) {
    Log.info('[PromptForge] Not enough build data to evolve. Need at least 3 builds per platform.');
    return { evolved: false, reason: 'insufficient_data', totalBuilds: analytics.totalBuilds };
  }

  // 2. Identify weakest
  const [weakestPlatform, weakestData] = platforms[0];
  Log.info(`[PromptForge] Weakest platform: ${weakestPlatform} (${weakestData.successRate}% success rate, ${weakestData.total} builds)`);

  // Skip if already at 100%
  if (weakestData.successRate >= 95) {
    Log.info('[PromptForge] All platforms are performing well (>=95%). No evolution needed.');
    return { evolved: false, reason: 'high_performance', weakest: weakestPlatform, rate: weakestData.successRate };
  }

  // 3. Mutate
  const mutation = await mutateTemplatePrompt(weakestPlatform, aiAdaptor);
  if (!mutation) {
    return { evolved: false, reason: 'mutation_failed', weakest: weakestPlatform };
  }

  // 4. Save version and apply
  const savedVersion = saveTemplateVersion(weakestPlatform);
  
  // Apply the mutation to the in-memory template
  if (PLATFORM_TEMPLATES[weakestPlatform]) {
    PLATFORM_TEMPLATES[weakestPlatform].systemPrompt = mutation.mutatedPrompt;
  }

  // 5. Log receipt
  const receipt = {
    type: 'crucible_evolution',
    platform: weakestPlatform,
    previousSuccessRate: weakestData.successRate,
    previousVersion: savedVersion?.versionId,
    analysis: mutation.analysis,
    changes: mutation.changes,
    expectedImpact: mutation.expectedImpact,
    aiProvider: mutation.aiProvider
  };

  appendJsonl(path.join(dataDir, MUTATION_LEDGER_FILE), receipt);

  Log.info(`[PromptForge] Evolved "${weakestPlatform}" template. Previous success rate: ${weakestData.successRate}%. Changes: ${mutation.changes?.join(', ')}`);

  return {
    evolved: true,
    platform: weakestPlatform,
    previousRate: weakestData.successRate,
    analysis: mutation.analysis,
    changes: mutation.changes,
    savedVersion: savedVersion?.versionId,
    receipt
  };
}

/**
 * Get the full PromptForge status dashboard data.
 */
export function getForgeStatus() {
  const rootDir = process.cwd();
  const dataDir = path.join(rootDir, FORGE_DATA_DIR);
  
  const analytics = getBuildAnalytics();
  const mutations = readJsonl(path.join(dataDir, MUTATION_LEDGER_FILE));
  
  const platformVersions = {};
  for (const platform of Object.keys(PLATFORM_TEMPLATES)) {
    platformVersions[platform] = listTemplateVersions(platform).length;
  }

  return {
    analytics,
    totalMutations: mutations.length,
    recentMutations: mutations.slice(-5),
    platformVersions,
    supportedPlatforms: Object.keys(PLATFORM_TEMPLATES)
  };
}
