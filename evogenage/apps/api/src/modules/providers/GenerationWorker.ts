import { PrismaClient } from '@prisma/client';
import { ReplicateProvider } from './ReplicateProvider';
import { CreditLedgerService } from '../credits/CreditLedgerService';

const prisma = new PrismaClient();
const provider = new ReplicateProvider();
const ledger = new CreditLedgerService();

/**
 * EVOGENAGE — GENERATION WORKER (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * The background process that physically executes generation.
 * Handles provider communication, asset storage, and credit finalization.
 */

export class GenerationWorker {
  async processJob(jobId: string) {
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: { user: true }
    });

    if (!job || job.status !== 'QUEUED') {
      console.log(`⚠️ [Worker] Job ${jobId} is not in QUEUED state. Skipping.`);
      return;
    }

    try {
      // 1. DISPATCH: Call the physical provider
      await prisma.generationJob.update({ where: { id: jobId }, data: { status: 'GENERATING' } });
      
      const response = await provider.generateImage({
        prompt: job.promptCompiled || job.promptRaw,
        width: 1024,
        height: 1024,
        steps: 50,
        assetType: job.assetType
      });

      // 2. STORE: Manifest the asset in physical storage
      await prisma.generationJob.update({ where: { id: jobId }, data: { status: 'UPLOADING' } });
      
      const asset = await prisma.generatedAsset.create({
        data: {
          userId: job.userId,
          jobId: job.id,
          url: response.assetUrl,
          metadata: response.providerMetadata,
          approvalStatus: 'PENDING'
        }
      });

      // 3. FINALIZE: Mark as completed
      await prisma.generationJob.update({ where: { id: jobId }, data: { status: 'COMPLETED' } });
      console.log(`✅ [Worker] Job ${jobId} COMPLETED. Asset generated: ${asset.id}`);

      return asset;
    } catch (error) {
      console.error(`❌ [Worker] Job ${jobId} failed during execution: ${error.message}`);
      
      // On failure, release the reserved credits
      await ledger.releaseReservation(job.userId, job.creditCost, job.id);
      
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', error: error.message }
      });
    }
  }
}
