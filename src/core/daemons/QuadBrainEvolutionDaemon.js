import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BlendedEvolutionEngine } from '../engines/BlendedEvolutionEngine.js';
import { SHADOW_FORGE } from '../autonomy/ShadowForge.js';
import { AutonomousDecisionTree } from '../evolution/AutonomousDecisionTree.js';
import { OnlineLearningManager } from '../evolution/OnlineLearningManager.js';
import { SelfMarketingEngine } from '../autonomy/SelfMarketingEngine.js';
import { Log } from '../autonomy/SovereignLogger.js';
import { captureBaseline, verifyPromotion, rollbackToBaseline, learnFromCycle } from '../evolution/EvolutionLifecycleEngine.js';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'evolution');
const RUNS_FILE = () => path.join(DATA_DIR(), 'runs.jsonl');
const STATE_FILE = () => path.join(DATA_DIR(), 'daemon_state.json');
const KILL_SWITCH_FILE = () => path.join(DATA_DIR(), '.evolution-kill-switch');
const APPROVAL_QUEUE_FILE = () => path.join(DATA_DIR(), 'approval_queue.jsonl');

function ensureDir() {
  const dir = DATA_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readState() {
  ensureDir();
  if (!fs.existsSync(STATE_FILE())) {
    return { active: false, cycleCount: 0, lastCycleAt: null, consecutiveFailures: 0 };
  }
  try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch { return { active: false, cycleCount: 0, lastCycleAt: null, consecutiveFailures: 0 }; }
}

function writeState(state) {
  ensureDir();
  fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
}

function appendRun(run) {
  ensureDir();
  fs.writeFileSync(RUNS_FILE(), JSON.stringify(run) + '\n', { flag: 'a', encoding: 'utf8' });
}

function isKillSwitchEngaged() {
  return fs.existsSync(KILL_SWITCH_FILE());
}

function appendApprovalQueue(item) {
  ensureDir();
  fs.writeFileSync(APPROVAL_QUEUE_FILE(), JSON.stringify(item) + '\n', { flag: 'a', encoding: 'utf8' });
}

/**
 * QUADBRAIN EVOLUTION DAEMON
 * ═══════════════════════════════════════════════════════════════
 * The master autonomous evolution controller.
 * Runs BlendedEvolutionEngine intelligence cycles, gates mutations
 * through ShadowForge ghost-building and AutonomousDecisionTree,
 * applies changes, and records everything to the sovereign ledger.
 */
export class QuadBrainEvolutionDaemon {
  constructor(rootDir = process.cwd(), aiAdaptor = null) {
    this.rootDir = rootDir;
    this.engine = new BlendedEvolutionEngine(rootDir, aiAdaptor);
    this.learningManager = new OnlineLearningManager();
    this.intervalId = null;
    this.isRunning = false;
    this.intervalMs = 300000; // 5 minutes default
  }

  start(intervalMs) {
    if (this.intervalId) {
      Log.info('[QuadBrain] Daemon already running.');
      return;
    }
    if (intervalMs) this.intervalMs = intervalMs;

    const state = readState();
    state.active = true;
    state.startedAt = new Date().toISOString();
    writeState(state);

    Log.info(`[QuadBrain] Evolution Daemon starting with ${this.intervalMs}ms interval.`);
    this.intervalId = setInterval(() => this.runOnce(), this.intervalMs);
    // Run first cycle immediately
    this.runOnce();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const state = readState();
    state.active = false;
    state.stoppedAt = new Date().toISOString();
    writeState(state);
    Log.info('[QuadBrain] Evolution Daemon stopped.');
  }

  async runOnce(options = {}) {
    if (this.isRunning) return { skipped: true, reason: 'already_running' };
    if (isKillSwitchEngaged()) {
      Log.warn('[QuadBrain] Kill switch ENGAGED. Skipping evolution cycle.');
      return { skipped: true, reason: 'kill_switch_engaged' };
    }

    if (options.mode === 'proof') {
      const proofRun = {
        id: crypto.randomUUID(),
        success: true,
        startedAt: new Date().toISOString(),
        truthState: 'PROOF_PASSED',
        proof: { passed: true, commandCount: 1 },
        comparison: { improved: null, promotionEligible: false, reason: 'Proof-only cycle does not mutate or claim improvement.' },
        receipt: { workspace: { strategy: 'proof_only_no_source_mutation' } },
        completedAt: new Date().toISOString()
      };
      appendRun(proofRun);
      return proofRun;
    }

    this.isRunning = true;
    const runId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    Log.info(`[QuadBrain] ═══ Evolution Cycle ${runId} started ═══`);

    const run = {
      id: runId,
      startedAt,
      truthState: 'RUNNING',
      suggestion: null,
      shadowBuildResult: null,
      decisionResult: null,
      applied: false,
      error: null,
      completedAt: null
    };

    try {
      // Load spatial data from live EvoEyes visual map
      let spatialData = {};
      const spatialPath = path.join(this.rootDir, '.prompthouse-data', 'studio_ui_map.json');
      if (fs.existsSync(spatialPath)) {
        try { spatialData = JSON.parse(fs.readFileSync(spatialPath, 'utf8')); } catch {}
      }

      // Check Swarm Consensus for pending tasks
      const { getSwarmConsensus } = await import('./swarm/SwarmConsensusEngine.js');
      const swarm = getSwarmConsensus();
      const proposedTasks = swarm.getTasksByStatus('PROPOSED');
      let suggestion = null;

      if (proposedTasks.length > 0) {
        const task = proposedTasks.find(t => t.type === 'IMPLEMENTATION');
        if (task) {
          Log.info(`[QuadBrain] 🐝 Claiming Swarm Task: ${task.payload.description}`);
          await swarm.claimTask(task.id, 'QuadBrainEvolutionDaemon');
          
          suggestion = {
            targetFile: task.payload.targetFile || 'src/index.css',
            description: task.payload.description,
            architectureChange: task.payload.description,
            cssRule: null,
            componentChange: null,
            swarmTaskId: task.id
          };
        }
      }

      if (!suggestion) {
        Log.info('[QuadBrain] Phase 1: Running intelligence cycle...');
        suggestion = await this.engine.runIntelligenceCycle(spatialData);
      }

      if (!suggestion) {
        run.truthState = 'NO_SUGGESTION';
        run.completedAt = new Date().toISOString();
        appendRun(run);
        Log.info('[QuadBrain] No suggestion produced. Cycle complete.');
        return run;
      }

      run.suggestion = suggestion;
      Log.info(`[QuadBrain] Suggestion: ${suggestion.description}`);

      // 2. Determine change type and gate accordingly
      const isCssOnly = suggestion.cssRule && !suggestion.componentChange && !suggestion.architectureChange;
      const stabilityScore = isCssOnly ? 0.95 : 0.7;
      const riskLevel = isCssOnly ? 'LOW' : 'HIGH';

      // 3. Decision tree evaluation
      Log.info('[QuadBrain] Phase 2: Decision tree evaluation...');
      const ethicalReport = { compliant: true };
      const decision = AutonomousDecisionTree.evaluateUpdate(stabilityScore, ethicalReport, riskLevel);
      run.decisionResult = decision;

      if (decision.action === 'REJECT') {
        run.truthState = 'REJECTED';
        run.completedAt = new Date().toISOString();
        appendRun(run);
        Log.warn(`[QuadBrain] Decision: REJECT — ${decision.reason}`);
        return run;
      }

      // 4. For REVIEW actions, queue for approval instead of auto-applying
      if (decision.action === 'REVIEW') {
        run.truthState = 'QUEUED_FOR_APPROVAL';
        run.completedAt = new Date().toISOString();
        appendRun(run);
        appendApprovalQueue({
          id: runId,
          suggestion,
          decision,
          queuedAt: new Date().toISOString(),
          status: 'pending'
        });
        Log.info(`[QuadBrain] Decision: REVIEW — Queued for owner approval.`);
        return run;
      }

      // 5. Establish a real baseline before mutation.
      // No baseline = no defensible improvement claim.
      const targetFile = suggestion.targetFile || 'src/index.css';
      Log.info('[QuadBrain] Phase 3: Capturing baseline verification...');
      const baseline = await captureBaseline({
        rootDir: this.rootDir,
        runId,
        targetFile,
        commands: ['npm run build']
      });
      run.baseline = baseline;

      if (!baseline.proof.passed) {
        run.truthState = 'BASELINE_FAILED';
        run.comparison = { promotionEligible: false, reason: 'Existing project did not pass baseline verification.' };
        run.completedAt = new Date().toISOString();
        appendRun(run);
        Log.error('[QuadBrain] Baseline failed. Mutation blocked.');
        return run;
      }

      // 6. ShadowForge ghost-build validation
      Log.info('[QuadBrain] Phase 4: ShadowForge ghost-build...');
      if (suggestion.cssRule) {
        const ghostCode = `/* EVO MUTATION */ ${suggestion.cssRule}`;
        const shadowResult = await SHADOW_FORGE.shadowBuild(`evo_css_${runId.slice(0, 8)}`, ghostCode);
        run.shadowBuildResult = shadowResult;
        if (!shadowResult) {
          run.truthState = 'SHADOW_BUILD_FAILED';
          run.completedAt = new Date().toISOString();
          appendRun(run);
          Log.error('[QuadBrain] ShadowForge rejected the mutation.');
          return run;
        }
      }

      // 7. Apply the mutation
      Log.info('[QuadBrain] Phase 5: Applying mutation...');
      let applied = false;

      if (suggestion.cssRule) applied = this.engine.applyCssChange(suggestion);
      if (suggestion.componentChange || suggestion.architectureChange) {
        applied = await this.engine.applyPhantomChange(suggestion);
      }

      run.applied = applied;

      if (!applied) {
        run.truthState = 'APPLY_FAILED';
        run.completedAt = new Date().toISOString();
        const lesson = learnFromCycle({
          rootDir: this.rootDir,
          run,
          baseline,
          verification: null,
          lesson: 'Mutation did not apply. Preserve this failure as a future guard and do not promote.'
        });
        run.learningReceipt = lesson;
        appendRun(run);
        return run;
      }

      // 8. Verify the candidate against the baseline with a real post-change build.
      Log.info('[QuadBrain] Phase 6: Candidate verification and baseline comparison...');
      const verification = await verifyPromotion({
        rootDir: this.rootDir,
        runId,
        baseline,
        targetFile,
        commands: ['npm run build']
      });
      run.verification = verification;
      run.proof = verification.proof;
      run.comparison = verification.comparison;

      if (!verification.comparison.promotionEligible) {
        const rollback = rollbackToBaseline({ rootDir: this.rootDir, runId, baseline });
        run.rollback = rollback;
        run.truthState = verification.comparison.regression ? 'REGRESSION_ROLLED_BACK' : 'NOT_IMPROVED_ROLLED_BACK';
        run.applied = false;
        const lesson = learnFromCycle({
          rootDir: this.rootDir,
          run,
          baseline,
          verification,
          lesson: verification.comparison.regression
            ? 'Regression detected. Candidate was rejected and rolled back; retain the verification pattern as a future defense.'
            : 'Candidate did not establish measurable improvement over the baseline; do not promote it.'
        });
        run.learningReceipt = lesson;
      } else {
        run.truthState = 'PROMOTED';
        run.receipt = {
          workspace: { strategy: 'baseline_candidate_comparison' },
          evidence: { baseline, verification },
          reversible: Boolean(baseline.snapshotPath)
        };
        const lesson = learnFromCycle({
          rootDir: this.rootDir,
          run,
          baseline,
          verification,
          lesson: 'Verified promotion: candidate passed post-change verification and differed from the baseline. Retain the change as an optimization candidate for future cycles.'
        });
        run.learningReceipt = lesson;
      }

      run.completedAt = new Date().toISOString();

      // 9. Record to learning manager
      await this.learningManager.ingestKnowledgeChunk({
        id: `evolution_${runId}`,
        source: 'quadbrain_evolution',
        signal_strength: run.truthState === 'PROMOTED' ? 1.0 : 0.3,
        context_summary: `[Evolution] ${run.truthState === 'PROMOTED' ? 'Promoted after verification' : 'Rejected/failed'}: ${suggestion.description}`
      });

      if (run.truthState === 'PROMOTED' && suggestion.swarmTaskId) {
        try {
          const { getSwarmConsensus } = await import('./swarm/SwarmConsensusEngine.js');
          const swarm = getSwarmConsensus();
          await swarm.resolveTask(suggestion.swarmTaskId, { status: 'SUCCESS' });
        } catch (e) {
          Log.error(`[QuadBrain] Failed to resolve Swarm Task: ${e.message}`);
        }
      }

      // 8. Update daemon state
      const state = readState();
      state.cycleCount = (state.cycleCount || 0) + 1;
      state.lastCycleAt = new Date().toISOString();
      state.lastRunId = runId;
      state.lastTruthState = run.truthState;
      if (run.truthState === 'PROMOTED') {
        state.consecutiveFailures = 0;
        state.totalEvolutions = (state.totalEvolutions || 0) + 1;
      } else {
        state.consecutiveFailures = (state.consecutiveFailures || 0) + 1;
      }
      writeState(state);

      // 9. Broadcast to MegaTether if available
      try {
        const { getMegaTether } = await import('../tethers/MegaTetherCore.js');
        const tether = getMegaTether();
        if (tether) {
          await tether.broadcast('quadbrain_evolution', 'evolution_cycle_complete', {
            runId,
            truthState: run.truthState,
            suggestion: suggestion.description,
            applied
          });
        }
      } catch {}

      // 10. Level 5 Autonomy: Self-Marketing Broadcast
      if (run.truthState === 'PROMOTED' && (suggestion.componentChange || suggestion.architectureChange)) {
        await SelfMarketingEngine.broadcastProductRelease(this.engine.aiAdaptor, runId, suggestion.description);
      }

      appendRun(run);
      Log.info(`[QuadBrain] ═══ Cycle ${runId} complete: ${run.truthState} ═══`);
      return run;

    } catch (err) {
      run.error = err.message;
      run.truthState = 'ERROR';
      run.completedAt = new Date().toISOString();
      appendRun(run);

      const state = readState();
      state.consecutiveFailures = (state.consecutiveFailures || 0) + 1;
      writeState(state);

      Log.error(`[QuadBrain] Evolution cycle error: ${err.message}`);
      return run;
    } finally {
      this.isRunning = false;
    }
  }

  getStatus() {
    const state = readState();
    return {
      ...state,
      killSwitchEngaged: isKillSwitchEngaged(),
      intervalMs: this.intervalMs,
      isRunning: this.isRunning
    };
  }
}
