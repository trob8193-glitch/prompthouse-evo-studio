import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getEvoWorkMemoryContract, getEvoWorkMemoryStatus, ingestEvoWorkMemory } from './EvoWorkMemoryEngine.js';
import { getFrontierIntelligenceSafetyContract, evaluateFrontierIntelligenceSafety, writeFrontierSafetyReceipt } from './FrontierIntelligenceSafetyGate.js';
import { getAppIntelligenceContract, ingestAppIntelligenceSource, buildAppIntelligenceDataset } from './EvoAppIntelligenceBridge.js';
import { getEvoLlmPaths, ensureEvoLlmDirs } from './EvoLlmPaths.js';

const VERSION = '1.1.0';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function nowId(prefix) {
  return `${prefix}_${Date.now()}_${hash(prefix)}`;
}

export class EvoIntelligenceTetherCore {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.paths = getEvoLlmPaths({ rootDir });
    this.tetherDir = path.join(this.paths.base, 'intelligence-tether');
    this.receiptDir = path.join(this.paths.receipts, 'intelligence-tether');
  }

  getTetherStatus() {
    return {
      truthState: 'EVO_INTELLIGENCE_TETHER_ONLINE',
      version: VERSION,
      appIntelligenceStatus: getAppIntelligenceContract(),
      workMemoryStatus: getEvoWorkMemoryContract(),
      workMemoryRuntimeStatus: getEvoWorkMemoryStatus({ rootDir: this.rootDir }),
      frontierSafetyStatus: getFrontierIntelligenceSafetyContract(),
      closedLoopMode: 'SAFE_PLAN_AND_PROOF_ONLY',
      files: {
        tetherDir: path.relative(this.rootDir, this.tetherDir),
        receiptDir: path.relative(this.rootDir, this.receiptDir)
      }
    };
  }

  writeTetherReceipt(type, payload) {
    ensureEvoLlmDirs({ rootDir: this.rootDir });
    ensureDir(this.receiptDir);
    const receipt = {
      id: nowId('tether_receipt'),
      type,
      createdAt: new Date().toISOString(),
      truthState: 'EVO_INTELLIGENCE_TETHER_RECEIPT_WRITTEN',
      payload
    };
    const file = path.join(this.receiptDir, `${receipt.id}.json`);
    writeJson(file, receipt);
    return { file, receipt };
  }

  createSafeEvolutionPlan({ sourceData = {}, intent = 'app-intelligence-cycle', tests = ['npm run build', 'npm run verify:studio'], scope = 'sandbox' } = {}) {
    const safetyReq = {
      summary: `Safe autonomous evolution plan for ${intent}`,
      autonomous: true,
      mode: 'plan',
      planOnly: true,
      workspaceScope: scope,
      tests,
      rollbackPlan: 'Do not promote. Revert generated plan or discard sandbox branch if verification fails.',
      receiptPlan: 'Write tether, frontier safety, work memory, and audit receipts before promotion.',
      humanReviewRequired: true,
      payload: sourceData
    };
    const safetyDecision = evaluateFrontierIntelligenceSafety({ rootDir: this.rootDir, request: safetyReq });
    const safetyReceipt = writeFrontierSafetyReceipt({ rootDir: this.rootDir, decision: safetyDecision, payload: { intent, sourceData } });
    const plan = {
      id: nowId('safe_evolution_plan'),
      createdAt: new Date().toISOString(),
      truthState: safetyDecision.allowed ? 'SAFE_EVOLUTION_PLAN_READY' : 'SAFE_EVOLUTION_PLAN_BLOCKED',
      intent,
      scope,
      sourceData,
      safetyDecision,
      safetyReceipt,
      requiredPromotionProof: [
        'frontier safety decision allowed',
        'work memory lesson written',
        'app intelligence dataset rebuilt when source is accepted',
        'npm run build passes locally',
        'npm run verify:studio passes locally',
        'audit receipt written',
        'rollback note attached',
        'human review complete for high-risk changes'
      ],
      nextCommands: [
        'node scripts/frontier_safety_gate.mjs --status',
        'node scripts/evo_work_memory.mjs --status',
        'node scripts/evo_app_intelligence.mjs --cycle-test',
        'node scripts/audit_intelligence_stack.mjs',
        'npm run build',
        'npm run verify:studio'
      ]
    };
    ensureDir(this.tetherDir);
    const planFile = path.join(this.tetherDir, `${plan.id}.json`);
    writeJson(planFile, plan);
    const tetherReceipt = this.writeTetherReceipt('safe_evolution_plan_receipt', { planFile: path.relative(this.rootDir, planFile), plan });
    return { success: safetyDecision.allowed, plan, planFile, tetherReceipt };
  }

  async cycleAppIntelligenceSource(sourceData = {}) {
    const appIntelResult = ingestAppIntelligenceSource({ rootDir: this.rootDir, source: sourceData });
    const workMemory = ingestEvoWorkMemory({
      rootDir: this.rootDir,
      item: {
        sourceType: 'operator-note',
        module: 'intelligence-tether',
        intent: 'improve_learning_loop',
        summary: `Tether observed app-intelligence source: ${sourceData.summary || sourceData.featureTarget || 'unnamed source'}`,
        payload: { sourceData, appIntelResult },
        allowedForTraining: appIntelResult.acceptedForTraining !== false,
        tags: ['tether', 'app-intelligence', 'safe-evolution']
      }
    });
    const dataset = appIntelResult.acceptedForTraining ? buildAppIntelligenceDataset({ rootDir: this.rootDir }) : null;
    const safePlan = this.createSafeEvolutionPlan({
      sourceData: { sourceData, appIntelResult, dataset },
      intent: 'app-intelligence-cycle',
      tests: ['npm run build', 'npm run verify:studio', 'node scripts/audit_intelligence_stack.mjs'],
      scope: 'sandbox'
    });
    return {
      success: Boolean(appIntelResult.acceptedForTraining),
      truthState: appIntelResult.acceptedForTraining ? 'APP_INTELLIGENCE_SAFE_TETHER_CYCLE_COMPLETE' : 'APP_INTELLIGENCE_REJECTED',
      appIntelResult,
      workMemory,
      dataset,
      safePlan
    };
  }
}

export function getMegaTetherStatus(rootDir = process.cwd()) {
  const tether = new EvoIntelligenceTetherCore(rootDir);
  return tether.getTetherStatus();
}

export function createMegaTetherSafeEvolutionPlan(options = {}) {
  const tether = new EvoIntelligenceTetherCore(options.rootDir || process.cwd());
  return tether.createSafeEvolutionPlan(options);
}
