import { exec } from 'child_process';
import { join } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import { ProductionAudit } from '../../src/core/engines/productionAudit.js';

/**
 * Vercel Deployment Adapter — SOVEREIGN VERSION
 * Deploys the generated sandbox application to Vercel ONLY if it passes a Nuclear Truth Audit.
 */
export class VercelAdapter {
  constructor(sandboxDir, token) {
    this.sandboxDir = sandboxDir;
    this.token = token;
  }

  async deploy() {
    if (!this.token) {
      throw new Error('Vercel API Token is missing.');
    }

    // 1. Run Production Audit on all files in sandbox
    
    const files = this.getFiles(this.sandboxDir);
    const auditResults = [];

    for (const file of files) {
      const code = readFileSync(file, 'utf8');
      const report = ProductionAudit.audit(code);
      if (!report.passed) {
        auditResults.push({ file, issues: report.issues });
      }
    }

    if (auditResults.length > 0) {
      console.error('[VercelAdapter] NUCLEAR TRUTH AUDIT FAILED. Deployment aborted.');
      return { 
        success: false, 
        error: 'DEPLOYMENT_BLOCKED_BY_AUDIT', 
        violations: auditResults 
      };
    }

    // 2. Proceed with deployment if passed
    return new Promise((resolve) => {
      const cmd = `npx vercel --yes --prod --token=${this.token}`;
      
      
      exec(cmd, { cwd: this.sandboxDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
          return;
        }
        const lines = stdout.split('\n');
        const urlLine = lines.find(line => line.startsWith('https://'));
        const url = urlLine ? urlLine.trim() : 'Unknown URL';
        resolve({ success: true, url, logs: stdout });
      });
    });
  }

  getFiles(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach(file => {
      if (file === 'node_modules') return;
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getFiles(fullPath));
      } else if (fullPath.match(/\.(js|jsx)$/)) {
        results.push(fullPath);
      }
    });
    return results;
  }
}
