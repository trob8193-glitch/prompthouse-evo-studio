/**
 * PH EVO STUDIO — STUB MODULE MARKER
 * ═══════════════════════════════════════════════════════════════
 * This module provides a standardized "honest stub" pattern.
 * Instead of claiming to be 'FULFILLED' and 'S+++++', modules
 * that are not yet implemented should use this to clearly report
 * their NOT_IMPLEMENTED status to the audit system.
 *
 * Usage:
 *   import { createHonestStub } from '../stub-marker.js';
 *   export const MyModule = createHonestStub('MyModule', 'Description of what this should do');
 */

export function createHonestStub(moduleName, description = '') {
  return {
    name: moduleName,
    description,
    status: 'NOT_IMPLEMENTED',
    grade: 'STUB',
    resonance: 0,
    implemented: false,

    async execute(params = {}) {
      console.warn(`[STUB] ${moduleName}.execute() called but not yet implemented.`);
      return {
        success: false,
        stub: true,
        module: moduleName,
        message: `${moduleName} is a planned feature that has not been implemented yet.`,
        timestamp: new Date().toISOString(),
      };
    },

    getStatus() {
      return {
        id: moduleName,
        grade: 'STUB',
        state: 'NOT_IMPLEMENTED',
        resonance: 0,
        description,
      };
    },
  };
}

/**
 * Creates a class-based honest stub for modules that are imported as classes.
 */
export class HonestStubClass {
  constructor(moduleName, description = '') {
    this.name = moduleName;
    this.description = description;
    this.status = 'NOT_IMPLEMENTED';
    this.iq_baseline = 0;
  }

  async execute(params = {}) {
    console.warn(`[STUB] ${this.name}.execute() called but not yet implemented.`);
    return {
      success: false,
      stub: true,
      module: this.name,
      message: `${this.name} is a planned feature that has not been implemented yet.`,
      timestamp: new Date().toISOString(),
    };
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'STUB',
      state: 'NOT_IMPLEMENTED',
      resonance: 0,
      description: this.description,
    };
  }
}
