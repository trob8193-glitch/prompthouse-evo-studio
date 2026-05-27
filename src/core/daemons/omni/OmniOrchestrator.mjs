import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../..');
const receiptDir = path.join(rootDir, '.prompthouse-data', 'omni', 'receipts');

if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });

console.log('🌌 [OMNI-ORCHESTRATOR] Initializing receipt-backed mission router...');

let bots = [
  { botId: 1, name: 'Architect', role: 'System Design', status: 'IDLE' },
  { botId: 2, name: 'Builder', role: 'Feature Forging', status: 'IDLE' },
  { botId: 3, name: 'Refactor', role: 'Code Optimization', status: 'IDLE' },
  { botId: 4, name: 'UI Designer', role: 'Interface Synthesis', status: 'IDLE' },
  { botId: 12, name: 'Sentinel', role: 'Platform Defense', status: 'IDLE' },
  { botId: 21, name: 'Antigravity', role: 'Meta-Evolution', status: 'IDLE' }
];

try {
  const botFile = path.join(rootDir, 'src', 'bot-characters.jsx');
  if (fs.existsSync(botFile)) console.log('🌌 [OMNI-ORCHESTRATOR] Verified local bot roster definitions.');
} catch {}

function writeMissionReceipt(cycle, mission, bot) {
  const receipt = {
    id: `omni_${cycle}_${mission.botId}_${Date.now()}`,
    cycle,
    generatedAt: new Date().toISOString(),
    bot,
    mission,
    status: 'MISSION_RECORDED',
    truthLabel: 'PROOF_REQUIRED',
    requiredProof: ['npm run platform:strict', 'npm run master:status']
  };
  const file = path.join(receiptDir, `${receipt.id}.json`);
  fs.writeFileSync(file, JSON.stringify(receipt, null, 2), 'utf8');
  return file;
}

let cycleCount = 0;

setInterval(async () => {
  cycleCount++;
  console.log(`\n🌌 [OMNI-ORCHESTRATOR] --- CYCLE ${cycleCount} ---`);

  try {
    const tasks = [
      { botId: 1, task: 'Audit build stability and routing integrity', status: 'PENDING' },
      { botId: 12, task: 'Request Platform Sentinel status review', status: 'PENDING' },
      { botId: 3, task: 'Prepare convergence-safe repair routing plan', status: 'PENDING' },
      { botId: 21, task: 'Review model and image routing governance', status: 'PENDING' }
    ];

    console.log(`🚀 [OMNI-ORCHESTRATOR] Recording ${tasks.length} mission receipts.`);

    for (const mission of tasks) {
      const bot = bots.find(b => b.botId === mission.botId) || { name: 'EvoBot', role: 'Utility' };
      mission.status = 'MISSION_RECORDED';
      const receiptPath = writeMissionReceipt(cycleCount, mission, bot);
      console.log(`🤖 [${bot.name} | ${bot.role}] Mission receipt: ${receiptPath}`);
    }
  } catch (err) {
    console.error('❌ [OMNI-ORCHESTRATOR] Error:', err.message);
  }
}, 20000);

console.log('🌌 [OMNI-ORCHESTRATOR] Receipt-backed mode online.');