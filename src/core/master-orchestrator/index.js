import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { AUTHORITY_MAP, MASTER_KERNEL_NAME } from './authority-map.js';
import { getActiveModel, getCheapestModelFor, getMostPowerfulModel } from '../ai/ModelRegistry.js';

function readScripts(rootDir) {
  const file = join(rootDir, 'package.json');
  if (!existsSync(file)) return {};
  try { return JSON.parse(readFileSync(file, 'utf8')).scripts || {}; } catch { return {}; }
}

function run(command) {
  try {
    const output = execSync(command, { cwd: process.cwd(), encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
    return { command, status: 'PASS', output: output.slice(-1600) };
  } catch (error) {
    return { command, status: 'FAIL', output: String(error.stdout || '').slice(-1600), error: String(error.stderr || error.message || '').slice(-1600) };
  }
}

function writeReceipt(rootDir, receipt) {
  const file = join(rootDir, '.prompthouse-data', 'master-orchestrator', `${receipt.id}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(receipt, null, 2), 'utf8');
  return file;
}

export class EvoCoreMasterOrchestrationKernel {
  constructor({ rootDir = process.cwd() } = {}) {
    this.rootDir = rootDir;
  }

  brains() {
    const scripts = readScripts(this.rootDir);
    const scriptMap = {
      'platform-sentinel': 'platform:strict',
      'self-evolution': 'evolve:status',
      'module-maturity': 'maturity:check',
      'cost-firewall': 'cost:check',
      convergence: 'convergence:daemon',
      crucible: 'crucible',
      singularity: 'singularity',
      omni: 'omni:orchestrator',
      'evo-llm': 'evo:train-status'
    };
    return AUTHORITY_MAP.map(item => ({
      ...item,
      script: scriptMap[item.id] || null,
      available: item.id === 'spinecore' || item.id === 'model-registry' || Boolean(scripts[scriptMap[item.id]])
    }));
  }

  modelState() {
    return {
      active: getActiveModel(),
      cheapestCode: getCheapestModelFor('code'),
      cheapestVision: getCheapestModelFor('vision'),
      mostPowerful: getMostPowerfulModel()
    };
  }

  status() {
    const sentinel = run('npm run platform:strict');
    return {
      generatedAt: new Date().toISOString(),
      kernel: MASTER_KERNEL_NAME,
      truthLabel: sentinel.status === 'PASS' ? 'MASTER_READY' : 'BLOCKED_BY_SENTINEL',
      sentinel,
      modelState: this.modelState(),
      brains: this.brains(),
      authorityMap: AUTHORITY_MAP,
      rule: 'All autonomous studio work must produce receipts, use governed model routing, and pass Platform Sentinel before release claims.'
    };
  }

  planMission(mission = {}) {
    const id = `master_${Date.now()}`;
    const text = String(`${mission.title || ''} ${mission.objective || ''}`).toLowerCase();
    const route = text.includes('converge') || text.includes('amplify')
      ? ['convergence', 'module-maturity', 'model-registry', 'platform-sentinel']
      : text.includes('repair') || text.includes('reinvent')
        ? ['self-evolution', 'crucible', 'model-registry', 'platform-sentinel']
        : text.includes('vision') || text.includes('image')
          ? ['model-registry', 'evo-llm', 'platform-sentinel']
          : ['omni', 'module-maturity', 'model-registry', 'platform-sentinel'];
    const highRisk = /main branch|merge|deploy|provider|stripe|billing|auth|credential|readiness/i.test(text);
    const receipt = {
      id,
      createdAt: new Date().toISOString(),
      truthLabel: highRisk ? 'OWNER_APPROVAL_REQUIRED' : 'MISSION_PLANNED',
      mission,
      route,
      risk: highRisk ? 'HIGH' : 'LOW',
      modelState: this.modelState(),
      requiredProof: ['npm run platform:strict', 'npm run maturity:check', 'npm run audit:imports', 'npm run audit:css']
    };
    writeReceipt(this.rootDir, receipt);
    return receipt;
  }
}

export { AUTHORITY_MAP } from './authority-map.js';
