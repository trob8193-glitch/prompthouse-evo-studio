#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const bridgePath = path.join(rootDir, 'promptbridge-server.js');
const routePath = path.join(rootDir, 'generated_apis', 'enterprise_architecture_routes.js');
const outDir = path.join(rootDir, '.prompthouse-data', 'architecture');

function contains(file, text) {
  return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(text);
}

const checks = [
  {
    id: 'enterprise-route-module-exists',
    passed: fs.existsSync(routePath),
    required: true,
    repair: 'Create generated_apis/enterprise_architecture_routes.js.',
  },
  {
    id: 'promptbridge-imports-enterprise-routes',
    passed: contains(bridgePath, "./generated_apis/enterprise_architecture_routes.js"),
    required: true,
    repair: "Add: import registerEnterpriseArchitectureRoutes from './generated_apis/enterprise_architecture_routes.js';",
  },
  {
    id: 'promptbridge-registers-enterprise-routes',
    passed: contains(bridgePath, 'registerEnterpriseArchitectureRoutes(app)'),
    required: true,
    repair: 'Call registerEnterpriseArchitectureRoutes(app) near the other generated API route registrations.',
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
  checks,
  blockers,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'bridge-wiring-audit.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.success ? 0 : 1);
