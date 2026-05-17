import { Log } from './SovereignLogger.js';
import { HolographicStorage } from '../memory/HolographicStorage.js';
import { PredictiveCache } from '../memory/PredictiveCache.js';

const storage = new HolographicStorage();
const cache = new PredictiveCache();

/**
 * PH EVO STUDIO — BOT RESIDENT MANAGER (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Manages the physical location and actions of Bots within the Manor.
 * Enables bots to roam the filesystem autonomously.
 */

export class BotResidentManager {
  constructor() {
    this.residents = new Map();
    this.initRoster();
  }

  initRoster() {
    this.residents.set('panther', { name: 'Panther-Dev', location: 'src/core/foundry', action: 'IDLE' });
    this.residents.set('diffuser', { name: 'Evo-Diffuser', location: 'evogenage/apps/api', action: 'IDLE' });
    this.residents.set('lion', { name: 'Evo-Lion', location: 'SOVEREIGN_MANIFEST.md', action: 'IDLE' });
  }

  /**
   * Move a bot to a new room (directory or file).
   */
  async moveResident(botId, newLocation, action = 'MOVING') {
    const bot = this.residents.get(botId);
    if (!bot) return;

    console.log(`🏠 [Manor] ${bot.name} is moving from ${bot.location} to ${newLocation}`);
    
    bot.location = newLocation;
    bot.action = action;
    
    this.residents.set(botId, bot);
  }

  /**
   * Amplify a bot by edging it to high-fidelity memory and foresight.
   */
  async amplifyBot(botId) {
    const bot = this.residents.get(botId);
    if (!bot) return;

    console.log(`⚡ [Manor] Edging ${bot.name} to Holographic Memory & Predictive Cache...`);
    
    bot.memory_edge = storage.id;
    bot.foresight_edge = cache.id;
    bot.iq_boost = 1.5;

    this.residents.set(botId, bot);
    console.log(`✅ [Manor] ${bot.name} has been AMPLIFIED.`);
  }
}

export const RESIDENT_MANAGER = new BotResidentManager();
