import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { normalizeEvoText } from './EvoLlmPolicy.js';
import { sanitizeSignalPayload } from './EvoSignalLearningBridge.js';

const APP_INTELLIGENCE_VERSION = '1.0.0';

const APP_INTELLIGENCE_TARGETS = Object.freeze([
  'app-feature-discovery',
  'ui-pattern-learning',
  'device-capability-learning',
  'build-flow-learning',
  'integration-learning',
  'market-fit-learning',
  'accessibility-learning',
  'offline-first-learning',
  'automation-learning',
  'studio-feature-generation'
]);

const ALLOWED_SOURCE_TYPES = Object.freeze([
  'authorized-app',
  'connected-source',
  'device-signal',
  'ui-screenshot-summary',
  'public-doc-summary',
  'repo-pattern',
  'api-schema',
  'user-observation',
  'build-log',
  'feature-request',
  'workflow-event'
]);

const RISKY_COPY_PATTERNS = [
  /copy\s+exact/i,
  /clone\s+exact/i,
  /steal/i,
  /scrape\s+private/i,
  /bypass/i,
  /circumvent/i,
  /reverse\s+engineer\s+private/i
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function readJsonl(file, limit = 1000) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function appendJsonl(file, entry) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8');
}

function appIntelligencePaths({ rootDir = process.cwd() } = {}) {
  const evoPaths = getEvoLlmPaths({ rootDir });
  return {
    ...evoPaths,
    appBase: path.join(evoPaths.base, 'app-intelligence'),
    sourceLog: path.join(evoPaths.base, 'app-intelligence', 'sources.jsonl'),
    featureMemory: path.join(evoPaths.base, 'app-intelligence', 'feature-memory.json'),
    blueprintFile: path.join(evoPaths.base, 'app-intelligence', 'generated-feature-blueprints.json'),
    datasetJson: path.join(evoPaths.training, 'app-intelligence-examples.json'),
    receipts: path.join(evoPaths.receipts, 'app-intelligence')
  };
}

function safeText(value, limit = 3000) {
  return normalizeEvoText(value).slice(0, limit);
}

function detectRisk(text) {
  return RISKY_COPY_PATTERNS.filter((pattern) => pattern.test(text)).map(String);
}

function normalizeSource(input = {}) {
  const sourceType = safeText(input.sourceType || input.type || 'user-observation', 80).toLowerCase().replace(/\s+/g, '-');
  const allowedType = ALLOWED_SOURCE_TYPES.includes(sourceType) ? sourceType : 'connected-source';
  const summary = safeText(input.summary || input.message || 'Authorized app intelligence source captured.', 1600);
  const payload = sanitizeSignalPayload(input.payload || input.data || {});
  const textForRisk = `${summary}\n${JSON.stringify(payload)}`;
  const riskFlags = detectRisk(textForRisk);

  return {
    id: input.id || `appintel_${Date.now()}_${hashValue(JSON.stringify(input)).slice(0, 8)}`,
    createdAt: input.createdAt || new Date().toISOString(),
    sourceType: allowedType,
    sourceName: safeText(input.sourceName || input.name || allowedType, 140),
    appDomain: safeText(input.appDomain || input.domain || 'general', 80).toLowerCase().replace(/\s+/g, '-'),
    featureTarget: safeText(input.featureTarget || input.feature || 'studio-feature-generation', 100).toLowerCase().replace(/\s+/g, '-'),
    uiPattern: safeText(input.uiPattern || input.pattern || 'unknown-pattern', 120).toLowerCase().replace(/\s+/g, '-'),
    deviceContext: sanitizeSignalPayload(input.deviceContext || null),
    connectedSource: sanitizeSignalPayload(input.connectedSource || null),
    summary,
    payload,
    tags: Array.isArray(input.tags) ? input.tags.map((tag) => safeText(tag, 64)).slice(0, 24) : [],
    confidence: Number.isFinite(Number(input.confidence)) ? Math.max(0, Math.min(1, Number(input.confidence))) : 0.6,
    learningValue: Number.isFinite(Number(input.learningValue)) ? Math.max(0, Math.min(1, Number(input.learningValue))) : 0.65,
    allowedForTraining: input.allowedForTraining !== false && riskFlags.length === 0,
    riskFlags,
    privacy: {
      authorizedSourceRequired: true,
      sanitized: true,
      exactCopyBlocked: riskFlags.length > 0,
      storesSecrets: false
    }
  };
}

