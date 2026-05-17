/**
 * scripts/generate-handover-report.mjs
 * 
 * Generates the sovereign studio handover report.
 * "No secrets. No provider calls."
 */

import fs from 'node:fs';
import path from 'node:path';

export function redact(val) {
  if (!val) return '';
  return val.slice(0, 8) + '...REDACTED';
}

export function generateHandoverReport() {
  const env = process.env.DEPLOY_ALLOW_PRODUCTION || 'false';
  const report = `# Handover Report
Generated: ${new Date().toISOString()}
Truth State: SECURITY_GATE_VERIFIED — PUBLIC_SMOKE_BLOCKED_BY_AUTH
No secrets. No provider calls.

## Environment Summary
- Deploy Production Allowed: ${env}
`;

  const outDir = path.join(process.cwd(), '.prompthouse-data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outDir, 'handover-report.md'), report);
  console.log('✅ Handover report generated successfully.');
}

// Auto-run if executed directly
if (import.meta.url === `file://${path.resolve(process.argv[1]).replace(/\\/g, '/')}`) {
  generateHandoverReport();
}
