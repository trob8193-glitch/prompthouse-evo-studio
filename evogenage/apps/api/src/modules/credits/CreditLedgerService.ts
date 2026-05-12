import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * EVOGENAGE — SOVEREIGN LEDGER (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Enforces the physical truth of every credit transaction.
 * No mocks. No fake balances.
 */

export class CreditLedgerService {
  /**
   * Reserve credits before starting a generation job.
   * This locks the credits so they cannot be spent elsewhere.
   */
  async reserveCredits(userId: string, amount: number, jobId: string) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.creditWallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        throw new Error('INSUFFICIENT_CREDITS: Cannot reserve latent cost.');
      }

      // Update wallet balance and reserved balance
      await tx.creditWallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          reservedBalance: { increment: amount },
        },
      });

      // Log the reservation
      return await tx.creditLedger.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          type: 'credit_reserved',
          description: `Reservation for generation job: ${jobId}`,
          metadata: { jobId },
        },
      });
    });
  }

  /**
   * Finalize the charge after a successful generation.
   * Moves credits from 'reserved' to 'permanently deducted'.
   */
  async finalizeCharge(userId: string, amount: number, jobId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.creditWallet.update({
        where: { userId },
        data: {
          reservedBalance: { decrement: amount },
        },
      });

      return await tx.creditLedger.create({
        data: {
          walletId: (await tx.creditWallet.findUnique({ where: { userId } })).id,
          amount: 0, // Transaction already reflected in balance decrement during reservation
          type: 'credit_charged',
          description: `Finalized charge for job: ${jobId}`,
          metadata: { jobId },
        },
      });
    });
  }

  /**
   * Release reserved credits on job failure.
   * Restores the balance to the user's wallet.
   */
  async releaseReservation(userId: string, amount: number, jobId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.creditWallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          reservedBalance: { decrement: amount },
        },
      });

      return await tx.creditLedger.create({
        data: {
          walletId: (await tx.creditWallet.findUnique({ where: { userId } })).id,
          amount: amount,
          type: 'credit_released',
          description: `Refund for failed job: ${jobId}`,
          metadata: { jobId },
        },
      });
    });
  }
}
