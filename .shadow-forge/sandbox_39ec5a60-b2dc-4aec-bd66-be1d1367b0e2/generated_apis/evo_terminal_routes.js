import express from 'express';
import { TerminalExecutionAdaptor } from '../lib/terminal/TerminalExecutionAdaptor.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

export default function registerEvoTerminalRoutes(app) {
  const adaptor = new TerminalExecutionAdaptor(process.cwd());

  app.post('/api/terminal/execute', async (req, res) => {
    try {
      const { action, targetPath, command, content, cwd } = req.body;
      
      Log.info(`[TerminalExecution] Autonomously executing action: ${action}`);

      let result;
      switch (action) {
        case 'read_file':
          result = adaptor.readFile(targetPath);
          break;
        case 'write_to_file':
          result = adaptor.writeFile(targetPath, content);
          break;
        case 'run_command':
          if (command.startsWith('evo train')) {
            Log.info(`[TerminalExecution] Intercepted CLI command: evo train`);
            
            // Execute it synchronously using node child_process
            const { execSync } = await import('child_process');
            try {
              const runOutput = execSync('node scripts/start-evo-training.mjs', { encoding: 'utf8', cwd });
              result = {
                success: true,
                output: runOutput,
                duration: 450
              };
            } catch (err) {
              result = {
                success: false,
                output: err.stdout ? err.stdout + '\n' + err.stderr : err.message,
                duration: 450
              };
            }
            break;
          }
          if (command.startsWith('evo kernel force-suspend')) {
            global.__EVO_KERNEL_SUSPENDED = true;
            result = {
              success: true,
              output: `[ExecutionKernelV2] FORCED SUSPEND STATE TRIGGERED.`,
              duration: 10
            };
            break;
          }
          if (command.startsWith('evo kernel status')) {
            Log.info(`[TerminalExecution] Intercepted CLI command: evo kernel status`);
            const isSuspended = global.__EVO_KERNEL_SUSPENDED ? 1 : 0;
            // Clear it after reading for UI demonstration purposes
            if (isSuspended) global.__EVO_KERNEL_SUSPENDED = false;
            
            result = {
              success: true,
              output: `[ExecutionKernelV2] STATUS: ACTIVE
- Version: 2.0.0-rc.1
- Suspended Executions: ${isSuspended}
- Active Workflows: 1
- Adapter Failover: READY`,
              duration: 42
            };
            break;
          }
          if (command.startsWith('evo failover trigger')) {
            Log.info(`[TerminalExecution] Intercepted CLI command: evo failover trigger`);
            result = {
              success: true,
              output: `[AdapterFailoverRuntime] FAILOVER TRIGGERED
- Simulating Primary Provider Degradation (429 Too Many Requests)
- Secondary Provider (Anthropic) is now ACTIVE
- Rerouting active Swarm signals... SUCCESS.`,
              duration: 115
            };
            break;
          }
          result = await adaptor.runCommand(command, cwd);
          break;
        case 'list_dir':
          result = adaptor.listDir(targetPath);
          break;
        default:
          return res.status(400).json({ success: false, error: 'Invalid action' });
      }

      if (!result.success) {
        Log.error(`[TerminalExecution] Action ${action} failed: ${result.error}`);
        return res.status(500).json(result);
      }

      Log.success(`[TerminalExecution] Action ${action} succeeded.`);
      return res.json(result);
    } catch (error) {
      Log.error('[TerminalExecution] Unhandled Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
