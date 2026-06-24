#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.prompthouse-data', '.gemini', 'coverage', 'generated_apps']);

function collectSourceFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const filePath = path.join(dir, entry);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      collectSourceFiles(filePath, files);
    } else if (/\.(jsx|js)$/.test(entry)) {
      files.push(filePath);
    }
  }
  return files;
}

function lineForIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

function compactTag(tag) {
  return tag.replace(/\s+/g, ' ').slice(0, 180);
}

function isInsideTemplateLiteral(text, index) {
  const prior = text.slice(0, index);
  const backticks = prior.match(/(?<!\\)`/g) || [];
  return backticks.length % 2 === 1;
}

function hasInteractiveButtonContract(tag) {
  return /\bonClick\s*=/.test(tag) ||
    /\bonPointerDown\s*=/.test(tag) ||
    /\bonMouseDown\s*=/.test(tag) ||
    /\btype\s*=\s*["']submit["']/.test(tag) ||
    /\btype\s*=\s*\{["']submit["']\}/.test(tag) ||
    /\bdisabled\b/.test(tag) ||
    /\baria-disabled\b/.test(tag) ||
    /\bdata-dead-surface-allow\b/.test(tag);
}

function getHref(tag) {
  const match = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|\{["']([^"']*)["']\})/);
  if (match) return match[1] || match[2] || match[3] || '';
  if (/\bhref\s*=\s*\{[^}]+\}/.test(tag)) return '__DYNAMIC__';
  return null;
}

export function auditDeadSurfaces({ rootDir = root } = {}) {
  const srcDir = path.join(rootDir, 'src');
  const violations = [];
  const astGraph = {};

  for (const filePath of collectSourceFiles(srcDir)) {
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const text = fs.readFileSync(filePath, 'utf8');
    
    // Parse imports for AST Graph
    const imports = [];
    for (const match of text.matchAll(/import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']/g)) {
      imports.push(match[1]);
    }
    for (const match of text.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) {
      imports.push(match[1]);
    }
    astGraph[rel] = { imports, size: text.length };

    for (const match of text.matchAll(/<button\b[^>]*>/gms)) {
      if (isInsideTemplateLiteral(text, match.index)) continue;
      const tag = match[0];
      if (!hasInteractiveButtonContract(tag)) {
        violations.push({
          type: 'DEAD_BUTTON',
          file: rel,
          line: lineForIndex(text, match.index),
          snippet: compactTag(tag)
        });
      }
    }

    for (const match of text.matchAll(/<a\b[^>]*>/gms)) {
      if (isInsideTemplateLiteral(text, match.index)) continue;
      const tag = match[0];
      const href = getHref(tag);
      const hasClick = /\bonClick\s*=/.test(tag);
      const allowed = /\bdata-dead-surface-allow\b/.test(tag);
      if (allowed) continue;
      if (href === null && !hasClick) {
        violations.push({
          type: 'DEAD_LINK',
          file: rel,
          line: lineForIndex(text, match.index),
          snippet: compactTag(tag)
        });
      } else if (href !== null && (/^\s*$/.test(href) || href === '#' || /^javascript:/i.test(href))) {
        violations.push({
          type: 'DISCONNECTED_LINK',
          file: rel,
          line: lineForIndex(text, match.index),
          snippet: compactTag(tag)
        });
      }
    }
  }

  // Write AST Graph Ledger
  const proofDir = path.join(rootDir, 'proof_receipts');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });
  fs.writeFileSync(path.join(proofDir, 'ast_graph_ledger.json'), JSON.stringify(astGraph, null, 2));

  return {
    success: violations.length === 0,
    truthState: violations.length === 0 ? 'DEAD_SURFACES_CLEAR' : 'DEAD_SURFACES_FOUND',
    scannedFiles: Object.keys(astGraph).length,
    astGraphSize: Object.keys(astGraph).length,
    violations
  };
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const report = auditDeadSurfaces();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}
