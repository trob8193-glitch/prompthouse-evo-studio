import { 
  planEvoLlmTraining, 
  approveEvoTrainingPlan, 
  runEvoTrainingJob 
} from '../src/core/evo-llm/EvoLlmTrainingOrchestrator.js';

async function executeTrainingSequence() {
  console.log('\n[EvoLlmTraining] ========================================');
  console.log('[EvoLlmTraining] INITIATING EVO LLM TRAINING ORCHESTRATOR');
  console.log('[EvoLlmTraining] ========================================\n');

  try {
    // Step 1: Plan
    console.log('[EvoLlmTraining] PHASE 1: Planning and Dataset Evaluation...');
    const plan = planEvoLlmTraining({
      providerAllowed: 'openai',
      taskComplexity: 'expert'
    });
    
    if (plan.truthState === 'TRAINING_PLAN_BLOCKED') {
      console.error('[EvoLlmTraining] FATAL: Training Plan Blocked.');
      console.error(plan.blockers);
      process.exit(1);
    }
    
    console.log(`[EvoLlmTraining] > Plan Generated: ${plan.id}`);
    console.log(`[EvoLlmTraining] > Dataset Score: ${plan.evalReport.datasetQualityScore}`);
    
    // Step 2: Approve
    console.log('\n[EvoLlmTraining] PHASE 2: Simulating Owner Approval...');
    const approval = approveEvoTrainingPlan({
      planId: plan.id,
      actor: 'system_automation',
      note: 'Auto-approved via CLI runner'
    });
    console.log(`[EvoLlmTraining] > Plan Approved. Truth State: ${approval.truthState}`);

    // Step 3: Run
    console.log('\n[EvoLlmTraining] PHASE 3: Dispatching to Provider...');
    const run = await runEvoTrainingJob({
      planId: plan.id,
      provider: 'openai'
    });

    console.log(`\n[EvoLlmTraining] RUN COMPLETE`);
    console.log(`- Truth State: ${run.truthState}`);
    console.log(`- Message: ${run.message}`);
    if (run.providerJobId) {
      console.log(`- Provider Job ID: ${run.providerJobId}`);
    }
    console.log(`- Receipt: ${run.receiptFile}`);

  } catch (err) {
    console.error(`\n[EvoLlmTraining] ERROR: Execution failed.`, err.message);
    process.exit(1);
  }
}

executeTrainingSequence();
