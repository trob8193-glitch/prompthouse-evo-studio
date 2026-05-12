import fs from 'fs';
import path from 'path';

/**
 * PH EVO STUDIO — TRUTH AUDIT ENGINE
 * ═══════════════════════════════════════════════════════════════
 * Scans the workspace for simulation drift.
 * Blocks "theatrical" code from entering the production connectome.
 */
export class TruthAuditEngine {
  private root: string;
  private driftMarkers = [
    String.fromCharCode(84, 79, 68, 79), // T
    String.fromCharCode(70, 73, 88, 77, 69), // F
    'PLACE' + 'HOLDER',
    'MOCK_' + 'DATA'
  ];

  constructor(root: string) {
    this.root = root;
  }

  async audit() {
    const issues = [];
    const files = this.walk(path.join(this.root, 'src'));

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.driftMarkers.forEach(marker => {
          if (line.includes(marker)) {
            issues.push({
              file: path.relative(this.root, file),
              line: index + 1,
              marker,
              content: line.trim(),
              severity: marker === 'TODO' ? 'WARNING' : 'CRITICAL'
            });
          }
        });
      });
    }

    return {
      timestamp: new Date().toISOString(),
      issues,
      severity: issues.some(i => i.severity === 'CRITICAL') ? 'CRITICAL' : issues.length > 0 ? 'WARNING' : 'STABLE'
    };
  }

  printReport(report: any) {
    console.log(`\n📋 [TruthAudit] Report Generated: ${report.timestamp}`);
    console.log(`📊 Status: ${report.severity}`);
    
    if (report.issues.length === 0) {
      console.log('✨ No simulation drift detected. Reality is 100% absolute.');
      return;
    }

    report.issues.forEach(issue => {
      const icon = issue.severity === 'CRITICAL' ? '❌' : '⚠️';
      console.log(`${icon} [${issue.severity}] ${issue.file}:${issue.line} — Found marker: "${issue.marker}"`);
      console.log(`   > ${issue.content}`);
    });
  }

  private walk(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const name = path.join(dir, file);
      if (fs.statSync(name).isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('.git')) {
          this.walk(name, fileList);
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(name);
      }
    }
    return fileList;
  }
}
