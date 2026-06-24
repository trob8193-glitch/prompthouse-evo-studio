import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export class TerminalExecutionAdaptor {
  constructor(workspaceRoot, sandboxMode = false) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.sandboxMode = sandboxMode;
    this.phantomRoot = path.join(this.workspaceRoot, '.phantom-sandbox');
    if (this.sandboxMode && !fs.existsSync(this.phantomRoot)) {
      fs.mkdirSync(this.phantomRoot, { recursive: true });
    }
  }

  // Resolve path safely within the workspace or phantom sandbox
  resolvePath(targetPath) {
    const rawResolved = path.resolve(this.workspaceRoot, targetPath);
    if (!rawResolved.startsWith(this.workspaceRoot)) {
      throw new Error(`Access denied: Cannot access path outside workspace (${rawResolved})`);
    }

    if (this.sandboxMode) {
      // Map it into the phantom sandbox
      const relative = path.relative(this.workspaceRoot, rawResolved);
      return path.join(this.phantomRoot, relative);
    }
    return rawResolved;
  }

  // Helper to commit a file from phantom to real workspace
  commit(targetPath) {
    if (!this.sandboxMode) return { success: true };
    try {
      const phantomPath = this.resolvePath(targetPath);
      const realPath = path.resolve(this.workspaceRoot, targetPath);
      
      if (!fs.existsSync(phantomPath)) return { success: false, error: 'Phantom file not found' };
      
      const content = fs.readFileSync(phantomPath, 'utf-8');
      const dir = path.dirname(realPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(realPath, content, 'utf-8');
      
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async runCommand(command, cwd = this.workspaceRoot) {
    const dangerousTokens = [
      'rm -rf', 'format', 'del /s', 'mkfs', 'dd if=', '> /dev/sda', 
      'DROP TABLE', 'TRUNCATE TABLE', 'chmod 777', 'chown root'
    ];
    
    const lowerCmd = command.toLowerCase();
    if (dangerousTokens.some(token => lowerCmd.includes(token.toLowerCase()))) {
      return { success: false, error: 'Command rejected by sandbox security protocol.' };
    }

    // In sandbox mode, ensure the cwd maps to the phantom root
    const rawCwd = path.resolve(this.workspaceRoot, cwd);
    const targetCwd = this.sandboxMode ? path.join(this.phantomRoot, path.relative(this.workspaceRoot, rawCwd)) : rawCwd;
    
    if (this.sandboxMode && !fs.existsSync(targetCwd)) {
       fs.mkdirSync(targetCwd, { recursive: true });
    }

    return new Promise((resolve) => {
      exec(command, { 
        cwd: targetCwd,
        shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
        timeout: 30000, // 30 second timeout to prevent hanging forever
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stdout, stderr });
          return;
        }
        resolve({ success: true, stdout, stderr });
      });
    });
  }

  readFile(targetPath) {
    try {
      const resolved = this.resolvePath(targetPath);
      // Fallback: If sandbox mode but phantom file doesn't exist, read the real file to seed the sandbox
      let targetToRead = resolved;
      if (this.sandboxMode && !fs.existsSync(resolved)) {
        const realResolved = path.resolve(this.workspaceRoot, targetPath);
        if (fs.existsSync(realResolved)) targetToRead = realResolved;
      }

      if (!fs.existsSync(targetToRead)) {
        return { success: false, error: 'File not found' };
      }
      const content = fs.readFileSync(targetToRead, 'utf-8');
      return { success: true, content };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  writeFile(targetPath, content) {
    try {
      const resolved = this.resolvePath(targetPath);
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(resolved, content, 'utf-8');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  listDir(targetPath = '.') {
    try {
      const resolved = this.resolvePath(targetPath);
      let targetToList = resolved;
      if (this.sandboxMode && !fs.existsSync(resolved)) {
         targetToList = path.resolve(this.workspaceRoot, targetPath);
      }
      if (!fs.existsSync(targetToList)) {
        return { success: false, error: 'Directory not found' };
      }
      const stats = fs.statSync(targetToList);
      if (!stats.isDirectory()) {
        return { success: false, error: 'Not a directory' };
      }
      const files = fs.readdirSync(targetToList);
      return { success: true, files };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
