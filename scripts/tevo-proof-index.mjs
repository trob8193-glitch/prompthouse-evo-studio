import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const proofRoot = path.join(root, '.prompthouse-data', 'proof');
const outputRoot = path.join(root, '.prompthouse-data', 'tevo-evidence');
const runId = 'proof-index-' + Date.now() + '-' + crypto.randomUUID().slice(0, 8);
const outputDir = path.join(outputRoot, runId);
mkdirSync(outputDir, { recursive: true });

const jsonFiles = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.json')) jsonFiles.push(full);
  }
}
walk(proofRoot);

const receipts = [];
for (const file of jsonFiles) {
  try {
    const raw = readFileSync(file);
    const value = JSON.parse(raw.toString('utf8'));
    if (value && typeof value === 'object') receipts.push({
      file: path.relative(root, file),
      sha256: crypto.createHash('sha256').update(raw).digest('hex'),
      value
    });
  } catch {
    // Invalid or non-proof JSON is not converted into evidence.
  }
}

const productionReceipts = receipts.filter(({ value }) =>
  typeof value.proofType === 'string' || typeof value.truthState === 'string' ||
  typeof value.verdict === 'string' || Array.isArray(value.results) || Array.isArray(value.commands)
);

const result = {
  schemaVersion: 1,
  runId,
  generatedAt: new Date().toISOString(),
  evidencePolicy: 'REAL_EXECUTION_ONLY',
  fabricatedMetrics: false,
  receiptCount: productionReceipts.length,
  receipts: productionReceipts.map(({ file, sha256, value }) => ({
    file, sha256, proofType: value.proofType ?? null, truthState: value.truthState ?? null,
    verdict: value.verdict ?? null, passed: typeof value.passed === 'boolean' ? value.passed : null,
    durationMs: Number.isFinite(value.durationMs) ? value.durationMs : null
  }))
};

const observedRuns = productionReceipts.filter(({ value }) => typeof value.passed === 'boolean');
const passedRuns = observedRuns.filter(({ value }) => value.passed === true).length;
const ratio = (n, d) => d > 0 ? n / d : null;
result.metrics = {
  verified_proof_run_success_rate: { numerator: passedRuns, denominator: observedRuns.length, value: ratio(passedRuns, observedRuns.length), status: observedRuns.length ? 'MEASURED' : 'NOT_PROVEN' },
  evidence_coverage: { numerator: productionReceipts.length, denominator: productionReceipts.length, value: productionReceipts.length ? 1 : null, status: productionReceipts.length ? 'MEASURED' : 'NOT_PROVEN' }
};

result.notProven = [
  'autonomous_build_success_rate', 'self_repair_rate', 'regression_free_change_rate',
  'human_intervention_rate', 'cost_per_successful_output', 'time_to_production',
  '3d_generation_success_rate', 'security_boundary_failure_rate', 'scale_reliability',
  'retention_and_revenue'
];

const indexPath = path.join(outputDir, 'evidence-index.json');
writeFileSync(indexPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ ...result, indexPath: path.relative(root, indexPath) }, null, 2));
process.exitCode = productionReceipts.length > 0 && observedRuns.length > 0 ? 0 : 1;