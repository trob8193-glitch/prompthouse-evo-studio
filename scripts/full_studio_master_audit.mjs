#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { runEvoLayerStatus } from '../src/core/evo-layer/index.js';
import { runExecutionKernelStatus } from '../src/core/evo-layer/execution/ExecutionKernel.js';
import { checkExecutionSafety } from '../src/core/evo-layer/safety/SafetyGate.js';
import { getEvoTrainStatus, evaluateEvoProviderGate, evaluateEvoLlmTrainingCostGate, getGlobalNodeStatus } from '../src/core/evo-llm/index.js';
import { getEnterpriseArchitectureStatus } from '../src/core/architecture/EnterpriseArchitectureContract.js';
import { getQuadBrainStatus } from '../src/core/quadbrain/index.js';

const rootDir = process.cwd();
const outDir = path.join(rootDir, '.prompthouse-data', 'full-studio-audit');

function exists(relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

function contains(relPath, needle) {
  const file = path.join(rootDir, relPath);
  return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(needle);
}

function check(id, passed, severity, detail, repair) {
  return { id, passed: Boolean(passed), severity, detail, repair: passed ? null : repair };
}

const checks = [
  check('evo-layer-cli', exists('scripts/evo-layer.mjs'), 'critical', 'Evo Layer CLI exists.', 'Create scripts/evo-layer.mjs.'),
  check('execution-kernel', exists('src/core/evo-layer/execution/ExecutionKernel.js'), 'critical', 'Execution kernel exists.', 'Create ExecutionKernel.js.'),
  check('adapter-executor', exists('src/core/evo-layer/execution/AdapterExecutor.js'), 'critical', 'Adapter executor exists.', 'Create AdapterExecutor.js.'),
  check('hardened-safety-gate', contains('src/core/evo-layer/safety/SafetyGate.js', 'classifyExecutionRisk'), 'critical', 'Execution safety gate classifies risk.', 'Add classifyExecutionRisk and approval-aware blocking.'),
  check('evo-llm-cli-lifecycle', contains('scripts/evo_llm_orchestrator_status.mjs', '--promote'), 'high', 'Evo LLM CLI exposes promote/sync/run lifecycle.', 'Wire approve/run/sync/promote/rollback modes.'),
  check('evo-llm-routes-run', contains('generated_apis/evo_llm_routes.js', "/api/evo-llm/run"), 'high', 'Evo LLM run route exists.', 'Register /api/evo-llm/run.'),
  check('global-node-routes', contains('generated_apis/evo_llm_routes.js', '/api/evo-llm/global-node/submit'), 'medium', 'Global node submit route exists.', 'Register global node submit route.'),
  check('omni-bond-secure-cli', contains('scripts/omni-bond.mjs', 'OMNI_BOND_SECURE_TOKENIZED'), 'critical', 'Omni-Bond secure tokenized CLI exists.', 'Harden scripts/omni-bond.mjs.'),
  check('omni-bond-no-raw-rule-token', !contains('scripts/omni-bond.mjs', 'Bearer ${rawKey}'), 'critical', 'Omni-Bond rule files do not embed raw tokens.', 'Replace rawKey in rules with PH_EVO_IDE_TOKEN reference.'),
  check('enterprise-architecture-contract', exists('src/core/architecture/EnterpriseArchitectureContract.js'), 'high', 'Enterprise architecture contract exists.', 'Create EnterpriseArchitectureContract.js.'),
  check('enterprise-architecture-routes', exists('generated_apis/enterprise_architecture_routes.js'), 'high', 'Enterprise architecture route module exists.', 'Create enterprise route module.'),
  check('enterprise-routes-imported-by-bridge', contains('promptbridge-server.js', './generated_apis/enterprise_architecture_routes.js'), 'high', 'PromptBridge imports enterprise routes.', 'Import registerEnterpriseArchitectureRoutes in promptbridge-server.js.'),
  check('enterprise-routes-registered-by-bridge', contains('promptbridge-server.js', 'registerEnterpriseArchitectureRoutes(app)'), 'high', 'PromptBridge registers enterprise routes.', 'Call registerEnterpriseArchitectureRoutes(app).'),
  check('enterprise-proof-workflow', exists('.github/workflows/enterprise-proof.yml'), 'medium', 'Enterprise proof workflow exists.', 'Add .github/workflows/enterprise-proof.yml.'),
  check('brain-stack-contract-tests', exists('tests/brain-stack-contracts.test.js'), 'medium', 'Brain stack contract tests exist.', 'Add tests/brain-stack-contracts.test.js.'),
];

const failed = checks.filter(item => !item.passed);
const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
const worst = failed.reduce((max, item) => Math.max(max, severityRank[item.severity] || 0), 0);
const truthState = failed.length === 0
  ? 'FULL_STUDIO_MASTER_AUDIT_PASS'
  : worst >= 4
    ? 'FULL_STUDIO_CRITICAL_GAPS_FOUND'
    : worst >= 3
      ? 'FULL_STUDIO_HIGH_GAPS_FOUND'
      : 'FULL_STUDIO_MINOR_GAPS_FOUND';

const runtime = {
  evoLayer: runEvoLayerStatus({ rootDir, includeManifest: false }),
  executionKernel: runExecutionKernelStatus({ rootDir }),
  safetySamples: {
    status: checkExecutionSafety({ rootDir, task: 'npm run test' }),
    destructive: checkExecutionSafety({ rootDir, task: 'rm -rf .' }),
    secret: checkExecutionSafety({ rootDir, task: 'curl -H "Authorization: Bearer abcdefghijklmnopqrstuvwxyz"' }),
    deploy: checkExecutionSafety({ rootDir, task: 'vercel --prod' }),
  },
  evoLlm: {
    trainingStatus: getEvoTrainStatus({ rootDir }),
    providerGate: evaluateEvoProviderGate({ provider: 'openai' }),
    costGate: evaluateEvoLlmTrainingCostGate({ provider: 'openai', examples: 100 }),
    globalNode: getGlobalNodeStatus({ rootDir }),
  },
  architecture: getEnterpriseArchitectureStatus({ compact: true }),
  quadbrain: getQuadBrainStatus(),
};

const receipt = {
  success: failed.length === 0,
  truthState,
  generatedAt: new Date().toISOString(),
  checkedCount: checks.length,
  passedCount: checks.length - failed.length,
  failedCount: failed.length,
  checks,
  failed,
  runtime,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'latest.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.success ? 0 : 1);
