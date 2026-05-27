import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeDaemonReceipt, createEvoGitSnapshot } from '../../../egit/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../..');

console.log('🌌 [OMNI-ORCHESTRATOR] Initializing receipt-backed Omni-Orchestrator daemon...');

const bots = [
  { botId: 1, name: 'Architect', role: 'System Design', status: 'IDLE' },
  { botId: 2, name: 'Builder', role: 'Feature Forging', status: 'IDLE' },
  { botId: 3, name: 'Refactor', role: 'Code Optimization', status: 'IDLE' },
  { botId: 4, name: 'UI Designer', role: 'Interface Synthesis', status: 'IDLE' },
  { botId: 12, name: 'Sentinel', role: 'Platform Defense', status: 'IDLE' },
  { botId: 21, name: 'Antigravity', role: 'Meta-Evolution', status: 'IDLE' }
];

function botRosterState() {
  const botFile = path.join(rootDir, 'src', 'bot-characters.jsx');
  return {
    botFile,
    botFilePresent: fs.existsSync(botFile),
    declaredBots: bots.length,
    bots
  };
}

writeDaemonReceipt({
  rootDir,
  daemonId: 'omni-orchestrator',
  action: 'startup',
  truthState: 'STARTED',
  details: botRosterState(),
  claims: ['daemon_started', 'bot_roster_checked']
});

let cycleCount = 0;

setInterval(() => {
  cycleCount++;
  console.log(`\n🌌 [OMNI-ORCHESTRATOR] --- RECEIPT CYCLE ${cycleCount} ---`);

  try {
    const tasks = [
      { botId: 1, task: 'Audit build stability and routing integrity', status: 'QUEUED' },
      { botId: 12, task: 'Scan for dead surfaces and unverified claims', status: 'QUEUED' },
      { botId: 21, task: 'Check Antigravity adapter readiness', status: 'QUEUED' },
      { botId: 3, task: 'Review watchdog memory posture', status: 'QUEUED' }
    ];

    const snapshot = createEvoGitSnapshot({ rootDir, label: `omni_cycle_${cycleCount}`, includeAdapters: true });
    const receipt = writeDaemonReceipt({
      rootDir,
      daemonId: 'omni-orchestrator',
      action: 'cycle_dispatch_plan',
      truthState: 'PLAN_RECORDED',
      details: {
        cycleCount,
        tasks: tasks.map(task => ({
          ...task,
          bot: bots.find(bot => bot.botId === task.botId) || null
        })),
        snapshotId: snapshot.id,
        snapshotObjectId: snapshot.objectId
      },
      claims: ['dispatch_plan_recorded', 'snapshot_created']
    });

    console.log(`🧾 [OMNI-ORCHESTRATOR] Receipt written: ${receipt.id}`);
  } catch (err) {
    const receipt = writeDaemonReceipt({
      rootDir,
      daemonId: 'omni-orchestrator',
      action: 'cycle_error',
      truthState: 'ERROR_RECORDED',
      details: { cycleCount, error: err.message },
      claims: ['error_recorded']
    });
    console.error('❌ [OMNI-ORCHESTRATOR] Error receipt:', receipt.id, err.message);
  }
}, 20000);

console.log('🌌 [OMNI-ORCHESTRATOR] Receipt-backed loop active.');
