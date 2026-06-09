import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { evaluateEvoLlmDataset } from './EvoLlmEvaluation.js';
import { getEvoLlmPaths } from './EvoLlmPaths.js';

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function stamp() { return new Date().toISOString(); }
function readJsonSafe(file, fallback = null) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }

export function getEvoGlobalNodePaths({ rootDir = process.cwd() } = {}) {
  const base = path.join(getEvoLlmPaths({ rootDir }).base, 'global-node');
  return {
    base,
    identity: path.join(base, 'node-identity.json'),
    outbox: path.join(base, 'outbox'),
    receipts: path.join(base, 'receipts')
  };
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function hmac(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function gitReceipt(rootDir) {
  try {
    return {
      commit: execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim(),
      branch: execSync('git branch --show-current', { cwd: rootDir, encoding: 'utf8' }).trim()
    };
  } catch {
    return { commit: null, branch: null };
  }
}

export function redactTrainingValue(value) {
  if (Array.isArray(value)) return value.map(redactTrainingValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactTrainingValue(item)]));
  }
  return String(value ?? '')
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, '[REDACTED_OPENAI_KEY]')
    .replace(/AIza[A-Za-z0-9_-]{20,}/g, '[REDACTED_GEMINI_KEY]')
    .replace(/Bearer\s+\S{12,}/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(password|secret|token|api[_-]?key)\s*[:=]\s*\S+/gi, '$1=[REDACTED]')
    .trim();
}

export function getOrCreateGlobalNodeIdentity({ rootDir = process.cwd(), env = process.env } = {}) {
  const paths = getEvoGlobalNodePaths({ rootDir });
  const existing = readJsonSafe(paths.identity, null);
  if (existing?.nodeId) return existing;

  const nodeId = env.PROMPTHOUSE_GLOBAL_NODE_ID || `ph_node_${crypto.randomUUID()}`;
  const identity = {
    nodeId,
    createdAt: stamp(),
    copyHash: sha256(`${rootDir}:${nodeId}`).slice(0, 16),
    truthState: 'GLOBAL_NODE_IDENTITY_LOCAL'
  };
  writeJson(paths.identity, identity);
  return identity;
}

function readTrainingExamples(rootDir) {
  const paths = getEvoLlmPaths({ rootDir });
  return [
    ...readJsonl(paths.trainJsonl),
    ...readJsonl(paths.evalJsonl)
  ];
}

function buildPacketBody({
  rootDir,
  env,
  contributor,
  scope,
  includeExamples,
  consent
}) {
  const identity = getOrCreateGlobalNodeIdentity({ rootDir, env });
  const dataset = buildEvoLlmDataset({ rootDir });
  const evaluation = evaluateEvoLlmDataset({ rootDir });
  const globalOptIn = consent.globalContribution === true || env.GLOBAL_EVO_CONTRIBUTION_OPT_IN === 'true';
  const dataRightsConfirmed = consent.dataRightsConfirmed === true || env.GLOBAL_EVO_DATA_RIGHTS_CONFIRMED === 'true';
  const examples = includeExamples && globalOptIn && dataRightsConfirmed
    ? readTrainingExamples(rootDir).map(redactTrainingValue)
    : [];
  const datasetReady = dataset.validExamples > 0 && dataset.invalidExamples.length === 0 && evaluation.datasetQualityScore >= 90;
  const blockers = [
    !globalOptIn ? 'GLOBAL_EVO_CONTRIBUTION_OPT_IN must be true or consent.globalContribution must be true.' : null,
    !dataRightsConfirmed ? 'GLOBAL_EVO_DATA_RIGHTS_CONFIRMED must be true or consent.dataRightsConfirmed must be true.' : null,
    !datasetReady ? 'Dataset must be valid and score at least 90 before global contribution.' : null,
    includeExamples && examples.length === 0 ? 'No redacted examples were included for global training.' : null
  ].filter(Boolean);

  return {
    schema: 'prompthouse.evo.global-node.contribution.v1',
    packetId: `global_evo_packet_${Date.now()}`,
    createdAt: stamp(),
    node: identity,
    contributor: redactTrainingValue(contributor || env.PROMPTHOUSE_GLOBAL_CONTRIBUTOR || 'local-copy'),
    scope: scope === 'global-corpus' ? 'global-corpus' : 'private-or-review',
    git: gitReceipt(rootDir),
    consent: {
      privateProviderTraining: consent.privateProviderTraining === true,
      globalContribution: globalOptIn,
      dataRightsConfirmed
    },
    dataset: redactTrainingValue(dataset),
    evaluation: redactTrainingValue(evaluation),
    containsExamples: examples.length > 0,
    examples,
    exampleHashes: examples.map((example) => sha256(JSON.stringify(example)).slice(0, 24)),
    blockers,
    truthState: blockers.length ? 'GLOBAL_CONTRIBUTION_PACKET_BLOCKED' : 'GLOBAL_CONTRIBUTION_PACKET_READY'
  };
}