function inferBuildPlan(source) {
  const payloadText = JSON.stringify(source.payload || {}).toLowerCase();
  const summary = source.summary.toLowerCase();
  const combined = `${summary}\n${payloadText}\n${source.uiPattern}`;
  const plan = [];

  if (/auth|login|account|tenant|role/.test(combined)) plan.push('Add authenticated user flow with tenant-aware roles and visible permission states.');
  if (/chat|message|inbox|conversation/.test(combined)) plan.push('Add real-time conversation surface with thread persistence and error states.');
  if (/map|gps|location|route/.test(combined)) plan.push('Add map/location module with permission gate, offline fallback, and location receipt policy.');
  if (/payment|checkout|stripe|invoice|billing/.test(combined)) plan.push('Add payment/commerce workflow with provider health checks and payment-required truth states.');
  if (/camera|image|photo|upload|scan/.test(combined)) plan.push('Add media capture/upload flow with file validation, preview, and proof receipt.');
  if (/dashboard|analytics|metric|chart/.test(combined)) plan.push('Add dashboard card system backed by live metrics, not hardcoded status theater.');
  if (/offline|cache|sync|queue/.test(combined)) plan.push('Add offline queue with resumable sync and receipt-backed recovery.');
  if (/bot|agent|daemon|automation/.test(combined)) plan.push('Add bot/daemon orchestration route with audit, owner approval, and rollback state.');
  if (/calendar|schedule|booking|appointment/.test(combined)) plan.push('Add scheduling workflow with conflict checks, reminders, and approval gates.');
  if (/profile|settings|preferences/.test(combined)) plan.push('Add profile/settings panel with persisted preferences and provider readiness display.');
  if (!plan.length) plan.push('Convert the observed pattern into a PromptHouse-native feature with route, UI, persistence, tests, proof receipt, and rollback notes.');

  return plan;
}

function inferUiGuidance(source) {
  const pattern = source.uiPattern;
  const guidance = [];
  if (/feed|timeline|list/.test(pattern)) guidance.push('Use a filterable feed with empty, loading, error, and synced states.');
  if (/card|tile|grid/.test(pattern)) guidance.push('Use responsive cards with primary action, secondary action, source badge, and confidence badge.');
  if (/wizard|stepper|onboarding/.test(pattern)) guidance.push('Use a step-by-step wizard with progress, backtracking, and save-resume behavior.');
  if (/dashboard|cockpit|console/.test(pattern)) guidance.push('Use cockpit layout with status rail, action rail, proof rail, and recent receipts.');
  if (/chat|assistant|composer/.test(pattern)) guidance.push('Use chat composer with tool state, route decision, memory disclosure, and action confirmation.');
  if (/map|canvas|spatial/.test(pattern)) guidance.push('Use spatial canvas with permission boundary, live status, and fallback list view.');
  if (!guidance.length) guidance.push('Use PromptHouse Evo design language: clear status, proof receipts, direct action buttons, and no hidden failure states.');
  return guidance;
}

function sourceToBlueprint(source) {
  const featureId = `${source.appDomain}_${source.featureTarget}_${hashValue(source.id)}`.replace(/[^a-z0-9_-]/g, '_');
  return {
    id: featureId,
    sourceId: source.id,
    createdAt: new Date().toISOString(),
    truthState: source.allowedForTraining ? 'APP_INTELLIGENCE_BLUEPRINT_READY' : 'APP_INTELLIGENCE_BLOCKED_BY_POLICY',
    appDomain: source.appDomain,
    featureTarget: source.featureTarget,
    sourceType: source.sourceType,
    confidence: source.confidence,
    buildPlan: inferBuildPlan(source),
    uiGuidance: inferUiGuidance(source),
    requiredStudioPieces: [
      'UI component/page',
      'Bridge route/API endpoint',
      'Persistence or cache strategy',
      'Proof receipt',
      'Error/loading/empty states',
      'Test or verification command',
      'Rollback note'
    ],
    safety: {
      doNotCloneExactUI: true,
      transformIntoPromptHouseNativePattern: true,
      authorizedSourceOnly: true
    }
  };
}

