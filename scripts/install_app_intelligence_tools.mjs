import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const routePath = path.join(rootDir, 'generated_apis', 'evo_app_intelligence_routes.js');
const bridgePath = path.join(rootDir, 'promptbridge-server.js');
const coreIndexPath = path.join(rootDir, 'src', 'core', 'evo-llm', 'index.js');
const cliPath = path.join(rootDir, 'scripts', 'build_app_intelligence_dataset.mjs');

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function write(file, text) {
  ensureDir(file);
  fs.writeFileSync(file, text, 'utf8');
}

const routeSource = `import {
  buildAppIntelligenceDataset,
  getAppIntelligenceContract,
  getAppIntelligenceStatus,
  ingestAppIntelligenceSource,
  writeAppIntelligenceReceipt
} from '../src/core/evo-llm/EvoAppIntelligenceBridge.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerEvoAppIntelligenceRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/evo-app-intelligence/contract', (_req, res) => {
    ok(res, { contract: getAppIntelligenceContract() });
  });

  app.get('/api/evo-app-intelligence/status', (req, res) => {
    try {
      ok(res, { status: getAppIntelligenceStatus({ rootDir, limit: Number(req.query.limit || 500) }) });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-app-intelligence/source', (req, res) => {
    try {
      ok(res, ingestAppIntelligenceSource({ rootDir, source: req.body || {} }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-app-intelligence/dataset', (req, res) => {
    try {
      ok(res, buildAppIntelligenceDataset({ rootDir, limit: Number(req.body?.limit || 1000), rebuildMainDataset: req.body?.rebuildMainDataset !== false }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-app-intelligence/receipt', (req, res) => {
    try {
      ok(res, writeAppIntelligenceReceipt({ rootDir, type: req.body?.type || 'app_intelligence_receipt', payload: req.body?.payload || {} }));
    } catch (error) {
      fail(res, error);
    }
  });
}
`;

const cliSource = `#!/usr/bin/env node
import fs from 'fs';
import {
  buildAppIntelligenceDataset,
  getAppIntelligenceStatus,
  ingestAppIntelligenceSource
} from '../src/core/evo-llm/EvoAppIntelligenceBridge.js';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));

function readJsonArg(flag) {
  const found = process.argv.find((arg) => arg.startsWith(flag + '='));
  if (!found) return null;
  const raw = found.slice(flag.length + 1);
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, 'utf8'));
  return JSON.parse(raw);
}

if (args.has('--status')) {
  console.log(JSON.stringify(getAppIntelligenceStatus({ rootDir }), null, 2));
  process.exit(0);
}

const source = readJsonArg('--source');
if (source) {
  console.log(JSON.stringify(ingestAppIntelligenceSource({ rootDir, source }), null, 2));
  process.exit(0);
}

console.log(JSON.stringify(buildAppIntelligenceDataset({
  rootDir,
  limit: Number(process.env.EVO_APP_INTELLIGENCE_LIMIT || 1000),
  rebuildMainDataset: !args.has('--no-main-dataset')
}), null, 2));
`;

write(routePath, routeSource);
write(cliPath, cliSource);

if (fs.existsSync(coreIndexPath)) {
  let coreIndex = fs.readFileSync(coreIndexPath, 'utf8');
  const exportLine = "export * from './EvoAppIntelligenceBridge.js';";
  if (!coreIndex.includes(exportLine)) {
    coreIndex = coreIndex.trimEnd() + '\n' + exportLine + '\n';
    fs.writeFileSync(coreIndexPath, coreIndex, 'utf8');
  }
}

if (fs.existsSync(bridgePath)) {
  let bridge = fs.readFileSync(bridgePath, 'utf8');
  const importAnchor = "import registerExternalConnectorRoutes from './generated_apis/external_connector_routes.js';";
  const registerAnchor = 'registerExternalConnectorRoutes(app, { db });';
  const importLine = "import registerEvoAppIntelligenceRoutes from './generated_apis/evo_app_intelligence_routes.js';";
  const registerLine = 'registerEvoAppIntelligenceRoutes(app);';

  if (!bridge.includes(importLine)) {
    if (!bridge.includes(importAnchor)) throw new Error('Missing import anchor for app intelligence route install.');
    bridge = bridge.replace(importAnchor, importAnchor + '\n' + importLine);
  }
  if (!bridge.includes(registerLine)) {
    if (!bridge.includes(registerAnchor)) throw new Error('Missing register anchor for app intelligence route install.');
    bridge = bridge.replace(registerAnchor, registerAnchor + '\n' + registerLine);
  }
  fs.writeFileSync(bridgePath, bridge, 'utf8');
}

console.log('PromptHouse Evo App Intelligence tools installed.');
