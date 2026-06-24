import express from 'express';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const execPromise = util.promisify(exec);
const app = express();
const PORT = 5174;
const rootDir = process.cwd();

app.use(express.json());

app.post('/api/v1/copilot/dispatch', async (req, res) => {
    const { instruction, files = [] } = req.body;

    if (!instruction) {
        return res.status(400).json({ error: "Instruction is required." });
    }

    Log.info(`\n🌐 [IDE Integration] Received dispatch from external copilot.`);
    Log.info(`Instruction: ${instruction}`);
    if (files.length > 0) Log.info(`Target Files: ${files.join(', ')}`);

    try {
        // Bonded directly to the God-Tier Runtime
        const agentPath = path.join(rootDir, 'gemini-opus-runtime.js');
        const payload = `[External IDE Dispatch]: ${instruction}\nFiles attached: ${files.join(', ')}`;
        
        Log.info(`🧠 [IDE Integration] Invoking Paradox Core...`);
        const { stdout } = await execPromise(`node "${agentPath}" "${payload}"`);
        
        Log.info(`✨ [IDE Integration] God-Tier Agent processed the dispatch successfully.`);
        
        res.json({
            status: "success",
            truthState: "PARADOX_CLEAR",
            agentOutput: stdout,
            message: "Instruction processed by Omni-Sovereign Runtime."
        });

    } catch (err) {
        Log.error(`💥 [IDE Integration] Agent execution failed or bridge offline. Sentient Rollback engaged.`);
        res.status(500).json({
            status: "error",
            truthState: "FALLBACK_TRIGGERED",
            message: "The AI Uplink is severed. Unable to process dispatch."
        });
    }
});

app.listen(PORT, () => {
    Log.info(`\n🚀 [IDE Integration] Pipeline active on port ${PORT}`);
    Log.info(`Listening for external Copilot dispatches...`);
});
