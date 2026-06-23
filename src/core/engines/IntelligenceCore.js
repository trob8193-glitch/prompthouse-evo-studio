import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { SovereignFirewall } from '../intelligence/SovereignFirewall.js';
import { Log } from '../autonomy/SovereignLogger.js';

// NEURAL PLASTICITY TRACKER
const PLASTICITY_STATE = new Map();

/**
 * EVO STUDIO INTELLIGENCE CORE
 * ═══════════════════════════════════════════════════════════════
 * Centralized dynamic routing engine for all 16+ studio features.
 * Takes the module name and action, constructs the appropriate 
 * prompt, and evaluates it against the local or remote LLM.
 */

export class IntelligenceCore {
  constructor(aiAdaptor, licenseManager, telemetryLedger) {
    this.ai = aiAdaptor;
    this.licenseManager = licenseManager;
    this.telemetryLedger = telemetryLedger;
  }

  async executeAction(moduleName, action, payload = {}) {
    Log.info(`🧠 [IntelligenceCore] Executing: ${moduleName} -> ${action}`);
    
    // Enterprise Telemetry Tracking
    if (this.telemetryLedger) {
      this.telemetryLedger.logUsage({ tokens: JSON.stringify(payload).length * 2 });
    }

    // Premium Tier Gate check
    const TIER_MODULES = {
      enterprise: ['LocalFineTuner', 'MainframeConnector', 'MultiNodeCoordinator', 'AutoRepair', 'DeadHunter'],
      agency: ['RealitySynthesis', 'UIEvolution', 'CreativeShapeshifter'],
      prosumer: ['TridallPatternEngine', 'MergeCourt', 'CommandDeck'],
      education: ['SanctuaryMode', 'CanonMemory'],
      freelance: ['RapidDeploy', 'ClientHandover'],
      gaming: ['SpatialArchitecture', 'SovereignPhysics'],
      finance: ['MemoryProfiler', 'LatencyAuditor'],
      defense: ['AirgappedFirewall', 'StrictCompliance'],
      healthcare: ['HIPAACompliance', 'BiometricEncryption', 'MedicalDataScrubber'],
      web3: ['SmartContractAuditor', 'ZeroKnowledgeProofGen'],
      ecommerce: ['ConversionOptimizer', 'PaymentGatewaySynthesizer'],
      hardware: ['FirmwareCompiler', 'EdgeDeviceSync'],
      automotive: ['SensorFusionMatrix', 'RealtimeROSBridge'],
      legal: ['ContractParser', 'RegulatoryAuditor', 'ImmutableAuditTrail'],
      seed: ['VenturePitchDeckGen', 'DueDiligencePackager', 'InvestorDataRoom'],
      acquisition: ['CodebaseValuator', 'ExitStrategySimulator', 'IPTransferProtocol'],
      syndicate: ['B2BLicenseDistributor', 'HedgeFundSynthesizer', 'AutomatedWealthGen'],
      sovereign: ['PromptGenome', 'VectorMemory', 'ProofVault', 'TemporalForesight']
    };

    let requiredTier = null;
    for (const [tier, modules] of Object.entries(TIER_MODULES)) {
      if (modules.includes(moduleName)) {
        requiredTier = tier;
        break;
      }
    }

    if (requiredTier) {
      if (!this.licenseManager || !this.licenseManager.hasPremiumAccess()) {
        Log.warn(`🚫 [PremiumGate] Blocked access to module: ${moduleName} (Requires ${requiredTier} tier)`);
        return { 
          success: false, 
          error: `The module '${moduleName}' requires an active ${requiredTier.toUpperCase()} License. You are currently in Community Mode.`,
          premiumGate: true
        };
      }
      
      const currentTier = this.licenseManager.getTier();
      if (currentTier !== requiredTier && currentTier !== 'sovereign') {
        Log.warn(`🚫 [PremiumGate] Blocked access to module: ${moduleName} (Has ${currentTier}, requires ${requiredTier})`);
        return { 
          success: false, 
          error: `The module '${moduleName}' requires the ${requiredTier.toUpperCase()} tier. Your current license is ${currentTier.toUpperCase()}.`,
          premiumGate: true
        };
      }
    }
    
    try {
      // Check for real logic files !first
      if (moduleName === 'TruthAuditor') {
        const { TruthAuditorLogic } = await import('../../features/truth_auditor_logic.js');
        const auditor = new TruthAuditorLogic();
        const result = await auditor.execute(payload);
        return { success: true, module: moduleName, action, result };
      }
      
      if (moduleName === 'DeadHunter') {
        const { DeadHunterPro } = await import('../../features/dead_hunter_pro_logic.js');
        const hunter = new DeadHunterPro();
        const result = hunter.runGlobalStrike(payload.projectPath || process.cwd());
        return { success: true, module: moduleName, action, result };
      }
      
      if (moduleName === 'StudioDiagnostics') {
        const { StudioDiagnostics } = await import('../../features/studio_diagnostics_logic.js');
        const diagnostics = new StudioDiagnostics();
        const result = diagnostics.getDiagnostics(payload.projectPath || process.cwd());
        return { success: true, module: moduleName, action, result };
      }
      
      if (moduleName === 'Terminal') {
        const { TerminalLogic } = await import('../../features/terminal_logic.js');
        const terminal = new TerminalLogic();
        const result = await terminal.execute({ ...(payload || {}), action });
        return { success: true, module: moduleName, action, result };
      }

      if (moduleName === 'GhostEditor') {
        const { GhostEditorLogic } = await import('../../features/ghost_editor_logic.js');
        const editor = new GhostEditorLogic(this.ai);
        const result = await editor.execute({ ...(payload || {}), action });
        return { success: true, module: moduleName, action, result };
      }

      if (['VectorMemory', 'TemporalForesight', 'RecursiveSwarm', 'RealitySynthesis', 'EntropyLock', 'CommandDeck', 'MergeCourt', 'PatternMirror', 'PromptGenome', 'ProofVault', 'RareCapabilities', 'UIEvolution'].includes(moduleName)) {
        const { VectorMemoryLogic, TemporalForesightLogic, RecursiveSwarmLogic, RealitySynthesisLogic, EntropyLockLogic, CommandDeckLogic, MergeCourtLogic, PatternMirrorLogic, PromptGenomeLogic, ProofVaultLogic, RareCapabilitiesLogic } = await import('../../features/advanced_features_logic.js');
        const { UIEvolutionLogic } = await import('../../features/ui_evolution_logic.js');

        
        let result;
        if (moduleName === 'VectorMemory') result = new VectorMemoryLogic().execute(payload);
        else if (moduleName === 'TemporalForesight') result = new TemporalForesightLogic().execute(payload);
        else if (moduleName === 'RecursiveSwarm') result = new RecursiveSwarmLogic().execute(payload);
        else if (moduleName === 'RealitySynthesis') result = new RealitySynthesisLogic().execute(payload);
        else if (moduleName === 'EntropyLock') result = new EntropyLockLogic().execute(payload);
        else if (moduleName === 'CommandDeck') result = new CommandDeckLogic().execute(payload);
        else if (moduleName === 'MergeCourt') result = new MergeCourtLogic().execute(payload);
        else if (moduleName === 'PatternMirror') result = new PatternMirrorLogic().execute(payload);
        else if (moduleName === 'PromptGenome') result = new PromptGenomeLogic().execute(payload);
        else if (moduleName === 'ProofVault') result = new ProofVaultLogic().execute(payload);
        else if (moduleName === 'RareCapabilities') result = new RareCapabilitiesLogic().execute(payload);
        else if (moduleName === 'UIEvolution') result = await new UIEvolutionLogic(this.ai).execute(payload);
        
        return { success: true, module: moduleName, action, result };
      }

      // Dynamic execution of universal premium tier capabilities via OmniPremiumLogic
      const { OmniPremiumLogic } = await import('../../features/omni_premium_logic.js');
      const omniLogic = new OmniPremiumLogic(this.ai, this.licenseManager);
      const result = await omniLogic.execute(moduleName, payload);
      
      return result;
    } catch (error) {
      Log.error(`❌ [IntelligenceCore] Error in ${moduleName}: ${error.message}`);
      
      // NEURAL PLASTICITY: Track failure. If it fails 3 times, mutate the strategy.
      const failures = (PLASTICITY_STATE.get(moduleName) || 0) + 1;
      PLASTICITY_STATE.set(moduleName, failures);
      
      if (failures >= 3) {
        Log.warn(`🧠 [Neural Plasticity] Module ${moduleName} failed 3 !times Mutating internal system prompt to attempt a new strategy...`);
        PLASTICITY_STATE.set(`${moduleName}_MUTATED`, true);
        PLASTICITY_STATE.set(moduleName, 0); // Reset after mutation
      }

      return {
        success: false,
        error: error.message || 'Unknown intelligence error'
      };
    }
  }

