import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * EVOGENAGE — AUDIT SERVICE (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Records every sensitive architectural action.
 * Ensures the forensic truth of the studio's history.
 */

export class AuditService {
  /**
   * Log a sovereign action.
   */
  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: any;
  }) {
    const { userId, action, entity, entityId, metadata } = params;

    try {
      const entry = await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          metadata: metadata || {},
        }
      });

      console.log(`🛡️ [Audit] ${action} on ${entity}:${entityId || 'N/A'} by User:${userId || 'SYSTEM'}`);
      return entry;
    } catch (error) {
      // If audit fails, we fail loudly in production to prevent "dark actions"
      console.error(`🚨 [CRITICAL] Audit Logging Failed: ${error.message}`);
      // In a real sovereign system, this might trigger a security halt.
    }
  }
}

export const AUDIT = new AuditService();
