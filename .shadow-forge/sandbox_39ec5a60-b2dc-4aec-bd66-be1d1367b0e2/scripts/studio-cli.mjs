#!/usr/bin/env node
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const execPromise = util.promisify(exec);
const rootDir = process.cwd();
const args = process.argv.slice(2);

async function runCLI() {
    Log.info(`\n🚀 [STUDIO CLI] Omni-Sovereign Dispatch Active.`);

    if (args.length === 0) {
        Log.error("Usage: node studio-cli.mjs --dispatch=\"Your instruction here\"");
        process.exit(1);
    }

    const dispatchMatch = args.find(a => a.startsWith('--dispatch='));
    if (!dispatchMatch) {
        Log.error("Error: Must provide an instruction via --dispatch=\"...\"");
        process.exit(1);
    }

    const instruction = dispatchMatch.split('=')[1];
    Log.info(`Dispatching to Prime Agent: ${instruction}`);

    try {
        const agentPath = path.join(rootDir, 'gemini-opus-runtime.js');
        const { stdout } = await execPromise(`node "${agentPath}" "${instruction}"`);
        Log.info(`\n✨ [AGENT RESPONSE]:\n${stdout}`);
    } catch (err) {
        Log.error(`\n💥 [FATAL] Agent failed to execute. Ensure PromptBridge is online.`);
        process.exit(1);
    }
}

runCLI();
