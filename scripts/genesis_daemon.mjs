import cron from 'node-cron';
import { ideateNewFeature } from '../src/core/autonomy/genesis_ideator.js';
import { quarantineAndAudit } from '../src/core/autonomy/quarantine_forge.js';
import { mergeGenesisConcept } from '../src/core/evolution/autonomous-evolution-engine.js';
import { ensureSchemaForFeature } from '../src/core/autonomy/schema_engineer.js';
import { buildLocalMemory } from '../src/core/memory/local_rag_indexer.js';
import fs from 'fs';
import path from 'path';

console.log("🌌 [Genesis Daemon] Online. Waking up every day at 3:00 AM.");

async function runGenesisSimulation() {
    console.log(`\n--- [Genesis Forge Wake Event] ${new Date().toISOString()} ---`);
    console.log("🌌 Initiating Autonomous Ideation Cycle...");

    try {
        // 0. Memory Fetch (RAG)
        const ragContext = buildLocalMemory('./src');

        // 1. Ideation (Multi-Agent Swarm)
        console.log("🧠 [Genesis Ideator] Triggering 4-Agent Swarm Sequence...");
        
        const capabilityGraphPath = path.resolve('./.prompthouse-data/capability-graph.json');
        const hallucinatedCode = await ideateNewFeature(capabilityGraphPath, ragContext);
        
        if (!hallucinatedCode) {
            console.error("❌ [Genesis Ideator] Swarm failed to reach consensus.");
            return;
        }

        const componentName = `AutonomousComponent_${Date.now()}`;
        console.log(`🧠 [Genesis Ideator] Successfully hallucinated '${componentName}.jsx'`);

        // 2. Quarantine & Audit
        console.log("🛡️ [Quarantine Forge] Pushing concept to quarantine zone...");
        const auditResult = await quarantineAndAudit(componentName, hallucinatedCode);

        if (!auditResult.success) {
            console.error(`❌ [Quarantine] Concept failed nuclear audit: ${auditResult.error}`);
            return;
        }

        // 3. Reality Merge
        console.log("⚡ [Reality Merger] Audit passed. Merging concept into src/...");
        const mergeResult = mergeGenesisConcept(auditResult.filePath, componentName);

        if (mergeResult.success) {
            console.log(`✅ [Success] Feature successfully deployed to ${mergeResult.path}`);
            // 4. Schema Engineering (Backend wiring)
            await ensureSchemaForFeature(componentName, hallucinatedCode);
        } else {
            console.error("❌ [Reality Merger] Merge failed.");
        }
    } catch (err) {
        console.error("❌ [Genesis Daemon] Fatal error during cycle:", err);
    }
}

// Run at 03:00 every day
cron.schedule('0 3 * * *', () => {
    runGenesisSimulation();
});

// If passed --run-now, execute once immediately
if (process.argv.includes('--run-now')) {
    runGenesisSimulation();
}
