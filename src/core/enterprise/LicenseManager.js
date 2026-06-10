import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export class LicenseManager {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.licensePath = path.join(dataDir, 'enterprise.lic');
    this.licenseState = {
      isEnterprise: false,
      tier: 'community',
      expiresAt: null,
      organization: null,
      truthState: 'COMMUNITY_MODE',
      reason: 'No enterprise license has been verified.'
    };
    this.verifyLicense();
  }

  setCommunityMode(reason = 'No enterprise license has been verified.', truthState = 'COMMUNITY_MODE') {
    this.licenseState = {
      isEnterprise: false,
      tier: 'community',
      expiresAt: null,
      organization: null,
      truthState,
      reason
    };
  }

  verifyLicense() {
    if (!fs.existsSync(this.licensePath)) {
      global.Log && global.Log.info('🛡️ [LicenseManager] No enterprise.lic found. Running in Community Mode.');
      this.setCommunityMode('enterprise.lic was not found.', 'LICENSE_FILE_MISSING');
      return;
    }

    const publicKey = process.env.PROMPTHOUSE_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('🛡️ [LicenseManager] PROMPTHOUSE_PUBLIC_KEY missing. Enterprise license cannot be verified.');
      this.setCommunityMode('PROMPTHOUSE_PUBLIC_KEY is required to verify enterprise.lic.', 'LICENSE_PUBLIC_KEY_REQUIRED');
      return;
    }

    try {
      const token = fs.readFileSync(this.licensePath, 'utf8').trim();

      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      if (decoded.tier !== 'enterprise') {
        this.setCommunityMode(`License tier "${decoded.tier || 'unknown'}" is not enterprise.`, 'LICENSE_TIER_NOT_ENTERPRISE');
        return;
      }

      this.licenseState = {
        isEnterprise: true,
        tier: decoded.tier,
        expiresAt: new Date(decoded.exp * 1000),
        organization: decoded.org || null,
        truthState: 'LICENSE_VERIFIED',
        reason: 'enterprise.lic was verified with PROMPTHOUSE_PUBLIC_KEY.'
      };
      global.Log && global.Log.info(`🛡️ [LicenseManager] Enterprise License Verified for: ${decoded.org || 'licensed organization'}`);
      return;
    } catch (error) {
      global.Log && global.Log.error('🛡️ [LicenseManager] Invalid or expired enterprise license. Downgrading to Community Mode.', error.message);
      this.setCommunityMode(error.message, 'LICENSE_VERIFICATION_FAILED');
    }
  }

  isEnterprise() {
    if (!this.licenseState.isEnterprise) return false;
    if (this.licenseState.expiresAt && new Date() > this.licenseState.expiresAt) {
      global.Log && global.Log.info('🛡️ [LicenseManager] Enterprise License EXPIRED. Downgrading to Community Mode.');
      this.setCommunityMode('Enterprise license is expired.', 'LICENSE_EXPIRED');
      return false;
    }
    return true;
  }
  
  getTier() {
    return this.isEnterprise() ? this.licenseState.tier : 'community';
  }
}
