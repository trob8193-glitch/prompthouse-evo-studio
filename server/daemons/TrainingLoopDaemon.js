import { getEvoTrainingState, saveState } from '../../src/core/evo-llm/EvoLlmTrainingOrchestrator.js';

export class TrainingLoopDaemon {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.intervalId = null;
    this.isRunning = false;
  }

  start(intervalMs = 60000) {
    if (this.intervalId) return;
    
    console.log(`[TrainingLoopDaemon] Starting background pipeline with ${intervalMs}ms tick.`);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    // run an initial tick right away
    this.tick();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[TrainingLoopDaemon] Stopped.');
    }
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const state = getEvoTrainingState({ rootDir: this.rootDir });
      
      let modified = false;

      // Find jobs that are queued or running
      for (const run of state.runs) {
        if (run.truthState === 'PROVIDER_FINE_TUNE_JOB_QUEUED' || run.truthState === 'PROVIDER_FINE_TUNE_RUNNING') {
          console.log(`[TrainingLoopDaemon] Polling status for run ${run.id}...`);
          
          if (process.env.OPENAI_API_KEY || true) {
            try {
              const { OpenAIFineTuningAdapter } = await import('../../src/core/evo-llm/OpenAIFineTuningAdapter.js');
              const adapter = new OpenAIFineTuningAdapter();
              
              const statusResult = await adapter.getJobStatus(run.providerJobId);
              
              if (statusResult.status === 'succeeded') {
                run.truthState = 'PROVIDER_FINE_TUNE_SUCCEEDED';
                run.message = `Fine-tuning completed. New model: ${statusResult.fine_tuned_model}`;
                modified = true;
              } else if (statusResult.status === 'running') {
                run.truthState = 'PROVIDER_FINE_TUNE_RUNNING';
                modified = true;
              } else if (statusResult.status === 'failed' || statusResult.error) {
                run.truthState = 'PROVIDER_FINE_TUNE_FAILED';
                run.message = `Job failed: ${statusResult.error}`;
                modified = true;
              }
            } catch (err) {
              console.error(`[TrainingLoopDaemon] Failed to poll run ${run.id}:`, err.message);
              if (err.message.includes('Could not find fine tune') || err.message.includes('Not Found') || err.message.includes('404')) {
                run.truthState = 'PROVIDER_FINE_TUNE_FAILED';
                run.message = `Job lost or not found: ${err.message}`;
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        saveState(this.rootDir, state);
      }
    } catch (e) {
      console.error('[TrainingLoopDaemon] Error during tick:', e);
    } finally {
      this.isRunning = false;
    }
  }
}
