import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// In a real scenario, this is the public key distributed with the software.
const PROMPTHOUSE_PUBLIC_KEY = process.env.PROMPTHOUSE_PUBLIC_KEY || 'mock-public-key-for-local-verification';

export class LicenseManager {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.licensePath = path.join(dataDir, 'enterprise.lic');
    this.licenseState = {
      isEnterprise: false,
      tier: 'community',
      expiresAt: null,
      organization: null
    };
    this.verifyLicense();
  }

  verifyLicense() {
    if (!fs.existsSync(this.licensePath)) {
      console.log('🛡️ [LicenseManager] No enterprise.lic found. Running in Community Mode.');
      this.licenseState = { isEnterprise: false, tier: 'community', expiresAt: null };
      return;
    }

    try {
      const token = fs.readFileSync(this.licensePath, 'utf8').trim();
      
      // If we don't have a real public key in env, we mock validation for demonstration.
      if (PROMPTHOUSE_PUBLIC_KEY === 'mock-public-key-for-local-verification') {
        const decoded = jwt.decode(token);
        if (decoded && decoded.tier === 'enterprise') {
          this.licenseState = {
            isEnterprise: true,
            tier: 'enterprise',
            expiresAt: new Date(decoded.exp * 1000),
            organization: decoded.org
          };
          console.log(`🛡️ [LicenseManager] Enterprise License Verified for: ${decoded.org}`);
          return;
        }
      } else {
        const decoded = jwt.verify(token, PROMPTHOUSE_PUBLIC_KEY, { algorithms: ['RS256'] });
        this.licenseState = {
          isEnterprise: true,
          tier: decoded.tier,
          expiresAt: new Date(decoded.exp * 1000),
          organization: decoded.org
        };
        console.log(`🛡️ [LicenseManager] Enterprise License Verified for: ${decoded.org}`);
        return;
      }
    } catch (error) {
      console.error('🛡️ [LicenseManager] Invalid or expired enterprise license. Downgrading to Community Mode.', error.message);
    }
    
    this.licenseState = { isEnterprise: false, tier: 'community', expiresAt: null };
  }

  isEnterprise() {
    if (!this.licenseState.isEnterprise) return false;
    if (this.licenseState.expiresAt && new Date() > this.licenseState.expiresAt) {
      console.log('🛡️ [LicenseManager] Enterprise License EXPIRED. Downgrading to Community Mode.');
      this.licenseState.isEnterprise = false;
      return false;
    }
    return true;
  }
  
  getTier() {
    return this.isEnterprise() ? this.licenseState.tier : 'community';
  }
}
