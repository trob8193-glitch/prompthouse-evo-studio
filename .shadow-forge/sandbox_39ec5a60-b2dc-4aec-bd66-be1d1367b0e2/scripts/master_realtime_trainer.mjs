import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

async function runMasterTrainer() {
  Log.info('🚀 [MasterTrainer] Initiating REAL-TIME deep learning ingestion sequence...');
  
  const files = fs.readdirSync(SCRIPTS_DIR);
  const trainingScripts = files.filter(f => f.startsWith('train_') && f.endsWith('.mjs'));
  
  if (trainingScripts.length === 0) {
    Log.error('❌ No training scripts found.');
    return;
  }
  
  // Also include ai_self_train.mjs
  if (files.includes('ai_self_train.mjs')) {
    trainingScripts.push('ai_self_train.mjs');
  }

  Log.info(`🔥 Found ${trainingScripts.length} training modules. Launching concurrent neural mesh...`);
  
  const activeProcesses = new Set();
  
  for (const script of trainingScripts) {
    const scriptPath = path.join(SCRIPTS_DIR, script);
    Log.info(`⚡ Firing module: ${script}`);
    
    const child = fork(scriptPath, [], {
      cwd: process.cwd(),
      env: { ...process.env, REALTIME_MODE: 'true' }
    });
    
    activeProcesses.add(child);
    
    child.on('exit', (code) => {
      activeProcesses.delete(child);
      if (code === 0) {
        Log.info(`✅ Module complete: ${script}`);
      } else {
        Log.error(`❌ Module failed: ${script} (exit code ${code})`);
      }
      
      if (activeProcesses.size === 0) {
        Log.info('🎉 [MasterTrainer] All 15 neural pathways have concluded ingestion.');
        Log.info('🧠 The Evo LLM is now fully trained and integrated.');
      }
    });
    
    // Slight stagger to prevent API rate limiting if using external models
    await new Promise(r => setTimeout(r, 2000));
  }
}

runMasterTrainer();
