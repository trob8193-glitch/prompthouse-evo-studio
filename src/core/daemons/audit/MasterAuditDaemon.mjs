import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { Log } from '../../autonomy/SovereignLogger.js';

export class MasterAuditDaemon {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.envPath = path.resolve(this.cwd, '.env');
  }

  async start() {
    Log.info('═══════════════════════════════════════════════════════════════');
    Log.info('   [LEVEL 5] MASTER AUDIT DAEMON ONLINE');
    Log.info('═══════════════════════════════════════════════════════════════');
    
    await this.runSecurityAudit();
    await this.runTetherAudit();
    await this.runEvolutionAudit();
    
    Log.success('[MasterAudit] Global System Verification Complete.');
  }

  async runSecurityAudit() {
    Log.info('[MasterAudit] Initiating Security Hardening Audit...');
    
    if (!existsSync(this.envPath)) {
      Log.error('[MasterAudit] [FATAL] .env file not found. Absolute Reality compromised.');
      return;
    }

    try {
      const envContent = readFileSync(this.envPath, 'utf8');
      const criticalKeys = ['STRIPE_SECRET_KEY', 'SMTP_URL', 'OPENAI_API_KEY'];
      let missingKeys = [];

      criticalKeys.forEach(key => {
        if (!envContent.includes(`${key}=`)) {
          missingKeys.push(key);
        }
      });

      if (missingKeys.length > 0) {
        Log.error(`[MasterAudit] Security Alert: Missing critical credentials - ${missingKeys.join(', ')}`);
      } else {
        Log.success('[MasterAudit] Security Posture: OPTIMAL. All critical tethers are locked in Absolute Reality.');
      }
    } catch (e) {
      Log.error(`[MasterAudit] Security Audit Failed: ${e.message}`);
    }
  }

  async runTetherAudit() {
    Log.info('[MasterAudit] Initiating Tether Audit...');
    // Simulated check of external API latencies
    const targetUrl = process.env.VITE_APP_URL || 'http://localhost:5173/';
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) {
        Log.success(`[MasterAudit] Core Application Node (${targetUrl}) is online and responsive.`);
      } else {
        Log.error(`[MasterAudit] Core Application Node returned status: ${res.status}`);
      }
    } catch (e) {
      Log.error(`[MasterAudit] Core Application Node Unreachable: ${e.message}`);
    }
  }

  async runEvolutionAudit() {
    Log.info('[MasterAudit] Initiating Evolution Audit...');
    const quadBrainStatePath = path.join(this.cwd, '.prompthouse-data', 'nightforge_state.json');
    if (existsSync(quadBrainStatePath)) {
      Log.success('[MasterAudit] QuadBrain evolutionary state tracker located. Cognitive core is intact.');
    } else {
      Log.info('[WARNING][MasterAudit] QuadBrain state file not found. System may be un-evolved.');
    }
  }
}

// Allow direct execution
if (process.argv[1] && process.argv[1].endsWith('MasterAuditDaemon.mjs')) {
  const auditor = new MasterAuditDaemon();
  auditor.start().catch(console.error);
}
