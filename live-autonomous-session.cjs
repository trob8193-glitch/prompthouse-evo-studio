/**
 * PH EVO STUDIO — LIVE AUTONOMOUS SESSION
 * Orchestrates bots, training, and sovereign intelligence for a live demonstration.
 * Runs for 15 minutes.
 */

const { exec } = require('child_process');
const path = require('path');

const BRIDGE_URL = 'http://127.0.0.1:3001';
const DURATION_MS = 15 * 60 * 1000; // 15 minutes
const INTERVAL_MS = 60 * 1000; // Every 1 minute

console.log('🚀 [PH EVO] STARTING LIVE AUTONOMOUS SESSION (15 MINUTE RUN)');
console.log('═══════════════════════════════════════════════════════════════');

let startTime = Date.now();

function runCommand(cmd, label) {
  console.log(`\n[${new Date().toLocaleTimeString()}] ⚡ TRIGER: ${label}...`);
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${label}] Error: ${error.message}`);
      return;
    }
    console.log(`[${label}] Output:\n${stdout.split('\n').slice(-5).join('\n')}`);
  });
}

const interval = setInterval(() => {
  const elapsed = Date.now() - startTime;
  if (elapsed >= DURATION_MS) {
    console.log('\n✅ [PH EVO] LIVE SESSION COMPLETE.');
    clearInterval(interval);
    process.exit(0);
  }

  const remaining = Math.round((DURATION_MS - elapsed) / 1000);
  console.log(`\n--- TIME REMAINING: ${remaining}s ---`);

  // 1. Run Sovereign Intelligence cycle
  runCommand('node sovereign-intelligence.js', 'Sovereign Intelligence');

  // 2. Trigger Bot Duel (via Bridge Invoke)
  // We'll simulate a duel by calling the bridge
  fetch(`${BRIDGE_URL}/bridge/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      command: 'run-duel', 
      args: { agentA: 'evo', agentB: 'dev', prompt: 'Design a self-healing memory architecture for PromptHouse.' } 
    })
  }).catch(() => {});

  // 3. Trigger Training Gold Miner
  runCommand('node src/core/foundry/GoldMiner.js', 'Gold Miner Training');

}, INTERVAL_MS);

// Immediate first run
runCommand('node sovereign-intelligence.js', 'Sovereign Intelligence (Initial)');
runCommand('node src/core/foundry/GoldMiner.js', 'Gold Miner Training (Initial)');
