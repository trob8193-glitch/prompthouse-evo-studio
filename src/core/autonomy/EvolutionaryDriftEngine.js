import fs from 'fs';
import path from 'path';
import { Log } from './SovereignLogger.js';

export class EvolutionaryDriftEngine {
  constructor(workspaceRoot = process.cwd()) {
    this.driftDir = path.join(workspaceRoot, '.prompthouse-data', 'genetic-drift');
    if (!fs.existsSync(this.driftDir)) {
      fs.mkdirSync(this.driftDir, { recursive: true });
    }
  }

  getGenomePath(orgId) {
    const safeOrgId = (orgId || 'local_sovereign').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return path.join(this.driftDir, `${safeOrgId}_genome.json`);
  }

  loadGenome(orgId) {
    const genomePath = this.getGenomePath(orgId);
    if (fs.existsSync(genomePath)) {
      try {
        return JSON.parse(fs.readFileSync(genomePath, 'utf8'));
      } catch (err) {
        Log.warn(`[EvolutionaryDrift] Failed to parse genome for ${orgId}. Resetting.`);
      }
    }
    return {
      orgId,
      generation: 0,
      traits: [],
      moduleAffinities: {},
      lastMutation: new Date().toISOString()
    };
  }

  saveGenome(orgId, genome) {
    const genomePath = this.getGenomePath(orgId);
    fs.writeFileSync(genomePath, JSON.stringify(genome, null, 2), 'utf8');
  }

  mutatePrompt(genome, baselinePrompt) {
    if (!genome.traits || genome.traits.length === 0) {
      return baselinePrompt;
    }

    let driftInjection = `\n\n--- [EVOLUTIONARY DRIFT DIRECTIVES] ---\n`;
    driftInjection += `You have evolved over ${genome.generation} generations specifically for this organization.\n`;
    driftInjection += `You MUST strictly adhere to these hyper-personalized traits learned from past usage:\n`;
    
    genome.traits.forEach((trait, i) => {
      driftInjection += `${i + 1}. ${trait}\n`;
    });
    driftInjection += `---------------------------------------\n`;

    return baselinePrompt + driftInjection;
  }

  async recordHabit(orgId, moduleName, payload, aiAdaptor) {
    const genome = this.loadGenome(orgId);
    genome.generation += 1;
    
    // Increment module affinity
    genome.moduleAffinities[moduleName] = (genome.moduleAffinities[moduleName] || 0) + 1;
    
    // Ask the AI to extract a new generic habit based on the execution context
    if (aiAdaptor) {
      try {
        Log.info(`🧬 [EvolutionaryDrift] Extracting new genetic trait from ${moduleName} execution...`);
        const userStr = `We just executed the premium module "${moduleName}" with this payload: ${JSON.stringify(payload)}. 
Extract exactly ONE high-level behavioral rule or preference (e.g., "Prioritize high-frequency arbitrage algorithms", "Always output strict markdown formatting", "Focus heavily on enterprise risk mitigation") that we should permanently encode into our genome for this user. 
Respond ONLY with the single rule.`;
        
        const response = await aiAdaptor.generateResponse([{ role: 'user', content: userStr }]);
        const trait = (response.message || response.content || response).trim();
        
        if (trait && trait.length < 200) {
           // Ensure we only keep the top 5 most relevant traits to avoid prompt bloat
           genome.traits.unshift(trait);
           if (genome.traits.length > 5) genome.traits.pop();
           Log.success(`🧬 [EvolutionaryDrift] New trait encoded: "${trait}"`);
        }
      } catch (err) {
         Log.warn(`[EvolutionaryDrift] Failed to extract habit: ${err.message}`);
      }
    }

    genome.lastMutation = new Date().toISOString();
    this.saveGenome(orgId, genome);
  }
}
