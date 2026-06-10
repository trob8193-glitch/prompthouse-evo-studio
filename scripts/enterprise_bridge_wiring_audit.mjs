#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const bridgePath = path.join(rootDir, 'promptbridge-server.js');
const quadbrainRoutePath = path.join(rootDir, 'generated_apis', 'quadbrain_routes.js');
const routePath = path.join(rootDir, 'generated_apis', 'enterprise_architecture_routes.js');
const outDir = path.join(rootDir, '.prompthouse-data', 'architecture');

function contains(file, text) {
  return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(text);
}

const directBridgeImport = contains(bridgePath, './generated_apis/enterprise_architecture_routes.js');
const directBridgeRegister = contains(bridgePath, 'registerEnterpriseArchitectureRoutes(app)');
const quadbrainImportedByBridge = contains(bridgePath, './generated_apis/quadbrain_routes.js') && contains(bridgePath, 'registerQuadBrainRoutes(app)');
const enterpriseNestedInQuadbrain = contains(quadbrainRoutePath, './enterprise_architecture_routes.js') && contains(quadbrainRoutePath, 'registerEnterpriseArchitectureRoutes(app)');
const liveViaQuadbrain = quadbrainImportedByBridge && enterpriseNestedInQuadbrain;

const checks = [
  {
    id: 'enterprise-route-module-exists',
    passed: fs.existsSync(routePath),
    required: true,
    repair: 'Create generated_apis/enterprise_architecture_routes.js.',
  },
  {
    id: 'promptbridge-direct-imports-enterprise-routes',
    passed: directBridgeImport,
    required: false,
    repair: "Optional direct path: import registerEnterpriseArchitectureRoutes from './generated_apis/enterprise_architecture_routes.js';",
  },
  {
    id: 'promptbridge-direct-registers-enterprise-routes',
    passed: directBridgeRegister,
    required: false,
    repair: 'Optional direct path: call registerEnterpriseArchitectureRoutes(app) near generated API route registrations.',
  },
  {
    id: 'promptbridge-registers-quadbrain-routes',
    passed: quadbrainImportedByBridge,
    required: true,
    repair: 'Register QuadBrain routes in promptbridge-server.js.',
  },
  {
    id: 'quadbrain-registers-enterprise-routes',
    passed: enterpriseNestedInQuadbrain,
    required: true,
    repair: 'Import and call registerEnterpriseArchitectureRoutes(app) inside generated_apis/quadbrain_routes.js.',
  },
  {
    id: 'enterprise-routes-live-through-registered-quadbrain',
    passed: liveViaQuadbrain,
    required: true,
    repair: 'Ensure PromptBridge registers QuadBrain and QuadBrain registers enterprise architecture routes.',
  },
  {
    id: 'architecture-cli-exists',
    passed: fs.existsSync(path.join(rootDir, 'scripts', 'enterprise_architecture_status.mjs')),
    required: true,
    repair: 'Create scripts/enterprise_architecture_status.mjs.',
  },
  {
    id: 'package-scripts-architecture-proof',
    passed: contains(path.join(rootDir, 'package.json'), 'architecture:proof'),
    required: true,
    repair: 'Add architecture:proof and enterprise proof scripts to package.json.',
  },
];

const blockers = checks.filter(check => check.required && !check.passed);
const receipt = {
  success: blockers.length === 0,
  truthState: blockers.length ? 'ENTERPRISE_BRIDGE_WIRING_BLOCKED' : 'ENTERPRISE_BRIDGE_WIRING_READY',
  generatedAt: new Date().toISOString(),
  routeExposureMode: liveViaQuadbrain ? 'REGISTERED_THROUGH_QUADBRAIN_ROUTE_MODULE' : 'NOT_LIVE',
  checks,
  blockers,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'bridge-wiring-audit.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.success ? 0 : 1);
