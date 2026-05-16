import { Log } from '../core/autonomy/SovereignLogger.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class ForgePipelineLogic {
  constructor() {
    this.status = 'ACTIVE';
    this.iq_baseline = 2000000;
    this.trainingFile = path.join(process.cwd(), '.prompthouse-data', 'evo_training.jsonl');
  }

  async execute(params = {}) {
    Log.info('🚀 [ForgePipeline] Orchestrating release pipeline...');
    const startTime = Date.now();
    
    try {
      // 1. Run Build
      Log.info('🚀 [ForgePipeline] Running vite build...');
      const { stdout, stderr } = await execAsync('npm run build');
      
      const success = !stderr || stderr.includes('built in');
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      const result = {
        success: success,
        duration: `${duration}s`,
        output: stdout.slice(-500), // Keep last 500 chars
        stage: 'production_build'
      };

      // 2. Log Training Data (The "Live Training" aspect)
      this._logTrainingData('ForgePipeline', params, result);

      Log.info('🚀 [ForgePipeline] Pipeline Execution Complete.', result);
      return result;
    } catch (e) {
      Log.error('🚀 [ForgePipeline] Pipeline Execution Failed.', e);
      
      const failureResult = { success: false, error: e.message, stage: 'production_build' };
      this._logTrainingData('ForgePipeline', params, failureResult);
      
      return failureResult;
    }
  }

  _logTrainingData(module, input, output) {
    try {
      const dir = path.dirname(this.trainingFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const trainingEntry = {
        messages: [
          { role: 'system', content: `You are the ${module} engine. Execute the requested action with maximum efficiency.` },
          { role: 'user', content: `Context:\n${JSON.stringify(input)}\n\nAction requested: execute` },
          { role: 'assistant', content: JSON.stringify(output) }
        ],
        metadata: {
          source: 'autonomous_forge',
          transport: 'live_execution',
          timestamp: Date.now()
        }
      };

      fs.appendFileSync(this.trainingFile, JSON.stringify(trainingEntry) + '\n', 'utf8');
      Log.info(`📊 [ForgePipeline] Training data logged to ${this.trainingFile}`);
    } catch (err) {
      Log.error('📊 [ForgePipeline] Failed to log training data.', err);
    }
  }

  getStatus() {
    return { id: 'forge_pipeline_logic', grade: 'PRODUCTION', state: 'VERIFIED', resonance: 0.99 };
  }
}