function sourceToTrainingExample(source, blueprint) {
  const system = 'You are Evo LLM inside PromptHouse Evo Studio. Learn from authorized apps, devices, connected sources, UI summaries, API schemas, public docs, build logs, and workflow events. Transform observations into original PromptHouse-native feature and UI blueprints. Never copy exact private UI, secrets, proprietary assets, credentials, or unauthorized app contents.';
  const instruction = [
    `Source type: ${source.sourceType}`,
    `Source name: ${source.sourceName}`,
    `App domain: ${source.appDomain}`,
    `Feature target: ${source.featureTarget}`,
    `UI pattern: ${source.uiPattern}`,
    `Device context: ${source.deviceContext ? JSON.stringify(source.deviceContext) : 'none'}`,
    `Connected source: ${source.connectedSource ? JSON.stringify(source.connectedSource) : 'none'}`,
    `Observation: ${source.summary}`,
    `Sanitized payload: ${JSON.stringify(source.payload)}`,
    'Create an original PromptHouse Evo Studio feature and UI build plan from this authorized source.'
  ].join('\n');
  const response = [
    `Feature blueprint: ${blueprint.id}.`,
    `Truth state: ${blueprint.truthState}.`,
    `Build plan: ${blueprint.buildPlan.join(' ')}`,
    `UI guidance: ${blueprint.uiGuidance.join(' ')}`,
    `Required pieces: ${blueprint.requiredStudioPieces.join(', ')}.`,
    'Policy: learn patterns, workflows, constraints, and device capabilities; do not copy exact UI, private data, proprietary assets, or unauthorized behavior.'
  ].join('\n');

  return {
    id: `app_intelligence_${source.id}`,
    system,
    instruction,
    response,
    tags: ['app-intelligence', source.sourceType, source.appDomain, source.featureTarget, source.uiPattern, ...source.tags].slice(0, 24),
    source: 'evo-app-intelligence-bridge',
    truthPolicy: 'authorized-source-transform-not-copy'
  };
}

function buildFeatureMemory(sources) {
  const memory = {};
  for (const source of sources) {
    const key = source.featureTarget;
    const current = memory[key] || {
      featureTarget: key,
      observations: 0,
      learningScore: 0,
      sourceTypes: {},
      appDomains: {},
      uiPatterns: {},
      lastSeenAt: null,
      recommendedNextBuilds: []
    };
    current.observations += 1;
    current.learningScore = Number((current.learningScore + source.learningValue).toFixed(4));
    current.sourceTypes[source.sourceType] = (current.sourceTypes[source.sourceType] || 0) + 1;
    current.appDomains[source.appDomain] = (current.appDomains[source.appDomain] || 0) + 1;
    current.uiPatterns[source.uiPattern] = (current.uiPatterns[source.uiPattern] || 0) + 1;
    current.lastSeenAt = source.createdAt;
    memory[key] = current;
  }

  for (const item of Object.values(memory)) {
    item.normalizedScore = Number(Math.min(1, item.learningScore / Math.max(1, item.observations)).toFixed(3));
    const topPattern = Object.entries(item.uiPatterns).sort((a, b) => b[1] - a[1])[0]?.[0] || 'prompt-house-native';
    item.recommendedNextBuilds = [
      `Generate a PromptHouse-native ${item.featureTarget} feature from the strongest observed ${topPattern} pattern.`,
      'Create UI, route, persistence, proof receipt, and verification command before marking it ready.',
      'Feed the resulting build receipt back into Evo LLM training after verification.'
    ];
  }
  return memory;
}

export function ingestAppIntelligenceSource({ rootDir = process.cwd(), source = {} } = {}) {
  const paths = appIntelligencePaths({ rootDir });
  const normalized = normalizeSource(source);
  appendJsonl(paths.sourceLog, normalized);
  const sources = readJsonl(paths.sourceLog, 5000).filter((item) => item.allowedForTraining !== false);
  const memory = buildFeatureMemory(sources);
  const blueprints = sources.map(sourceToBlueprint);
  writeJson(paths.featureMemory, {
    generatedAt: new Date().toISOString(),
    version: APP_INTELLIGENCE_VERSION,
    features: memory
  });
  writeJson(paths.blueprintFile, blueprints);
  return {
    source: normalized,
    acceptedForTraining: normalized.allowedForTraining,
    riskFlags: normalized.riskFlags,
    blueprint: sourceToBlueprint(normalized),
    featureMemory: memory[normalized.featureTarget] || null,
    paths
  };
}

