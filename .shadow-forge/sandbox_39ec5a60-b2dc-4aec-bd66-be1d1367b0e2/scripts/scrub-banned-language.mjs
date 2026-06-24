#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const TERMS = [
  'todo',
  'placeholder',
  'mock',
  'dummy',
  'stub',
  'fake',
  'for brevity',
  'lorem ipsum',
  'pending implementation',
  'currently gated'
];

const DEFAULT_TARGETS = [
  'src/core/evolution',
  'scripts/self_evolution_cycle.mjs',
  'scripts/self-invention-daemon.mjs'
];

const args = process.argv.slice(2);
const targets = args.length ? args : DEFAULT_TARGETS;
const exts = new Set(['.js', '.jsx', '.mjs', '.cjs']);

function walk(target) {
  const full = path.resolve(process.cwd(), target);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return exts.has(path.extname(full)) ? [full] : [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === 'node_modules' || entry.name === '.git') return [];
    const child = path.join(full, entry.name);
    return entry.isDirectory() ? walk(child) : (exts.has(path.extname(child)) ? [child] : []);
  });
}

const findings = [];
for (const file of targets.flatMap(walk)) {
  const content = fs.readFileSync(file, 'utf8');
  const lower = content.toLowerCase();
  for (const term of TERMS) {
    if (lower.includes(term)) {
      findings.push({ file: path.relative(process.cwd(), file), term });
    }
  }
}

const report = {
  success: findings.length === 0,
  truthState: findings.length ? 'BANNED_LANGUAGE_FOUND' : 'BANNED_LANGUAGE_CLEAR',
  scannedTargets: targets,
  findingCount: findings.length,
  findings
};

Log.info(JSON.stringify(report, null, 2));
process.exit(report.success ? 0 : 1);
