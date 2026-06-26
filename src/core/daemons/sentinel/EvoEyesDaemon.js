import fs from 'fs';
import path from 'path';
import { Log } from '../../autonomy/SovereignLogger.js';

const STATE_FILE = path.join(process.cwd(), '.prompthouse-data', 'daemons', 'evo_eyes_state.json');
const MAP_FILE = path.join(process.cwd(), '.prompthouse-data', 'studio_ui_map.json');

function ensureDir() {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class EvoEyesDaemon {
  constructor() {
    this.name = 'EvoEyesDaemon';
    this.active = false;
  }

  start() {
    this.active = true;
    Log.info(`[EvoEyes] 👁️  Vision System Online. Tethered to AutoUser streams.`);
    this.saveState();
  }

  stop() {
    this.active = false;
    Log.info(`[EvoEyes] 👁️  Vision System Offline.`);
    this.saveState();
  }

  saveState() {
    ensureDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify({ active: this.active, lastUpdate: new Date().toISOString() }, null, 2));
  }

  getStatus() {
    return { active: this.active };
  }

  async processUiMap(mapData, screenshotBuffer) {
    Log.info(`[EvoEyes] 👁️  Processing new Spatial Semantic Map...`);
    
    // Save map
    fs.writeFileSync(MAP_FILE, JSON.stringify(mapData, null, 2), 'utf8');
    
    if (screenshotBuffer) {
      const snapPath = path.join(process.cwd(), '.prompthouse-data', 'eyes_snapshot.png');
      fs.writeFileSync(snapPath, screenshotBuffer);
      Log.success(`[EvoEyes] 📸 Snapshot stored at ${snapPath}`);
    }
  }
}
