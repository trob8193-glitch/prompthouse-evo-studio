import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../maturity/index.js';
import { Log } from '../autonomy/SovereignLogger.js';
import { createProofManifest, signProofManifest } from './ProofManifest.js';
import { evaluatePromotionPolicy } from './PromotionPolicy.js';

export class Gatekeeper {
  static findModule(report, moduleId) {
    const normalized = String(moduleId || '').toLowerCase();
    return report.modules.find(module =>
      String(module.id).toLowerCase() === normalized ||
      String(module.name).toLowerCase() === normalized
    );
  }

  static async review({ rootDir = process.cwd(), moduleId, targetStage = 'production', rollbackRef = null } = {}) {
    if (!moduleId) throw new Error('Gatekeeper review requires moduleId.');
    Log.info(`[Gatekeeper] Reviewing ${moduleId} for ${targetStage}`);

    const maturityReport = runModuleMaturityAudit({ rootDir });
    const module = Gatekeeper.findModule(maturityReport, moduleId);
    const policy = evaluatePromotionPolicy({ module, targetStage, rollbackRef });
    const maturityReceipt = writeModuleMaturityReceipt({ rootDir, report: maturityReport });

    const manifest = signProofManifest(createProofManifest({
      moduleId,
      targetStage: policy.stage,
      maturity: module,
      maturityReceipt: maturityReceipt.file,
      rollbackRef,
      issues: policy.issues,
      evidence: {
        requiredScore: policy.requiredScore,
        moduleCount: maturityReport.moduleCount,
        averageScore: maturityReport.averageScore,
        truthState: maturityReport.truthState
      }
    }));

    return {
      approved: policy.approved,
      truthState: policy.approved ? 'PROMOTION_APPROVED' : 'PROMOTION_REVIEW_REQUIRED',
      module,
      policy,
      issues: policy.issues,
      manifest
    };
  }

  static async promote(moduleId, targetStage = 'production', options = {}) {
    return Gatekeeper.review({ ...options, moduleId, targetStage });
  }
}

export default Gatekeeper;
