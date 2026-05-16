/**
 * PromptHouse Evo Studio — Feedback Collection Engine
 * Logs every AI interaction with user rating. No fake data.
 * Powers: Pattern Analysis, Prompt Evolution, Fine-Tuning Pipeline.
 */

const BRIDGE = 'http://127.0.0.1:3001';

/**
 * Log an AI interaction for later analysis and rating.
 * Call this every time the studio generates an AI output.
 */
export async function logInteraction({ prompt, output, domain, stackVersion = 'v1', sixLayerStack = null }) {
  const interactionId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    const res = await fetch(`${BRIDGE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interactionId, prompt, output, domain, stackVersion, sixLayerStack, rating: 'unrated' }),
    });
    const data = await res.json();
    return data.record;
  } catch (e) {
    console.error('[Feedback] Failed to log interaction:', e.message);
    return { id: interactionId, prompt, output, domain, stackVersion, rating: 'unrated' };
  }
}

/**
 * Rate a previously logged interaction.
 * @param {string} interactionId
 * @param {'good'|'bad'|'neutral'} rating
 * @param {string} reason - optional user explanation
 */
export async function rateInteraction(interactionId, rating, reason = '') {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interactionId, rating, reason }),
    });
    return await res.json();
  } catch (e) {
    console.error('[Feedback] Failed to rate interaction:', e.message);
    return null;
  }
}

/**
 * Get all interactions filtered by rating.
 */
export async function getInteractionsByRating(rating, limit = 200) {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback?rating=${rating}&limit=${limit}`);
    return await res.json();
  } catch (e) {
    console.error('[Feedback] Failed to fetch interactions:', e.message);
    return [];
  }
}

/**
 * Get aggregate feedback statistics.
 */
export async function getFeedbackStats() {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback/stats`);
    return await res.json();
  } catch (e) {
    console.error('[Feedback] Failed to fetch stats:', e.message);
    return { total: 0, good: 0, bad: 0, neutral: 0, goodRate: 0, badRate: 0, worstDomain: null };
  }
}

/**
 * Get fine-tuning readiness status.
 */
export async function getFineTuningStatus() {
  try {
    const res = await fetch(`${BRIDGE}/api/finetune/status`);
    return await res.json();
  } catch (e) {
    return { ready: false, examples: 0, minimum: 100 };
  }
}

/**
 * Export fine-tuning dataset to disk.
 * Returns the file path and example count.
 */
export async function exportFineTuningData() {
  try {
    const res = await fetch(`${BRIDGE}/api/finetune/export`, { method: 'POST' });
    return await res.json();
  } catch (e) {
    console.error('[FineTune] Export failed:', e.message);
    return { success: false, error: e.message };
  }
}
