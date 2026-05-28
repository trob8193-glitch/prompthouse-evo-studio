#!/usr/bin/env node
import { creativeOrchestrator } from '../src/core/creative/CreativeOrchestrator.js';

const args = new Set(process.argv.slice(2));
const createOnly = args.has('--create-only');
const request = creativeOrchestrator.createRequest({
  tenantId: 'tenant_default',
  projectId: 'studio-core',
  userId: 'quadbrain_check',
  assetType: 'platform_demo_banner',
  goal: 'Create a proof-tracked PH Evo Studio demo banner request.',
  prompt: 'Premium futuristic AI studio command cockpit, emerald and silver interface, cinematic lighting',
  styleProfile: 'evo-premium',
  preferredEngine: 'evo_diffuser',
  needsApproval: true,
});

const output = {
  generatedAt: new Date().toISOString(),
  truthLabel: request.success ? 'QUADBRAIN_CREATIVE_LAYER_READY' : 'QUADBRAIN_CREATIVE_LAYER_BLOCKED',
  status: creativeOrchestrator.status(),
  request,
  queues: {
    requests: creativeOrchestrator.listRequests({ projectId: 'studio-core' }).requests,
    assets: creativeOrchestrator.listAssets({ projectId: 'studio-core' }).assets,
    receipts: creativeOrchestrator.listReceipts({ projectId: 'studio-core' }).receipts,
  },
  note: createOnly
    ? 'Create-only mode did not call image providers.'
    : 'This check validates queue/proof/contract wiring without calling image providers by default.',
};

console.log(JSON.stringify(output, null, 2));
if (!request.success) process.exitCode = 1;
