import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const bridgeFile = path.join(rootDir, 'promptbridge-server.js');

if (!fs.existsSync(bridgeFile)) {
  throw new Error('promptbridge-server.js not found. Run from repo root.');
}

let content = fs.readFileSync(bridgeFile, 'utf8');
const routeModules = [
  {
    importLine: "import registerEvoSignalFabricRoutes from './generated_apis/evo_signal_fabric_routes.js';",
    registerLine: 'registerEvoSignalFabricRoutes(app);'
  },
  {
    importLine: "import registerEvoSignalLearningRoutes from './generated_apis/evo_signal_learning_routes.js';",
    registerLine: 'registerEvoSignalLearningRoutes(app);'
  }
];

const importAnchor = "import registerExternalConnectorRoutes from './generated_apis/external_connector_routes.js';";
const registerAnchor = 'registerExternalConnectorRoutes(app, { db });';

for (const module of routeModules) {
  if (!content.includes(module.importLine)) {
    if (!content.includes(importAnchor)) throw new Error('Could not find generated API import anchor.');
    content = content.replace(importAnchor, `${importAnchor}\n${module.importLine}`);
  }

  if (!content.includes(module.registerLine)) {
    if (!content.includes(registerAnchor)) throw new Error('Could not find generated API registration anchor.');
    content = content.replace(registerAnchor, `${registerAnchor}\n${module.registerLine}`);
  }
}

fs.writeFileSync(bridgeFile, content, 'utf8');
console.log('Evo Signal Fabric and Signal Learning routes installed into promptbridge-server.js');
