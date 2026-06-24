import { IntelligenceCore } from '../src/core/engines/IntelligenceCore.js';
import { LicenseManager } from '../src/core/enterprise/LicenseManager.js';
import path from 'path';

async function run() {
  const dataDir = path.resolve('.prompthouse-data');
  const licenseManager = new LicenseManager(dataDir);
  licenseManager.getTier = () => 'sovereign';
  licenseManager.hasPremiumAccess = () => true;
  
  // Simulated AI Adaptor
  const simulatedAi = {
    generateResponse: async (opts) => ({ message: "Simulated AI text response for OmniPremiumLogic execution" })
  };

  const core = new IntelligenceCore(simulatedAi, licenseManager);

  // We bypass the license check directly to test the fallback mechanism
  console.log('Testing OmniPremiumLogic fallback...');
  
  // Test a generic JSON module
  const result1 = await core.executeAction('AutomatedWealthGen', 'generate', { projectPath: process.cwd(), capital: 10000 });
  console.log('Result 1 (JSON output expected):', result1);

  // Test a generic MD module
  const result2 = await core.executeAction('VenturePitchDeckGen', 'generate', { projectPath: process.cwd(), startup: 'Acme Corp' });
  console.log('Result 2 (MD output expected):', result2);
}

run().catch(console.error);
