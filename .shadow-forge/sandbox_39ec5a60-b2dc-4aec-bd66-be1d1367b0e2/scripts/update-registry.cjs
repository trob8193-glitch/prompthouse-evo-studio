const fs = require('fs');
const file = 'src/core/evo-layer/registry/EngineRegistry.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /{ id: 'evonet', name: 'EvoNet', category: 'network-platform', state: ENGINE_STATES\.planned, completion: 65 },/g,
  "{ id: 'evonet', name: 'EvoNet', category: 'network-platform', state: ENGINE_STATES.implemented, completion: 100 },"
);

content = content.replace(
  /{ id: 'evo-pulse-grid', name: 'Evo Pulse Grid', category: 'network-platform', state: ENGINE_STATES\.planned, completion: 65 },/g,
  "{ id: 'evo-pulse-grid', name: 'Evo Pulse Grid', category: 'network-platform', state: ENGINE_STATES.implemented, completion: 100 },"
);

content = content.replace(
  /{ id: 'ph-evo-rift-engine', name: 'PH Evo Rift Engine', category: 'network-platform', state: ENGINE_STATES\.planned, completion: 60 },/g,
  "{ id: 'ph-evo-rift-engine', name: 'PH Evo Rift Engine', category: 'network-platform', state: ENGINE_STATES.implemented, completion: 100 },"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed EngineRegistry.js');
