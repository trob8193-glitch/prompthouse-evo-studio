import { PrismaClient } from '@prisma/client';
import { ASSET_PACKS } from './PackRegistry';
import { GenerationQueue } from '../providers/GenerationQueue';
import { CreditLedgerService } from '../credits/CreditLedgerService';

const prisma = new PrismaClient();
const genQueue = new GenerationQueue();
const ledger = new CreditLedgerService();

/**
 * EVOGENAGE — ASSET PACK GENERATOR (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Orchestrates multi-job generation for coordinated packs.
 * Enforces atomic credit reservation for the entire collection.
 */

export class AssetPackGenerator {
  async generatePack(params: {
    userId: string;
    packId: string;
    canonProfileId?: string;
  }) {
    const { userId, packId, canonProfileId } = params;

    // 1. Load Blueprint
    const blueprint = ASSET_PACKS.find(p => p.id === packId);
    if (!blueprint) throw new Error('PACK_NOT_FOUND: Invalid pack ID.');

    // 2. Estimate Total Cost
    const totalCost = blueprint.itemCount * blueprint.baseCreditsPerItem;

    // 3. ATOMIC START: Create Collection Record
    const collection = await prisma.generatedAssetCollection.create({
      data: {
        userId,
        name: blueprint.name,
        metadata: { blueprintId: packId, totalItems: blueprint.itemCount },
        status: 'INITIALIZING'
      }
    });

    try {
      // 4. RESERVE: Lock credits for the entire pack
      await ledger.reserveCredits(userId, totalCost, collection.id);

      // 5. MANIFEST: Create individual generation jobs
      const jobPromises = [];
      for (let i = 0; i < blueprint.itemCount; i++) {
        jobPromises.push(genQueue.createJob({
          userId,
          promptRaw: `${blueprint.name} - Item ${i + 1}`,
          assetType: blueprint.assetType,
          stylePresetId: blueprint.stylePresetId,
          canonProfileId
        }));
      }

      const jobIds = await Promise.all(jobPromises);

      // 6. TRACK: Link jobs to collection
      await prisma.generatedAssetCollection.update({
        where: { id: collection.id },
        data: { 
          status: 'GENERATING',
          metadata: { ...collection.metadata as object, jobIds }
        }
      });

      console.log(`📦 [PackGenerator] Orchestrated ${blueprint.itemCount} jobs for collection ${collection.id}`);
      return collection.id;
    } catch (error) {
      console.error(`❌ [PackGenerator] Pack initialization failed: ${error.message}`);
      await prisma.generatedAssetCollection.update({
        where: { id: collection.id },
        data: { status: 'FAILED', error: error.message }
      });
      throw error;
    }
  }
}
