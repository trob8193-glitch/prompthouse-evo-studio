import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { normalizeEvoText } from './EvoLlmPolicy.js';
import { sanitizeSignalPayload } from './EvoSignalLearningBridge.js';

const VERSION = '1.0.0';

const SOURCE_TYPES = Object.freeze([
  'studio-chat-summary',
  'task-result',
  'build-log-summary',
  'audit-receipt',
  'verification-result',
  'commit-summary',
  'pull-request-summary',
  'ui-action-summary',
  'bot-decision',
  'customer-work-summary',
  'operator-note'
]);

const PRIVATE_PATTERNS = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ghp_[A-Za-z0-9_]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /password\s*[:=]\s*\S+/gi,
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
  /secret\s*[:=]\s*\S+/gi
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function safeText(value, limit = 2400) {
  let text = normalizeEvoText(value).slice(0, limit);
  for (const pattern of PRIVATE_PATTERNS) text = text.replace(pattern, '[REDACTED]');
  return text;
}

function readJsonl(file, limit = 2000) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(-limit).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8');
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function workMemoryPaths({ rootDir = process.cwd() } = {}) {
  const evoPaths = getEvoLlmPaths({ rootDir });
  return {
    ...evoPaths,
    workBase: path.join(evoPaths.base, 'work-memory'),
    events: path.join(evoPaths.base, 'work-memory', 'events.jsonl'),
    lessons: path.join(evoPaths.base, 'work-memory', 'lessons.json'),
    evolutionPlans: path.join(evoPaths.base, 'work-memory', 'evolution-plans.json'),
    datasetJson: path.join(evoPaths.training, 'work-memory-examples.json'),
    receipts: path.join(evoPaths.receipts, 'work-memory')
  };
}

function inferIntent(text) {
  const value = text.toLowerCase();
  if (/build|implement|wire|connect|route|button|feature/.test(value)) return 'build_feature';
  if (/test|verify|audit|score|check|proof/.test(value)) return 'verify_or_audit';
  if (/error|fail|broken|crash|blocked|missing/.test(value)) return 'repair_failure';
  if (/ui|screen|design|layout|canvas|dashboard/.test(value)) return 'improve_ui';
  if (/sell|money|client|customer|package|price/.test(value)) return 'productize_work';
  if (/train|learn|memory|dataset|evolve/.test(value)) return 'improve_learning_loop';
  return 'general_studio_lesson';
}

function inferPriority(intent, text) {
  const value = text.toLowerCase();
  if (/urgent|now|today|fix all|broken|blocked|critical/.test(value)) return 'high';
  if (['repair_failure', 'verify_or_audit', 'build_feature'].includes(intent)) return 'medium-high';
  return 'medium';
}

function normalizeWorkItem(input = {}) {
  const summary = safeText(input.summary || input.message || input.text || 'PromptHouse Evo work memory event.', 2000);
  const sourceType = safeText(input.sourceType || input.type || 'operator-note', 80).toLowerCase().replace(/\s+/g, '-');
  const allowedType = SOURCE_TYPES.includes(sourceType) ? sourceType : 'operator-note';
  const intent = safeText(input.intent || inferIntent(summary), 80);
  const payload = sanitizeSignalPayload(input.payload || input.data || {});
  const allowedForTraining = input.allowedForTraining !== false;
  return {
    id: input.id || `work_${Date.now()}_${hash(JSON.stringify(input))}`,
    createdAt: input.createdAt || new Date().toISOString(),
    sourceType: allowedType,
    intent,
    priority: safeText(input.priority || inferPriority(intent, summary), 40),
    summary,
    payload,
    module: safeText(input.module || input.area || 'studio', 100).toLowerCase().replace(/\s+/g, '-'),
    resultState: safeText(input.resultState || input.status || 'observed', 80).toLowerCase().replace(/\s+/g, '-'),
    tags: Array.isArray(input.tags) ? input.tags.map((tag) => safeText(tag, 64)).slice(0, 24) : [],
    allowedForTraining,
    privacy: {
      sanitized: true,
      storesRawSecrets: false,
      storesRawPrivateChat: false,
      requiresApproval: true
    }
  };
}

function lessonFromItem(item) {
  const needsProof = ['build_feature', 'repair_failure', 'verify_or_audit', 'improve_learning_loop'].includes(item.intent);
  const action = item.intent === 'repair_failure'
    ? 'Create a repair plan with local verification, rollback note, and receipt.'
    : item.intent === 'build_feature'
      ? 'Create a feature plan with UI, route, persistence, tests, and receipt.'
      : item.intent === 'improve_ui'
        ? 'Create a UI improvement plan with state handling and accessibility checks.'
        : item.intent === 'productize_work'
          ? 'Create a product workflow with offer, proof, pricing, and delivery steps.'
          : 'Create a studio learning note and feed approved lessons into Evo LLM training.';
  return {
    id: `lesson_${item.id}`,
    sourceId: item.id,
    intent: item.intent,
    module: item.module,
    priority: item.priority,
    lesson: `When ${item.module} receives ${item.intent} work, ${action}`,
    recommendedAction: action,
    proofRequired: needsProof,
    trainingAllowed: item.allowedForTraining,
    resultState: item.resultState,
    tags: item.tags
  };
}

