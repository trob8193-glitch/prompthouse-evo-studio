import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('fs-watcher-daemon');

const execPromise = util.promisify(exec);
const rootDir = process.cwd();
const targetDir = path.join(rootDir, 'src');

Log.info(`\n👁️  [FS WATCHER] Initializing File System Sentinel...`);
Log.info(`Watching directory: ${targetDir}`);

let debounceTimer;

fs.watch(targetDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.js') && !filename.endsWith('.jsx')) return;

    // Debounce to prevent multiple triggers for a single save
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        Log.info(`\n📝 [FS WATCHER] Detected external modification in: ${filename}`);
        Log.info(`🧠 [FS WATCHER] Spawning God-Tier IDE Composer for architectural review...`);

        try {
            const idePath = path.join(rootDir, 'gemini-opus-ide-model.mjs');
            const instruction = `The file src/${filename} was just modified by an external Copilot. Perform a silent Paradox Core audit on its new structure. Do not modify it unless a fatal flaw is found.`;
            
            const { stdout } = await execPromise(`node "${idePath}" "${instruction}"`);
            Log.info(`✨ [FS WATCHER] Code reviewed by Prime Composer.`);
        } catch (err) {
            Log.warn(`💥 [FS WATCHER] Agent uplink severed or file failed validation. Sentient Rollback logging skipped.`);
        }
    }, 1000);
});
