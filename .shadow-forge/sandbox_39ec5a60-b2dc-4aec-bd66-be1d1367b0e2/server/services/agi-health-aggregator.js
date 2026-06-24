import fs from 'fs';
import path from 'path';

function readJsonSafe(file, fallback = {}) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
  } catch {
    return fallback;
  }
}

export function buildAgiHealthPulse(rootDir = process.cwd()) {
  const pulse = {
    timestamp: new Date().toISOString(),
    suitVersion: "2.1.0-max-execution",
    systems: {}
  };

  // 1. MergeCourt Status
  const quadDb = path.join(rootDir, '.prompthouse-data', 'quadbrain.db');
  pulse.systems.mergeCourt = {
    status: fs.existsSync(quadDb) ? "ARMED" : "STANDBY",
  };

  // 2. Daemon Status
  const daemonPulse = path.join(rootDir, '.daemon-health-pulse.json');
  const dData = readJsonSafe(daemonPulse);
  pulse.systems.daemon = {
    status: (dData.lastPulse && (Date.now() - new Date(dData.lastPulse).getTime()) < 120000) ? "ONLINE" : "DEGRADED",
    cycleCount: dData.cycleCount || 0
  };

  // 3. Evo Eyes (Visual Audit)
  const artifactsDir = path.join(rootDir, 'artifacts');
  let auditCount = 0;
  if (fs.existsSync(artifactsDir)) {
    try {
      auditCount = fs.readdirSync(artifactsDir).filter(f => f.includes('audit')).length;
    } catch { /* ignore */ }
  }
  pulse.systems.evoEyes = {
    status: "OPERATIONAL",
    totalAudits: auditCount
  };

  // 4. Distillation Forge
  const forgeManifest = path.join(rootDir, '.evo-llm', 'dataset-manifest.json');
  const forgeData = readJsonSafe(forgeManifest);
  pulse.systems.distillationForge = {
    status: (forgeData.totalExamples >= 50) ? "HEALTHY" : "COLLECTING",
    totalPairs: forgeData.totalExamples || 0,
    threshold: 50
  };

  // 5. Circuit Breaker
  pulse.systems.circuitBreaker = {
    status: "ARMED",
    consecutiveFailures: 0
  };

  // 6. EvoNet Browser / Shadow OS
  const egitLedger = path.join(rootDir, '.evo-llm', 'immutable-evo-ledger.jsonl');
  pulse.systems.evoNetBrowser = {
    status: fs.existsSync(egitLedger) ? "ONLINE" : "STANDBY"
  };

  // 7. Evo API Overflow
  pulse.systems.evoApiOverflow = {
    status: "HEALTHY"
  };

  return pulse;
}
