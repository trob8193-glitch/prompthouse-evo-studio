import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const bridgeUrl = process.env.BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'));

Log.info('🚀 Real-Time Ingestion Daemon Started');

async function sendTelemetryPulse() {
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
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      Log.warn(`Pulse failed with status ${res.status}`);
    } else {
      const data = await res.json();
      Log.info(`Pulse successful: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    Log.error(`Ingestion daemon error: ${error.message}`);
  }
}

// Pulse every 5 seconds
setInterval(sendTelemetryPulse, 5000);
sendTelemetryPulse();
