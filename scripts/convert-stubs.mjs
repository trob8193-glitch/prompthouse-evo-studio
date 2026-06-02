/**
 * BATCH STUB CONVERTER — One-shot script to convert all hollow modules to honest stubs.
 * Run: node scripts/convert-stubs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'src');

// Map of [relative path from src/core] => [className, description]
const STUBS = {
  // Memory
  'core/memory/KnowledgeDistiller.js': ['KnowledgeDistiller', 'Distills and compresses knowledge from agent interactions into reusable patterns'],
  'core/memory/PatternLibrary.js': ['PatternLibrary', 'Stores and retrieves reusable prompt/code patterns for the evolution system'],
  'core/memory/PredictiveCache.js': ['PredictiveCache', 'Predictive caching layer for frequently accessed AI responses'],
  'core/memory/workspace_memory.js': ['WorkspaceMemory', 'Persists workspace state (open files, layout, preferences) across sessions'],
  'core/memory/consent_modes.js': ['ConsentModes', 'Manages user consent levels for data collection and AI training'],
  'core/memory/local_memory_box.js': ['LocalMemoryBox', 'Local-first encrypted memory storage for sensitive agent state'],
  'core/memory/HolographicStorage.js': ['HolographicStorage', 'Multi-dimensional memory storage using vector embeddings'],

  // Foundry
  'core/foundry/DNACompiler.js': ['DNACompiler', 'Compiles prompt DNA sequences into executable AI pipelines'],
  'core/foundry/ConfidenceRadar.js': ['ConfidenceRadar', 'Scores confidence levels across module outputs and AI responses'],
  'core/foundry/GoldMiner.js': ['GoldMiner', 'Mines high-quality training data from user interactions'],
  'core/foundry/evo-runtime-orchestrator.js': ['EvoRuntimeOrchestrator', 'Orchestrates runtime evolution cycles across the platform'],

  // Knowledge
  'core/knowledge/SemanticBranchEngine.js': ['SemanticBranchEngine', 'Creates semantic branches in the knowledge graph for topic exploration'],
  'core/knowledge/SeedSower.js': ['SeedSower', 'Seeds new knowledge nodes and learning paths from discovered patterns'],

  // Extension
  'core/extension/export_center.js': ['ExportCenter', 'Exports projects, prompts, and training data in standard formats'],
  'core/extension/firing_orders_panel.js': ['FiringOrdersPanel', 'Chrome extension panel for managing execution order of prompts'],
  'core/extension/live_command_graph.js': ['LiveCommandGraph', 'Real-time visualization of command execution flow'],
  'core/extension/prompt_library.js': ['PromptLibrary', 'Searchable library of curated and user-created prompts'],
  'core/extension/reality_twin.js': ['RealityTwinExt', 'Chrome extension integration for RealityTwin digital mirroring'],
  'core/extension/revenue_autopilot_with_proof_gates.js': ['RevenueAutopilotWithProofGates', 'Revenue tracking with cryptographic proof gates for billing integrity'],
  'core/extension/self-healing_workflow_repair.js': ['SelfHealingWorkflowRepair', 'Detects and auto-repairs broken workflow chains'],
  'core/extension/side-panel_cockpit.js': ['SidePanelCockpit', 'Chrome extension side-panel cockpit for quick studio access'],
  'core/extension/training_gold_miner.js': ['TrainingGoldMiner', 'Extracts high-value training pairs from browsing sessions'],

  // Other Core
  'core/training/Paragrammer.js': ['Paragrammer', 'Generates training paragrams and augmented data for model fine-tuning'],
  'core/reality/RealityTwin.js': ['RealityTwin', 'Digital twin engine that mirrors real-world state for simulation'],
  'core/progression/LevelSystem.js': ['LevelSystem', 'Gamified progression and level-up tracking for studio mastery'],
  'core/physics/SovereignPhysics.js': ['SovereignPhysics', 'Physics-based layout engine for dynamic UI element positioning'],
  'core/optimization/CognitiveCompressor.js': ['CognitiveCompressor', 'Compresses prompts and context windows for cost optimization'],
  'core/commerce/RevenueAutopilot.js': ['RevenueAutopilot', 'Autonomous Stripe billing and subscription management'],
  'core/audit/FlightRecorder.js': ['FlightRecorder', 'Records all system actions for audit trail and replay debugging'],
  'core/agent/Arena.js': ['Arena', 'Agent battle-testing arena for comparing AI model outputs'],
  'core/autonomy/test_autonomy.js': ['TestAutonomy', 'Autonomous test generation and execution system'],
  'core/automation/seeding_mission.js': ['SeedingMission', 'Automated mission seeding for self-evolution cycles'],
  'core/evolution/PatchProposalEngine.js': ['PatchProposalEngine', 'Proposes code patches based on detected issues and patterns'],

  // API stubs
  'core/api/api_keys.js': ['ApiKeyManager', 'Manages API key lifecycle, rotation, and scope permissions'],
  'core/api/app_registry.js': ['AppRegistry', 'Registry of deployed apps and their configurations'],
  'core/api/dataset_build.js': ['DatasetBuilder', 'Builds training datasets from captured interactions'],
  'core/api/model_inference.js': ['ModelInference', 'Model inference routing and response caching'],
  'core/api/model_registry.js': ['ModelRegistry', 'Registry of available AI models with capability metadata'],
  'core/api/rag_routes.js': ['RagRoutes', 'Retrieval-Augmented Generation API routes'],
  'core/api/reality_twin_routes.js': ['RealityTwinRoutes', 'API routes for digital twin state management'],
  'core/api/scopes.js': ['ScopeManager', 'OAuth-style scope management for API permissions'],
  'core/api/training_capture.js': ['TrainingCapture', 'Captures user interactions for training data generation'],
  'core/api/training_job_queue.js': ['TrainingJobQueue', 'Queue for managing training job execution and scheduling'],

  // Automation
  'core/automation/RecursiveSwarm.js': ['RecursiveSwarm', 'Multi-agent recursive swarm for parallel task execution'],
  'core/automation/ShadowRunner.js': ['ShadowRunner', 'Shadow execution engine that runs tasks in isolated sandboxes'],
  'core/automation/AsyncQueue.js': ['AsyncQueue', 'Priority-based async queue for background task management'],
};

let converted = 0;
let failed = 0;

for (const [relPath, [className, description]] of Object.entries(STUBS)) {
  const fullPath = path.join(SRC, relPath);

  // Determine relative import depth to stub-marker
  const dir = path.dirname(relPath);
  const depth = dir.split('/').length;
  const prefix = '../'.repeat(depth - 1); // core/memory/ => ../../ => ../
  const importPath = `${prefix}stub-marker.js`;

  const content = `import { HonestStubClass } from '${importPath}';

/**
 * ${className} — ${description}
 * Status: NOT_IMPLEMENTED (honest stub)
 */
