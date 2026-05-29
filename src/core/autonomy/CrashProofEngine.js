import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TetherEngine } from './TetherEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const logsDir = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'crash_logs');
const healDir = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'healed_patches');

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
if (!fs.existsSync(healDir)) fs.mkdirSync(healDir, { recursive: true });

// ---------------------------------------------------------------------------
// Startup Patch Scanner
// Detects and auto-removes raw CSS blocks injected into JS/JSX files by the
// Evo Daemon. Runs once per process boot before any other logic.
// ---------------------------------------------------------------------------

/** JS/TS file extensions that cannot contain bare top-level CSS */
const JS_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

/** Directories to skip during the startup scan */
const SKIP_DIRS = new Set([
  'node_modules', 'dist', '.git', '.prompthouse-data', 'buildkit_import',
  'generated_apps', 'temp_zip', 'zip_temp', '.ai', '.sovereign-shards',
]);

/**
 * Check whether a file contains a bare top-level CSS block or an Evo Daemon
 * CSS injection comment (`/* [EVO-DAEMON] ... *‌/ .selector { ... }`).
 */
function containsInvalidCss(content) {
  // Pattern 1: Evo Daemon CSS comment + CSS block
  if (/\/\*\s*\[EVO-DAEMON\][^*]*\*\/[\s\S]{0,300}^[.#][\w]/m.test(content)) return true;
  // Pattern 2: Bare CSS selector at column 0 (outside string/template literal)
  if (/^[.#][a-zA-Z][\w\s,.:()#>+~=\-]*\s*\{/m.test(content)) return true;
  return false;
}

/**
 * Remove Evo Daemon CSS injection blocks from a JS/JSX file's content.
 * Strips lines that look like:   /* [EVO-DAEMON] ... *‌/\n .selector { ... }
 */
function removeInvalidCssBlocks(content) {
  // Remove the EVO-DAEMON comment + following CSS line(s)
  let cleaned = content.replace(
    /\n?\/\*\s*\[EVO-DAEMON\][^*]*\*\/\n[.#][^\n]*(\n[.#][^\n]*)*/g,
    ''
  );
  // Remove any remaining bare top-level CSS lines (. or # at col 0)
  cleaned = cleaned.replace(/\n[.#][a-zA-Z][\w\s,.:()#>+~=\-]*\s*\{[^\}]*\}/g, '');
  return cleaned;
}

/**
 * Recursively walk `dir`, scan each JS/JSX file, and auto-heal any that
 * contain raw CSS top-level blocks. Returns a list of healed file paths.
 */
function scanAndHealDirectory(dir) {
  const healed = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return healed; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      healed.push(...scanAndHealDirectory(full));
    } else if (entry.isFile() && JS_EXTS.has(path.extname(entry.name).toLowerCase())) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (!containsInvalidCss(content)) continue;

        const cleaned = removeInvalidCssBlocks(content);
        if (cleaned === content) continue; // Nothing actually changed

        fs.writeFileSync(full, cleaned, 'utf8');
        healed.push(full);

        // Write a heal receipt so the operator can see what was fixed
        const receiptPath = path.join(healDir, `heal_${Date.now()}_${entry.name}.json`);
        fs.writeFileSync(receiptPath, JSON.stringify({
          file: path.relative(rootDir, full),
          healedAt: new Date().toISOString(),
          originalLength: content.length,
          cleanedLength: cleaned.length,
          reason: 'Removed raw CSS block injected by Evo Daemon into JS/JSX file',
        }, null, 2), 'utf8');
      } catch { /* skip unreadable files */ }
    }
  }
  return healed;
}

// ---------------------------------------------------------------------------
// CrashProofEngine
// ---------------------------------------------------------------------------

export class CrashProofEngine {
  /**
   * Run the startup CSS injection scanner across the entire project source.
   * Call this once from a root-level boot script or daemon initializer.
   */
  static runStartupScan(daemonName = 'Startup') {
    const srcDir = path.join(rootDir, 'src');
    const scriptsDir = path.join(rootDir, 'scripts');

    const healed = [
      ...(fs.existsSync(srcDir) ? scanAndHealDirectory(srcDir) : []),
      ...(fs.existsSync(scriptsDir) ? scanAndHealDirectory(scriptsDir) : []),
    ];

    if (healed.length > 0) {
      console.warn(`🩹 [CRASH-PROOF ENGINE] Startup scan healed ${healed.length} file(s) with invalid CSS injection:`);
      for (const f of healed) {
        console.warn(`   ↳ ${path.relative(rootDir, f)}`);
      }
    } else {
      console.log(`✅ [CRASH-PROOF ENGINE] Startup scan clean — no invalid CSS injections found.`);
    }

    return healed;
  }

  static initialize(daemonName) {
    console.log(`🛡️ [CRASH-PROOF ENGINE] Tethered and guarding daemon: ${daemonName}`);

    // Run the startup scan to auto-heal any Evo Daemon CSS corruption
    CrashProofEngine.runStartupScan(daemonName);

    const handleFatalError = async (err, origin) => {
      console.error(`\n🚨 [CRASH-PROOF ENGINE: FATAL INTERCEPT] Intercepted crash in ${daemonName}!`);
      console.error(`🚨 Origin: ${origin}`);
      console.error(`🚨 Stack: ${err.stack || err}`);

      const crashId = `crash_${daemonName}_${Date.now()}`;
      const logPath = path.join(logsDir, `${crashId}.json`);

      const crashPayload = {
        id: crashId,
        daemon: daemonName,
        timestamp: new Date().toISOString(),
        origin,
        message: err.message || String(err),
        stack: err.stack || '',
      };

      fs.writeFileSync(logPath, JSON.stringify(crashPayload, null, 2), 'utf8');

      console.log(`🧠 [CRASH-PROOF ENGINE] Tethering to AI for emergency hotfix...`);

      const missionTask = `URGENT FATAL CRASH INTERCEPTED.
Daemon: ${daemonName}
Error: ${crashPayload.message}
Stack Trace:
${crashPayload.stack}

Analyze this Node.js crash. Provide a [FILE_UPDATE] block to fix the source of this crash immediately. Focus on defensive programming (adding try/catch, checking for undefined variables, or fixing pathing).`;

      try {
        await TetherEngine.executeMission(
          missionTask,
          'SelfHealer',
          'Emergency Crash Responder',
          JSON.stringify(crashPayload),
          'gemini' // Fastest response
        );
        console.log(`\n✅ [CRASH-PROOF ENGINE] AI provided a hotfix attempt. Receipt generated.`);
        // We do NOT exit the process. We allow the Node event loop to continue if possible.
        // If it was a synchronous UncaughtException, Node may still force exit after this handler
        // completes, but pm2 / concurrently will restart it, and the patch will be applied on reboot.
      } catch (aiErr) {
        console.error(`❌ [CRASH-PROOF ENGINE] AI Hotfix failed:`, aiErr.message);
      }
    };

    process.on('uncaughtException', (err, origin) => {
      handleFatalError(err, `uncaughtException at ${origin}`);
    });

    process.on('unhandledRejection', (reason, promise) => {
      handleFatalError(reason, 'unhandledRejection');
    });
  }
}
