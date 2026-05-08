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
