import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAiProviderStatus, classifyOpenAiKey, classifyGeminiKey } from '../server/services/ai-provider-status.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('AI Provider Status Service', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('missing OpenAI returns PROVIDER_GATED', () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const status = classifyOpenAiKey();
    expect(status.configured).toBe(false);
    expect(status.truthState).toBe(TRUTH_STATES.PROVIDER_GATED);
  });

  it('missing Gemini returns PROVIDER_GATED', () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const status = classifyGeminiKey();
    expect(status.configured).toBe(false);
    expect(status.truthState).toBe(TRUTH_STATES.PROVIDER_GATED);
  });

  it('configured OpenAI does not expose key', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-proj-some-long-secret-key-123456');
    const status = classifyOpenAiKey();
    expect(status.configured).toBe(true);
    expect(status.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(status.redactedKey).not.toContain('some-long-secret-key');
    expect(status.redactedKey).toMatch(/^sk-pro\.\.\.3456$/);
  });

  it('configured Gemini does not expose key', () => {
    vi.stubEnv('GEMINI_API_KEY', 'AIzaSySomeVeryLongGeminiKey9876');
    const status = classifyGeminiKey();
    expect(status.configured).toBe(true);
    expect(status.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(status.redactedKey).not.toContain('VeryLongGeminiKey');
  });
});
