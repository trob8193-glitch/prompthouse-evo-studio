/** Self-Healing Workflow Repair - pb20 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const FAILURE_LOG_PATH = path.resolve(__dirname, 'failure_log.json');

export const selfHealingRepair = async () => {
    try {
        const failedChains = await diagnoseFailedChains();
        if (failedChains.length > 0) {
            await patchFailedChains(failedChains);
        } else {
            console.log('No failed agent chains detected.');
        }
    } catch (error) {
        console.error('Error during self-healing workflow repair:', error);
    }
};

const diagnoseFailedChains = async () => {
    const response = await fetch(`${LOCAL_BRIDGE_URL}/api/agent-status`);
    const data = await response.json();
    const failedChains = data.filter(agent => agent.status === 'failed');

    if (failedChains.length > 0) {
        logFailures(failedChains);
    }
    
    return failedChains;
};

const patchFailedChains = async (failedChains) => {
    for (const chain of failedChains) {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/api/repair`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: chain.id }),
        });

        if (!response.ok) {
            console.error(`Failed to patch agent chain ${chain.id}: ${response.statusText}`);
            continue;
        }

        const result = await response.json();
        console.log(`Patched agent chain ${chain.id}: ${result.message}`);
    }
};

const logFailures = (failedChains) => {
    const logData = {
        timestamp: new Date().toISOString(),
        failures: failedChains,
    };

    fs.readFile(FAILURE_LOG_PATH, 'utf8', (err, data) => {
        const existingLogs = data ? JSON.parse(data) : [];
        existingLogs.push(logData);
        fs.writeFile(FAILURE_LOG_PATH, JSON.stringify(existingLogs, null, 2), (err) => {
            if (err) {
                console.error('Error logging failures:', err);
            } else {
                console.log('Failures logged successfully.');
            }
        });
    });
};

export const startSelfHealingWorkflow = () => {
    console.log('Starting Self-Healing Workflow Repair...');
    selfHealingRepair();
};