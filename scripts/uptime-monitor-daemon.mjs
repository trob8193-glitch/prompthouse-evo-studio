#!/usr/bin/env node
/**
 * PH EVO STUDIO — Uptime Monitoring Daemon
 * Continuous HTTP probing to ensure the Bridge server is alive and responding.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.BRIDGE_PORT || 3001;
const INTERVAL_MS = parseInt(process.env.UPTIME_MONITOR_INTERVAL || '60000', 10);
const DATA_DIR = path.join(process.cwd(), '.prompthouse-data', 'uptime');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function probe() {
  const start = Date.now();
  const req = http.get(`http://localhost:${PORT}/healthz`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const ms = Date.now() - start;
      const ok = res.statusCode === 200;
      logResult(ok, ms, res.statusCode);
    });
  });

  req.on('error', (err) => {
    logResult(false, Date.now() - start, 0, err.message);
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    logResult(false, 5000, 0, 'TIMEOUT');
  });
}

function logResult(ok, ms, code, error = '') {
  const ts = new Date().toISOString();
  const state = ok ? 'UP' : 'DOWN';
  const line = `[${ts}] [${state}] [${code}] ${ms}ms ${error ? `| ERR: ${error}` : ''}\n`;
  
  fs.appendFileSync(path.join(DATA_DIR, 'uptime.log'), line);
  
  if (!ok) {
    fs.appendFileSync(path.join(DATA_DIR, 'downtime-events.log'), line);
    console.error(`\x1b[31m[Uptime Daemon] Bridge server DOWN (${code}): ${error || 'Unknown'}\x1b[0m`);
  } else if (process.argv.includes('--debug')) {
    console.log(`\x1b[32m[Uptime Daemon] Bridge server UP (${ms}ms)\x1b[0m`);
  }
}

console.log(`\x1b[36m[Uptime Daemon] Starting continuous probes on port ${PORT} every ${INTERVAL_MS}ms\x1b[0m`);
probe(); // Initial probe
setInterval(probe, INTERVAL_MS);
