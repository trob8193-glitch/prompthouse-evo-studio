import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { buildEvoLlmDataset, evaluateEvoLlmDataset, getEvoTrainStatus } from '../../src/core/evo-llm/index.js';
import { addTrainingJob } from '../../src/core/api/training_job_queue.js';

const DATA_DIR = (rootDir) => path.join(rootDir, '.prompthouse-data');
const TRAINING_DIR = (rootDir) => path.join(rootDir, '.evo-llm', 'training-data');
const INGESTED_EXAMPLES_FILE = (rootDir) => path.join(TRAINING_DIR(rootDir), 'ingested-examples.json');
const TRAINING_CAPTURE_FILE = (rootDir) => path.join(DATA_DIR(rootDir), 'training-captures.jsonl');
const EVO_RUNTIME_STATE_FILE = (rootDir) => path.join(DATA_DIR(rootDir), 'evo-runtime-state.json');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(file, fallback) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8');
}

function readJsonl(file, limit = 100) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-limit)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .reverse();
}

function cleanText(value) {
  return String(value || '')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED_KEY]')
    .replace(/Bearer\s+\S{20,}/gi, 'Bearer [REDACTED]')
    .replace(/password\s*[:=]\s*\S+/gi, 'password=[REDACTED]')
    .trim();
}

function hashExample(example) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({
      system: example.system,
      instruction: example.instruction,
      response: example.response,
      source: example.source
    }))
    .digest('hex')
    .slice(0, 16);
}

export function normalizeTrainingExample(example = {}, source = 'training-ingest') {
  const rawInstruction = example.instruction
    || example.input
    || example.prompt
    || example.question
    || example.title
    || example.name
    || example.content;
  const rawResponse = example.response
    || example.output
    || example.completion
    || example.answer
    || example.expected
    || (example.title && example.content ? example.content : '');

  const instruction = cleanText(rawInstruction);
  const response = cleanText(rawResponse);
  const system = cleanText(example.system || example.systemPrompt || 'You are Evo LLM for PromptHouse Evo Studio. Stay truth-bound, receipt-backed, and production-only.');

  if (!instruction || !response) {
    return {
      valid: false,
      reason: 'Training example requires an instruction/input/prompt and a response/output/completion.'
    };
  }

  const normalized = {
    id: cleanText(example.id) || `ingested_${hashExample({ system, instruction, response, source })}`,
    system,
    instruction,
    response,
    tags: Array.isArray(example.tags) ? example.tags.map(cleanText).filter(Boolean) : ['ingested'],
    source: cleanText(example.source || source),
    metadata: example.metadata && typeof example.metadata === 'object' ? example.metadata : {},
    truthPolicy: example.truthPolicy || 'truth-bound-production-only'
  };

  return { valid: true, example: normalized };
}

export function ingestTrainingExamples({ rootDir = process.cwd(), examples = [], source = 'training-ingest' } = {}) {
  const input = Array.isArray(examples) ? examples : [examples];
  const accepted = [];
  const rejected = [];

  for (const item of input) {
    const normalized = normalizeTrainingExample(item, source);
    if (normalized.valid) accepted.push(normalized.example);
    else rejected.push({ item, reason: normalized.reason });
  }

  const file = INGESTED_EXAMPLES_FILE(rootDir);
  const existing = readJsonSafe(file, []);
  const byId = new Map((Array.isArray(existing) ? existing : []).map((item) => [item.id, item]));
  for (const example of accepted) byId.set(example.id, example);
  const next = Array.from(byId.values());
  writeJson(file, next);

  const manifest = buildEvoLlmDataset({ rootDir });
  const evaluation = evaluateEvoLlmDataset({ rootDir });

  return {
    success: true,
    truthState: rejected.length ? 'TRAINING_INGEST_PARTIAL' : 'TRAINING_INGESTED',
    ingested: accepted.length,
    rejected,
    totalExamples: next.length,
    file: path.relative(rootDir, file),
    manifest,
    evaluation
  };
}

