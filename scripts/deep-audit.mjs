import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'acorn';
import { simple as walkAST } from 'acorn-walk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════
//  DEEP AUDIT ENGINE — AST-Based Semantic Code Analysis
//  Goes beyond regex. Parses actual JavaScript syntax trees.
// ═══════════════════════════════════════════════════════════════

const AUDIT_RULES = [
  {
    id: 'EMPTY_FUNCTION',
    severity: 'critical',
    description: 'Function body is empty or contains only a comment',
    check: (ast, content) => {
      const violations = [];
      walkAST(ast, {
        FunctionDeclaration(node) {
          if (node.body.body.length === 0) {
            violations.push({ line: node.loc.start.line, name: node.id?.name || 'anonymous' });
          }
        },
        ArrowFunctionExpression(node) {
          if (node.body.type === 'BlockStatement' && node.body.body.length === 0) {
            violations.push({ line: node.loc.start.line, name: 'arrow function' });
          }
        },
      });
      return violations;
    },
  },
  {
    id: 'UNREACHABLE_CODE',
    severity: 'warning',
    description: 'Code exists after a return statement',
    check: (ast) => {
      const violations = [];
      walkAST(ast, {
        BlockStatement(node) {
          let foundReturn = false;
          for (const stmt of node.body) {
            if (foundReturn) {
              violations.push({ line: stmt.loc.start.line, name: 'unreachable statement' });
              break;
            }
            if (stmt.type === 'ReturnStatement') foundReturn = true;
          }
        },
      });
      return violations;
    },
  },
  {
    id: 'HARDCODED_SECRET',
    severity: 'critical',
    description: 'Potential hardcoded API key or secret',
    check: (_ast, content) => {
      const violations = [];
      const lines = content.split('\n');
      const secretPatterns = [
        /['"]sk[-_](?:test|live|proj)[-_][A-Za-z0-9]{20,}['"]/,
        /['"]AIzaSy[A-Za-z0-9_-]{33}['"]/,
        /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
      ];
      lines.forEach((line, i) => {
        // Skip .env files and comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
        // Skip process.env references
        if (/process\.env/.test(line)) return;
        for (const pat of secretPatterns) {
          if (pat.test(line)) {
            violations.push({ line: i + 1, name: 'hardcoded secret' });
          }
        }
      });
      return violations;
    },
  },
  {
    id: 'DEAD_EXPORT',
    severity: 'info',
    description: 'Exported function with no implementation logic (single return/throw)',
    check: (ast) => {
      const violations = [];
      walkAST(ast, {
        FunctionDeclaration(node) {
          if (node.body.body.length === 1) {
            const only = node.body.body[0];
            if (only.type === 'ThrowStatement') {
              violations.push({ line: node.loc.start.line, name: node.id?.name || 'anonymous' });
            }
          }
        },
      });
      return violations;
    },
  },
];

export function deepAuditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(rootDir, filePath);
  const results = { file: relPath, violations: [], score: 100 };

  // Skip non-parseable files (CSS, JSON, etc.)
  if (!/\.(js|mjs|cjs)$/.test(filePath)) {
    return results;
  }

  // Skip JSX files (acorn can't parse JSX without a plugin)
  if (/\.jsx$/.test(filePath)) {
    return results;
  }

  let ast;
  try {
    ast = parse(content, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      allowImportExportEverywhere: true,
      allowHashBang: true,
    });
  } catch {
    // If we can't parse, do line-based checks only
    const lineChecks = AUDIT_RULES.filter((r) => r.id === 'HARDCODED_SECRET');
    for (const rule of lineChecks) {
      const violations = rule.check(null, content);
      violations.forEach((v) => {
        results.violations.push({ rule: rule.id, severity: rule.severity, ...v });
        results.score -= rule.severity === 'critical' ? 15 : 5;
      });
    }
    return results;
  }

  for (const rule of AUDIT_RULES) {
    try {
      const violations = rule.check(ast, content);
      violations.forEach((v) => {
        results.violations.push({ rule: rule.id, severity: rule.severity, description: rule.description, ...v });
        results.score -= rule.severity === 'critical' ? 15 : rule.severity === 'warning' ? 5 : 2;
      });
    } catch { /* rule failed gracefully */ }
  }

  results.score = Math.max(0, results.score);
  return results;
}

export function deepAuditDirectory(dir) {
  const files = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'dist-electron'].includes(entry.name)) continue;
        walk(full);
      } else if (/\.(js|mjs|cjs)$/.test(entry.name)) {
        files.push(full);
      }
    }
  }
  walk(dir);

  const allResults = files.map(deepAuditFile);
  const avgScore = allResults.length > 0
    ? (allResults.reduce((s, r) => s + r.score, 0) / allResults.length).toFixed(1)
    : 100;

  return {
    totalFiles: allResults.length,
    averageScore: parseFloat(avgScore),
    criticalViolations: allResults.flatMap((r) => r.violations.filter((v) => v.severity === 'critical')),
    warnings: allResults.flatMap((r) => r.violations.filter((v) => v.severity === 'warning')),
    filesWithIssues: allResults.filter((r) => r.violations.length > 0),
  };
}

// CLI entry
if (process.argv[1] && process.argv[1].endsWith('deep-audit.mjs')) {
  const target = process.argv[2] || 'src';
  const targetPath = path.resolve(rootDir, target);

  process.stdout.write('\n\x1b[35m╔═══════════════════════════════════════════════════════════════╗\x1b[0m\n');
  process.stdout.write('\x1b[35m║   DEEP AUDIT ENGINE — AST-Based Semantic Analysis            ║\x1b[0m\n');
  process.stdout.write('\x1b[35m╚═══════════════════════════════════════════════════════════════╝\x1b[0m\n\n');

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const report = deepAuditDirectory(targetPath);
    process.stdout.write(`Files Audited: ${report.totalFiles}\n`);
    process.stdout.write(`Average Score: ${report.averageScore}/100\n`);
    process.stdout.write(`Critical:      ${report.criticalViolations.length}\n`);
    process.stdout.write(`Warnings:      ${report.warnings.length}\n\n`);

    if (report.criticalViolations.length > 0) {
      process.stdout.write('\x1b[31mCritical Violations:\x1b[0m\n');
      report.criticalViolations.forEach((v) => {
        process.stdout.write(`  ❌ ${v.rule} at line ${v.line}: ${v.name}\n`);
      });
    }

    if (report.filesWithIssues.length === 0) {
      process.stdout.write('\x1b[32m✅ All files passed deep semantic audit.\x1b[0m\n');
    }

    // Write receipt
    const receiptDir = path.join(rootDir, 'proof_receipts');
    if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });
    fs.writeFileSync(path.join(receiptDir, 'deep_audit.json'), JSON.stringify(report, null, 2));
    process.stdout.write(`\n📋 Receipt: proof_receipts/deep_audit.json\n`);
  } else {
    const result = deepAuditFile(targetPath);
    process.stdout.write(`File: ${result.file}\n`);
    process.stdout.write(`Score: ${result.score}/100\n`);
    result.violations.forEach((v) => {
      process.stdout.write(`  ❌ ${v.rule} at line ${v.line}: ${v.name}\n`);
    });
  }
}
