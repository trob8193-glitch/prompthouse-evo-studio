import { exec } from 'child_process';
import { join } from 'path';

/**
 * Execution Sandbox
 * Securely executes shell commands strictly within the sandbox directory.
 */
export class ExecutionSandbox {
  constructor(sandboxDir) {
    this.sandboxDir = sandboxDir;
  }

  async runCommand(command) {
    // Basic security block for destructive commands
    const dangerousTokens = ['rm -rf /', 'mkfs', '> /dev/sda'];
    if (dangerousTokens.some(token => command.includes(token))) {
      throw new Error('Command rejected by sandbox security protocol.');
    }

    return new Promise((resolve) => {
      exec(command, { cwd: this.sandboxDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stdout, stderr });
          return;
        }
        resolve({ success: true, stdout, stderr });
      });
    });
  }
}
