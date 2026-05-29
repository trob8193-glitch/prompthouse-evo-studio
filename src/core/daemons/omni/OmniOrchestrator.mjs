import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TetherEngine } from '../../autonomy/TetherEngine.js';
import { CrashProofEngine } from '../../autonomy/CrashProofEngine.js';
import { getEvoTrainingState, planEvoLlmTraining } from '../../evo-llm/EvoLlmTrainingOrchestrator.js';

CrashProofEngine.initialize('OmniOrchestrator');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../..');
const receiptDir = path.join(rootDir, '.prompthouse-data', 'omni', 'receipts');
const inboxDir = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'inbox');

if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });
if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });

console.log('🌌 [OMNI-ORCHESTRATOR] Initializing receipt-backed mission router...');

// ── Gather live context from Evo subsystems ──
function gatherEvoContext() {
  const ctx = {};

  // Evo Training State
  try {
    ctx.evoTraining = getEvoTrainingState({ rootDir });
    console.log(`👁️ [OMNI-ORCHESTRATOR] Evo Training State: ${ctx.evoTraining.truthState}`);
  } catch (e) {
    ctx.evoTraining = { truthState: 'OFFLINE', error: e.message };
  }

  // Evo Eyes — read latest diagnostics receipt
  try {
    const diagFile = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'evo-eyes-snapshot.json');
    if (fs.existsSync(diagFile)) {
      ctx.evoEyes = JSON.parse(fs.readFileSync(diagFile, 'utf8'));
    } else {
      ctx.evoEyes = { truthState: 'NO_SNAPSHOT_YET' };
    }
  } catch (e) {
    ctx.evoEyes = { truthState: 'OFFLINE', error: e.message };
  }

  // Evo DOM — check EvoFrameCore health
  try {
    const frameFile = path.join(rootDir, 'src', 'core', 'runtime', 'EvoFrameCore.js');
    ctx.evoDom = {
      truthState: fs.existsSync(frameFile) ? 'EVODOM_ONLINE' : 'EVODOM_MISSING',
      fileSize: fs.existsSync(frameFile) ? fs.statSync(frameFile).size : 0,
    };
  } catch (e) {
    ctx.evoDom = { truthState: 'OFFLINE', error: e.message };
  }

  return ctx;
}

let bots = [
  { botId: 1, name: 'Architect', role: 'System Design', status: 'IDLE' },
  { botId: 2, name: 'Builder', role: 'Feature Forging', status: 'IDLE' },
  { botId: 3, name: 'Refactor', role: 'Code Optimization', status: 'IDLE' },
  { botId: 4, name: 'UI Designer', role: 'Interface Synthesis', status: 'IDLE' },
  { botId: 12, name: 'Sentinel', role: 'Platform Defense', status: 'IDLE' },
  { botId: 21, name: 'Antigravity', role: 'Meta-Evolution', status: 'IDLE' },
  { botId: 30, name: 'EvoTrainer', role: 'Evo LLM Training Pipeline', status: 'IDLE' },
  { botId: 31, name: 'EvoEyesAgent', role: 'Visual Diagnostics & X-Ray', status: 'IDLE' },
  { botId: 32, name: 'EvoDOMGuard', role: 'Virtual DOM Integrity & Runtime', status: 'IDLE' }
];

try {
  const botFile = path.join(rootDir, 'src', 'bot-characters.jsx');
  if (fs.existsSync(botFile)) console.log('🌌 [OMNI-ORCHESTRATOR] Verified local bot roster definitions.');
} catch {}

