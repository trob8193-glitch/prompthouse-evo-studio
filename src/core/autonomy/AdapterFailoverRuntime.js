import { Log } from './SovereignLogger.js';

/**
 * AdapterFailoverRuntime
 * Provides an intelligent resilience layer for the Universal AI Adaptor.
 * Automatically pivots to secondary providers (e.g., Anthropic/Claude) if the primary (OpenAI) degrades.
 */
export class AdapterFailoverRuntime {
  constructor(primaryAdapter, secondaryAdapter) {
    this.primary = primaryAdapter;
    this.secondary = secondaryAdapter;
    this.activeProvider = 'primary';
    this.errorThreshold = 3;
    this.errorCount = 0;
    this.fallbackActive = false;
  }

  async executeWithResilience(method, args) {
    const target = this.fallbackActive ? this.secondary : this.primary;
    if (!target) {
      throw new Error('AdapterFailoverRuntime: Target adapter is not initialized.');
    }

    try {
      const startTime = Date.now();
      const result = await target[method](...args);
      const latency = Date.now() - startTime;
      
      Log.info(`[AdapterFailoverRuntime] ${this.fallbackActive ? 'Secondary' : 'Primary'} adapter responded in ${latency}ms.`);
      
      // Decay errors on success
      if (this.errorCount > 0) this.errorCount--;
      
      return result;
    } catch (error) {
      Log.error(`[AdapterFailoverRuntime] Error encountered on ${this.fallbackActive ? 'Secondary' : 'Primary'} adapter:`, error.message);
      
      if (!this.fallbackActive && this.isRetryableError(error)) {
        this.errorCount++;
        
        if (this.errorCount >= this.errorThreshold) {
          Log.warn(`[AdapterFailoverRuntime] Primary adapter failed ${this.errorCount} times. Triggering failover to secondary adapter.`);
          this.triggerFailover();
          return this.executeWithResilience(method, args); // Retry with secondary
        }
      }
      
      throw error;
    }
  }

  isRetryableError(error) {
    // Treat 429 Too Many Requests or generic network errors as retryable
    const msg = error.message.toLowerCase();
    return msg.includes('429') || msg.includes('rate limit') || msg.includes('timeout') || msg.includes('econnrefused');
  }

  triggerFailover() {
    if (this.secondary) {
      this.fallbackActive = true;
      this.activeProvider = 'secondary';
      Log.info('[AdapterFailoverRuntime] Failover mechanism engaged successfully.');
    } else {
      Log.error('[AdapterFailoverRuntime] Cannot trigger failover: Secondary adapter not configured.');
    }
  }
  
  resetFailover() {
    this.fallbackActive = false;
    this.activeProvider = 'primary';
    this.errorCount = 0;
    Log.info('[AdapterFailoverRuntime] Failover mechanism reset. Primary adapter restored.');
  }

  status() {
    return {
      activeProvider: this.activeProvider,
      fallbackActive: this.fallbackActive,
      errorCount: this.errorCount
    };
  }
}
