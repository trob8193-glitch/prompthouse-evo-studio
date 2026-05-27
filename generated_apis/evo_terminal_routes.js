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