export function buildGlobalContributionPacket({
  rootDir = process.cwd(),
  env = process.env,
  contributor = 'local-copy',
  scope = 'global-corpus',
  includeExamples = false,
  consent = {}
} = {}) {
  const paths = getEvoGlobalNodePaths({ rootDir });
  ensureDir(paths.outbox);
  const body = buildPacketBody({ rootDir, env, contributor, scope, includeExamples, consent });
  const canonical = JSON.stringify(body);
  const packetHash = sha256(canonical);
  const signingSecret = env.GLOBAL_EVO_NODE_SIGNING_SECRET || '';
  const packet = {
    ...body,
    packetHash,
    signature: signingSecret ? hmac(packetHash, signingSecret) : null,
    signatureTruthState: signingSecret ? 'GLOBAL_NODE_PACKET_SIGNED' : 'GLOBAL_NODE_SIGNING_SECRET_REQUIRED_FOR_SUBMIT'
  };
  const file = path.join(paths.outbox, `${packet.packetId}.json`);
  writeJson(file, packet);
  return { file, packet };
}

function listJsonFiles(dir, limit = 25) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ file: path.join(dir, file), mtime: fs.statSync(path.join(dir, file)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit)
    .map(({ file }) => readJsonSafe(file, null))
    .filter(Boolean);
}

function findPacket(paths, packetId) {
  const packets = listJsonFiles(paths.outbox, 100);
  if (!packetId) return packets[0] || null;
  return packets.find((packet) => packet.packetId === packetId) || null;
}

export function getGlobalNodeStatus({ rootDir = process.cwd(), env = process.env } = {}) {
  const paths = getEvoGlobalNodePaths({ rootDir });
  const identity = getOrCreateGlobalNodeIdentity({ rootDir, env });
  const packets = listJsonFiles(paths.outbox, 20);
  const receipts = listJsonFiles(paths.receipts, 20);
  const blockers = [
    env.GLOBAL_EVO_CONTRIBUTION_OPT_IN !== 'true' ? 'GLOBAL_EVO_CONTRIBUTION_OPT_IN is not true.' : null,
    env.GLOBAL_EVO_DATA_RIGHTS_CONFIRMED !== 'true' ? 'GLOBAL_EVO_DATA_RIGHTS_CONFIRMED is not true.' : null,
    !env.GLOBAL_EVO_HUB_URL ? 'GLOBAL_EVO_HUB_URL missing.' : null,
    !env.GLOBAL_EVO_HUB_TOKEN ? 'GLOBAL_EVO_HUB_TOKEN missing.' : null,
    !env.GLOBAL_EVO_NODE_SIGNING_SECRET ? 'GLOBAL_EVO_NODE_SIGNING_SECRET missing.' : null
  ].filter(Boolean);
  return {
    success: true,
    truthState: blockers.length ? 'GLOBAL_NODE_PROVIDER_GATED' : 'GLOBAL_NODE_READY_TO_SUBMIT',
    identity,
    blockers,
    latestPackets: packets,
    latestReceipts: receipts
  };
}

export async function submitGlobalContributionPacket({
  rootDir = process.cwd(),
  env = process.env,
  packetId = null,
  hubUrl = env.GLOBAL_EVO_HUB_URL,
  hubToken = env.GLOBAL_EVO_HUB_TOKEN,
  fetchImpl = globalThis.fetch
} = {}) {
  const paths = getEvoGlobalNodePaths({ rootDir });
  const packet = findPacket(paths, packetId);
  const baseReceipt = {
    id: `global_evo_submit_${Date.now()}`,
    packetId: packet?.packetId || packetId || null,
    createdAt: stamp()
  };

  const blockers = [
    !packet ? 'Contribution packet not found.' : null,
    packet && packet.truthState !== 'GLOBAL_CONTRIBUTION_PACKET_READY' ? 'Contribution packet is not ready.' : null,
    packet && packet.signatureTruthState !== 'GLOBAL_NODE_PACKET_SIGNED' ? 'Contribution packet must be signed before hub submission.' : null,
    !hubUrl ? 'GLOBAL_EVO_HUB_URL missing.' : null,
    !hubToken ? 'GLOBAL_EVO_HUB_TOKEN missing.' : null,
    typeof fetchImpl !== 'function' ? 'A fetch implementation is required.' : null
  ].filter(Boolean);

  if (blockers.length) {
    const receipt = {
      ...baseReceipt,
      success: false,
      truthState: 'GLOBAL_HUB_SUBMISSION_BLOCKED',
      blockers
    };
    writeJson(path.join(paths.receipts, `${receipt.id}.json`), receipt);
    return { receipt };
  }

  const url = `${String(hubUrl).replace(/\/+$/, '')}/api/evo-global/contributions`;
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packet)
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || `Hub responded with HTTP ${response.status}`);
    }
    const receipt = {
      ...baseReceipt,
      success: true,
      truthState: 'GLOBAL_CONTRIBUTION_SUBMITTED',
      hubUrl: url,
      hubReceiptId: payload?.id || payload?.receiptId || null,
      submittedAt: stamp(),
      response: redactTrainingValue(payload || {})
    };
    writeJson(path.join(paths.receipts, `${receipt.id}.json`), receipt);
    return { receipt };
  } catch (error) {
    const receipt = {
      ...baseReceipt,
      success: false,
      truthState: 'GLOBAL_HUB_SUBMISSION_FAILED',
      error: error.message || String(error)
    };
    writeJson(path.join(paths.receipts, `${receipt.id}.json`), receipt);
    return { receipt };
  }
}
