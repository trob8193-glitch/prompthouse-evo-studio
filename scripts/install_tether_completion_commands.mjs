#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const pkgPath = path.join(rootDir, 'package.json');

const scripts = {
  'evo:tether:status': 'node scripts/evo_app_intelligence.mjs --status',
  'evo:tether:contract': 'node scripts/evo_app_intelligence.mjs --contract',
  'evo:tether:cycle': 'node scripts/evo_app_intelligence.mjs --cycle-test',
  'evo:tether:safety': 'node scripts/frontier_safety_gate.mjs --status',
  'evo:tether:memory': 'node scripts/evo_work_memory.mjs --status',
  'evo:tether:audit': 'node scripts/audit_intelligence_stack.mjs',
  'evo:tether:proof': 'node scripts/frontier_safety_gate.mjs --status && node scripts/evo_work_memory.mjs --status && node scripts/evo_app_intelligence.mjs --cycle-test && node scripts/audit_intelligence_stack.mjs',
  'evo:intelligence:master': 'npm run evo:wire-intelligence && npm run evo:tether:proof && npm run build && npm run verify:studio'
};

if (!fs.existsSync(pkgPath)) {
  console.error(JSON.stringify({ success: false, truthState: 'PACKAGE_JSON_MISSING', pkgPath }, null, 2));
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = { ...(pkg.scripts || {}), ...scripts };
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

const receiptDir = path.join(rootDir, '.prompthouse-data', 'intelligence-wiring');
fs.mkdirSync(receiptDir, { recursive: true });
const receipt = {
  generatedAt: new Date().toISOString(),
  truthState: 'TETHER_COMPLETION_COMMANDS_INSTALLED',
  scripts
};
const receiptPath = path.join(receiptDir, `tether-completion-commands-${Date.now()}.json`);
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
console.log(JSON.stringify({ success: true, receiptPath, scripts }, null, 2));
