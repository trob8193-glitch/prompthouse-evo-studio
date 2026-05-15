#!/usr/bin/env node
/**
 * PH EVO STUDIO — CSS VARIABLE AUDIT
 * ═══════════════════════════════════════════════════════════════
 * Scans all source files for var(--token) references and checks
 * that every referenced token is defined in a :root block.
 *
 * Exit 0 = clean, Exit 1 = missing tokens found.
 */
import { runCssAudit } from '../src/diagnostics/css-var-audit.js';

const cwd = process.cwd();
const result = runCssAudit(cwd);

console.log(`\n🎨 CSS Variable Audit`);
console.log(`   Defined tokens:    ${result.definedCount}`);
console.log(`   Referenced tokens: ${result.referencedCount}`);

if (result.ok) {
  console.log(`   ✅ All referenced tokens are defined.\n`);
  process.exit(0);
} else {
  console.log(`   ❌ Missing tokens: ${result.missing.length}\n`);
  for (const { token, files } of result.missing) {
    console.log(`   ${token}`);
    for (const f of files.slice(0, 3)) {
      console.log(`      ↳ ${f}`);
    }
    if (files.length > 3) console.log(`      ↳ ... and ${files.length - 3} more`);
  }
  console.log('');
  process.exit(1);
}
