export const CREATIVE_LAYER_NAME = 'QuadBrain Creative Layer';

export const CREATIVE_ENGINES = Object.freeze({
  EVO_DIFFUSER: 'evo_diffuser',
  EVO_PIXEL: 'evo_pixel',
  IMAGE_GENERATOR: 'image_generator',
  STABLE_DIFFUSION: 'stablediffusion',
  DALLE: 'dalle',
});

export const ASSET_REQUEST_STATUS = Object.freeze({
  QUEUED: 'queued',
  GENERATING: 'generating',
  GENERATED: 'generated',
  NEEDS_REVIEW: 'needs_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FAILED: 'failed',
  PUBLISHED: 'published',
});

export const ASSET_RECEIPT_TYPES = Object.freeze({
  REQUEST_CREATED: 'request_created',
  ENGINE_SELECTED: 'engine_selected',
  GENERATION_STARTED: 'generation_started',
  GENERATION_COMPLETED: 'generation_completed',
  GENERATION_FAILED: 'generation_failed',
  ASSET_APPROVED: 'asset_approved',
  ASSET_REJECTED: 'asset_rejected',
  ASSET_PUBLISHED: 'asset_published',
});

export function createAssetRequest(input = {}) {
  const now = new Date().toISOString();
  const requestId = input.requestId || `asset_req_${Date.now()}`;
  return {
    requestId,
    tenantId: input.tenantId || 'tenant_default',
    projectId: input.projectId || 'studio-core',
    userId: input.userId || 'system',
    assetType: input.assetType || 'general_asset',
    goal: input.goal || 'Create a studio asset.',
    prompt: String(input.prompt || '').trim(),
    styleProfile: input.styleProfile || 'evo-premium',
    preferredEngine: input.preferredEngine || CREATIVE_ENGINES.EVO_DIFFUSER,
    selectedEngine: input.selectedEngine || null,
    needsApproval: Boolean(input.needsApproval ?? true),
    status: input.status || ASSET_REQUEST_STATUS.QUEUED,
    metadata: input.metadata || {},
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export function createAssetRecord(input = {}) {
  const now = new Date().toISOString();
  return {
    assetId: input.assetId || `asset_${Date.now()}`,
    requestId: input.requestId,
    tenantId: input.tenantId || 'tenant_default',
    projectId: input.projectId || 'studio-core',
    engine: input.engine || CREATIVE_ENGINES.IMAGE_GENERATOR,
    fileUrl: input.fileUrl || null,
    thumbnailUrl: input.thumbnailUrl || input.fileUrl || null,
    variantType: input.variantType || 'primary',
    approved: Boolean(input.approved),
    rejected: Boolean(input.rejected),
    published: Boolean(input.published),
    tags: Array.isArray(input.tags) ? input.tags : [],
    metadata: input.metadata || {},
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export function createAssetReceipt(input = {}) {
  return {
    receiptId: input.receiptId || `asset_receipt_${Date.now()}`,
    requestId: input.requestId || null,
    assetId: input.assetId || null,
    tenantId: input.tenantId || 'tenant_default',
    projectId: input.projectId || 'studio-core',
    engineUsed: input.engineUsed || null,
    actionType: input.actionType || ASSET_RECEIPT_TYPES.REQUEST_CREATED,
    status: input.status || 'recorded',
    truthState: input.truthState || 'VERIFIED',
    message: input.message || '',
    approvedBy: input.approvedBy || null,
    notes: input.notes || '',
    generatedAt: input.generatedAt || new Date().toISOString(),
    evidence: input.evidence || {},
  };
}

export function validateAssetRequest(input = {}) {
  const errors = [];
  if (!String(input.prompt || '').trim()) errors.push('Asset request prompt is required.');
  if (!String(input.projectId || '').trim()) errors.push('projectId is required.');
  if (!String(input.assetType || '').trim()) errors.push('assetType is required.');
  return { valid: errors.length === 0, errors };
}
