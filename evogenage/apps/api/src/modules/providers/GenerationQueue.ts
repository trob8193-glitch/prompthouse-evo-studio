import { PrismaClient, JobStatus } from '@prisma/client';
import { PromptForgeCompiler } from '../generation/PromptForgeCompiler';
import { SafetyFilter } from '../generation/SafetyFilter';
import { CreditLedgerService } from '../credits/CreditLedgerService';

const prisma = new PrismaClient();
const compiler = new PromptForgeCompiler();
const safety = new SafetyFilter();
const ledger = new CreditLedgerService();

/**
 * EVOGENAGE — GENERATION JOB QUEUE (SOVEREIGN)
 * ═══════════════════════════════════════════════════════════════
 * Manages the production lifecycle of image generation jobs.
 * Enforces Truth, Safety, and Credit Gating at every step.
 */

export class GenerationQueue {
  async createJob(params: {
    userId: string;
    promptRaw: string;
    assetType: string;
    stylePresetId?: string;
    canonProfileId?: string;
  }) {
    const { userId, promptRaw, assetType, stylePresetId, canonProfileId } = params;

    // 1. PHYSICAL START: Create the job record
    const job = await prisma.generationJob.create({
      data: {
        userId,
        promptRaw,
        assetType,
        stylePresetId,
        canonProfileId,
        status: 'CREATED',
      },
    });

    try {
      // 2. COMPILE: Perform Denoising Pass
      await this.updateStatus(job.id, 'COMPILING');
      const compiled = await compiler.compile({ promptRaw, assetType, stylePresetId, canonProfileId });
      
      // 3. SAFETY: Scan for violations
      await this.updateStatus(job.id, 'SAFETY_CHECKING');
      const { isSafe, findings } = await safety.scan(compiled.promptCompiled);
      
      if (!isSafe) {
        await this.failJob(job.id, `SAFETY_BLOCK: ${findings[0].message}`);
        return;
      }

      // 4. CREDITS: Reserve the latent cost
      await this.updateStatus(job.id, 'AWAITING_CREDIT_RESERVATION');
      await ledger.reserveCredits(userId, compiled.estimatedCredits, job.id);
      
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: 'CREDIT_RESERVED',
          promptCompiled: compiled.promptCompiled,
          creditCost: compiled.estimatedCredits,
        },
      });

      // 5. QUEUE: Ready for the Worker pass
      await this.updateStatus(job.id, 'QUEUED');
      
      return job.id;
    } catch (error) {
      await this.failJob(job.id, error.message);
      throw error;
    }
  }

  private async updateStatus(jobId: string, status: JobStatus) {
    return await prisma.generationJob.update({
      where: { id: jobId },
      data: { status },
    });
  }

  private async failJob(jobId: string, error: string) {
    console.error(`❌ [GenerationQueue] Job ${jobId} FAILED: ${error}`);
    return await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', error },
    });
  }
}
