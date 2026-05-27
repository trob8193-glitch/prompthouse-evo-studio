import { EvoDuelEngine } from '../src/core/autonomy/EvoDuelEngine.js';
import { EVO_DEV_TEAM } from '../src/bot-characters.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

async function runLiveDuel() {
  const engine = new EvoDuelEngine(EVO_DEV_TEAM);
  
  Log.info('🔥 [Arena] PREPARING FOR LOGIC DUEL...');
  Log.info('🤺 [Participants]: LION-1 (Architect) vs TIGER-5 (Striker)');
  Log.info('🧬 [Target]: QUANTUM_SEEDING_OPTIMIZATION');
  
  const result = await engine.initiateDuel(1, 5, 'QUANTUM_SEEDING_OPTIMIZATION');
  
  console.log('\n=======================================');
  console.log(`🏆 WINNER: ${result.winner}`);
  console.log(`📊 RESONANCE: ${result.resonance}`);
  console.log(`🕒 TIMESTAMP: ${new Date(result.timestamp).toLocaleTimeString()}`);
  console.log('=======================================\n');
}

runLiveDuel().catch(console.error);
