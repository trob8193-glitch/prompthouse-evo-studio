#!/usr/bin/env node
/**
 * PH EVO STUDIO — MARKDOWN WARNING REPORT
 * ════════════════════════════════════════════════════════════════
 * Scans docs and .ai folders for markdown files and reports
 * likely lint warnings. Does NOT mutate or delete any files.
 * Classification: DOCS_HYGIENE_ONLY — does not block build.
 */
import fs from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const DATA_DIR = join(ROOT, '.prompthouse-data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const SCAN_DIRS = ['docs', '.ai'];
const WARNING_PATTERNS = [
  { pattern: /^#{1,6}(?![\s#])/, label: 'Missing space after heading #' },
  { pattern: /\|\s*$/, label: 'Trailing pipe in table row' },
  { pattern: /\r\n/, label: 'Windows CRLF line endings' },
  { pattern: /[ \t]+$/, label: 'Trailing whitespace' },
  { pattern: /^-{3,}\s*$/, label: 'Bare HR (---) without surrounding blank lines', multiLine: false },
  { pattern: /\[.+\]\((?!http|#|\.\/|\/|\.\.)/, label: 'Possibly broken relative link' },
];

function scanDir(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
      scanDir(full, results);
    } else if (e.isFile() && extname(e.name).toLowerCase() === '.md') {
      results.push(full);
    }
  }
  return results;
}

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║  PH EVO STUDIO — MARKDOWN WARNING REPORT            ║');
console.log('╚══════════════════════════════════════════════════════╝\n');
console.log('Classification: DOCS_HYGIENE_ONLY — does not block build.\n');

const files = SCAN_DIRS.flatMap(d => scanDir(join(ROOT, d)));
const warnings = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const rel = relative(ROOT, filePath).replace(/\\/g, '/');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { pattern, label } of WARNING_PATTERNS) {
      if (pattern.test(line)) {
        warnings.push({ file: rel, line: i + 1, warning: label, preview: line.slice(0, 80) });
        break; // one warning per line
      }
    }
  }
}

const summary = {
  scannedDirs: SCAN_DIRS,
  scannedFiles: files.length,
  warningCount: warnings.length,
  classification: 'DOCS_HYGIENE_ONLY',
  blocksBuilds: false,
  note: 'These warnings do not block the build unless markdown lint is configured as a CI gate. Fix additively — do not delete files.',
  warnings: warnings.slice(0, 200), // cap at 200 for readability
};

const md = `# PH EVO STUDIO — Markdown Warning Report

Classification: **DOCS_HYGIENE_ONLY**
This report does NOT block builds. Fix warnings additively. Do NOT delete files.

## Summary
- Scanned directories: ${SCAN_DIRS.join(', ')}
- Files scanned: ${files.length}
- Warnings found: ${warnings.length}

${warnings.length === 0 ? '✅ No markdown warnings detected.' : `
## Warnings (up to 200 shown)

| File | Line | Warning |
|:---|:---|:---|
${warnings.slice(0, 200).map(w => `| \`${w.file}\` | ${w.line} | ${w.warning} |`).join('\n')}
`}

---
*No files were mutated or deleted by this script.*
`;

const jsonPath = join(DATA_DIR, 'markdown-warning-report.json');
const mdPath   = join(DATA_DIR, 'markdown-warning-report.md');
fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(`Files scanned: ${files.length}`);
console.log(`Warnings found: ${warnings.length}`);
console.log(`✅ JSON: ${jsonPath}`);
console.log(`✅ MD:   ${mdPath}`);
console.log('\nClassification: DOCS_HYGIENE_ONLY — no build impact.\n');
