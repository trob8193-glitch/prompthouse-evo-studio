import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TetherEngine } from './TetherEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const logsDir = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'crash_logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export class CrashProofEngine {
  static initialize(daemonName) {
    console.log(`🛡️ [CRASH-PROOF ENGINE] Tethered and guarding daemon: ${daemonName}`);

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
        const aiResponse = await TetherEngine.executeMission(
          missionTask,
          'SelfHealer',
          'Emergency Crash Responder',
          JSON.stringify(crashPayload),
          'gemini' // Fastest response
        );
        
        console.log(`\n✅ [CRASH-PROOF ENGINE] AI provided a hotfix attempt. Receipt generated.`);
        // We do NOT exit the process. We allow the Node event loop to continue if possible.
        // If it was a synchronous UncaughtException, Node may still force exit after this handler completes,
        // but pm2 / concurrently will restart it, and the patch will be applied on the next boot.
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
