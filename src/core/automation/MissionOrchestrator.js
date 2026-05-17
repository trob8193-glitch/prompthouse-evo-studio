import { Log } from '../autonomy/SovereignLogger.js';
import { EVO_DEV_TEAM } from '../../bot-characters.jsx';

/**
 * PH EVO STUDIO — MISSION ORCHESTRATOR (PHASE 14)
 * ═══════════════════════════════════════════════════════════════
 * Translates AI Architect strategy into atomic bot missions.
 * Manages the autonomous execution loop for the 21 Sentients.
 */

export class MissionOrchestrator {
  constructor() {
    this.active_missions = [];
    this.current_strategy = null;
  }

  async loadStrategy(strategyText) {
    Log.info('🎯 [Orchestrator] Loading new strategy from Architect...');
    this.current_strategy = strategyText;
    return this.parseMissions();
  }

  async parseMissions() {
    Log.info('🔍 [Orchestrator] Parsing strategy into bot-specific tasks...');
    // In a real production loop, this would use LLM to fragment the strategy
    // For now, we seed the first autonomous task-mapping logic
    const tasks = [
      { botId: 1, task: 'Audit build stability', status: 'PENDING' },
      { botId: 4, task: 'Synchronize Tunnel UI', status: 'PENDING' },
      { botId: 12, task: 'Scan for hull fragments', status: 'PENDING' }
    ];
    this.active_missions = tasks;
    return tasks;
  }

  async executeMissions() {
    Log.success(`🚀 [Orchestrator] Launching ${this.active_missions.length} autonomous missions...`);
    
    // [WIRING] Start Rift Session for the overall mission batch
    const sessionRes = await fetch('http://127.0.0.1:3002/api/rift/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionName: `Mission Sequence ${Date.now()}`,
        metadata: { missionCount: this.active_missions.length }
      })
    }).catch(() => null);
    
    const session = sessionRes ? await sessionRes.json() : null;
    const sessionId = session?.data?.session?.id;

    for (const mission of this.active_missions) {
      const bot = EVO_DEV_TEAM.find(b => b.id === mission.botId);
      Log.info(`🤖 [${bot.name}] Starting task: ${mission.task}`);
      mission.status = 'EXECUTING';

      // [WIRING] Log bot-specific event to Rift
      if (sessionId) {
        fetch(`http://127.0.0.1:3002/api/rift/sessions/${sessionId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'NPC_EVENT_GENERATED',
            payload: { botId: mission.botId, botName: bot.name, task: mission.task }
          })
        }).catch(() => {});
      }
    }
  }
}
