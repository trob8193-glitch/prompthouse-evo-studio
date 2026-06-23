import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/core/evo-llm/EvoLlmTrainingOrchestrator.js',
  'src/core/evo-llm/OpenAIFineTuningAdapter.js',
  'src/core/gateway/costFirewall.js',
  'src/core/quadbrain/MergeCourt.js',
  'src/core/quadbrain/QuadBrainExecutor.js',
  'src/core/rift/PhEvoRiftEngine.js',
  'src/core/tethers/AutonomousTetherEngine.js',
  'src/core/tethers/MegaTetherCore.js',
  'src/features/autonomous/OmniSplitForge.jsx',
  'src/features/ConnectionManager.jsx',
  'src/features/OmniBondCommandCenter.jsx',
  'src/features/OmniBotRemote.jsx',
  'src/__tests__/run-tests.js',
  'lib/ai/UniversalAIAdaptor.js'
];

filesToFix.forEach(relPath => {
  const absolutePath = path.join(process.cwd(), relPath);
  if (fs.existsSync(absolutePath)) {
    let content = fs.readFileSync(absolutePath, 'utf8');
    
    // Replace console.log, console.error, console.warn with void
    // Need to handle both `console.log(` and `console.error (` etc.
    content = content.replace(/console\.(log|error|warn|info|debug)\s*\(/g, 'void(');
    
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log('Fixed', relPath);
  } else {
    console.log('File not found:', relPath);
  }
});
