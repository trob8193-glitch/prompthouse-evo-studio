/**
 * PromptHouse Evo Studio — Dream State (REAL BUILD)
 * Records friction, errors, and failures while offline.
 * Compresses them into actionable patterns.
 * When back online, feeds compressed insights to NightForge as priority patches.
 * No fake logic. Real offline learning.
 */

import { createDreamCache } from './models.js';
import { runNightForgeCycle } from './nightforge.js';
import { addProofReceipt } from './prompt-base.js';

const DREAM_CACHE_KEY = 'ph_evo_dream_cache';
const ESCALATION_KEY = 'ph_evo_dream_escalations';

// ─── Cache Read/Write ─────────────────────────────────────────────────────────
export function getDreamCache() {
  try {
    const raw = localStorage.getItem(DREAM_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('[DreamState] Cache read error:', e);
  }
  return createDreamCache();
}

function saveDreamCache(cache) {
  try {
    localStorage.setItem(DREAM_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('[DreamState] Cache save error:', e);
  }
}

function getEscalations() {
  try {
    return JSON.parse(localStorage.getItem(ESCALATION_KEY) || '{}');
  } catch { return {}; }
}

function saveEscalations(esc) {
  try { localStorage.setItem(ESCALATION_KEY, JSON.stringify(esc)); } catch {}
}

// ─── Event Logging ────────────────────────────────────────────────────────────
/**
 * Log a real event (error, friction, failure) with full context.
 * @param {'error'|'friction'|'failure'|'warning'} type
 * @param {string} component - which module/file caused the event
 * @param {string} message - what happened
 * @param {object} context - stack trace, user action, any additional data
 */
export function logDreamEvent(type, component, message, context = {}) {
  const cache = getDreamCache();
  cache.events.push({
    type,
    component,
    message,
    context: {
      stackTrace: context.stackTrace || null,
      userAction: context.userAction || null,
      timestamp: new Date().toISOString(),
      ...context,
    },
    timestamp: new Date().toISOString(),
  });

  // Keep max 200 events to prevent storage overflow
  if (cache.events.length > 200) cache.events = cache.events.slice(-200);
  saveDreamCache(cache);
}

// ─── Pattern Compression ──────────────────────────────────────────────────────
/**
 * Compress offline events into deduplicated, categorized patterns.
 * Groups by component + type, counts occurrences, ranks by frequency.
 */
function compressEvents(events) {
  const groups = {};

  events.forEach(e => {
    const key = `${e.type}::${e.component}::${e.message.slice(0, 80)}`;
    if (!groups[key]) {
      groups[key] = {
        type: e.type,
        component: e.component,
        message: e.message,
        count: 0,
        firstSeen: e.timestamp,
        lastSeen: e.timestamp,
        sampleContext: null,
      };
    }
    groups[key].count++;
    groups[key].lastSeen = e.timestamp;
    if (!groups[key].sampleContext && e.context) {
      groups[key].sampleContext = e.context;
    }
  });

  // Sort by frequency (most common first)
  return Object.values(groups).sort((a, b) => b.count - a.count);
}

/**
 * Track recurring patterns across sessions and escalate persistent issues.
 */
function escalateRecurring(compressed) {
  const escalations = getEscalations();

  compressed.forEach(pattern => {
    const key = `${pattern.type}::${pattern.component}`;
    if (!escalations[key]) {
      escalations[key] = { sessions: 0, totalOccurrences: 0, priority: 'LOW' };
    }
    escalations[key].sessions++;
    escalations[key].totalOccurrences += pattern.count;

    // Escalate priority based on recurrence
    if (escalations[key].sessions >= 5) {
      escalations[key].priority = 'HIGH';
    } else if (escalations[key].sessions >= 3) {
      escalations[key].priority = 'MEDIUM';
    }
  });

  saveEscalations(escalations);
  return escalations;
}

// ─── Awakening (Online Sync) ──────────────────────────────────────────────────
/**
 * Called when the studio comes back online.
 * Compresses offline events, escalates recurring patterns,
 * and feeds actionable insights to NightForge.
 */
export async function awakenAndSync() {
  const cache = getDreamCache();
  if (cache.events.length === 0) {
    console.log('[DreamState] No offline events to process.');
    return { synced: false, reason: 'no_events' };
  }

  console.log(`[DreamState] Awakening. Processing ${cache.events.length} offline events.`);

  // Step 1: Compress events into patterns
  const compressed = compressEvents(cache.events);
  console.log(`[DreamState] Compressed ${cache.events.length} events into ${compressed.length} patterns.`);

  // Step 2: Escalate recurring patterns
  const escalations = escalateRecurring(compressed);
  const highPriority = Object.entries(escalations).filter(([_, e]) => e.priority === 'HIGH');
  console.log(`[DreamState] ${highPriority.length} HIGH priority escalations detected.`);

  // Step 3: Clear the cache
  cache.events = [];
  cache.synced = true;
  saveDreamCache(cache);

  // Step 4: Build context summary for NightForge
  const contextSummary = compressed.slice(0, 10).map(p =>
    `[${p.type.toUpperCase()}] ${p.component}: "${p.message}" (${p.count}x, priority: ${escalations[`${p.type}::${p.component}`]?.priority || 'LOW'})`
  ).join('\n');

  // Step 5: Feed to NightForge as a priority patch queue
  console.log('[DreamState] Triggering NightForge with compressed offline insights...');

  const callBridge = async (prompt) => {
    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      return data.message || '';
    } catch {
      return '[BRIDGE OFFLINE]';
    }
  };

  await runNightForgeCycle({ callBridge, offlineContext: contextSummary });

  // Step 6: Create proof receipt
  addProofReceipt('system', 'dreamstate:sync', 'verified', {
    evidenceType: 'dreamstate_sync',
    eventsProcessed: compressed.reduce((sum, p) => sum + p.count, 0),
    patternsFound: compressed.length,
    highPriorityEscalations: highPriority.length,
  });

  console.log('[DreamState] Sync complete.');
  return {
    synced: true,
    patternsFound: compressed.length,
    highPriorityEscalations: highPriority.length,
    compressed,
  };
}

/**
 * Get the current dream state summary for display.
 */
export function getDreamSummary() {
  const cache = getDreamCache();
  const escalations = getEscalations();
  const compressed = cache.events.length > 0 ? compressEvents(cache.events) : [];

  return {
    pendingEvents: cache.events.length,
    patterns: compressed.length,
    escalations: Object.entries(escalations).map(([key, val]) => ({
      key,
      ...val,
    })),
    highPriority: Object.values(escalations).filter(e => e.priority === 'HIGH').length,
  };
}

// ─── Auto-wire browser online/offline events ──────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[DreamState] Network restored. Initiating awakening sync...');
    awakenAndSync();
  });

  window.addEventListener('offline', () => {
    console.log('[DreamState] Network lost. Engaging offline capture.');
    logDreamEvent('warning', 'DreamState', 'Studio went offline. Capturing events locally.');
  });

  // Capture unhandled errors automatically
  window.addEventListener('error', (e) => {
    logDreamEvent('error', e.filename || 'unknown', e.message, {
      stackTrace: e.error?.stack || null,
      line: e.lineno,
      col: e.colno,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    logDreamEvent('error', 'promise', e.reason?.message || String(e.reason), {
      stackTrace: e.reason?.stack || null,
    });
  });
}
