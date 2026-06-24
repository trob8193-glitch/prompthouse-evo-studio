#!/usr/env/bin node
import os from 'os';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

/**
 * PH EVO STUDIO — OLLAMA HARDWARE DAEMON
 * ═══════════════════════════════════════════════════════════════
 * Manages local AI models and hardware limits for Sovereign mode.
 */

hardenProcess('ollama-hardware-daemon');

const OLLAMA_API = 'http://127.0.0.1:11434';
const REQUIRED_MODELS = ['qwen2.5-coder:32b', 'deepseek-r1:70b'];
const FALLBACK_MODELS = ['llama3:8b', 'qwen2.5-coder:7b'];

// VRAM proxy: use free system RAM (since we can't easily poll GPU VRAM cross-platform without native bindings)
const GB = 1024 * 1024 * 1024;
const MIN_RAM_FOR_32B = 24 * GB;

async function checkOllamaStatus() {
  try {
    const res = await fetch(`${OLLAMA_API}/api/tags`);
    if (!res.ok) throw new Error('Ollama not responding');
    const data = await res.json();
    return data.models || [];
  } catch (e) {
    console.error(`❌ [HardwareDaemon] Ollama is not running on ${OLLAMA_API}`);
    return null;
  }
}

async function pullModel(modelName) {
  console.log(`📥 [HardwareDaemon] Pulling model: ${modelName}... (this may take a while)`);
  try {
    const res = await fetch(`${OLLAMA_API}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: false })
    });
    if (res.ok) {
      console.log(`✅ [HardwareDaemon] Model pulled successfully: ${modelName}`);
    } else {
      const err = await res.json();
      console.error(`❌ [HardwareDaemon] Failed to pull ${modelName}:`, err);
    }
  } catch (e) {
    console.error(`❌ [HardwareDaemon] Error pulling ${modelName}:`, e.message);
  }
}

async function runAudit() {
  console.log(`\n🔍 [HardwareDaemon] Running hardware & model audit...`);
  
  const freeRam = os.freemem();
  const totalRam = os.totalmem();
  console.log(`📊 System RAM: ${(freeRam/GB).toFixed(1)}GB free / ${(totalRam/GB).toFixed(1)}GB total`);

  const installedModels = await checkOllamaStatus();
  if (!installedModels) return; // Exit early if Ollama is offline

  const installedNames = installedModels.map(m => m.name);
  console.log(`📦 Installed Local Models: ${installedNames.join(', ') || 'None'}`);

  // Check if we have enough RAM for the big models
  if (totalRam >= MIN_RAM_FOR_32B) {
    console.log(`✅ Sufficient RAM detected for 32B+ models.`);
    for (const req of REQUIRED_MODELS) {
      if (!installedNames.includes(req) && !installedNames.some(n => n.startsWith(req + ':'))) {
        console.log(`⚠️ Missing required model: ${req}`);
        // As a safeguard during development, we'll just log instead of actually pulling a 20GB+ file automatically
        // await pullModel(req); 
        console.log(`💡 Suggestion: run 'ollama pull ${req}'`);
      }
    }
  } else {
    console.log(`⚠️ Insufficient RAM for 32B+ models (Need 24GB, have ${(totalRam/GB).toFixed(1)}GB). Using fallbacks.`);
    for (const fb of FALLBACK_MODELS) {
      if (!installedNames.includes(fb) && !installedNames.some(n => n.startsWith(fb + ':'))) {
        console.log(`⚠️ Missing fallback model: ${fb}`);
        // await pullModel(fb);
        console.log(`💡 Suggestion: run 'ollama pull ${fb}'`);
      }
    }
  }

  // [VRAM PIN TETHER] Pin qwen3.6 to VRAM if it's installed
  if (installedNames.some(n => n.startsWith('qwen3.6'))) {
    try {
      await fetch(`${OLLAMA_API}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen3.6', prompt: '', keep_alive: -1 })
      });
      console.log(`📌 [HardwareDaemon] qwen3.6 pinned to VRAM.`);
    } catch {}
  }
}

if (process.argv[1] && process.argv[1].endsWith('ollama-hardware-daemon.mjs')) {
  createDaemonHeartbeat('ollama-hardware-daemon', 300000); // 5 min
  runAudit().catch(console.error);
  // Re-run audit every 10 minutes
  setInterval(runAudit, 600000);
}
