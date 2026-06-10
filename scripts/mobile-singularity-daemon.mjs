import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LEDGER_PATH = path.join(DATA_DIR, 'holding_company_ledger.json');
const CANDIDATES_PATH = path.join(DATA_DIR, 'holding_company_candidates.json');

const DAEMON_INTERVAL_MS = Number(process.env.MOBILE_DAEMON_INTERVAL_MS || 45_000);
const ARCHITECTURE_TARGET = 'expo_router'; // Default native compilation target

console.log(`
==================================================
MOBILE SINGULARITY DAEMON (NATIVE COMPILER)
==================================================
Mode: Uncompromising Autonomous App Generation
Mission: Detect Web SaaS & Force Native Compilation
==================================================
`);

function readJson(filepath, fallback) {
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJson(filepath, data) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Ensure the portfolio ledger exists
if (!fs.existsSync(LEDGER_PATH)) {
  saveJson(LEDGER_PATH, []);
}

export async function runMobileSingularityCycle() {
  console.log('[MobileDaemon] Scanning Holding Company Portfolio for missing native apps...');
  
  const ledger = readJson(LEDGER_PATH, []);
  const candidates = readJson(CANDIDATES_PATH, []);
  
  // Combine all known apps to check
  const allApps = [...ledger, ...candidates];
  let uncompiledFound = false;

  for (let i = 0; i < allApps.length; i++) {
    const app = allApps[i];
    
    if (app.status === 'live' && !app.native_compiled) {
      uncompiledFound = true;
      console.log(`[MobileDaemon] ⚠️ Missing Native App Detected: ${app.name} (${app.id})`);
      console.log(`[MobileDaemon] ⚡ Initializing Autonomous Compilation to ${ARCHITECTURE_TARGET}...`);
      
      const scriptPath = path.resolve(__dirname, 'mobile-architect-cli.mjs');
      
      await new Promise((resolve) => {
        const child = spawn('node', [scriptPath, app.id, ARCHITECTURE_TARGET]);
        
        child.stdout.on('data', (data) => {
          const lines = data.toString().split('\\n').filter(Boolean);
          lines.forEach(line => console.log(`[Compiler] ${line.trim()}`));
        });
        
        child.stderr.on('data', (data) => {
          const lines = data.toString().split('\\n').filter(Boolean);
          lines.forEach(line => console.error(`[Compiler Error] ${line.trim()}`));
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            console.log(`[MobileDaemon] ✅ Native Synthesis Complete for: ${app.name}`);
            // Mark as compiled in the actual ledger arrays
            if (ledger.find(a => a.id === app.id)) {
              ledger.find(a => a.id === app.id).native_compiled = true;
              ledger.find(a => a.id === app.id).mobile_architect = ARCHITECTURE_TARGET;
              saveJson(LEDGER_PATH, ledger);
            }
            if (candidates.find(a => a.id === app.id)) {
              candidates.find(a => a.id === app.id).native_compiled = true;
              candidates.find(a => a.id === app.id).mobile_architect = ARCHITECTURE_TARGET;
              saveJson(CANDIDATES_PATH, candidates);
            }
          } else {
            console.log(`[MobileDaemon] ❌ Native Synthesis FAILED for ${app.name} (Code: ${code})`);
          }
          resolve();
        });
      });
    }
  }

  if (!uncompiledFound) {
    console.log('[MobileDaemon] Portfolio fully synchronized. All SaaS apps have Native counterparts.');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMobileSingularityCycle().catch((error) => {
    console.error('[MobileDaemon] Cycle failed:', error.message);
    process.exitCode = 1;
  });
  
  if (process.env.MOBILE_DAEMON_RUN_ONCE !== 'true') {
    setInterval(() => {
      runMobileSingularityCycle().catch((error) => console.error('[MobileDaemon] Cycle failed:', error.message));
    }, DAEMON_INTERVAL_MS);
  }
}
