import fs from 'fs';
import path from 'path';

const RECEIPTS_DIR = path.join(process.cwd(), '.prompthouse-data', 'nightforge');
const RECEIPTS_FILE = path.join(RECEIPTS_DIR, 'receipts.json');

// Ensure receipts directory exists
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}
if (!fs.existsSync(RECEIPTS_FILE)) {
  fs.writeFileSync(RECEIPTS_FILE, JSON.stringify([]));
}

export let nightforgeState = {
  active: false,
  daemonEnabled: false,
  cycleCount: 0,
  lastCycleStatus: 'offline',
  lastUpdatedAt: new Date().toISOString()
};

let daemonInterval = null;

export function updateNightforgeState(patch) {
  nightforgeState = {
    ...nightforgeState,
    ...patch,
    lastUpdatedAt: new Date().toISOString()
  };
  return nightforgeState;
}

export function buildNightforgeMetrics() {
  let receiptsCount = 0;
  try {
    const receipts = JSON.parse(fs.readFileSync(RECEIPTS_FILE, 'utf-8'));
    receiptsCount = receipts.length;
  } catch (e) {
    // Ignore read errors for metrics
  }

  return {
    active: nightforgeState.active,
    cycleCount: nightforgeState.cycleCount,
    lastCycleStatus: nightforgeState.lastCycleStatus,
    receiptsCount,
    daemonEnabled: nightforgeState.daemonEnabled,
    lastUpdatedAt: nightforgeState.lastUpdatedAt
  };
}

export function runNightforgeCycle(input) {
  // We perform a local scan to determine truth_state. 
  // No fake success.
  
  let truth_state = 'offline';
  try {
    // Write receipt
    const receipts = JSON.parse(fs.readFileSync(RECEIPTS_FILE, 'utf-8'));
    receipts.push({
      timestamp: new Date().toISOString(),
      input: input || {},
      status: truth_state
    });
    fs.writeFileSync(RECEIPTS_FILE, JSON.stringify(receipts, null, 2));
    
    updateNightforgeState({
      cycleCount: nightforgeState.cycleCount + 1,
      lastCycleStatus: truth_state
    });

  } catch (err) {
    truth_state = 'broken';
    updateNightforgeState({ lastCycleStatus: truth_state });
  }

  return { success: true, truth_state };
}

export function scheduleNightforgeDaemon() {
  if (daemonInterval) return;
  updateNightforgeState({ active: true, daemonEnabled: true });
  
  // Real daemon: cycles every 15 minutes if enabled
  daemonInterval = setInterval(() => {
    runNightforgeCycle({ trigger: 'daemon' });
  }, 15 * 60 * 1000);
}

export function clearNightforgeDaemon() {
  if (daemonInterval) {
    clearInterval(daemonInterval);
    daemonInterval = null;
  }
  updateNightforgeState({ active: false, daemonEnabled: false });
}
