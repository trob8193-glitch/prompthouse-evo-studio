import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { normalizeEvoText } from './EvoLlmPolicy.js';

const SIGNAL_LEARNING_VERSION = '1.0.0';

const DEFAULT_FEATURE_TARGETS = Object.freeze([
  'brain-routing',
  'offline-mode',
  'daemon-recovery',
  'training-prioritization',
  'evolution-safety',
  'bot-coordination',
  'cost-firewall',
  'proof-gates',
  'ui-adaptation',
  'local-capability-selection'
]);

const SECRET_KEY_PATTERN = /(password|passwd|secret|token|api[_-]?key|authorization|cookie|session|credential|private[_-]?key)/i;
const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const MAC_PATTERN = /\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b/ig;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function safeJsonParse(value, fallback = []) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function readJsonl(file, limit = 500) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map((line) => safeJsonParse(line, null))
    .filter(Boolean);
}

function appendJsonl(file, entry) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8');
}

function signalLearningPaths({ rootDir = process.cwd() } = {}) {
  const evoPaths = getEvoLlmPaths({ rootDir });
  return {
    ...evoPaths,
    signalBase: path.join(evoPaths.base, 'signal-learning'),
    eventLog: path.join(evoPaths.base, 'signal-learning', 'events.jsonl'),
    datasetJson: path.join(evoPaths.training, 'signal-learning-examples.json'),
    featureMemory: path.join(evoPaths.base, 'signal-learning', 'feature-memory.json'),
    receipts: path.join(evoPaths.receipts, 'signal-learning')
  };
}

function sanitizeString(value) {
  return String(value || '')
    .replace(IP_PATTERN, (ip) => `ip_${hashValue(ip)}`)
    .replace(MAC_PATTERN, (mac) => `mac_${hashValue(mac)}`)
    .slice(0, 1400);
}

export function sanitizeSignalPayload(value, depth = 0) {
  if (depth > 8) return '[depth-limit]';
  if (Array.isArray(value)) return value.slice(0, 80).map((item) => sanitizeSignalPayload(item, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (SECRET_KEY_PATTERN.test(key)) {
        out[key] = '[redacted]';
      } else {
        out[key] = sanitizeSignalPayload(item, depth + 1);
      }
    }
    return out;
  }
  if (typeof value === 'string') return sanitizeString(value);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean' || value === null) return value;
  return String(value || '').slice(0, 200);
}

function normalizeSignalEvent(event = {}) {
  const sourceType = normalizeEvoText(event.sourceType || event.source || 'unknown-signal').toLowerCase().replace(/\s+/g, '-');
  const feature = normalizeEvoText(event.feature || event.targetFeature || 'studio-runtime').toLowerCase().replace(/\s+/g, '-');
  const confidence = Number.isFinite(Number(event.confidence)) ? Math.max(0, Math.min(1, Number(event.confidence))) : 0.6;
  const learningValue = Number.isFinite(Number(event.learningValue)) ? Math.max(0, Math.min(1, Number(event.learningValue))) : confidence;

  return {
    id: event.id || `siglearn_${Date.now()}_${hashValue(JSON.stringify(event)).slice(0, 8)}`,
    createdAt: event.createdAt || new Date().toISOString(),
    sourceType,
    sourceName: sanitizeString(event.sourceName || sourceType),
    feature,
    signalKind: normalizeEvoText(event.signalKind || event.kind || 'observation').toLowerCase().replace(/\s+/g, '-'),
    summary: sanitizeString(event.summary || event.message || 'Signal observation captured.'),
    payload: sanitizeSignalPayload(event.payload || event.data || {}),
    connectedSource: sanitizeSignalPayload(event.connectedSource || null),
    confidence,
    learningValue,
    tags: Array.isArray(event.tags) ? event.tags.map(sanitizeString).slice(0, 20) : [],
    allowedForTraining: event.allowedForTraining !== false,
    privacy: {
      sanitized: true,
      storesSecrets: false,
      storesNetworkPasswords: false,
      storesExactMacOrIp: false
    }
  };
}

