const RULES = [
  ['rename_surface', 'Use Evo names and smaller file boundaries.', 3, true],
  ['split_payload', 'Move the change into a focused adapter.', 3, true],
  ['fresh_sha', 'Fetch current file metadata before retrying.', 2, true],
  ['proof_chain', 'Run proof commands and record the result.', 3, true],
  ['local_patch', 'Use exact manual patch notes for oversized files.', 2, false],
  ['safe_note', 'Return a receipt and isolate the target area.', 4, false]
];

function now() {
  return new Date().toISOString();
}

function clean(value, fallback = '', max = 500) {
  return String(value || fallback).trim().slice(0, max);
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function hash(value = '') {
  let n = 2166136261;
  const raw = String(value);
  for (let i = 0; i < raw.length; i += 1) {
    n ^= raw.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  return Math.abs(n >>> 0).toString(36);
}

function scoreName(score) {
  if (score >= 4) return 'critical';
  if (score === 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

function pickRule(note = '', area = '', tags = []) {
  const text = `${note} ${area} ${tags.join(' ')}`.toLowerCase();
  if (text.includes('sha') || text.includes('409') || text.includes('conflict')) return RULES[2];
  if (text.includes('ci') || text.includes('test') || text.includes('build') || text.includes('workflow')) return RULES[3];
  if (text.includes('truncated') || text.includes('oversized')) return RULES[4];
  if (text.includes('large') || text.includes('giant')) return RULES[1];
  if (text.includes('route') || text.includes('server') || text.includes('name')) return RULES[0];
  return RULES[5];
}

function normalize(item = {}) {
  const tags = arr(item.tags).map(tag => clean(tag, '', 80)).filter(Boolean);
  const area = clean(item.area || item.surface || item.file || item.module, 'unknown', 240);
  const action = clean(item.action || item.operation, 'unknown', 160);
  const note = clean(item.note || item.reason || item.message || item.error, 'unspecified', 1000);
  const rule = pickRule(note, area, tags);
  const severityScore = Number(item.severityScore || rule[2]);

  return {
    id: item.id || `evo_issue_${hash(`${area}:${action}:${note}`)}`,
    createdAt: item.createdAt || now(),
    area,
    action,
    note,
    tags,
    source: clean(item.source || 'studio', 'studio', 160),
    done: Boolean(item.done || item.resolved),
    severity: scoreName(severityScore),
    severityScore,
    response: {
      id: rule[0],
      action: rule[1],
      retry: Boolean(rule[3])
    }
  };
}

export function createEvoIssueCounter(items = []) {
  const entries = arr(items).map(normalize);
  const open = entries.filter(entry => !entry.done);
  const byArea = {};
  const byResponse = {};
  const bySeverity = {};
  let totalScore = 0;

  for (const entry of entries) {
    byArea[entry.area] = (byArea[entry.area] || 0) + 1;
    byResponse[entry.response.id] = (byResponse[entry.response.id] || 0) + 1;
    bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
    totalScore += entry.severityScore;
  }

  const next = open
    .map(entry => ({
      area: entry.area,
      severity: entry.severity,
      response: entry.response.id,
      action: entry.response.action,
      retry: entry.response.retry
    }))
    .sort((a, b) => ({ critical: 4, high: 3, medium: 2, low: 1 }[b.severity] - { critical: 4, high: 3, medium: 2, low: 1 }[a.severity]));

  return {
    success: true,
    truthState: open.length ? 'EVO_ISSUES_ACTIVE' : 'EVO_ISSUES_CLEAR',
    total: entries.length,
    open: open.length,
    closed: entries.length - open.length,
    totalScore,
    byArea,
    byResponse,
    bySeverity,
    next,
    entries
  };
}

export function createEvoIssueReceipt(items = []) {
  const report = createEvoIssueCounter(items);
  return {
    receiptId: `evo_issue_receipt_${hash(JSON.stringify(report.byResponse))}`,
    createdAt: now(),
    engine: 'EvoIssueCounter',
    version: '1.0.0',
    ...report
  };
}

export function getEvoIssueRules() {
  return RULES.map(rule => ({ id: rule[0], action: rule[1], severityScore: rule[2], retry: rule[3] }));
}

export default createEvoIssueCounter;
