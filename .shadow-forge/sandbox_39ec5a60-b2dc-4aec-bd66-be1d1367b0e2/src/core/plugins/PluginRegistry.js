import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Log } from '../autonomy/SovereignLogger.js';

let __dirname = '';
try { __dirname = path.dirname(fileURLToPath(import.meta.url)); } catch (e) { __dirname = process.cwd(); }

export class PluginRegistry {
  constructor() {
    this.plugins = new Map();
  }

  async register(pluginInstance) {
    if (this.plugins.has(pluginInstance.id)) {
      Log.warn(`[PluginRegistry] Plugin ${pluginInstance.id} is already registered.`);
      return false;
    }
    
    this.plugins.set(pluginInstance.id, pluginInstance);
    Log.info(`\x1b[35m[PluginRegistry]\x1b[0m Registered: ${pluginInstance.name} (v${pluginInstance.version})`);
    
    try {
      if (typeof pluginInstance.onInstall === 'function') {
        await pluginInstance.onInstall(this);
      }
    } catch (e) {
      Log.error(`[PluginRegistry] Error during onInstall for ${pluginInstance.id}: ${e.message}`);
    }

    return true;
  }

  get(id) {
    return this.plugins.get(id);
  }

  getAll() {
    return Array.from(this.plugins.values());
  }

  // Hook Dispatchers
  
  dispatchBackendRoutes(app) {
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.onBackendRoute === 'function') {
        plugin.onBackendRoute(app);
      }
    }
  }

  async dispatchMobileIntent(intent) {
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.onMobileIntent === 'function') {
        const result = await plugin.onMobileIntent(intent);
        if (result) return result; // First plugin to handle it wins
      }
    }
    return null;
  }

  async dispatchEvolutionCycle(spatialData) {
    const suggestions = [];
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.onEvolutionCycle === 'function') {
        const result = await plugin.onEvolutionCycle(spatialData);
        if (result) suggestions.push(result);
      }
    }
    return suggestions;
  }

  // Dynamic Loading from Active Directory
  async loadActivePlugins(activeDir) {
    if (!fs.existsSync(activeDir)) return;
    
    const files = fs.readdirSync(activeDir).filter(f => f.endsWith('.plugin.js') || f.endsWith('.plugin.mjs'));
    for (const file of files) {
      const fullPath = path.join(activeDir, file);
      try {
        const module = await import(`file://${fullPath}?ts=${Date.now()}`); // Cache busting
        if (module.default) {
          const plugin = new module.default();
          await this.register(plugin);
        }
      } catch (e) {
        Log.error(`[PluginRegistry] Failed to load plugin ${file}: ${e.message}`);
      }
    }
  }
}

// Singleton instance export
export const GlobalPluginRegistry = new PluginRegistry();