export function buildAppIntelligenceDataset({ rootDir = process.cwd(), limit = 1000, rebuildMainDataset = true } = {}) {
  const paths = appIntelligencePaths({ rootDir });
  const sources = readJsonl(paths.sourceLog, limit).filter((item) => item.allowedForTraining !== false);
  const blueprints = sources.map(sourceToBlueprint);
  const blueprintBySource = new Map(blueprints.map((item) => [item.sourceId, item]));
  const examples = sources.map((source) => sourceToTrainingExample(source, blueprintBySource.get(source.id) || sourceToBlueprint(source)));
  const memory = buildFeatureMemory(sources);
  writeJson(paths.datasetJson, examples);
  writeJson(paths.blueprintFile, blueprints);
  writeJson(paths.featureMemory, {
    generatedAt: new Date().toISOString(),
    version: APP_INTELLIGENCE_VERSION,
    features: memory
  });
  const manifest = rebuildMainDataset ? buildEvoLlmDataset({ rootDir }) : null;
  const receipt = writeAppIntelligenceReceipt({
    rootDir,
    type: 'app_intelligence_dataset_receipt',
    payload: {
      sourceCount: sources.length,
      exampleCount: examples.length,
      blueprintCount: blueprints.length,
      datasetFile: path.relative(rootDir, paths.datasetJson),
      blueprintFile: path.relative(rootDir, paths.blueprintFile),
      mainDatasetManifest: manifest
    }
  });
  return { sources: sources.length, examples: examples.length, blueprints: blueprints.length, featureMemory: memory, datasetFile: paths.datasetJson, blueprintFile: paths.blueprintFile, manifest, receipt };
}

export function getAppIntelligenceStatus({ rootDir = process.cwd(), limit = 500 } = {}) {
  const paths = appIntelligencePaths({ rootDir });
  const sources = readJsonl(paths.sourceLog, limit);
  const accepted = sources.filter((source) => source.allowedForTraining !== false);
  const blocked = sources.filter((source) => source.allowedForTraining === false);
  const memory = fs.existsSync(paths.featureMemory) ? JSON.parse(fs.readFileSync(paths.featureMemory, 'utf8')) : { features: buildFeatureMemory(accepted) };
  const blueprints = fs.existsSync(paths.blueprintFile) ? JSON.parse(fs.readFileSync(paths.blueprintFile, 'utf8')) : [];
  return {
    success: true,
    version: APP_INTELLIGENCE_VERSION,
    truthState: accepted.length ? 'APP_INTELLIGENCE_READY' : 'APP_INTELLIGENCE_WAITING_FOR_AUTHORIZED_SOURCES',
    sourceCount: sources.length,
    acceptedSourceCount: accepted.length,
    blockedSourceCount: blocked.length,
    targets: APP_INTELLIGENCE_TARGETS,
    allowedSourceTypes: ALLOWED_SOURCE_TYPES,
    files: {
      sourceLog: path.relative(rootDir, paths.sourceLog),
      datasetJson: path.relative(rootDir, paths.datasetJson),
      featureMemory: path.relative(rootDir, paths.featureMemory),
      blueprintFile: path.relative(rootDir, paths.blueprintFile)
    },
    featureMemory: memory.features || memory,
    latestBlueprints: blueprints.slice(-20)
  };
}

export function writeAppIntelligenceReceipt({ rootDir = process.cwd(), type = 'app_intelligence_receipt', payload = {} } = {}) {
  const paths = appIntelligencePaths({ rootDir });
  ensureDir(paths.receipts);
  const receipt = {
    id: `evo_app_intelligence_${Date.now()}`,
    type,
    createdAt: new Date().toISOString(),
    truthState: 'APP_INTELLIGENCE_RECEIPT_WRITTEN',
    payload: sanitizeSignalPayload(payload)
  };
  const file = path.join(paths.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file, receipt };
}

export function getAppIntelligenceContract() {
  return {
    name: 'PromptHouse Evo App Intelligence Bridge',
    version: APP_INTELLIGENCE_VERSION,
    purpose: 'Turn authorized external app, connected-source, device, UI, API, build-log, and workflow observations into original PromptHouse feature blueprints, UI guidance, and Evo LLM training examples.',
    targets: APP_INTELLIGENCE_TARGETS,
    allowedSourceTypes: ALLOWED_SOURCE_TYPES,
    policy: {
      authorizedSourcesOnly: true,
      learnPatternsNotExactCopies: true,
      blocksExactCloneRequests: true,
      storesSecrets: false,
      transformsIntoPromptHouseNativeFeatures: true
    },
    routes: [
      'GET /api/evo-app-intelligence/status',
      'POST /api/evo-app-intelligence/ingest',
      'POST /api/evo-app-intelligence/dataset',
      'POST /api/evo-app-intelligence/receipt',
      'GET /api/evo-app-intelligence/contract'
    ],
    outputs: {
      dataset: '.evo-llm/training-data/app-intelligence-examples.json',
      featureMemory: '.evo-llm/app-intelligence/feature-memory.json',
      blueprints: '.evo-llm/app-intelligence/generated-feature-blueprints.json'
    }
  };
}
