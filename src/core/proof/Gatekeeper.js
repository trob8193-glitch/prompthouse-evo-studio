import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../maturity/index.js';
import { evaluateCostVelocity } from '../gateway/CostVelocityMonitor.js';
import { runAuditorReview } from '../agents/AuditorBot.js';
import { Log } from '../autonomy/SovereignLogger.js';
import { createProofManifest, signProofManifest } from './ProofManifest.js';
import { evaluatePromotionPolicy } from './PromotionPolicy.js';
import { saveReview } from './ReviewStore.js';

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
    const costVelocity = evaluateCostVelocity({ rootDir, orgId: 'studio_owner' });

    const issues = [...policy.issues];
    if (!costVelocity.allowed) issues.push(...costVelocity.issues);

    const draftManifest = createProofManifest({
      moduleId,
      targetStage: policy.stage,
      maturity: module,
      maturityReceipt: maturityReceipt.file,
      costVelocity,
      rollbackRef,
      issues,
      evidence: {
        requiredScore: policy.requiredScore,
        moduleCount: maturityReport.moduleCount,
        averageScore: maturityReport.averageScore,
        truthState: maturityReport.truthState
      }
    });

    const signedManifest = signProofManifest(draftManifest);
    const auditor = runAuditorReview({ module, manifest: signedManifest });
    const finalIssues = [...issues, ...auditor.issues];

    const manifest = finalIssues.length === issues.length
      ? { ...signedManifest, auditor }
      : signProofManifest({ ...draftManifest, auditor, issues: finalIssues });

    const stored = saveReview({ rootDir, review: manifest });

    return {
      approved: finalIssues.length === 0,
      truthState: finalIssues.length ? 'PROMOTION_REVIEW_REQUIRED' : 'PROMOTION_APPROVED',
      module,
      policy,
      costVelocity,
      auditor,
      issues: finalIssues,
      reviewFile: stored.file,
      manifest
    };
  }

  static async promote(moduleId, targetStage = 'production', options = {}) {
    return Gatekeeper.review({ ...options, moduleId, targetStage });
  }
}

export default Gatekeeper;
