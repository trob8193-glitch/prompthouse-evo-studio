import { runEvolutionCycle, getEvolutionStatus, listEvolutionRuns } from '../src/core/evolution/index.js';

const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const objectiveArg = args.find(arg => arg.startsWith('--objective='));
const list = args.includes('--list');
const status = args.includes('--status');

const mode = modeArg ? modeArg.split('=').slice(1).join('=').trim() : 'proposal';
let objective = objectiveArg
  ? objectiveArg.split('=').slice(1).join('=').trim()
  : 'Evolve self-implementation-policy to EVOLVED state with Omni-Live Daemon provenance';

try {
  const { execSync } = await import('child_process');
  console.log("📡 [Omni-Mesh] Interrogating physical hardware bindings for context...");
  const silicon = execSync('node scripts/physical_hardware_interface.js --action=map_silicon', { stdio: 'pipe' }).toString();
  objective += `\n\n[OMNI-MESH PHYSICAL CONTEXT]\n${silicon}`;
} catch(e) {
  console.log("⚠️ [Omni-Mesh] Hardware sweep bypassed.");
}

try {
  if (status) {
    console.log(JSON.stringify(getEvolutionStatus(), null, 2));
    process.exit(0);
  }
  if (list) {
    console.log(JSON.stringify(listEvolutionRuns({ limit: 25 }), null, 2));
    process.exit(0);
  }

  const unattended = args.includes('--unattended');

  let success = false;
  let attempts = 0;
  const maxAttempts = unattended ? 5 : 1;
  let currentObjective = objective;
  let finalResult = null;

  while (!success && attempts < maxAttempts) {
    attempts++;
    if (attempts > 1) {
      console.log(`\n🔄 [Omni-Mesh] Autonomous CI Retry (Attempt ${attempts}/${maxAttempts})`);
    }

    const result = await runEvolutionCycle({
      objective: currentObjective,
      mode,
      applyFixes: mode !== 'proposal',
      runTests: !args.includes('--skip-tests'),
      runBuild: !args.includes('--skip-build'),
      allowRollback: !args.includes('--no-rollback'),
      policy: { unattended, requireOwnerApprovalForMerge: !unattended },
    });

    finalResult = result;
    if (result.success) {
      if (mode === 'sandbox_apply') {
        // Sandbox mode — patch was applied in workspace. Accept directly.
        success = true;
        console.log(`✅ [Omni-Mesh] Sandbox patch applied. Evolution cycle complete.`);
      } else {
        // Full proof mode — validate through ShadowForge
        console.log(`🛡️ [Omni-Mesh] Logic mutated. Routing to ShadowForge for permutation validation...`);
        try {
          const { ShadowForge } = await import('../src/core/autonomy/ShadowForge.js');
          const shadow = new ShadowForge();
          const shadowValid = await shadow.compilePermutation(currentObjective);
          
          if (shadowValid) {
            success = true;
            console.log(`✅ [Omni-Mesh] ShadowForge validated. Absolute CI Green State Achieved.`);
          } else {
            throw new Error('ShadowForge Permutation Compilation Failed');
          }
        } catch (err) {
           console.log(`⚠️ [Omni-Mesh] ShadowForge validation failed: ${err.message}. Recalculating Matrix...`);
           currentObjective = `SHADOWFORGE REJECTED PREVIOUS MUTATION. REASON: ${err.message}\n\nObjective: ${objective}`;
        }
      }
    } else if (unattended) {
      console.log(`⚠️ [Omni-Mesh] CI Validation Failed. Recalculating Matrix...`);
      currentObjective = `PREVIOUS RUN FAILED. REASON: ${JSON.stringify(result.proof || result.blockedReasons)}\n\nObjective: ${objective}`;
    }
  }

  console.log(JSON.stringify(finalResult, null, 2));
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error(JSON.stringify({ success: false, error: error.message, code: error.code || 'SELF_EVOLUTION_CLI_ERROR' }, null, 2));
  process.exit(1);
}