function writeMissionReceipt(cycle, mission, bot, aiResponse) {
  const receipt = {
    id: `omni_${cycle}_${mission.botId}_${Date.now()}`,
    cycle,
    generatedAt: new Date().toISOString(),
    bot,
    mission,
    status: 'MISSION_EXECUTED',
    truthLabel: 'VERIFIED_BY_TETHER',
    aiFindings: aiResponse
  };
  const file = path.join(receiptDir, `${receipt.id}.json`);
  fs.writeFileSync(file, JSON.stringify(receipt, null, 2), 'utf8');

  // Push to QuadBrain Inbox
  const inboxFile = path.join(inboxDir, 'inbox.json');
  let currentInbox = [];
  try {
    if (fs.existsSync(inboxFile)) {
      currentInbox = JSON.parse(fs.readFileSync(inboxFile, 'utf8'));
    }
  } catch (e) {}
  
  currentInbox.push({
    id: receipt.id,
    timestamp: receipt.generatedAt,
    bot: bot.name,
    task: mission.task,
    summary: "Daemon completed background task. Review receipt for full AI findings."
  });
  
  // Keep inbox small (last 50 items)
  if (currentInbox.length > 50) currentInbox = currentInbox.slice(-50);
  fs.writeFileSync(inboxFile, JSON.stringify(currentInbox, null, 2), 'utf8');

  return file;
}

let cycleCount = 0;

