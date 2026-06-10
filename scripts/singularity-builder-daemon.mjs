import fs from 'fs';
import path from 'path';
import { runEvolutionCycle } from '../src/core/evolution/index.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const REPORT_PATH = path.resolve('.ai/outbox/ai-self-train-report.md');
const DAEMON_INTERVAL_MS = 60000 * 5; // 5 minutes

async function extractObjectives(reportContent) {
  const objectives = [];
  // Match lines that look like "### Objective N: [Name]"
  const regex = /### Objective \d+:\s*(.+)/g;
  let match;
  while ((match = regex.exec(reportContent)) !== null) {
    if (match[1].trim()) {
      objectives.push(match[1].trim());
    }
  }
  return objectives;
}

async function runBuilderCycle(isDryRun = false) {
  Log.info('\n🌌 [Singularity-Builder] Waking up to process AI training blueprints...');

  if (!fs.existsSync(REPORT_PATH)) {
    Log.info('⏳ [Singularity-Builder] No training report found at .ai/outbox/ai-self-train-report.md. Sleeping.');
    return;
  }

  const reportContent = fs.readFileSync(REPORT_PATH, 'utf8');
  const objectives = await extractObjectives(reportContent);

  if (objectives.length === 0) {
    Log.info('⏳ [Singularity-Builder] No clear objectives found in the current blueprint. Sleeping.');
    return;
  }

  Log.info(`\n🛠️ [Singularity-Builder] Found ${objectives.length} objectives in the blueprint:`);
  objectives.forEach((obj, idx) => Log.info(`   ${idx + 1}. ${obj}`));

  if (isDryRun) {
    Log.info('\n✅ [Singularity-Builder] Dry run complete. Objectives successfully extracted.');
    return;
  }

  // To prevent an infinite loop, we will just pick the first uncompleted objective.
  // For now, we take the first one and run the evolution engine.
  const targetObjective = objectives[0];
  Log.info(`\n🚀 [Singularity-Builder] Commencing autonomous implementation for: "${targetObjective}"`);

  try {
    const result = await runEvolutionCycle({
      objective: `Implement the architectural blueprint for: ${targetObjective}`,
      mode: 'execute',
      applyFixes: true,
      runTests: true,
      runBuild: true,
      allowRollback: true,
      proofProfile: 'full',
      proofTimeoutMs: 120000,
    });

    if (result.success) {
      Log.info(`\n✅ [Singularity-Builder] Objective "${targetObjective}" implemented and hardened successfully!`);
      // We could rewrite the report to mark it done, but for now we log success.
    } else {
      Log.error(`\n❌ [Singularity-Builder] Failed to implement "${targetObjective}". Rollback invoked.`);
    }
  } catch (error) {
    Log.error('\n❌ [Singularity-Builder] Fatal error during evolution cycle:', error);
  }
}

// Support manual execution from CLI
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

runBuilderCycle(isDryRun).then(() => {
  // If not dry-run and launched as daemon, we could loop it. 
  // For now, it runs once per invocation.
  if (!isDryRun && process.env.DAEMON_MODE === 'true') {
    setInterval(() => runBuilderCycle(false), DAEMON_INTERVAL_MS);
  }
});