export function captureTrainingEvent({ rootDir = process.cwd(), capture = {} } = {}) {
  const id = cleanText(capture.id) || `training_capture_${Date.now()}`;
  const event = {
    ...capture,
    id,
    createdAt: capture.createdAt || new Date().toISOString(),
    source: cleanText(capture.source || 'training-capture')
  };
  appendJsonl(TRAINING_CAPTURE_FILE(rootDir), event);

  const instruction = [
    `Review PromptHouse Evo Studio training capture ${id}.`,
    event.summary ? `Summary: ${event.summary}` : '',
    event.next_pass_excerpt ? `Next pass: ${event.next_pass_excerpt}` : '',
    event.checklist ? `Checklist: ${event.checklist}` : ''
  ].filter(Boolean).join('\n');

  const response = [
    'Convert this capture into a proof-gated improvement plan.',
    'Preserve verified behavior, list blockers explicitly, run tests/build/route proof before claiming completion, and require owner approval before external provider execution.'
  ].join(' ');

  const ingest = ingestTrainingExamples({
    rootDir,
    source: event.source,
    examples: [{
      id: `${id}_example`,
      system: 'You are Evo LLM learning from PromptHouse Studio review and repair captures.',
      instruction,
      response,
      tags: ['training-capture', 'self-training'],
      metadata: {
        captureId: id,
        reviewPath: event.reviewPath || null,
        nextPassPath: event.nextPassPath || null
      }
    }]
  });

  // ─── AUTO-QUEUE TRAINING JOB ─────────────────────────────────
  // When the dataset reaches sufficient quality, automatically queue
  // a fine-tuning job into the TrainingJobQueue. The job will only
  // execute if OPENAI_API_KEY is set and a real fileId is provided.
  let queuedJob = null;
  if (ingest.evaluation && ingest.evaluation.datasetQualityScore >= 90 && ingest.totalExamples >= 10) {
    try {
      const datasetFile = ingest.manifest?.trainFile || ingest.file;
      queuedJob = addTrainingJob({
        captureId: id,
        source: event.source,
        datasetFile,
        totalExamples: ingest.totalExamples,
        datasetQualityScore: ingest.evaluation.datasetQualityScore,
        // fileId must be set by the user or upload step before execution
        fileId: event.openaiFileId || null,
        model: event.model || 'gpt-4o-mini-2024-07-18',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      // Queue is non-critical — log but don't fail the capture
      console.warn('[TrainingCapture] Auto-queue failed:', e.message);
    }
  }

  return {
    success: true,
    truthState: 'TRAINING_CAPTURE_RECORDED',
    capture: event,
    ingest,
    queuedJob
  };
}

export function getTrainingStats({ rootDir = process.cwd(), limit = 25 } = {}) {
  const ingested = readJsonSafe(INGESTED_EXAMPLES_FILE(rootDir), []);
  const captures = readJsonl(TRAINING_CAPTURE_FILE(rootDir), limit);
  const manifest = buildEvoLlmDataset({ rootDir });
  const evaluation = evaluateEvoLlmDataset({ rootDir });
  return {
    success: true,
    truthState: evaluation.datasetQualityScore >= 90 ? 'TRAINING_STATS_READY' : 'TRAINING_STATS_NEEDS_DATA_REPAIR',
    total: manifest.totalExamples,
    ingested: Array.isArray(ingested) ? ingested.length : 0,
    captures: captures.length,
    sizeBytes: fs.existsSync(INGESTED_EXAMPLES_FILE(rootDir)) ? fs.statSync(INGESTED_EXAMPLES_FILE(rootDir)).size : 0,
    manifest,
    evaluation,
    recentCaptures: captures
  };
}

export function getEvoRuntimeStatus({ rootDir = process.cwd() } = {}) {
  const state = readJsonSafe(EVO_RUNTIME_STATE_FILE(rootDir), null);
  const training = getTrainingStats({ rootDir, limit: 10 });
  return {
    success: true,
    truthState: state?.active ? 'EVO_RUNTIME_LOCAL_ACTIVE' : 'EVO_RUNTIME_LOCAL_READY',
    active: Boolean(state?.active),
    state: state || {
      active: false,
      activatedAt: null,
      source: null,
      runId: null
    },
    training,
    trainStatus: getEvoTrainStatus({ rootDir })
  };
}

export function activateEvoRuntime({ rootDir = process.cwd(), source = 'manual', runId = `runtime_${Date.now()}` } = {}) {
  const status = getEvoRuntimeStatus({ rootDir });
  const state = {
    active: true,
    source: cleanText(source),
    runId: cleanText(runId),
    activatedAt: new Date().toISOString(),
    trainingTruthState: status.training.truthState,
    activeVersion: status.trainStatus.activeVersion || null
  };
  writeJson(EVO_RUNTIME_STATE_FILE(rootDir), state);
  return {
    success: true,
    truthState: 'EVO_RUNTIME_LOCAL_ACTIVE',
    state,
    training: status.training,
    trainStatus: status.trainStatus
  };
}
