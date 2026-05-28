import {
  ASSET_RECEIPT_TYPES,
  ASSET_REQUEST_STATUS,
  createAssetRecord,
  createAssetRequest,
  validateAssetRequest,
} from './AssetContracts.js';
import { creativeStores } from './AssetStores.js';
import { CreativeEngineRouter } from './CreativeEngineAdapters.js';

export class CreativeOrchestrator {
  constructor({ stores = creativeStores, engineRouter = new CreativeEngineRouter() } = {}) {
    this.stores = stores;
    this.engineRouter = engineRouter;
  }

  status() {
    return {
      generatedAt: new Date().toISOString(),
      truthLabel: 'QUADBRAIN_CREATIVE_LAYER_READY',
      queues: {
        requests: this.stores.requests.list({ limit: 500 }).length,
        assets: this.stores.assets.list({ limit: 500 }).length,
        receipts: this.stores.ledger.list({ limit: 500 }).length,
      },
      rule: 'Creative requests must create requests, select an engine, log receipts, store assets, and require review before publish.',
    };
  }

  createRequest(input = {}) {
    const validation = validateAssetRequest(input);
    if (!validation.valid) {
      return {
        success: false,
        truthState: 'BLOCKED',
        errors: validation.errors,
      };
    }

    const request = this.stores.requests.create(createAssetRequest(input));
    const receipt = this.stores.ledger.record({
      requestId: request.requestId,
      tenantId: request.tenantId,
      projectId: request.projectId,
      actionType: ASSET_RECEIPT_TYPES.REQUEST_CREATED,
      status: request.status,
      message: 'Asset request created in QuadBrain Creative Layer.',
      evidence: { requestId: request.requestId, assetType: request.assetType, preferredEngine: request.preferredEngine },
    });

    return {
      success: true,
      truthState: 'VERIFIED',
      request,
      receipt,
    };
  }

  async generateAsset({ requestId } = {}) {
    const request = this.stores.requests.get(requestId);
    if (!request) {
      return { success: false, truthState: 'BLOCKED', error: `Asset request not found: ${requestId}` };
    }

    const selectedEngine = this.engineRouter.selectEngine(request);
    this.stores.requests.update(requestId, { status: ASSET_REQUEST_STATUS.GENERATING, selectedEngine });
    this.stores.ledger.record({
      requestId,
      tenantId: request.tenantId,
      projectId: request.projectId,
      engineUsed: selectedEngine,
      actionType: ASSET_RECEIPT_TYPES.GENERATION_STARTED,
      status: ASSET_REQUEST_STATUS.GENERATING,
      message: 'Asset generation started.',
      evidence: { selectedEngine },
    });

    const result = await this.engineRouter.generate({ ...request, selectedEngine });
    if (!result.success) {
      const failedRequest = this.stores.requests.update(requestId, { status: ASSET_REQUEST_STATUS.FAILED, selectedEngine });
      const receipt = this.stores.ledger.record({
        requestId,
        tenantId: request.tenantId,
        projectId: request.projectId,
        engineUsed: selectedEngine,
        actionType: ASSET_RECEIPT_TYPES.GENERATION_FAILED,
        status: ASSET_REQUEST_STATUS.FAILED,
        truthState: 'BLOCKED',
        message: result.error || 'Asset generation failed.',
        evidence: { selectedEngine, adaptorEngine: result.adaptorEngine },
      });
      return { success: false, truthState: 'BLOCKED', request: failedRequest, receipt, error: result.error };
    }

    const asset = this.stores.assets.create(createAssetRecord({
      requestId,
      tenantId: request.tenantId,
      projectId: request.projectId,
      engine: selectedEngine,
      fileUrl: result.url,
      thumbnailUrl: result.url,
      tags: [request.assetType, request.styleProfile, selectedEngine].filter(Boolean),
      metadata: {
        prompt: result.prompt,
        adaptorEngine: result.adaptorEngine,
        sourceEngine: result.engine,
      },
    }));

    const updatedRequest = this.stores.requests.update(requestId, {
      status: request.needsApproval ? ASSET_REQUEST_STATUS.NEEDS_REVIEW : ASSET_REQUEST_STATUS.GENERATED,
      selectedEngine,
    });

    const receipt = this.stores.ledger.record({
      requestId,
      assetId: asset.assetId,
      tenantId: request.tenantId,
      projectId: request.projectId,
      engineUsed: selectedEngine,
      actionType: ASSET_RECEIPT_TYPES.GENERATION_COMPLETED,
      status: updatedRequest.status,
      message: 'Asset generated and stored in QuadBrain Creative Layer.',
      evidence: { assetId: asset.assetId, selectedEngine, adaptorEngine: result.adaptorEngine },
    });

    return {
      success: true,
      truthState: 'VERIFIED',
      request: updatedRequest,
      asset,
      receipt,
    };
  }

  listRequests(filter = {}) {
    return { success: true, requests: this.stores.requests.list(filter) };
  }

  listAssets(filter = {}) {
    return { success: true, assets: this.stores.assets.list(filter) };
  }

  listReceipts(filter = {}) {
    return { success: true, receipts: this.stores.ledger.list(filter) };
  }

  approveAsset(input = {}) {
    return { success: true, truthState: 'VERIFIED', ...this.stores.approvals.approve(input) };
  }

  rejectAsset(input = {}) {
    return { success: true, truthState: 'VERIFIED', ...this.stores.approvals.reject(input) };
  }
}

export const creativeOrchestrator = new CreativeOrchestrator();
