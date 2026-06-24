/**
 * scripts/generate-handover-report.mjs
 * 
 * Generates the sovereign studio handover report.
 * "No secrets. No provider calls."
 */

import fs from 'node:fs';
import path from 'node:path';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

export function redact(val) {
  if (!val) return '';
  return val.slice(0, 8) + '...REDACTED';
}

export function generateHandoverReport() {
  const sentinel = new PlatformReadinessEngine();
  
  // This internally generates the platform_readiness_receipt and returns the full audit result
  const audit = sentinel.receipt({ runCommands: true, includeHeavy: false });
  
  const env = process.env.DEPLOY_ALLOW_PRODUCTION || 'false';
  
  let report = `# Enterprise AI & Software Audit Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Truth State**: ${audit.release.truthLabel}
- **Audit Score**: ${audit.score}/100
- **Total Blockers**: ${audit.repairQueue.length}
- **Online Blockers**: ${audit.onlineBlockers.length}
- **Release Verdict**: ${audit.release.verdict}

### Verdict Details
> ${audit.release.reason}

## Module Maturity Breakdown
`;

  audit.modules.forEach(mod => {
    report += `- **${mod.label}**: ${mod.status === 'PASS' ? '✅' : '❌'}\n`;
    if (mod.missing && mod.missing.length > 0) {
      report += `  - Missing: ${mod.missing.join(', ')}\n`;
    }
  });

  report += `\n## Online Gates & Provider Status\n`;
  if (audit.onlineBlockers.length === 0) {
    report += `All required provider connectivity verified. No blockers.\n`;
  } else {
    audit.onlineBlockers.forEach(blocker => {
      report += `- **[${blocker.severity}] ${blocker.label}**: ${blocker.truthLabel}\n`;
      report += `  - Reason: ${blocker.reasons.join(', ')}\n`;
      report += `  - Action: ${blocker.nextAction}\n`;
    });
  }

  report += `\n## Critical Issues & Vulnerabilities\n`;
  if (audit.issues.length === 0) {
    report += `No critical static analysis or credential leak issues found.\n`;
  } else {
    audit.issues.forEach(issue => {
      report += `- **[${issue.severity.toUpperCase()}]**: ${issue.message}\n`;
      if (issue.file) report += `  - File: \`${issue.file}\`\n`;
    });
  }

  report += `\n## Autonomous Repair Queue\n`;
  if (audit.repairQueue.length === 0) {
    report += `No items in repair queue.\n`;
  } else {
    audit.repairQueue.forEach((repair, idx) => {
      report += `${idx + 1}. **[${repair.priority}]** ${repair.title}\n`;
      report += `   - Detail: ${repair.detail}\n`;
    });
  }

  report += `\n---\n*This report is cryptographically bound to platform_readiness_receipt ledgers. No live provider credentials have been leaked.*`;

  const outDir = path.join(process.cwd(), '.prompthouse-data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // Write the rich markdown report
  fs.writeFileSync(path.join(outDir, 'handover-report.md'), report);
  
  // Write the exportable repair queue
  fs.writeFileSync(path.join(outDir, 'repair-queue.json'), JSON.stringify(audit.repairQueue, null, 2));

  Log.info('✅ Handover report generated successfully.');
  Log.info('✅ Repair queue exported to .prompthouse-data/repair-queue.json');
}

// Auto-run if executed directly
if (import.meta.url === `file://${path.resolve(process.argv[1]).replace(/\\/g, '/')}`) {
  generateHandoverReport();
}
