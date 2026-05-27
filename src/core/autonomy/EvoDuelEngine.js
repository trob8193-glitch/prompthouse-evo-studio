import { Log } from './SovereignLogger.js';
import crypto from 'crypto';

/**
 * PH EVO STUDIO — EVO DUEL ENGINE (PHASE 14)
 * ═══════════════════════════════════════════════════════════════
 * Competitive evaluation framework for sentient agents.
 * Resolves logic conflicts by pitting bot-strategies against 
 * each other in the 'Logic Arena'.
 */

export class EvoDuelEngine {
  constructor(roster) {
    this.roster = roster;
    this.duel_history = [];
  }

  async initiateDuel(botAId, botBId, logicTarget) {
    const botA = this.roster.find(b => b.id === botAId);
    const botB = this.roster.find(b => b.id === botBId);

    Log.info(`⚔️ [Duel] Initiating logic duel: ${botA.name} vs ${botB.name}`);
    Log.info(`📍 Target: ${logicTarget}`);

    // Deterministic evaluation based on keyword matching + stable hash tie-break.
    const evaluate = (bot, target) => {
      const keywords = target.toLowerCase().split(' ');
      const botNameWords = bot.name.toLowerCase().split(' ');
      const botRoleWords = (bot.role || '').toLowerCase().split(' ');
      
      let score = 0;
      keywords.forEach(word => {
        if (botNameWords.includes(word)) score += 10;
        if (botRoleWords.includes(word)) score += 5;
      });
      
      // Bonus for experience (numeric id if present).
      const numericId = Number(bot.id);
      if (Number.isFinite(numericId)) score += numericId * 0.1;

      if (score > 0) return score;

      // Stable fallback (no randomness): hash(botId + target) mapped to [0, 1).
      const seed = `${String(bot.id ?? bot.name)}::${target}`;
      const h = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 8);
      const n = parseInt(h, 16) / 0xffffffff;
      return n;
    };

    const scoreA = evaluate(botA, logicTarget);
    const scoreB = evaluate(botB, logicTarget);

    const winner = scoreA >= scoreB ? botA : botB;
    const resonance = Math.max(scoreA, scoreB) / (scoreA + scoreB || 1);

    const duelResult = {
      timestamp: Date.now(),
      participants: [botA.name, botB.name],
      target: logicTarget,
      winner: winner.name,
      resonance: resonance.toFixed(4)
    };

    this.duel_history.push(duelResult);
    Log.success(`🏆 [Duel] Winner: ${winner.name} (Resonance: ${resonance.toFixed(4)})`);
    
    return duelResult;
  }

  getRankings() {
    // Logic to calculate bot efficiency rankings based on duel wins
    return this.duel_history;
  }
}
