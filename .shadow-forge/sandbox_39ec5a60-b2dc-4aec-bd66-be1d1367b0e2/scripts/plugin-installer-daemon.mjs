import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('plugin-installer-daemon');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const INBOX_DIR = path.join(ROOT_DIR, 'src/plugins/inbox');
const ACTIVE_DIR = path.join(ROOT_DIR, 'src/plugins/active');
const RECEIPTS_DIR = path.join(ROOT_DIR, '.prompthouse-data/receipts/plugin_installations');

Log.info('\x1b[36m[Plugin Installer] Starting autonomous plugin install daemon...\x1b[0m');

// Ensure directories exist
if (!fs.existsSync(INBOX_DIR)) fs.mkdirSync(INBOX_DIR, { recursive: true });
if (!fs.existsSync(ACTIVE_DIR)) fs.mkdirSync(ACTIVE_DIR, { recursive: true });
if (!fs.existsSync(RECEIPTS_DIR)) fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

async function checkInbox() {
  try {
    const files = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.plugin.js') || f.endsWith('.plugin.mjs'));
    
    if (files.length === 0) return;

    for (const file of files) {
      const inboxPath = path.join(INBOX_DIR, file);
      const activePath = path.join(ACTIVE_DIR, file);
      
      Log.info(`\x1b[33m[Plugin Installer] New plugin detected: ${file}\x1b[0m`);
      
      // Basic Frontier Safety Check Simulation (in reality this might call the gate CLI)
      const content = fs.readFileSync(inboxPath, 'utf8');
      if (content.includes('process.exit') || content.includes('execSync(') && !content.includes('FrontierSafetyGate')) {
         Log.warn(`\x1b[31m[Plugin Installer] REJECTED ${file}: Unsafe operations detected.\x1b[0m`);
         fs.renameSync(inboxPath, inboxPath + '.rejected');
         continue;
      }

      Log.info(`\x1b[32m[Plugin Installer] APPROVED ${file}: Passed safety gate.\x1b[0m`);
      
      // Move to active
      fs.renameSync(inboxPath, activePath);
      
      // Write receipt
      const receipt = {
        plugin: file,
        installedAt: new Date().toISOString(),
        status: 'ACTIVE',
        auditedBy: 'PluginInstallerDaemon'
      };
      
      fs.writeFileSync(
        path.join(RECEIPTS_DIR, `install_${Date.now()}_${file}.json`),
        JSON.stringify(receipt, null, 2)
      );

      Log.info(`\x1b[35m[Plugin Installer] Plugin ${file} successfully installed to active directory.\x1b[0m`);
    }
  } catch (e) {
    Log.error(`[Plugin Installer] Error during cycle: ${e.message}`);
  }
}

// Check every 10 seconds
setInterval(checkInbox, 10000);
checkInbox();
