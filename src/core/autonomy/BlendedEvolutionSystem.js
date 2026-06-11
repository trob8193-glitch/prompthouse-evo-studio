import fs from 'fs';
import path from 'path';
import { Log } from './SovereignLogger.js';
import { getEvoWiFiStatus, listBonds } from '../signals/EvoWiFi.js';
import { getGlobalNodeStatus } from '../evo-llm/index.js';

function loadEnv(rootDir) {
  const envPath = path.join(rootDir, '.env');
  const vars = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.replace(/\r$/, '').match(/^([^#=]+)=(.*)$/);
      if (m) vars[m[1].trim()] = m[2].trim();
    }
  }
  return vars;
}

export class BlendedEvolutionSystem {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
  }

  async captureEnvironmentState() {
    Log.info('\x1b[36m[EVO-SYSTEM] Harvesting full Blended QuadBrain System State...\x1b[0m');
    
    // 1. File structure (React components mapping fallback)
    const srcPath = path.join(this.rootDir, 'src');
    let components = [];
    if (fs.existsSync(srcPath)) {
      components = fs.readdirSync(srcPath)
        .filter(f => f.endsWith('.jsx') || f.endsWith('.js'))
        .map(f => {
          const stats = fs.statSync(path.join(srcPath, f));
          return {
            name: f,
            size: stats.size,
            hasStyles: fs.readFileSync(path.join(srcPath, f), 'utf-8').includes('style={{'),
          };
        });
    }

    // 2. Network and Signals structure
    let quadbrainEnvironment = {};
    try {
      const wifiStatus = await getEvoWiFiStatus(this.rootDir);
      const bonds = listBonds(this.rootDir);
      const globalNode = getGlobalNodeStatus({ rootDir: this.rootDir });
      quadbrainEnvironment = { wifiStatus, bonds, globalNode };
    } catch (err) {
      Log.info(`\x1b[33m⚠️ Could not harvest full QuadBrain map: ${err.message}\x1b[0m`);
    }

    const spatialData = {
      mode: 'blended_system_analysis',
      components,
      quadbrainEnvironment,
      totalComponents: components.length,
      timestamp: new Date().toISOString(),
    };

    return spatialData;
  }

  async broadcastState(spatialData) {
    const env = loadEnv(this.rootDir);
    const bridgePort = env.BRIDGE_PORT || process.env.BRIDGE_PORT || 3001;
    const bridgeUrl = `http://127.0.0.1:${bridgePort}/api/evo-uplink`;
    const targets = [{ url: bridgeUrl, type: 'Studio Brain' }];

    try {
      const bondedFile = path.join(this.rootDir, '.prompthouse-data', 'bonded-nodes.json');
      if (fs.existsSync(bondedFile)) {
        const bondedNodes = JSON.parse(fs.readFileSync(bondedFile, 'utf-8'));
        for (const node of bondedNodes) {
          if (node.url) {
            targets.push({ url: `${node.url}/api/evo-uplink`, type: 'Bonded Node' });
          } else if (node.ip && node.port) {
            targets.push({ url: `http://${node.ip}:${node.port}/api/evo-uplink`, type: 'Bonded Node' });
          }
        }
      }
    } catch (e) {
      Log.error(`\x1b[33m⚠️ Failed to read bonded nodes: ${e.message}\x1b[0m`);
    }

    const ideBonds = ['CURSOR_BOND', 'CODEX_BOND', 'VSCODE_BOND'];
    for (const bondKey of ideBonds) {
      const bondVal = env[bondKey] || process.env[bondKey];
      if (bondVal && bondVal !== 'simulated_bypass') {
        targets.push({ url: `${bondVal}/api/evo-uplink`, type: `IDE Bond (${bondKey})` });
      }
    }

    Log.info(`\x1b[36m[EVO-SYSTEM] Broadcasting Blended State to ${targets.length} connected entities...\x1b[0m`);

    const payload = {
      origin: 'blended-evolution-system',
      action: 'SPATIAL_MAP_BROADCAST',
      payload: JSON.stringify(spatialData)
    };

    const promises = targets.map(async (target) => {
      try {
        await fetch(target.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch (e) {}
    });

    await Promise.all(promises);

    // Push to local signal learning
    try {
      const ingestPayload = {
        sourceType: 'blended-evolution-system',
        feature: 'ui-and-architecture-adaptation',
        signalKind: 'blended-map',
        summary: 'Blended System state captured for AI training',
        payload: spatialData,
        confidence: 0.95,
        learningValue: 0.85
      };
      await fetch(`http://127.0.0.1:${bridgePort}/api/evo-signal-learning/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingestPayload)
      }).catch(() => {});
    } catch (e) {}
  }
}
