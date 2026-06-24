#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function readJsonFiles(dir, limit = 50) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .slice(-limit)
    .map(name => {
      const file = path.join(dir, name);
      try {
        return { file, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function row(values) {
  return `| ${values.map(value => String(value ?? '').replace(/\n/g, ' ')).join(' | ')} |`;
}

function writeFile(relPath, content) {
  const file = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${content.trim()}\n`, 'utf8');
  return file;
}

const root = process.cwd();
const reviews = readJsonFiles(path.join(root, '.prompthouse-data', 'reviews'));
const maturity = readJsonFiles(path.join(root, '.prompthouse-data', 'maturity'));
const evolution = readJsonFiles(path.join(root, '.prompthouse-data', 'evolution', 'receipts'));
const now = new Date().toISOString();

const latestMaturity = maturity.at(-1)?.data || null;

const reviewLines = [
  '# Proof Ledger Summary',
  '',
  `Generated: ${now}`,
  '',
  row(['Module', 'Stage', 'Approved', 'Truth State', 'Signed At', 'Issues']),
  row(['---', '---', '---', '---', '---', '---']),
  ...reviews.slice(-25).map(({ data }) => row([
    data.moduleId,
    data.targetStage,
    data.approved,
    data.truthState,
    data.signedAt,
    Array.isArray(data.issues) ? data.issues.join('; ') : ''
  ]))
];

const maturityLines = [
  '# Module Maturity Status',
  '',
  `Generated: ${now}`,
  '',
  latestMaturity ? `Average Score: ${latestMaturity.averageScore}%` : 'Average Score: No maturity receipt found.',
  '',
  row(['Module', 'Score', 'Grade', 'Missing Checks']),
  row(['---', '---', '---', '---']),
  ...(latestMaturity?.modules || []).map(module => row([
    module.name || module.id,
    `${module.score}%`,
    module.grade,
    Array.isArray(module.missing) ? module.missing.map(item => item.label || item.key).join('; ') : ''
  ]))
];

const evolutionLines = [
  '# Self-Evolution Readiness',
  '',
  `Generated: ${now}`,
  '',
  row(['Run', 'Truth State', 'Success', 'Updated', 'Objective']),
  row(['---', '---', '---', '---', '---']),
  ...evolution.slice(-25).map(({ data }) => row([
    data.id,
    data.truthState,
    data.success ?? '',
    data.updatedAt || data.createdAt,
    data.objective || ''
  ]))
];

const files = [
  writeFile('docs/proof-ledger-summary.md', reviewLines.join('\n')),
  writeFile('docs/module-maturity-status.md', maturityLines.join('\n')),
  writeFile('docs/self-evolution-readiness.md', evolutionLines.join('\n'))
];

console.log(JSON.stringify({
  success: true,
  truthState: 'PROOF_DOCS_GENERATED',
  reviewCount: reviews.length,
  maturityReceiptCount: maturity.length,
  evolutionReceiptCount: evolution.length,
  files
}, null, 2));