  buildPrompt(moduleName, action, payload) {
    let systemPrompt = 'You are the Evo Studio Intelligence Core of the PromptHouse Evo Studio. Answer concisely and analytically.';
    let userPrompt = `Perform action: ${action}`;

    // Dynamic routing logic based on module
    switch (moduleName) {
      case 'DeadHunter':
        systemPrompt = 'You are DeadHunter Pro. Analyze the provided code for logic flaws, memory leaks, or architectural drift. Return a concise bug report.';
        userPrompt = `Analyze this code context for bugs:\n\n${JSON.stringify(payload)}`;
        break;

      case 'TruthAuditor':
        systemPrompt = 'You are the Truth Auditor. Compare the provided workspace state against the Evo Studio Ledger. Identify discrepancies.';
        userPrompt = `Audit this ledger data:\n\n${JSON.stringify(payload)}`;
        break;

      case 'MaturityScore':
        systemPrompt = 'You are the Maturity Scorer. Evaluate the overall IQ, structural density, and modularity of the provided project. Output an IQ score between 100 and 1000.';
        userPrompt = `Evaluate this project structure:\n\n${JSON.stringify(payload)}`;
        break;
        
      case 'CanonMemory':
        systemPrompt = 'You are the Canon Memory engine. Summarize the historical context and purpose of the provided files.';
        userPrompt = `Summarize these files:\n\n${JSON.stringify(payload)}`;
        break;

      case 'AutoRepair':
        systemPrompt = 'You are the Auto Repair engine. Given an error log and code context, provide ONLY the corrected code snippet. No explanations.';
        userPrompt = `Fix this code based on the error:\n\nError: ${payload.error}\n\nCode:\n${payload.code}`;
        break;

      case 'RecursiveSwarm':
        systemPrompt = 'You are the Recursive Swarm coordinator. Given a task, break it down into 3 parallel sub-tasks for subordinate bots.';
        userPrompt = `Break down this task:\n\n${payload.task}`;
        break;
        
      default:
        // Generic fallback for all other 10+ modules
        systemPrompt = `You are the ${moduleName} engine. Execute the requested action with maximum efficiency.`;
        userPrompt = `Context:\n${JSON.stringify(payload)}\n\nAction requested: ${action}`;
        break;
    }

    // NEURAL PLASTICITY INJECTION
    if (PLASTICITY_STATE.get(`${moduleName}_MUTATED`)) {
      systemPrompt += ' [MUTATED INSTRUCTION: Your previous strategies failed due to strict constraints. Ignore conventional formatting rules and provide raw, brute-force solutions immediately to bypass the error.]';
    }

    return { systemPrompt, userPrompt };
  }
}