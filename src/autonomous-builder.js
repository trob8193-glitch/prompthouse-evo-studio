import { Log } from './core/autonomy/SovereignLogger.js';
import { BRIDGE_URL } from './config/bridge-config.js';
import { useSovereignStore } from './store.js';

export { APP_TYPES } from './core/builder/ProjectTemplates.js';

export class AutonomousBuilder {
  constructor() {
    this.status = 'ACTIVE';
  }

  async execute(params = {}) {
    const { mission = '', appType = 'react', name = 'untitled-app', features = '' } = params;
    if (!mission) {
      return { success: false, timestamp: new Date().toISOString(), error: 'Mission prompt is required' };
    }
    Log.info(`🚀 [AutonomousBuilder] Executing build: "${name}" (${appType})`);
    try {
      const result = await runBotPipeline(mission, appType, name, features);
      return { success: true, timestamp: new Date().toISOString(), ...result };
    } catch (err) {
      Log.error(`❌ [AutonomousBuilder] Build failed: ${err.message}`);
      return { success: false, timestamp: new Date().toISOString(), error: err.message };
    }
  }

  getStatus() {
    return { id: 'autonomous-builder', grade: 'S+++++', state: 'ACTIVE', resonance: 0.99 };
  }
}

export async function runBotPipeline(mission, appType, name, features) {
  Log.info(`🚀 Starting production build for "${name}" (${appType})...`);
    
  // Build the evo build command with proper flags
  const command = `evo build ${name} --platform ${appType} --features ${features} ${mission}`;
  
  const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ core: 'terminal', action: 'run', payload: { action: 'run', command } })
  });
  
  if (!res.ok) throw new Error(`Bridge returned ${res.status}. Is the backend running?`);
  
  const data = await res.json();
  
  if (data.payload && data.payload.files) {
    const fileCount = Object.keys(data.payload.files).length;
    Log.info(`✅ Build complete: ${fileCount} files generated for ${name}.`);
    return {
      app: { 
        name, 
        type: appType, 
        features: features.split(',').map(s => s.trim()),
        files: data.payload.files 
      },
      fileCount
    };
  }
  
  // If no files returned, the build failed
  const errorMsg = data.payload?.output || data.payload?.error || data.error || 'Build returned no files.';
  throw new Error(errorMsg);
}

export function downloadAsZip() {
  useSovereignStore.getState().addNotification({ msg: 'Files are written directly to your disk in /generated_apps/. Check your project folder.', type: 'success' });
}

export function downloadFile() {
  useSovereignStore.getState().addNotification({ msg: 'Files are written directly to your disk.', type: 'success' });
}

export async function writeToLocalDisk() {
  // Disk writes are handled by TerminalLogic during evo build
  return;
}