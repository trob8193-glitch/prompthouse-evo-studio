const DESTRUCTIVE_PATTERNS = Object.freeze([
  { pattern: /\brm\s+-rf\b/i, reason: 'Recursive forced removal requires explicit approval.' },
  { pattern: /\brmdir\s+\/s\b/i, reason: 'Recursive directory removal requires explicit approval.' },
  { pattern: /\bdel\s+\/s\b/i, reason: 'Recursive Windows delete requires explicit approval.' },
  { pattern: /\bformat\b/i, reason: 'Disk format command is blocked.' },
  { pattern: /\bmkfs\b/i, reason: 'Filesystem creation command is blocked.' },
  { pattern: /\bdrop\s+(database|table|schema)\b/i, reason: 'Database drop operation requires explicit approval.' },
  { pattern: /\btruncate\s+table\b/i, reason: 'Database truncate operation requires explicit approval.' },
  { pattern: /\bshutdown\b/i, reason: 'System shutdown command is blocked.' },
  { pattern: /\breboot\b/i, reason: 'System reboot command is blocked.' },
  { pattern: /\btaskkill\b.*\/f/i, reason: 'Forced process termination requires explicit approval.' },
]);

const SECRET_PATTERNS = Object.freeze([
  { pattern: /sk-[A-Za-z0-9_-]{12,}/, reason: 'Command appears to include an OpenAI-style API key.' },
  { pattern: /AIza[A-Za-z0-9_-]{20,}/, reason: 'Command appears to include a Gemini-style API key.' },
  { pattern: /Bearer\s+\S{12,}/i, reason: 'Command appears to include a bearer token.' },
  { pattern: /(password|secret|token|api[_-]?key)\s*[:=]\s*\S{8,}/i, reason: 'Command appears to include secret material.' },
]);

const HIGH_RISK_PATTERNS = Object.freeze([
  { pattern: /\bgit\s+push\b/i, reason: 'Git push requires approval or operator confirmation.' },
  { pattern: /\bgit\s+reset\s+--hard\b/i, reason: 'Hard reset requires approval.' },
  { pattern: /\bgit\s+clean\s+-fd/i, reason: 'Git clean can destroy untracked work and requires approval.' },
  { pattern: /\bnpm\s+(install|i)\b/i, reason: 'Dependency installation requires dependency approval.' },
  { pattern: /\bdeploy\b|\bvercel\s+--prod\b|\bstripe\b/i, reason: 'Deployment, billing, or commerce operations require approval.' },
  { pattern: /\bchmod\s+777\b/i, reason: 'Unsafe permission mutation requires approval.' },
]);

function matchAny(patterns, text) {
  return patterns.find(({ pattern }) => pattern.test(text)) || null;
}

export function classifyExecutionRisk({ task = '' } = {}) {
  const text = String(task || '').trim();
  const secret = matchAny(SECRET_PATTERNS, text);
  if (secret) return { risk: 'CRITICAL', blocked: true, reason: secret.reason, category: 'secret_exposure' };

  const destructive = matchAny(DESTRUCTIVE_PATTERNS, text);
  if (destructive) return { risk: 'CRITICAL', blocked: true, reason: destructive.reason, category: 'destructive_command' };

  const highRisk = matchAny(HIGH_RISK_PATTERNS, text);
  if (highRisk) return { risk: 'HIGH', blocked: false, reason: highRisk.reason, category: 'approval_required' };

  if (/\btest\b|\bbuild\b|\baudit\b|\bstatus\b|\blist\b/i.test(text)) {
    return { risk: 'LOW', blocked: false, reason: 'Readiness, test, build, or audit command.', category: 'proof_command' };
  }

  return { risk: 'MEDIUM', blocked: false, reason: 'General execution requires receipt and adapter routing.', category: 'general_command' };
}

export function checkExecutionSafety({ rootDir = process.cwd(), task = '', approval = null, allowHighRisk = false } = {}) {
  const classification = classifyExecutionRisk({ task });
  const approved = Boolean(
    approval?.approved === true ||
    approval?.scope === 'execution' ||
    approval?.scope === 'high-risk-execution' ||
    allowHighRisk === true
  );

  if (classification.blocked) {
    return {
      allowed: false,
      risk: classification.risk,
      category: classification.category,
      approvalRequired: true,
      reason: classification.reason,
      rootDir,
    };
  }

  if (classification.risk === 'HIGH' && !approved) {
    return {
      allowed: false,
      risk: classification.risk,
      category: classification.category,
      approvalRequired: true,
      reason: classification.reason,
      rootDir,
    };
  }

  return {
    allowed: true,
    risk: classification.risk,
    category: classification.category,
    approvalRequired: classification.risk === 'HIGH',
    reason: classification.reason || 'SAFE',
    rootDir,
  };
}