export class ${className} extends HonestStubClass {
  constructor() { super('${className}', '${description.replace(/'/g, "\\'")}'); }
}
`;

  try {
    fs.writeFileSync(fullPath, content, 'utf-8');
    converted++;
    console.log(`✅ ${relPath} → ${className}`);
  } catch (e) {
    failed++;
    console.error(`❌ ${relPath}: ${e.message}`);
  }
}

// Also handle root-level src stubs
const ROOT_STUBS = {
  'dream-state.js': ['DreamState', 'Ambient background processing engine for idle-time learning'],
  'deploy-rail.js': ['DeployRail', 'Frontend deploy rail logic (now superseded by SovereignDeployRail.mjs)'],
  'evo-exchange.js': ['EvoExchange', 'Exchange protocol for sharing evolution data between studios'],
  'owner-approval.js': ['OwnerApproval', 'Owner approval gate for critical system changes'],
  'pattern-analyzer.js': ['PatternAnalyzer', 'Analyzes code and prompt patterns for optimization suggestions'],
  'pattern-miner.js': ['PatternMiner', 'Mines recurring patterns from interaction history'],
  'proof-to-value.js': ['ProofToValue', 'Maps proof receipts to business value metrics'],
};

for (const [fileName, [className, description]] of Object.entries(ROOT_STUBS)) {
  const fullPath = path.join(SRC, fileName);
  const content = `import { HonestStubClass } from './core/stub-marker.js';

/**
 * ${className} — ${description}
 * Status: NOT_IMPLEMENTED (honest stub)
 */
export class ${className} extends HonestStubClass {
  constructor() { super('${className}', '${description.replace(/'/g, "\\'")}'); }
}
`;

  try {
    fs.writeFileSync(fullPath, content, 'utf-8');
    converted++;
    console.log(`✅ ${fileName} → ${className}`);
  } catch (e) {
    failed++;
    console.error(`❌ ${fileName}: ${e.message}`);
  }
}

console.log(`\n━━━ STUB CONVERSION COMPLETE ━━━`);
console.log(`✅ Converted: ${converted}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${converted + failed}`);
