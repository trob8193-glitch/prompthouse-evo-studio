import fs from 'fs';
import path from 'path';

/**
 * EnterpriseLicenseManager
 * 
 * Manages the boundary between the Free Open-Core and the Enterprise Edition.
 * Verifies if the studio is running with a valid enterprise license key.
 */
export class EnterpriseLicenseManager {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.envPath = path.join(this.workspaceRoot, '.env');
  }

  getEnvValue(key) {
    if (!fs.existsSync(this.envPath)) return process.env[key];
    const lines = fs.readFileSync(this.envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.replace(/\r$/, '').match(/^([^#=]+)=(.*)$/);
      if (match && match[1].trim() === key) {
        return match[2].trim();
      }
    }
    return process.env[key];
  }

  /**
   * Checks if the studio is operating under an Enterprise License.
   * @returns {boolean}
   */
  hasPremiumAccess() {
    const key = this.getEnvValue('PH_ENTERPRISE_LICENSE_KEY');
    
    // For MVP validation, any key starting with "PROMPTHOUSE-ENT-" is considered valid.
    // In production, this would call a remote billing/licensing server (e.g., Stripe/LemonSqueezy).
    if (key && key.startsWith('PROMPTHOUSE-ENT-')) {
      return true;
    }
    
    return false;
  }

  /**
   * Throws an error if the studio is not running an Enterprise License.
   * Used to hard-gate critical autonomous daemons.
   */
  enforceEnterprise(featureName) {
    if (!this.hasPremiumAccess()) {
      throw new Error(`[LOCKED] ${featureName} requires an active Premium License to operate. Please upgrade.`);
    }
  }
}
