#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { ProductionAudit } from '../src/core/engines/productionAudit.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', 'build', '.next']);

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (SKIP_DIRS.has(file)) return;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(js|jsx|mjs)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function classifyPath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
  return {
    isScript: normalized.startsWith('scripts/') || normalized.endsWith('.mjs'),
    isTest: normalized.startsWith('tests/') || /\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized),
    isLogger: normalized.includes('sovereignlogger'),
    isAudit: /(audit|verify|review|receipt|report|crucible|team_repair|repair)/.test(normalized),
    isEntrypoint: normalized === 'src/main.jsx' || normalized.includes('/daemons/') || normalized.includes('/routes/') || normalized.endsWith('promptbridge-server.js')
  };
}

function filterIssuesForPath(issues, relativePath) {
  const flags = classifyPath(relativePath);
  return issues.filter(issue => {
    if (issue.includes('No ESM exports') && (flags.isScript || flags.isEntrypoint)) return false;
    if (issue.includes('console logging') && (flags.isScript || flags.isLogger || flags.isAudit || flags.isEntrypoint)) return false;
    if (issue.includes('TODO/FIXME') && (flags.isScript || flags.isAudit || flags.isTest)) return false;
    return true;
  });
}

function syntaxCheck(file) {
  if (file.endsWith('.jsx')) return null;
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    return null;
  } catch (error) {
    return `Syntax check failed: ${String(error.stderr || error.message).trim().split('\n')[0]}`;
  }
}

async function runAudit() {
  Log.info('[Enterprise Audit] Starting full project scan...');

  const roots = ['src', 'lib', 'scripts'];
  const allFiles = roots.flatMap(root => getAllFiles(path.join(process.cwd(), root)));

  Log.info(`[Enterprise Audit] Found ${allFiles.length} files to audit.`);

  let totalScore = 0;
  let totalPassed = 0;
  const failures = [];

  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    const syntaxIssue = syntaxCheck(file);
    let result = ProductionAudit.audit(content);
    result.issues = filterIssuesForPath(result.issues, relativePath);
    if (syntaxIssue) result.issues.push(syntaxIssue);
    result.passed = result.issues.length === 0;
    result.score = result.passed ? 100 : Math.max(0, 100 - result.issues.length * 12);

    totalScore += result.score;
    if (result.passed) {
      totalPassed += 1;
    } else {
      failures.push({ file: relativePath, issues: result.issues });
    }
  });

  const avgScore = allFiles.length > 0 ? totalScore / allFiles.length : 0;

  Log.info('');
  Log.info('ENTERPRISE AUDIT REPORT');
  Log.info(`Total Files: ${allFiles.length}`);
  Log.info(`Passed: ${totalPassed}`);
  Log.info(`Failed: ${failures.length}`);
  Log.info(`Average Score: ${avgScore.toFixed(2)}/100`);

  if (failures.length > 0) {
    Log.info('');
    Log.info('Failures:');
    failures.slice(0, 100).forEach(failure => {
      Log.info(`- ${failure.file}`);
      failure.issues.forEach(issue => Log.info(`  ${issue}`));
    });
    if (failures.length > 100) Log.info(`... ${failures.length - 100} additional failures omitted from console output.`);
  } else {
    Log.info('All files passed production audit.');
  }

  const report = {
    timestamp: new Date().toISOString(),
    truthState: failures.length === 0 ? 'ENTERPRISE_AUDIT_CLEAR' : 'ENTERPRISE_AUDIT_FAILED',
    totalFiles: allFiles.length,
    passed: totalPassed,
    failed: failures.length,
    averageScore: avgScore,
    failures
  };

  const reportDir = path.join(process.cwd(), '.prompthouse-data');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, 'enterprise_audit_report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  Log.info('Detailed report saved to .prompthouse-data/enterprise_audit_report.json');
  if (failures.length > 0) process.exit(1);
}

runAudit().catch(error => {
  console.error(error);
  process.exit(1);
});
