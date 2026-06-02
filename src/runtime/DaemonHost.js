import fs from 'fs';
import path from 'path';
import { listDaemonEvents } from '../core/evo-layer/daemons/DaemonBus.js';

let running = false;

export function startDaemonHost({ rootDir = process.cwd() } = {}) {
  if (running) return;
  running = true;

  const base = path.join(rootDir, '.evo-layer', 'daemon-host');
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

  setInterval(() => {
    const events = listDaemonEvents({ rootDir });

    const heartbeat = {
      id: `heartbeat_${Date.now()}`,
      ts: new Date().toISOString(),
      daemonCount: new Set(events.map(e => e.daemonId)).size,
      eventCount: events.length
    };

    fs.writeFileSync(
      path.join(base, `heartbeat_${Date.now()}.json`),
      JSON.stringify(heartbeat, null, 2)
    );
  }, 5000);
}
