import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getEvoWorkMemoryContract, getEvoWorkMemoryStatus } from './EvoWorkMemoryEngine.js';
import { getFrontierIntelligenceSafetyContract, evaluateFrontierIntelligenceSafety } from './FrontierIntelligenceSafetyGate.js';
import { getAppIntelligenceContract, ingestAppIntelligenceSource } from './EvoAppIntelligenceBridge.js';
import { getEvoLlmPaths } from './EvoLlmPaths.js';

const VERSION = '1.0.0';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

export class EvoIntelligenceTetherCore {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.paths = getEvoLlmPaths({ rootDir });
  }

  getTetherStatus() {
    return {
      truthState: 'EVO_INTELLIGENCE_TETHER_ONLINE',
      version: VERSION,
      appIntelligenceStatus: getAppIntelligenceContract(),
      workMemoryStatus: getEvoWorkMemoryContract(),
      frontierSafetyStatus: getFrontierIntelligenceSafetyContract(),
    };
  }

  async cycleAppIntelligenceSource(sourceData) {
    // 1. Ingest via App Intelligence
    const appIntelResult = ingestAppIntelligenceSource({ rootDir: this.rootDir, source: sourceData });
    
    // 2. Determine if we need to request frontier execution
    if (appIntelResult.acceptedForTraining && appIntelResult.blueprint) {
      const safetyReq = {
        summary: `Autonomous integration of feature: ${appIntelResult.blueprint.featureTarget}`,
        autonomous: true,
        tests: ['npm run build'],
        rollbackPlan: 'Git reset hard to last known Evo baseline',
        receiptPlan: 'Write Evo Work Memory receipt',
        planOnly: true // Default to plan-only for safety
      };

      const safetyDecision = evaluateFrontierIntelligenceSafety({ rootDir: this.rootDir, request: safetyReq });
      
      return {
        success: true,
        truthState: 'APP_INTELLIGENCE_CYCLE_COMPLETE',
        blueprint: appIntelResult.blueprint,
        safetyDecision: safetyDecision
      };
    }
    
    return { success: false, truthState: 'APP_INTELLIGENCE_REJECTED', data: appIntelResult };
  }
}

export function getMegaTetherStatus(rootDir = process.cwd()) {
  const tether = new EvoIntelligenceTetherCore(rootDir);
  return tether.getTetherStatus();
}
