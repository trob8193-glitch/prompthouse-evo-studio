import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('realtime-ingestion-daemon');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const bridgeUrl = process.env.BRIDGE_URL || process.env.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';

// Exponential backoff state
let consecutiveFailures = 0;
let bridgeOnline = false;

Log.info('🚀 Real-Time Ingestion Daemon Started');

async function checkBridgeOnline() {
  try {
    const res = await fetch(`${bridgeUrl}/healthz`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendTelemetryPulse() {
  // Back off silently if bridge isn't up yet — no spam
  if (!bridgeOnline) {
    bridgeOnline = await checkBridgeOnline();
    if (!bridgeOnline) {
      consecutiveFailures++;
      // Only log every 12 failures (~60s) to avoid terminal spam
      if (consecutiveFailures % 12 === 1) {
        Log.warn(`[Ingestion] Bridge not reachable at ${bridgeUrl}. Waiting for it to come online...`);
      }
      return;
    }
    Log.info(`[Ingestion] Bridge is online. Starting telemetry stream to ${bridgeUrl}`);
    consecutiveFailures = 0;
  }

  try {
    const payload = {
      timestamp: new Date().toISOString(),
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      status: 'active',
      source: 'realtime-ingestion-daemon'
    };

    const res = await fetch(`${bridgeUrl}/api/stream-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      Log.warn(`[Ingestion] Pulse rejected with status ${res.status}`);
      consecutiveFailures++;
      if (consecutiveFailures > 3) bridgeOnline = false; // Re-check on next tick
    } else {
      consecutiveFailures = 0;
    }
  } catch (error) {
    consecutiveFailures++;
    bridgeOnline = false; // Bridge went down, re-probe next tick
    if (consecutiveFailures <= 1) {
      Log.warn(`[Ingestion] Bridge connection lost. Will auto-reconnect.`);
    }
  }
}

// Initial 10-second delay to let the bridge fully boot
setTimeout(() => {
  sendTelemetryPulse();
  setInterval(sendTelemetryPulse, 5000);
}, 10000);