function planFromLesson(lesson) {
  return {
    id: `plan_${lesson.sourceId}`,
    createdAt: new Date().toISOString(),
    truthState: lesson.trainingAllowed ? 'WORK_MEMORY_PLAN_READY' : 'WORK_MEMORY_PLAN_HELD_FOR_APPROVAL',
    module: lesson.module,
    priority: lesson.priority,
    steps: [
      'Extract approved lesson from work event.',
      'Create or update module memory.',
      'Generate Evo LLM training example.',
      'Require verification before promotion.',
      'Write receipt after successful work.'
    ],
    recommendedAction: lesson.recommendedAction,
    proofRequired: lesson.proofRequired
  };
}

function exampleFromLesson(lesson, item) {
  return {
    id: `work_memory_${item.id}`,
    system: 'You are Evo LLM inside PromptHouse Evo Studio. Learn from approved studio work summaries, task results, audits, receipts, build logs, UI summaries, and bot decisions. Store useful lessons, not raw private life or secrets.',
    instruction: [
      `Source type: ${item.sourceType}`,
      `Intent: ${lesson.intent}`,
      `Module: ${lesson.module}`,
      `Priority: ${lesson.priority}`,
      `Result state: ${item.resultState}`,
      `Summary: ${item.summary}`,
      `Payload: ${JSON.stringify(item.payload)}`,
      'Turn this into a safe studio learning rule and evolution plan.'
    ].join('\n'),
    response: [
      `Lesson: ${lesson.lesson}`,
      `Recommended action: ${lesson.recommendedAction}`,
      `Proof required: ${lesson.proofRequired}.`,
      'Policy: use approved summaries only, redact secrets, avoid raw private chat, require verification before promotion.'
    ].join('\n'),
    tags: ['work-memory', lesson.intent, lesson.module, ...(lesson.tags || [])].slice(0, 24),
    source: 'evo-work-memory-engine'
  };
}

export function ingestEvoWorkMemory({ rootDir = process.cwd(), item = {} } = {}) {
  const paths = workMemoryPaths({ rootDir });
  const normalized = normalizeWorkItem(item);
  appendJsonl(paths.events, normalized);
  const items = readJsonl(paths.events, 5000);
  const lessons = items.map(lessonFromItem);
  const plans = lessons.map(planFromLesson);
  writeJson(paths.lessons, lessons);
  writeJson(paths.evolutionPlans, plans);
  return { success: true, item: normalized, lesson: lessonFromItem(normalized), plan: planFromLesson(lessonFromItem(normalized)), files: paths };
}

export function buildEvoWorkMemoryDataset({ rootDir = process.cwd(), limit = 1000, rebuildMainDataset = true } = {}) {
  const paths = workMemoryPaths({ rootDir });
  const items = readJsonl(paths.events, limit).filter((item) => item.allowedForTraining !== false);
  const lessons = items.map(lessonFromItem);
  const plans = lessons.map(planFromLesson);
  const examples = items.map((item, index) => exampleFromLesson(lessons[index], item));
  writeJson(paths.lessons, lessons);
  writeJson(paths.evolutionPlans, plans);
  writeJson(paths.datasetJson, examples);
  const manifest = rebuildMainDataset ? buildEvoLlmDataset({ rootDir }) : null;
  const receipt = writeEvoWorkMemoryReceipt({ rootDir, type: 'work_memory_dataset_receipt', payload: { itemCount: items.length, lessonCount: lessons.length, planCount: plans.length, exampleCount: examples.length, manifest } });
  return { success: true, items: items.length, lessons: lessons.length, plans: plans.length, examples: examples.length, datasetFile: paths.datasetJson, manifest, receipt };
}

export function getEvoWorkMemoryStatus({ rootDir = process.cwd(), limit = 500 } = {}) {
  const paths = workMemoryPaths({ rootDir });
  const items = readJsonl(paths.events, limit);
  const accepted = items.filter((item) => item.allowedForTraining !== false);
  return {
    success: true,
    version: VERSION,
    truthState: accepted.length ? 'WORK_MEMORY_READY' : 'WORK_MEMORY_WAITING_FOR_APPROVED_WORK',
    itemCount: items.length,
    acceptedItemCount: accepted.length,
    sourceTypes: SOURCE_TYPES,
    files: {
      events: path.relative(rootDir, paths.events),
      lessons: path.relative(rootDir, paths.lessons),
      plans: path.relative(rootDir, paths.evolutionPlans),
      dataset: path.relative(rootDir, paths.datasetJson)
    }
  };
}

export function writeEvoWorkMemoryReceipt({ rootDir = process.cwd(), type = 'work_memory_receipt', payload = {} } = {}) {
  const paths = workMemoryPaths({ rootDir });
  ensureDir(paths.receipts);
  const receipt = { id: `work_memory_${Date.now()}`, type, createdAt: new Date().toISOString(), truthState: 'WORK_MEMORY_RECEIPT_WRITTEN', payload: sanitizeSignalPayload(payload) };
  const file = path.join(paths.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file, receipt };
}

export function getEvoWorkMemoryContract() {
  return {
    name: 'PromptHouse Evo Chat and Work Learning Engine',
    version: VERSION,
    purpose: 'Convert approved studio chats, work summaries, task results, build logs, commits, audits, UI actions, and receipts into safe lessons, memory, training examples, and evolution plans.',
    sourceTypes: SOURCE_TYPES,
    policy: {
      approvedSummariesOnly: true,
      rawSecretsStored: false,
      rawPrivateChatStored: false,
      verificationBeforePromotion: true
    },
    outputs: {
      events: '.evo-llm/work-memory/events.jsonl',
      lessons: '.evo-llm/work-memory/lessons.json',
      plans: '.evo-llm/work-memory/evolution-plans.json',
      dataset: '.evo-llm/training-data/work-memory-examples.json'
    }
  };
}
