import { Log } from './SovereignLogger.js';
/**
 * EVOGENAGE — EVO STUDIO INTERFACE LAYER (SIL)
 * ═══════════════════════════════════════════════════════════════
 * Grants Bots the 'Hands' to interact with any feature in the Studio.
 * Maps UI and Logic controls to Bot-Callable methods.
 */

export class SovereignInterfaceLayer {
  constructor(studio) {
    this.studio = studio;
  }

  /**
   * Universal Action Dispatcher.
   * Allows a bot to call any registered studio feature.
   */
  async botAction(botId, action, params = {}) {
    Log.info(`🤖 [SIL] Bot ${botId} is executing: ${action}`);

    switch (action) {
      case 'TOGGLE_REALITY_GUARD':
        return await this.studio.realityGuard.toggle();
      case 'TRIGGER_HEALING':
        return await this.studio.selfHeal.execute({ target: params.path });
      case 'DEPLOY_GENESIS':
        return await this.studio.seedSower.sowGenesisPack(params.packId, 'PRODUCTION');
      case 'UPDATE_UI_THEME':
        return await this.studio.evoEngine.evolveProfile(params.dnaUpdates);
      default:
        Log.error(`❌ [SIL] Action '${action}' not mapped to a physical control.`);
    }
  }
}

export const SIL = new SovereignInterfaceLayer({
  realityGuard: { toggle: () => Log.info('🛡️ RealityGuard Toggled.') },
  selfHeal: { execute: (p) => Log.info(`🛠️ Healing ${p.target}...`) },
  seedSower: { sowGenesisPack: (id, env) => Log.info(`🌱 Sowing ${id} to ${env}...`) },
  evoEngine: { evolveProfile: (u) => Log.info(`🧬 Evolving DNA: ${JSON.stringify(u)}`) }
});
