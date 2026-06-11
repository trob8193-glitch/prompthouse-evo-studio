import fs from 'fs';
import path from 'path';
import { collectEvoSignalFabric } from './EvoSignalFabric.js';

export async function getEvoWiFiStatus(rootDir = process.cwd()) {
  const fabric = await collectEvoSignalFabric({ rootDir });
  
  // Synthesize EvoWiFi status from fabric
  const bridgeReady = fabric.probes.some(p => p.id === 'promptbridge' && p.reachable);
  const evoLlmReady = fabric.probes.some(p => p.id === 'evo-llm' && p.reachable);
  const evoApiReady = fabric.probes.some(p => p.id === 'evo-api' && p.reachable);
  
  const ping = fabric.probes.find(p => p.id === 'promptbridge')?.latencyMs || 0;

  return {
    online: bridgeReady || evoApiReady,
    trustedNetwork: fabric.network.trustedNetworkNames.includes(fabric.network.currentNetworkAlias),
    ssidAlias: fabric.network.currentNetworkAlias,
    gatewayReachable: bridgeReady || evoApiReady, // Simplified mapping for MVP
    promptBridgeReachable: bridgeReady,
    evoLlmReachable: evoLlmReady,
    latencyMs: ping,
    signalQuality: ping > 0 && ping < 150 ? 'strong' : (ping >= 150 ? 'weak' : 'unknown'),
    mode: fabric.mode
  };
}

export async function getEvoWiFiTopology(rootDir = process.cwd()) {
  const fabric = await collectEvoSignalFabric({ rootDir });
  return {
    interfaces: fabric.network.interfaces,
    currentNetworkAlias: fabric.network.currentNetworkAlias,
    platform: fabric.network.platform,
    gateway: '192.168.1.1' // Simulated for MVP without running heavy network scanning
  };
}

export function evaluateBrainRoute(intentData, wifiStatus, bonds, rootDir = process.cwd()) {
  const { intent, risk = 'low', preferredBrain, requiresRepoAccess = false } = intentData;
  const isHighRisk = ['high', 'critical'].includes(risk.toLowerCase()) || requiresRepoAccess;
  
  const ownerBonded = bonds.some(b => b.role === 'owner-device');
  const pcBonded = bonds.some(b => b.role === 'studio-core');

  let decision = {};

  if (isHighRisk && !ownerBonded) {
    decision = {
      route: 'deny',
      fallback: 'none',
      reason: 'High-risk action requires owner device presence on network.',
      proofRequired: true,
      receiptId: `PH-EVO-WIFI-${Date.now()}`
    };
  } else if (!wifiStatus.promptBridgeReachable) {
    decision = {
      route: 'offline-queue',
      fallback: 'none',
      reason: 'Bridge offline. Queue actions until reconnected.',
      proofRequired: false,
      receiptId: `PH-EVO-WIFI-${Date.now()}`
    };
  } else if (wifiStatus.signalQuality === 'weak' || preferredBrain === 'evo-llm') {
    if (wifiStatus.evoLlmReachable) {
      decision = {
        route: 'local-evo-llm',
        fallback: 'studio-brain',
        reason: 'Signal unstable or Evo LLM preferred. Using local intelligence.',
        proofRequired: isHighRisk,
        receiptId: `PH-EVO-WIFI-${Date.now()}`
      };
    } else {
      decision = {
        route: 'studio-brain',
        fallback: 'chatgpt-operator',
        reason: 'Evo LLM preferred but unreachable. Defaulting to cloud.',
        proofRequired: isHighRisk,
        receiptId: `PH-EVO-WIFI-${Date.now()}`
      };
    }
  } else {
    decision = {
      route: 'studio-brain',
      fallback: 'chatgpt-operator',
      reason: 'Network strong and trusted. Default cloud route selected.',
      proofRequired: isHighRisk,
      receiptId: `PH-EVO-WIFI-${Date.now()}`
    };
  }

  // Write proof receipt
  const receiptDir = path.join(rootDir, '.prompthouse-data', 'signals', 'receipts');
  if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });
  const receipt = {
    receiptId: decision.receiptId,
    timestamp: new Date().toISOString(),
    intentData,
    networkStatus: { ssid: wifiStatus.ssidAlias, latency: wifiStatus.latencyMs, mode: wifiStatus.mode },
    bondedDevices: bonds.map(b => b.deviceName),
    decision
  };
  fs.writeFileSync(path.join(receiptDir, `${decision.receiptId}.json`), JSON.stringify(receipt, null, 2), 'utf8');

  return decision;
}

// EvoBond Registry Logic
const getBondsFile = (rootDir) => process.env.EVO_SIGNAL_BOND_FILE || path.join(rootDir, '.prompthouse-data', 'evo_signal_bonds.json');

export function listBonds(rootDir = process.cwd()) {
  const file = getBondsFile(rootDir);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function saveBonds(rootDir, bonds) {
  const file = getBondsFile(rootDir);
  if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(bonds, null, 2), 'utf8');
}

export function registerBond(rootDir = process.cwd(), bondData) {
  const bonds = listBonds(rootDir);
  const newBond = {
    id: `bond_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    deviceName: bondData.deviceName || 'Unknown Device',
    role: bondData.role || 'guest',
    pairingMethod: bondData.pairingMethod || 'manual',
    allowedActions: bondData.allowedActions || [],
    createdAt: new Date().toISOString()
  };
  
  bonds.push(newBond);
  saveBonds(rootDir, bonds);
  
  return {
    bonded: true,
    bondName: newBond.deviceName,
    trustLevel: newBond.role,
    receiptId: `PH-EVO-BOND-${Date.now()}`
  };
}

export function revokeBond(rootDir = process.cwd(), bondId) {
  const bonds = listBonds(rootDir);
  const filtered = bonds.filter(b => b.id !== bondId);
  saveBonds(rootDir, filtered);
  return { success: true, revokedId: bondId };
}
