#!/usr/bin/env node
/**
 * PH EVO STUDIO — LOCAL IMPORT AUDIT
 * ═══════════════════════════════════════════════════════════════
 * Scans all .js/.jsx/.mjs/.cjs files for local imports and
 * verifies that every imported file actually exists on disk.
 *
 * Exit 0 = clean, Exit 1 = missing imports found.
 */
import { runImportAudit } from '../src/diagnostics/import-audit.js';

const cwd = process.cwd();
const result = runImportAudit(cwd);

console.log(`\n📦 Import Audit`);
console.log(`   Files scanned: ${result.scannedCount}`);

if (result.ok) {
  console.log(`   ✅ All local imports resolve correctly.\n`);
  process.exit(0);
} else {
  console.log(`   ❌ Missing imports: ${result.missing.length}\n`);
  for (const { file, specifier, line } of result.missing) {
    console.log(`   ${file}:${line} → ${specifier}`);
  }
  console.log('');
  process.exit(1);
}
