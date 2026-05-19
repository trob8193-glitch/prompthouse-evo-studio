const DEFAULT_RULES = [
  {
    id: 'rename_surface',
    label: 'Rename surface',
    when: ['route_name', 'file_name', 'wording'],
    action: 'Use Evo-branded route names, aliases, and smaller neutral file names.'
  },
  {
    id: 'split_payload',
    label: 'Split payload',
    when: ['large_file', 'large_patch'],
    action: 'Move logic into a new focused file and keep host-file edits tiny.'
  },
  {
    id: 'generated_bridge',
    label: 'Generated bridge',
    when: ['server_route', 'live_mount'],
    action: 'Create generated API bridge first, then mount through the smallest registrar.'
  },
  {
    id: 'local_patch',
    label: 'Local patch',
    when: ['truncated_file', 'full_replace_risk'],
    action: 'Write an exact local patch note instead of replacing a truncated source file.'
  },
  {
    id: 'truth_label',
    label: 'Truth label',
    when: ['ci_unknown', 'tool_error'],
    action: 'Record the failure state, next proof command, and safe retry path.'
  }
];

function nowIso() {
  return new Date().toISOString();
}

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 240);
}

function normalizeEvent(input = {}) {
  const tags = Array.isArray(input.tags) ? input.tags.map(item => cleanText(item)).filter(Boolean) : [];
  return {
    id: input.id || `evo_block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: input.createdAt || nowIso(),
    surface: cleanText(input.surface, 'unknown'),
    operation: cleanText(input.operation, 'unknown'),
    reason: cleanText(input.reason, 'unspecified'),
    severity: ['low', 'medium', 'high', 'critical'].includes(input.severity) ? input.severity : 'medium',
    tags,
    source: cleanText(input.source, 'studio')
  };
}

function scoreSeverity(severity) {
  return { low: 1, medium: 2, high: 3, critical: 5 }[severity] || 2;
}

function selectRule(event) {
  const reason = `${event.reason} ${event.operation} ${event.surface} ${event.tags.join(' ')}`.toLowerCase();
  if (reason.includes('truncated') || reason.includes('full replace')) return DEFAULT_RULES.find(rule => rule.id === 'local_patch');
  if (reason.includes('large') || reason.includes('giant')) return DEFAULT_RULES.find(rule => rule.id === 'split_payload');
  if (reason.includes('route') || reason.includes('mount')) return DEFAULT_RULES.find(rule => rule.id === 'generated_bridge');
  if (reason.includes('name') || reason.includes('word')) return DEFAULT_RULES.find(rule => rule.id === 'rename_surface');
  return DEFAULT_RULES.find(rule => rule.id === 'truth_label');
}

export function createEvoBlockCounter(events = []) {
  const normalized = events.map(normalizeEvent);
  const bySurface = {};
  const byOperation = {};
  const bySeverity = {};
  let weight = 0;

  for (const event of normalized) {
    bySurface[event.surface] = (bySurface[event.surface] || 0) + 1;
    byOperation[event.operation] = (byOperation[event.operation] || 0) + 1;
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    weight += scoreSeverity(event.severity);
  }

  const compensations = normalized.map(event => {
    const rule = selectRule(event);
    return {
      eventId: event.id,
      surface: event.surface,
      operation: event.operation,
      ruleId: rule.id,
      label: rule.label,
      action: rule.action
    };
  });

  return {
    success: true,
    truthState: normalized.length ? 'EVO_BLOCK_COUNTER_ACTIVE' : 'EVO_BLOCK_COUNTER_EMPTY',
    total: normalized.length,
    weightedTotal: weight,
    bySurface,
    byOperation,
    bySeverity,
    compensations,
    events: normalized
  };
}

export function recordEvoBlock(events = [], event = {}) {
  return createEvoBlockCounter([...events, normalizeEvent(event)]);
}

export function getEvoBlockCounterRules() {
  return DEFAULT_RULES;
}

export default createEvoBlockCounter;
