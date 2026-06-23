import fs from 'fs';
import path from 'path';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { SovereignFirewall } from '../core/intelligence/SovereignFirewall.js';
import { EvolutionaryDriftEngine } from '../core/autonomy/EvolutionaryDriftEngine.js';

export class OmniPremiumLogic {
  constructor(aiAdaptor, licenseManager) {
    this.ai = aiAdaptor;
    this.licenseManager = licenseManager;
    this.driftEngine = new EvolutionaryDriftEngine();
  }

  async execute(moduleName, payload = {}) {
    Log.info(`💎 [OmniPremiumEngine] Automating execution for premium module: ${moduleName}...`);
    
    // 0. Genetic Drift (Identify the specific Organization)
    const orgId = this.licenseManager?.licenseState?.organization || 'local_sovereign';
    const genome = this.driftEngine.loadGenome(orgId);

    // 1. Establish Secure Workspace
    const workspaceRoot = payload.projectPath || process.cwd();
    const premiumDir = path.join(workspaceRoot, '.prompthouse-data', 'premium-runs', moduleName);
    
    if (!fs.existsSync(premiumDir)) {
      fs.mkdirSync(premiumDir, { recursive: true });
    }

    // 2. Synthesize Execution Strategy
    const extensionType = this._determineExtension(moduleName);
    let systemPrompt = `You are the core logic engine for the premium tier module: ${moduleName}.
Your objective is to generate the highest quality, production-ready output for this specific capability.
Do not wrap your output in markdown code blocks if the output is JSON.
The requested output format should be: ${extensionType}.
Generate exactly what this module implies it generates.`;

    // Inject Hyper-Personalized Genetic Drift
    systemPrompt = this.driftEngine.mutatePrompt(genome, systemPrompt);

    const userPrompt = `Execute ${moduleName} using the following payload data: ${JSON.stringify(payload)}. Generate the automated artifact output.`;

    // 3. Fallback to Sovereign Firewall (LLM Core)
    const fwResult = await SovereignFirewall.intercept(userPrompt, JSON.stringify(payload), {
      aiAdaptor: this.ai,
      systemPrompt: systemPrompt
    });

    // 4. Persist Artifacts
    const artifactFilename = `automated_output_${Date.now()}${extensionType}`;
    const artifactPath = path.join(premiumDir, artifactFilename);
    
    fs.writeFileSync(artifactPath, fwResult.result, 'utf8');
    Log.success(`💎 [OmniPremiumEngine] Successfully generated and automated artifact for ${moduleName} at ${artifactPath}`);

    // 5. Autonomously Mutate the User's Brain (Genetic Drift)
    await this.driftEngine.recordHabit(orgId, moduleName, payload, this.ai);

    return {
      success: true,
      module: moduleName,
      automatedArtifactPath: artifactPath,
      preview: fwResult.result.substring(0, 500) + '...',
      metrics: fwResult.metrics
    };
  }

  _determineExtension(moduleName) {
    const jsonModules = [
      'MemoryProfiler', 'LatencyAuditor', 'CodebaseValuator', 
      'SensorFusionMatrix', 'ExitStrategySimulator', 'AutomatedWealthGen'
    ];
    
    const mdModules = [
      'VenturePitchDeckGen', 'DueDiligencePackager', 'SmartContractAuditor',
      'HIPAACompliance', 'ContractParser', 'RegulatoryAuditor'
    ];

    if (jsonModules.includes(moduleName)) return '.json';
    if (mdModules.includes(moduleName)) return '.md';
    return '.txt'; // Default fallback
  }
}
