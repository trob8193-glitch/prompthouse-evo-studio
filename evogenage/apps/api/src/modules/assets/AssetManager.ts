import { PrismaClient } from '@prisma/client';
import { CreditLedgerService } from '../credits/CreditLedgerService';

const prisma = new PrismaClient();
const ledger = new CreditLedgerService();

/**
 * EVOGENAGE — ASSET MANAGER (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Handles asset lifecycle: approval, rejection, and deletion.
 * Enforces the final credit charge upon approval.
 */

export class AssetManager {
  /**
   * Approve an asset. This triggers the final credit charge.
   */
  async approveAsset(assetId: string) {
    return await prisma.$transaction(async (tx) => {
      const asset = await tx.generatedAsset.findUnique({
        where: { id: assetId },
        include: { job: true }
      });

      if (!asset || asset.approvalStatus !== 'PENDING') {
        throw new Error('ASSET_NOT_ELIGIBLE: Asset must be in PENDING state.');
      }

      // Update asset status
      await tx.generatedAsset.update({
        where: { id: assetId },
        data: { approvalStatus: 'APPROVED' }
      });

      // Finalize the credit charge
      await ledger.finalizeCharge(asset.userId, asset.job.creditCost, asset.job.id);
      
      console.log(`✅ [AssetManager] Asset ${assetId} APPROVED and charged.`);
      return { status: 'APPROVED' };
    });
  }

  /**
   * Reject an asset. This releases the reserved credits.
   */
  async rejectAsset(assetId: string) {
    return await prisma.$transaction(async (tx) => {
      const asset = await tx.generatedAsset.findUnique({
        where: { id: assetId },
        include: { job: true }
      });

      if (!asset || asset.approvalStatus !== 'PENDING') {
        throw new Error('ASSET_NOT_ELIGIBLE: Asset must be in PENDING state.');
      }

      // Update asset status
      await tx.generatedAsset.update({
        where: { id: assetId },
        data: { approvalStatus: 'REJECTED' }
      });

      // Release the credit reservation
      await ledger.releaseReservation(asset.userId, asset.job.creditCost, asset.job.id);
      
      console.log(`🚫 [AssetManager] Asset ${assetId} REJECTED and credits released.`);
      return { status: 'REJECTED' };
    });
  }
}
