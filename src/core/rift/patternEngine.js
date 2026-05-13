import { TRUTH_LABELS } from './riftTypes.js';

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function confidenceFromFrequency(frequency, total) {
  if (!total || total < 1) return 0;
  const ratio = frequency / total;
  const frequencyWeight = Math.min(1, frequency / 7);
  return Number(Math.min(0.98, (ratio * 0.55) + (frequencyWeight * 0.45)).toFixed(3));
}

function signalKey(signal) {
  return `${String(signal.source || 'unknown').trim().toLowerCase()}::${normalizeValue(signal.value)}`;
}

export function extractPatternSignals({ events = [], now = new Date() } = {}) {
  const safeNow = now instanceof Date ? now : new Date(now);
  const signals = [];

  for (const event of Array.isArray(events) ? events : []) {
    const timestamp = event.timestamp ? new Date(event.timestamp) : safeNow;
    const values = [];

    if (event.value !== undefined && event.value !== null) {
      values.push({ source: event.source || event.type || 'user_event', value: event.value });
    }

    if (event.location?.latitude !== undefined && event.location?.longitude !== undefined) {
      const lat = Number(event.location.latitude).toFixed(3);
      const lng = Number(event.location.longitude).toFixed(3);
      values.push({ source: 'location_grid', value: `${lat},${lng}` });
    }

    if (!Number.isNaN(timestamp.getTime())) {
      const hour = String(timestamp.getHours()).padStart(2, '0');
      const minute = String(timestamp.getMinutes()).padStart(2, '0');
      const hhmm = `${hour}:${minute}`;
      values.push({ source: 'timestamp_hhmm', value: hhmm });

      const repeatedDigits = hhmm.replace(':', '').match(/^(\d)\1{2,}$/);
      if (repeatedDigits) {
        values.push({ source: 'repeated_number', value: hhmm });
      }
    }

    for (const tag of Array.isArray(event.tags) ? event.tags : []) {
      values.push({ source: 'object_tag', value: tag });
    }

    for (const item of values) {
      const value = normalizeValue(item.value);
      if (!value) continue;
      signals.push({
        id: `${signalKey(item)}::${timestamp.getTime()}`,
        source: String(item.source || 'unknown'),
        value,
        timestamp: Number.isNaN(timestamp.getTime()) ? safeNow.toISOString() : timestamp.toISOString(),
      });
    }
  }

  return signals;
}

export function analyzePatternSignals({ events = [], existingSignals = [] } = {}) {
  const extracted = extractPatternSignals({ events });
  const combined = [...(Array.isArray(existingSignals) ? existingSignals : []), ...extracted];
  const buckets = new Map();

  for (const signal of combined) {
    const key = signalKey(signal);
    if (!key.endsWith('::')) {
      const current = buckets.get(key) || {
        id: key.replace(/[^a-z0-9:_.,-]/gi, '_'),
        source: signal.source || 'unknown',
        value: normalizeValue(signal.value),
        frequency: 0,
        firstSeenAt: signal.timestamp || signal.firstSeenAt || new Date().toISOString(),
        lastSeenAt: signal.timestamp || signal.lastSeenAt || new Date().toISOString(),
      };
      current.frequency += Number(signal.frequency || 1);
      const seenAt = signal.timestamp || signal.lastSeenAt || signal.firstSeenAt;
      if (seenAt) {
        if (new Date(seenAt) < new Date(current.firstSeenAt)) current.firstSeenAt = new Date(seenAt).toISOString();
        if (new Date(seenAt) > new Date(current.lastSeenAt)) current.lastSeenAt = new Date(seenAt).toISOString();
      }
      buckets.set(key, current);
    }
  }

  const total = Array.from(buckets.values()).reduce((sum, signal) => sum + signal.frequency, 0);
  return Array.from(buckets.values())
    .map(signal => ({
      ...signal,
      confidence: confidenceFromFrequency(signal.frequency, total),
      label: TRUTH_LABELS.INFERRED,
      explanation: 'Software inference only. This pattern is based on repeated captured values, not supernatural certainty.',
    }))
    .sort((a, b) => b.confidence - a.confidence || b.frequency - a.frequency);
}

export function createTimelineBranch({ baseTimelineId, choice, currentState = {}, userId = 'local-user' }) {
  if (!choice || typeof choice !== 'object') {
    throw new Error('Timeline branch choice must be an object.');
  }

  const choiceText = String(choice.text || choice.label || '').trim();
  if (!choiceText) throw new Error('Timeline branch choice requires text or label.');

  const stableSeed = `${baseTimelineId || 'timeline'}:${choiceText}:${JSON.stringify(currentState)}`;
  let hash = 0;
  for (let index = 0; index < stableSeed.length; index += 1) {
    hash = ((hash << 5) - hash) + stableSeed.charCodeAt(index);
    hash |= 0;
  }

  const intensity = Math.abs(hash % 100) / 100;
  return {
    id: `branch_${Date.now()}_${Math.abs(hash).toString(36)}`,
    userId,
    baseTimelineId: baseTimelineId || null,
    choice: choiceText,
    simulatedOutcome: {
      emotionalTone: intensity > 0.66 ? 'volatile' : intensity > 0.33 ? 'charged' : 'stable',
      riskBand: intensity > 0.72 ? 'high' : intensity > 0.42 ? 'medium' : 'low',
      opportunityBand: intensity < 0.35 ? 'high' : intensity < 0.75 ? 'medium' : 'uncertain',
    },
    truth_label: TRUTH_LABELS.SIMULATED,
    createdAt: new Date().toISOString(),
  };
}
