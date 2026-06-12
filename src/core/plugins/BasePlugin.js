export class BasePlugin {
  constructor(config = {}) {
    this.id = config.id || 'anonymous_plugin_' + Date.now();
    this.name = config.name || 'Anonymous Plugin';
    this.version = config.version || '1.0.0';
    this.capabilities = config.capabilities || [];
  }

  /**
   * Called when the plugin is successfully registered in the PluginRegistry.
   */
  async onInstall(registry) {
    // Default: No-op
  }

  /**
   * Called to register Express routes on the backend.
   * @param {import('express').Application} app
   */
  onBackendRoute(app) {
    // Default: No-op
  }

  /**
   * Called to intercept or add OmniBot Mobile intents.
   * @param {Object} intent
   * @returns {Object|null} The resolved intent handling response, or null to pass to next.
   */
  async onMobileIntent(intent) {
    return null;
  }

  /**
   * Called during Blended Evolution cycles to provide custom insights or suggestions.
   * @param {Object} spatialData
   * @returns {Object|null}
   */
  async onEvolutionCycle(spatialData) {
    return null;
  }
}
