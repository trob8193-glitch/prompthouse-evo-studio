/**
 * PH EVO STUDIO — fallback MODULE MARKER
 * ═══════════════════════════════════════════════════════════════
 * This module provides a standardized "honest fallback" pattern.
 * Instead of claiming to be 'FULFILLED' and 'S+++++', modules
 * that are not yet implemented should use this to clearly report
 * their NOT_IMPLEMENTED status to the audit system.
 *
 * Usage:
 *   import { createHonestfallback } from '../fallback-marker.js';
 *   export const MyModule = createHonestfallback('MyModule', 'Description of what this should do');
 */

export function createHonestfallback(moduleName, description = '') {
  return {
    name: moduleName,
    description,
    status: 'NOT_IMPLEMENTED',
    grade: 'fallback',
    resonance: 0,
    implemented: false,

    async execute(params = {}) {
      console.warn(`[fallback] ${moduleName}.execute() called but not yet implemented.`);
      return {
        success: false,
        fallback: true,
        module: moduleName,
        message: `${moduleName} is a planned feature that has not been implemented yet.`,
        timestamp: new Date().toISOString(),
      };
    },

    getStatus() {
      return {
        id: moduleName,
        grade: 'fallback',
        state: 'NOT_IMPLEMENTED',
        resonance: 0,
        description,
      };
    },
  };
}

/**
 * Creates a class-based honest fallback for modules that are imported as classes.
 */
export class HonestFallbackClass {
  constructor(moduleName, description = '') {
    this.name = moduleName;
    this.description = description;
    this.status = 'NOT_IMPLEMENTED';
    this.iq_baseline = 0;
  }

  async execute(params = {}) {
    console.warn(`[fallback] ${this.name}.execute() called but not yet implemented.`);
    return {
      success: false,
      fallback: true,
      module: this.name,
      message: `${this.name} is a planned feature that has not been implemented yet.`,
      timestamp: new Date().toISOString(),
    };
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'fallback',
      state: 'NOT_IMPLEMENTED',
      resonance: 0,
      description: this.description,
    };
  }
}
