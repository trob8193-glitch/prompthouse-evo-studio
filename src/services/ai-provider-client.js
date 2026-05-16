import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Returns unified AI provider status (OpenAI + Gemini)
 */
export async function getAiProviderStatus() {
  return await safeFetchBridge('/api/ai-providers/status');
}

/**
 * Returns OpenAI status.
 */
export async function getOpenAiStatus() {
  return await safeFetchBridge('/api/ai-providers/openai/status');
}

/**
 * Returns Gemini status.
 */
export async function getGeminiStatus() {
  return await safeFetchBridge('/api/ai-providers/gemini/status');
}

/**
 * Probes OpenAI if owner approval is provided.
 */
export async function runOpenAiProbe(ownerApproval) {
  if (!ownerApproval) {
    return { ok: false, error: 'Owner approval required to run OpenAI probe', truthState: 'NEEDS_OWNER_APPROVAL' };
  }
  
  return await safeFetchBridge('/api/ai-providers/openai/probe', {
    method: 'POST',
    body: JSON.stringify({ ownerApproval })
  });
}

/**
 * Probes Gemini if owner approval is provided.
 */
export async function runGeminiProbe(ownerApproval) {
  if (!ownerApproval) {
    return { ok: false, error: 'Owner approval required to run Gemini probe', truthState: 'NEEDS_OWNER_APPROVAL' };
  }
  
  return await safeFetchBridge('/api/ai-providers/gemini/probe', {
    method: 'POST',
    body: JSON.stringify({ ownerApproval })
  });
}