function scoreFeatureMemory(events) {
  const memory = {};
  for (const event of events) {
    const feature = event.feature || 'studio-runtime';
    const current = memory[feature] || {
      feature,
      observations: 0,
      learningScore: 0,
      sourceTypes: {},
      signalKinds: {},
      lastSeenAt: null,
      recommendations: []
    };
    current.observations += 1;
    current.learningScore = Number((current.learningScore + event.learningValue).toFixed(4));
    current.sourceTypes[event.sourceType] = (current.sourceTypes[event.sourceType] || 0) + 1;
    current.signalKinds[event.signalKind] = (current.signalKinds[event.signalKind] || 0) + 1;
    current.lastSeenAt = event.createdAt;
    memory[feature] = current;
  }

  for (const item of Object.values(memory)) {
    const topSource = Object.entries(item.sourceTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    const topKind = Object.entries(item.signalKinds).sort((a, b) => b[1] - a[1])[0]?.[0] || 'observation';
    item.normalizedScore = Number(Math.min(1, item.learningScore / Math.max(1, item.observations)).toFixed(3));
    item.recommendations = buildFeatureRecommendations(item.feature, topSource, topKind, item.normalizedScore);
  }
  return memory;
}

function buildFeatureRecommendations(feature, sourceType, signalKind, score) {
  const base = [];
  if (feature.includes('routing') || feature.includes('brain')) {
    base.push('Use signal confidence to prefer local Evo LLM, Evo API, bridge, queue, or denial routes.');
  }
  if (feature.includes('daemon')) {
    base.push('Trigger daemon recovery when repeated signal loss or reconnect events appear.');
  }
  if (feature.includes('training')) {
    base.push('Prioritize training examples from repeated high-confidence events.');
  }
  if (feature.includes('evolution')) {
    base.push('Require proof receipts before evolution changes caused by signal events.');
  }
  if (feature.includes('bot')) {
    base.push('Assign bot council roles based on source type and signal kind.');
  }
  if (!base.length) base.push('Use the signal as weighted context for safer studio feature behavior.');
  base.push(`Current dominant source is ${sourceType}; dominant signal kind is ${signalKind}; confidence score is ${score}.`);
  return base;
}

function eventToTrainingExample(event, featureMemory) {
  const featureState = featureMemory[event.feature] || {};
  const system = 'You are Evo LLM inside PromptHouse Evo Studio. Learn from sanitized Wi-Fi, local, external, and connected-source signals only when the signal is allowed for training. Never store secrets. Use signals to improve routing, daemons, training, evolution, bots, proof gates, and feature behavior.';
  const instruction = [
    `Signal source: ${event.sourceType}`,
    `Feature target: ${event.feature}`,
    `Signal kind: ${event.signalKind}`,
    `Summary: ${event.summary}`,
    `Confidence: ${event.confidence}`,
    `Connected source: ${event.connectedSource ? JSON.stringify(event.connectedSource) : 'none'}`,
    `Sanitized payload: ${JSON.stringify(event.payload)}`,
    'Decide how PromptHouse Evo Studio should learn from this signal.'
  ].join('\n');
  const response = [
    `Learning decision: use this signal for ${event.feature}.`,
    `Training weight: ${event.learningValue}.`,
    `Feature memory observations: ${featureState.observations || 1}.`,
    `Recommended studio behavior: ${(featureState.recommendations || buildFeatureRecommendations(event.feature, event.sourceType, event.signalKind, event.learningValue)).join(' ')}`,
    'Safety rule: keep secrets, passwords, exact MAC addresses, exact IP addresses, and private connector contents out of model examples unless the user explicitly exports sanitized training data.'
  ].join('\n');

  return {
    id: `signal_learning_${event.id}`,
    system,
    instruction,
    response,
    tags: ['signal-learning', event.sourceType, event.feature, event.signalKind, ...event.tags].slice(0, 24),
    source: 'evo-signal-learning-bridge',
    truthPolicy: 'sanitized-signal-learning'
  };
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

export function ingestEvoSignalLearningEvent({ rootDir = process.cwd(), event = {} } = {}) {
  const paths = signalLearningPaths({ rootDir });
  const normalized = normalizeSignalEvent(event);
  appendJsonl(paths.eventLog, normalized);
  const events = readJsonl(paths.eventLog, 2000).filter((item) => item.allowedForTraining !== false);
  const featureMemory = scoreFeatureMemory(events);
  writeJson(paths.featureMemory, {
    generatedAt: new Date().toISOString(),
    version: SIGNAL_LEARNING_VERSION,
    features: featureMemory
  });
  return { event: normalized, featureMemory: featureMemory[normalized.feature] || null, paths };
}

export function importEvoSignalFabricSnapshot({ rootDir = process.cwd(), fabric = {}, connectedSources = [] } = {}) {
  const events = [];
  const probes = Array.isArray(fabric.probes) ? fabric.probes : [];
  const matrix = Array.isArray(fabric.supportMatrix) ? fabric.supportMatrix : [];

  for (const probe of probes) {
    events.push(ingestEvoSignalLearningEvent({
      rootDir,
      event: {
        sourceType: 'signal-fabric-probe',
        sourceName: probe.label || probe.id,
        feature: probe.target || 'studio-runtime',
        signalKind: probe.reachable ? 'reachable' : 'not-reachable',
        summary: probe.reason || `${probe.id} signal observed.`,
        confidence: probe.reachable ? 0.85 : 0.55,
        learningValue: probe.critical ? 0.9 : 0.6,
        payload: probe,
        tags: ['signal-fabric', probe.id]
      }
    }).event);
  }

  for (const item of matrix) {
    events.push(ingestEvoSignalLearningEvent({
      rootDir,
      event: {
        sourceType: 'signal-support-matrix',
        sourceName: item.target,
        feature: item.target,
        signalKind: item.supported ? 'supported' : 'needs-support',
        summary: `${item.target} support is ${item.truthState}.`,
        confidence: item.supported ? 0.8 : 0.5,
        learningValue: item.supported ? 0.65 : 0.75,
        payload: item,
        tags: ['support-matrix']
      }
    }).event);
  }

  for (const source of connectedSources) {
    events.push(ingestEvoSignalLearningEvent({
      rootDir,
      event: {
        sourceType: source.type || 'connected-source',
        sourceName: source.name || source.id || 'connected-source',
        feature: source.feature || 'intelligence-router',
        signalKind: source.signalKind || 'source-event',
        summary: source.summary || 'Connected source signal captured for feature learning.',
        confidence: source.confidence ?? 0.6,
        learningValue: source.learningValue ?? 0.65,
        connectedSource: source,
        payload: source.payload || {},
        tags: ['connected-source', source.type || 'source']
      }
    }).event);
  }

  return { imported: events.length, events };
}

export function buildSignalLearningDataset({ rootDir = process.cwd(), limit = 1000, rebuildMainDataset = true } = {}) {
  const paths = signalLearningPaths({ rootDir });
  const events = readJsonl(paths.eventLog, limit).filter((event) => event.allowedForTraining !== false);
  const featureMemory = scoreFeatureMemory(events);
  const examples = events.map((event) => eventToTrainingExample(event, featureMemory));
  writeJson(paths.datasetJson, examples);
  writeJson(paths.featureMemory, {
    generatedAt: new Date().toISOString(),
    version: SIGNAL_LEARNING_VERSION,
    features: featureMemory
  });
  const manifest = rebuildMainDataset ? buildEvoLlmDataset({ rootDir }) : null;
  const receipt = writeSignalLearningReceipt({
    rootDir,
    type: 'signal_learning_dataset_receipt',
    payload: {
      eventCount: events.length,
      exampleCount: examples.length,
      featureCount: Object.keys(featureMemory).length,
      datasetFile: path.relative(rootDir, paths.datasetJson),
      mainDatasetManifest: manifest
    }
  });
  return { events: events.length, examples: examples.length, featureMemory, datasetFile: paths.datasetJson, manifest, receipt };
}

export function getSignalLearningStatus({ rootDir = process.cwd(), limit = 500 } = {}) {
  const paths = signalLearningPaths({ rootDir });
  const events = readJsonl(paths.eventLog, limit);
  const trainingEvents = events.filter((event) => event.allowedForTraining !== false);
  const featureMemory = fs.existsSync(paths.featureMemory) ? JSON.parse(fs.readFileSync(paths.featureMemory, 'utf8')) : { features: scoreFeatureMemory(trainingEvents) };
  return {
    success: true,
    version: SIGNAL_LEARNING_VERSION,
    truthState: trainingEvents.length ? 'SIGNAL_LEARNING_READY' : 'SIGNAL_LEARNING_WAITING_FOR_EVENTS',
    eventCount: events.length,
    trainingEventCount: trainingEvents.length,
    featureTargets: DEFAULT_FEATURE_TARGETS,
    files: {
      eventLog: path.relative(rootDir, paths.eventLog),
      datasetJson: path.relative(rootDir, paths.datasetJson),
      featureMemory: path.relative(rootDir, paths.featureMemory)
    },
    featureMemory: featureMemory.features || featureMemory
  };
}

export function writeSignalLearningReceipt({ rootDir = process.cwd(), type = 'signal_learning_receipt', payload = {} } = {}) {
  const paths = signalLearningPaths({ rootDir });
  ensureDir(paths.receipts);
  const receipt = {
    id: `evo_signal_learning_${Date.now()}`,
    type,
    createdAt: new Date().toISOString(),
    truthState: 'SIGNAL_LEARNING_RECEIPT_WRITTEN',
    payload: sanitizeSignalPayload(payload)
  };
  const file = path.join(paths.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file, receipt };
}

export function getSignalLearningContract() {
  return {
    name: 'PromptHouse Evo Signal Learning Bridge',
    version: SIGNAL_LEARNING_VERSION,
    purpose: 'Convert sanitized Wi-Fi, internal, external, local runtime, daemon, bot, training, evolution, and connected-source signals into Evo LLM training examples and feature memory.',
    privacy: {
      storesSecrets: false,
      storesNetworkPasswords: false,
      hashesExactMacAndIp: true,
      requiresAllowedForTraining: true
    },
    routes: [
      'GET /api/evo-signal-learning/status',
      'POST /api/evo-signal-learning/ingest',
      'POST /api/evo-signal-learning/import-fabric',
      'POST /api/evo-signal-learning/dataset',
      'POST /api/evo-signal-learning/receipt',
      'GET /api/evo-signal-learning/contract'
    ],
    evoLlmBridge: {
      writesTrainingJson: '.evo-llm/training-data/signal-learning-examples.json',
      rebuildsMainDataset: true,
      affects: DEFAULT_FEATURE_TARGETS
    }
  };
}