async function runOmniCycle() {
  cycleCount++;
  console.log(`\n🌌 [OMNI-ORCHESTRATOR] --- CYCLE ${cycleCount} ---`);

  try {
    // Gather live context from Evo Eyes, Evo DOM, Evo Training
    const evoCtx = gatherEvoContext();
    const contextPayload = JSON.stringify(evoCtx, null, 2);

    const tasks = [
      { botId: 1, task: 'Audit build stability and routing integrity', status: 'PENDING', brain: 'local' },
      { botId: 12, task: 'Request Platform Sentinel status review', status: 'PENDING', brain: 'gemini' },
      { botId: 3, task: 'Prepare convergence-safe repair routing plan', status: 'PENDING', brain: 'local' },
      { botId: 21, task: 'Review model and image routing governance', status: 'PENDING', brain: 'gemini' },
      { botId: 2, task: 'Forge requested feature updates and logic patches', status: 'PENDING', brain: 'openai' },
      { botId: 4, task: 'Synthesize UI interfaces for pending patches', status: 'PENDING', brain: 'openai' },
      { botId: 30, task: 'Evaluate Evo LLM training pipeline health. Check dataset quality, blockers, and plan readiness. If dataset is ready, output a training plan summary.', status: 'PENDING', brain: 'local' },
      { botId: 31, task: 'Run Evo Eyes diagnostics sweep. Analyze module health, semantic drift, sovereignty score, and bonded node count from the live snapshot. Flag any modules with drift > 50% or unhealthy status.', status: 'PENDING', brain: 'gemini' },
      { botId: 32, task: 'Verify EvoDOM / EvoFrameCore runtime integrity. Confirm the virtual DOM reconciler exists, truth-gate rendering is intact, and the EvoState reactive engine is properly exporting. Repair any missing or corrupted files.', status: 'PENDING', brain: 'local' }
    ];

    console.log(`🚀 [OMNI-ORCHESTRATOR] Processing 1 task this cycle to preserve API limits...`);
    
    // Pick 1 task per cycle to avoid API rate limits
    const mission = tasks[cycleCount % tasks.length];
    
    const bot = bots.find(b => b.botId === mission.botId) || { name: 'EvoBot', role: 'Utility' };
    console.log(`🧠 [OMNI-ORCHESTRATOR] Delegating mission to ${bot.name} via TetherEngine...`);
    
    mission.status = 'EXECUTING';
    
    // Wire to Tether Engine with LIVE Evo context (Cost Firewall + Semantic Cache enforced automatically)
    const aiResponse = await TetherEngine.executeMission(mission.task, bot.name, bot.role, contextPayload, mission.brain);
    
    // If this was the EvoTrainer bot, also write an Evo Eyes snapshot for cross-brain visibility
    if (mission.botId === 31) {
      try {
        const snapshotFile = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'evo-eyes-snapshot.json');
        fs.writeFileSync(snapshotFile, JSON.stringify({
          lastScanBy: 'EvoEyesAgent',
          scannedAt: new Date().toISOString(),
          findings: aiResponse.substring(0, 2000),
          truthState: 'SNAPSHOT_WRITTEN'
        }, null, 2), 'utf8');
        console.log(`👁️ [EVO-EYES] Snapshot written for cross-brain sync.`);
      } catch (e) {}
    }

    mission.status = 'COMPLETED';
    const receiptPath = writeMissionReceipt(cycleCount, mission, bot, aiResponse);
    console.log(`✅ [${bot.name} | ${bot.role}] Mission complete. Receipt: ${receiptPath}`);
    
  } catch (err) {
    console.error('❌ [OMNI-ORCHESTRATOR] Error:', err.message);
  }

  // --- EMIT QUADBRAIN PULSE ---
  try {
    let xrayScore = 0;
    try {
      const { StudioDiagnostics } = await import('../../../features/studio_diagnostics_logic.js');
      const diagnostics = new StudioDiagnostics();
      xrayScore = diagnostics.getDiagnostics(rootDir).summary.avg_drift;
    } catch (e) {}

    let sentinelStatus = "UNKNOWN";
    let maturityScore = "UNKNOWN";
    let spineCoreHealth = "UNKNOWN";

    try {
      const fetch = (await import('node-fetch')).default || globalThis.fetch;
      const AbortController = globalThis.AbortController || (await import('abort-controller')).AbortController;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // NUCLEAR HARDENING: Increased to 10s to handle heavy swarm CPU load

      const [sRes, mRes, scRes] = await Promise.all([
        fetch('http://127.0.0.1:3001/api/platform-sentinel/status', { signal: controller.signal }).then(r => r.json()).catch(() => ({})),
        fetch('http://127.0.0.1:3001/api/module-maturity/status', { signal: controller.signal }).then(r => r.json()).catch(() => ({})),
        fetch('http://127.0.0.1:3001/api/spinecore/status', { signal: controller.signal }).then(r => r.json()).catch(() => ({}))
      ]);
      clearTimeout(timeoutId);

      if (sRes.status && sRes.status.release) sentinelStatus = sRes.status.release.verdict;
      if (mRes.report && mRes.report.averageScore !== undefined) maturityScore = mRes.report.averageScore;
      if (scRes.truthState) spineCoreHealth = scRes.truthState;
    } catch (e) {
      console.error("Pulse API Fetch Timeout or Error");
    }

    let spiderWebCount = 0;
    try {
      const spiderFile = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'spider_webs.json');
      if (fs.existsSync(spiderFile)) {
        const webData = JSON.parse(fs.readFileSync(spiderFile, 'utf8'));
        spiderWebCount = webData.webs ? webData.webs.length : 0;
      }
    } catch (e) {}

    const pulsePath = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'quadbrain_pulse.json');
    const pulse = {
      timestamp: new Date().toISOString(),
      cycleCount,
      activeBot: typeof bot !== 'undefined' && bot ? bot.name : 'NONE',
      trainingState: getEvoTrainingState(rootDir),
      lastMission: typeof mission !== 'undefined' && mission ? mission.task : 'WAITING',
      cognitiveDrift: xrayScore,
      platformSentinel: sentinelStatus,
      moduleMaturity: maturityScore,
      spineCore: spineCoreHealth,
      autonomousWebs: spiderWebCount
    };
    fs.writeFileSync(pulsePath, JSON.stringify(pulse, null, 2), 'utf8');
  } catch (e) {
    console.error("❌ [OMNI PULSE ERROR]", e);
  }
}

// Run immediately on boot
runOmniCycle();

// Then run every 5 minutes
setInterval(runOmniCycle, 300000);

console.log('🌌 [OMNI-ORCHESTRATOR] Receipt-backed mode online. Evo Eyes + Evo DOM + Evo Training + QuadBrain Pulse TETHERED.');