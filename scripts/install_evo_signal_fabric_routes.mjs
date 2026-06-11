import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const bridgeFile = path.join(rootDir, 'promptbridge-server.js');

if (!fs.existsSync(bridgeFile)) {
  throw new Error('promptbridge-server.js not found. Run from repo root.');
}

let content = fs.readFileSync(bridgeFile, 'utf8');
const importLine = "import registerEvoSignalFabricRoutes from './generated_apis/evo_signal_fabric_routes.js';";
const registerLine = 'registerEvoSignalFabricRoutes(app);';

if (!content.includes(importLine)) {
  const anchor = "import registerExternalConnectorRoutes from './generated_apis/external_connector_routes.js';";
  if (!content.includes(anchor)) throw new Error('Could not find generated API import anchor.');
  content = content.replace(anchor, `${anchor}\n${importLine}`);
}

if (!content.includes(registerLine)) {
  const anchor = 'registerExternalConnectorRoutes(app, { db });';
  if (!content.includes(anchor)) throw new Error('Could not find generated API registration anchor.');
  content = content.replace(anchor, `${anchor}\n${registerLine}`);
}

fs.writeFileSync(bridgeFile, content, 'utf8');
console.log('Evo Signal Fabric routes installed into promptbridge-server.js');
