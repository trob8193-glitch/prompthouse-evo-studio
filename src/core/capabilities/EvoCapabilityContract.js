import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const EVO_CAPABILITY_CONTRACT_VERSION = '1.0.0';

export const EVO_CAPABILITIES = Object.freeze({
  desktopHost: {
    id: 'desktop_host',
    name: 'Evo Desktop Host',
    status: 'implemented',
    scope: ['launch_studio_shell', 'launch_promptbridge', 'bridge_health_check', 'desktop_window_host'],
    requiresApproval: false,
    risk: 'medium',
  },
  browserDomBridge: {
    id: 'browser_dom_bridge',
    name: 'Evo Browser DOM Bridge',
    status: 'implemented',
    scope: ['active_tab_dom_snapshot', 'approved_css_variables', 'approved_data_attributes', 'selector_highlight'],
    requiresApproval: true,
    risk: 'high',
  },
  commandGateway: {
    id: 'hardened_command_gateway',
    name: 'Hardened Command Gateway',
    status: 'implemented',
    scope: ['allowlisted_commands', 'workspace_cwd_jail', 'timeout_control', 'receipt_logging'],
    requiresApproval: true,
    risk: 'high',
  },
  localAdapters: {
    id: 'local_tool_adapters',
    name: 'Local Tool Adapters',
    status: 'implemented',
    scope: ['git', 'node', 'npm', 'ollama'],
    requiresApproval: false,
    risk: 'medium',
  },
  apiAdapters: {
    id: 'api_adapters',
    name: 'API Adapters',
    status: 'implemented',
    scope: ['openai', 'vercel', 'stripe', 'jwt'],
    requiresApproval: true,
    risk: 'high',
  },
});

export function createCapabilityManifest({ rootDir = process.cwd(), label = 'manual' } = {}) {
  return {
    id: `evo_capability_manifest_${Date.now()}`,
    version: EVO_CAPABILITY_CONTRACT_VERSION,
    label,
    truthState: 'EVO_CAPABILITY_MANIFEST_CREATED',
    capabilities: Object.values(EVO_CAPABILITIES),
    rules: [
      'No external DOM control without active tab permission and user approval.',
      'No shell execution outside the workspace jail.',
      'No high-risk action without a receipt.',
      'No claim of IDE, API, daemon, or extension control without a matching adapter receipt.',
      'No mutation of third-party pages beyond the approved command contract.',
    ],
    rootDir,
    createdAt: new Date().toISOString(),
  };
}

export function writeCapabilityReceipt({ rootDir = process.cwd(), action, capabilityId, truthState = 'RECORDED', details = {}, claims = [] } = {}) {
  if (!action) throw new Error('action is required');
  if (!capabilityId) throw new Error('capabilityId is required');

  const dir = path.join(rootDir, '.prompthouse-data', 'capability_receipts');
  fs.mkdirSync(dir, { recursive: true });
  const receipt = {
    id: `capability_${capabilityId}_${Date.now()}_${crypto.randomUUID()}`,
    action,
    capabilityId,
    truthState,
    details,
    claims,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dir, `${receipt.id}.json`), JSON.stringify(receipt, null, 2), 'utf8');
  return receipt;
}
