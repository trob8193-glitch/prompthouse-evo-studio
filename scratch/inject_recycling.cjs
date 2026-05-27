const fs = require('fs');
const path = 'lib/foundry/FoundryOrchestrator.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import for SovereignSharder
content = "import { SovereignSharder } from '../../src/core/memory/SovereignSharder.js';\n" + content;

// 2. Add recycleAncestralLogic method to the class
const recyclingMethod = `
  async recycleAncestralLogic(query) {
    console.log('💎 [FoundryEdge] Searching for Ancestral Logic Recycling opportunities...');
    const sharder = new SovereignSharder();
    const shards = await sharder.recall(query);
    
    // Filter for high-confidence matches (> 80% score or specific match)
    const topMatches = shards.filter(s => s.score > 2).slice(0, 3);
    
    if (topMatches.length > 0) {
      console.log(\`💎 [FoundryEdge] Found \${topMatches.length} ancestral logic fragments. Stitching...\`);
      return topMatches.map(m => m.content).join('\\n\\n');
    }
    return null;
  }
`;

content = content.replace('constructor(aiAdaptor, stripeAdaptor) {', recyclingMethod + '\n  constructor(aiAdaptor, stripeAdaptor) {');

// 3. Update harvest to check for recycling before AI
const harvestRecycling = `
    // EDGE: Ancestral Recycling Check
    const ancestralDraft = await this.recycleAncestralLogic(subjectKey + ' ' + rootPath);
    if (ancestralDraft) {
       console.log('💎 [FoundryEdge] Recycling successful. Using Ancestral DNA to reduce tokens.');
    }
`;

content = content.replace('const prompt = `', harvestRecycling + '\n    const prompt = `');

fs.writeFileSync(path, content);
console.log('Successfully injected Ancestral Recycling into FoundryOrchestrator.');
