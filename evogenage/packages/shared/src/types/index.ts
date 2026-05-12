/**
 * EVOGENAGE — SHARED TYPES (CORE PROTOCOL)
 * ═══════════════════════════════════════════════════════════════
 * Truth-aligned types for Frontend/Backend parity.
 */

export type UserRole = 'USER' | 'CREATOR' | 'DEVELOPER' | 'BUSINESS' | 'ADMIN' | 'SUPER_ADMIN';

export type JobStatus = 
  | 'CREATED' 
  | 'COMPILING' 
  | 'SAFETY_CHECKING' 
  | 'BLOCKED' 
  | 'AWAITING_CREDIT_RESERVATION' 
  | 'CREDIT_RESERVED' 
  | 'QUEUED' 
  | 'GENERATING' 
  | 'POST_PROCESSING' 
  | 'UPLOADING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditWallet {
  balance: number;
  reservedBalance: number;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  promptRaw: string;
  promptCompiled: string | null;
  assetType: string;
  creditCost: number;
  error: string | null;
  createdAt: string;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  metadata: Record<string, any>;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface VisualDnaProfile {
  preferredMood: string | null;
  density: string | null;
  primaryShape: string | null;
  colorBias: string | null;
}
