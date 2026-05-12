import { ReplicateProvider } from './ReplicateProvider';
import { LocalComfyUIProvider } from './LocalComfyUIProvider';
import { IModelProvider } from './IModelProvider';

/**
 * EVOGENAGE — INTEROP CONTROLLER (AUTONOMOUS SWITCH)
 * ═══════════════════════════════════════════════════════════════
 * Dynamically switches between Local and Cloud providers based on 
 * health, latency, and connectivity.
 */

export class InteropController {
  private cloudProvider = new ReplicateProvider();
  private localProvider = new LocalComfyUIProvider();

  /**
   * Select the best available provider for the current environment.
   */
  async selectProvider(): Promise<IModelProvider> {
    const cloudStatus = await this.cloudProvider.statusCheck();
    
    if (cloudStatus === 'online' && this.cloudProvider.isConfigured()) {
      console.log('📡 [Interop] Cloud Provider is Online. Using Replicate.');
      return this.cloudProvider;
    }

    console.log('🏠 [Interop] Cloud Offline or Unconfigured. Switching to Local Autonomy (ComfyUI).');
    return this.localProvider;
  }
}
