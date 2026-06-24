import fs from 'fs';
import path from 'path';

const SKIP_DIRS = new Set([
  '.git', 
  'node_modules', 
  '.prompthouse-data', 
  'dist', 
  'build', 
  '.gemini', 
  'coverage', 
  'generated_apps',
  '.shadow-forge' // don't recursively copy shadow-forge
]);

/**
 * Recursively copies a directory to a destination, skipping massive directories.
 */
function copyDirFiltered(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Creates an ephemeral sandboxed copy of the workspace.
 * Uses a directory junction for node_modules on Windows to ensure blazing fast setup.
 * @param {string} rootDir The main workspace directory
 * @param {string} runId Unique ID for the sandbox
 * @returns {string} The absolute path to the newly created sandbox
 */
export function createEphemeralSandbox(rootDir, runId) {
  const shadowDir = path.join(rootDir, '.shadow-forge');
  if (!fs.existsSync(shadowDir)) fs.mkdirSync(shadowDir, { recursive: true });

  const sandboxPath = path.join(shadowDir, `sandbox_${runId}`);
  
  // Clean up if it exists from a previous identical run ID
  if (fs.existsSync(sandboxPath)) {
    fs.rmSync(sandboxPath, { recursive: true, force: true });
  }

  // 1. Clone source code (omitting heavy directories)
  copyDirFiltered(rootDir, sandboxPath);

  // 2. Symlink / Junction node_modules for instant access without install
  const hostNodeModules = path.join(rootDir, 'node_modules');
  const sandboxNodeModules = path.join(sandboxPath, 'node_modules');
  
  if (fs.existsSync(hostNodeModules)) {
    // 'junction' is used because it doesn't require administrator privileges on Windows
    try {
      fs.symlinkSync(hostNodeModules, sandboxNodeModules, 'junction');
    } catch (e) {
      console.warn(`[EphemeralSandbox] Failed to junction node_modules: ${e.message}`);
    }
  }

  return sandboxPath;
}

/**
 * Destroys a previously created sandbox.
 * @param {string} sandboxPath The absolute path to the sandbox
 */
export function destroySandbox(sandboxPath) {
  if (fs.existsSync(sandboxPath)) {
    // Unlink node_modules first to prevent deleting the host's actual node_modules via junction
    const sandboxNodeModules = path.join(sandboxPath, 'node_modules');
    if (fs.existsSync(sandboxNodeModules)) {
      try {
        fs.unlinkSync(sandboxNodeModules);
      } catch (e) {
        // If it's a directory (not a junction, maybe fallback), handle it
        try { fs.rmdirSync(sandboxNodeModules); } catch (e2) {}
      }
    }
    
    // Now delete the sandbox directory safely
    fs.rmSync(sandboxPath, { recursive: true, force: true });
  }
}
