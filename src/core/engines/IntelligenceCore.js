import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { SovereignFirewall } from '../intelligence/SovereignFirewall.js';

/**
 * SOVEREIGN INTELLIGENCE CORE
 * ═══════════════════════════════════════════════════════════════
 * Centralized dynamic routing engine for all 16+ studio features.
 * Takes the module name and action, constructs the appropriate 
 * prompt, and evaluates it against the local or remote LLM.
 */

export class IntelligenceCore {
  constructor(aiAdaptor) {
    this.ai = aiAdaptor;
  }

  async executeAction(moduleName, action, payload = {}) {
    console.log(`[IntelligenceCore] Executing: ${moduleName} -> ${action}`);
    
    try {
      // Check for real logic files first!
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
        const result = await terminal.execute(payload);
        return { success: true, module: moduleName, action, result };
      }

      if (moduleName === 'GhostEditor') {
        const { GhostEditorLogic } = await import('../../features/ghost_editor_logic.js');
        const editor = new GhostEditorLogic(this.ai);
        const result = await editor.execute(payload);
        return { success: true, module: moduleName, action, result };
      }

      if (['VectorMemory', 'TemporalForesight', 'RecursiveSwarm', 'RealitySynthesis', 'EntropyLock', 'CommandDeck', 'MergeCourt', 'PatternMirror', 'PromptGenome', 'ProofVault', 'RareCapabilities'].includes(moduleName)) {
        const { VectorMemoryLogic, TemporalForesightLogic, RecursiveSwarmLogic, RealitySynthesisLogic, EntropyLockLogic, CommandDeckLogic, MergeCourtLogic, PatternMirrorLogic, PromptGenomeLogic, ProofVaultLogic, RareCapabilitiesLogic } = await import('../../features/advanced_features_logic.js');
        
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
        
        return { success: true, module: moduleName, action, result };
      }

      // Fallback to AI prompts if no real logic file exists
      const { systemPrompt, userPrompt } = this.buildPrompt(moduleName, action, payload);
      
      const fwResult = await SovereignFirewall.intercept(userPrompt, JSON.stringify(payload), {
        aiAdaptor: this.ai,
        systemPrompt: systemPrompt
      });
      
      return {
        success: true,
        module: moduleName,
        action: action,
        result: fwResult.result,
        metrics: fwResult.metrics,
        source: fwResult.source
      };
    } catch (error) {
      console.error(`[IntelligenceCore] Error in ${moduleName}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown intelligence error'
      };
    }
  }

  buildPrompt(moduleName, action, payload) {
    let systemPrompt = 'You are the Sovereign Intelligence Core of the PromptHouse Evo Studio. Answer concisely and analytically.';
    let userPrompt = `Perform action: ${action}`;

    // Dynamic routing logic based on module
    switch (moduleName) {
      case 'DeadHunter':
        systemPrompt = 'You are DeadHunter Pro. Analyze the provided code for logic flaws, memory leaks, or architectural drift. Return a concise bug report.';
        userPrompt = `Analyze this code context for bugs:\n\n${JSON.stringify(payload)}`;
        break;

      case 'TruthAuditor':
        systemPrompt = 'You are the Truth Auditor. Compare the provided workspace state against the Sovereign Ledger. Identify discrepancies.';
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

    return { systemPrompt, userPrompt };
  }
}
