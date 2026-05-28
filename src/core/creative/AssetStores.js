import {
  ASSET_RECEIPT_TYPES,
  ASSET_REQUEST_STATUS,
  createAssetReceipt,
} from './AssetContracts.js';

const requestStore = new Map();
const assetStore = new Map();
const receiptStore = new Map();

export class AssetRequestService {
  create(request) {
    requestStore.set(request.requestId, request);
    return request;
  }

  update(requestId, patch = {}) {
    const existing = requestStore.get(requestId);
    if (!existing) return null;
    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    requestStore.set(requestId, next);
    return next;
  }

  get(requestId) {
    return requestStore.get(requestId) || null;
  }

  list({ projectId, tenantId, status, limit = 50 } = {}) {
    return [...requestStore.values()]
      .filter(item => !projectId || item.projectId === projectId)
      .filter(item => !tenantId || item.tenantId === tenantId)
      .filter(item => !status || item.status === status)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, limit);
  }
}

export class AssetLibraryService {
  create(asset) {
    assetStore.set(asset.assetId, asset);
    return asset;
  }

  update(assetId, patch = {}) {
    const existing = assetStore.get(assetId);
    if (!existing) return null;
    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    assetStore.set(assetId, next);
    return next;
  }

  get(assetId) {
    return assetStore.get(assetId) || null;
  }

  list({ projectId, tenantId, requestId, limit = 50 } = {}) {
    return [...assetStore.values()]
      .filter(item => !projectId || item.projectId === projectId)
      .filter(item => !tenantId || item.tenantId === tenantId)
      .filter(item => !requestId || item.requestId === requestId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, limit);
  }
}

export class AssetProofLedgerService {
  record(input = {}) {
    const receipt = createAssetReceipt(input);
    receiptStore.set(receipt.receiptId, receipt);
    return receipt;
  }

  list({ projectId, tenantId, requestId, assetId, limit = 50 } = {}) {
    return [...receiptStore.values()]
      .filter(item => !projectId || item.projectId === projectId)
      .filter(item => !tenantId || item.tenantId === tenantId)
      .filter(item => !requestId || item.requestId === requestId)
      .filter(item => !assetId || item.assetId === assetId)
      .sort((a, b) => String(b.generatedAt).localeCompare(String(a.generatedAt)))
      .slice(0, limit);
  }
}

export class AssetApprovalService {
  constructor({ requests, assets, ledger }) {
    this.requests = requests;
    this.assets = assets;
    this.ledger = ledger;
  }

  approve({ assetId, approvedBy = 'owner', notes = '' } = {}) {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Asset not found: ${assetId}`);
    const updatedAsset = this.assets.update(assetId, { approved: true, rejected: false });
    const updatedRequest = this.requests.update(asset.requestId, { status: ASSET_REQUEST_STATUS.APPROVED });
    const receipt = this.ledger.record({
      requestId: asset.requestId,
      assetId,
      tenantId: asset.tenantId,
      projectId: asset.projectId,
      engineUsed: asset.engine,
      actionType: ASSET_RECEIPT_TYPES.ASSET_APPROVED,
      status: ASSET_REQUEST_STATUS.APPROVED,
      message: 'Asset approved through QuadBrain Creative Layer.',
      approvedBy,
      notes,
      evidence: { assetId, requestId: asset.requestId },
    });
    return { asset: updatedAsset, request: updatedRequest, receipt };
  }

  reject({ assetId, rejectedBy = 'owner', notes = '' } = {}) {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Asset not found: ${assetId}`);
    const updatedAsset = this.assets.update(assetId, { approved: false, rejected: true });
    const updatedRequest = this.requests.update(asset.requestId, { status: ASSET_REQUEST_STATUS.REJECTED });
    const receipt = this.ledger.record({
      requestId: asset.requestId,
      assetId,
      tenantId: asset.tenantId,
      projectId: asset.projectId,
      engineUsed: asset.engine,
      actionType: ASSET_RECEIPT_TYPES.ASSET_REJECTED,
      status: ASSET_REQUEST_STATUS.REJECTED,
      message: 'Asset rejected through QuadBrain Creative Layer.',
      approvedBy: rejectedBy,
      notes,
      evidence: { assetId, requestId: asset.requestId },
    });
    return { asset: updatedAsset, request: updatedRequest, receipt };
  }
}

export const creativeStores = {
  requests: new AssetRequestService(),
  assets: new AssetLibraryService(),
  ledger: new AssetProofLedgerService(),
};
creativeStores.approvals = new AssetApprovalService(creativeStores);
