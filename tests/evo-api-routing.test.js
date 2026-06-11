import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';

describe('UniversalAIAdaptor - Evo API Routing', () => {
  beforeEach(() => {
    vi.stubEnv('IS_BRIDGE_SERVER', 'true');
  });

  it('delegates to Gemini model when evo provider is requested and gemini key is active', async () => {
    const adaptor = new UniversalAIAdaptor({ gemini: 'test-gemini-key' });
    vi.spyOn(adaptor.cache, 'get').mockReturnValue(null);
    vi.spyOn(adaptor.cache, 'set').mockReturnValue(true);

    const callGeminiSpy = vi.spyOn(adaptor, 'callGemini').mockImplementation(async (messages, options) => {
      const systemMessage = messages.find(m => m.role === 'system');
      expect(systemMessage).toBeDefined();
      expect(systemMessage.content).toContain('EVO LLM SWARM ACTIVE');
      expect(options.model).toBe('gemini-2.5-pro-preview-05-06');
      return { success: true, content: 'Evo Swarm Response', provider: 'gemini' };
    });

    const result = await adaptor.chat([{ role: 'user', content: 'Hello Swarm' }], { provider: 'evo', model: 'evo-llm-swarm' });
    expect(result.success).toBe(true);
    expect(result.content).toBe('Evo Swarm Response');
    expect(result.provider).toBe('evo');
    expect(callGeminiSpy).toHaveBeenCalledOnce();
  });

  it('delegates to light models when evo-light-agent is selected', async () => {
    const adaptor = new UniversalAIAdaptor({ gemini: 'test-gemini-key' });
    vi.spyOn(adaptor.cache, 'get').mockReturnValue(null);
    vi.spyOn(adaptor.cache, 'set').mockReturnValue(true);

    const callGeminiSpy = vi.spyOn(adaptor, 'callGemini').mockImplementation(async (messages, options) => {
      const systemMessage = messages.find(m => m.role === 'system');
      expect(systemMessage).toBeDefined();
      expect(systemMessage.content).toContain('EVO LIGHT AGENT ACTIVE');
      expect(options.model).toBe('gemini-2.5-flash');
      return { success: true, content: 'Evo Light Response', provider: 'gemini' };
    });

    const result = await adaptor.chat([{ role: 'user', content: 'Hello Light' }], { provider: 'evo', model: 'evo-light-agent' });
    expect(result.success).toBe(true);
    expect(result.content).toBe('Evo Light Response');
    expect(result.provider).toBe('evo');
    expect(callGeminiSpy).toHaveBeenCalledOnce();
  });

  it('delegates requests to bridge proxy if not running on bridge server', async () => {
    vi.stubEnv('IS_BRIDGE_SERVER', 'false');
    const adaptor = new UniversalAIAdaptor({ gemini: 'test-gemini-key' });
    vi.spyOn(adaptor.cache, 'get').mockReturnValue(null);
    vi.spyOn(adaptor.cache, 'set').mockReturnValue(true);

    const callBridgeProxySpy = vi.spyOn(adaptor, 'callBridgeProxy').mockImplementation(async () => {
      return { success: true, content: 'Bridge Response', provider: 'bridge_proxy' };
    });

    const result = await adaptor.chat([{ role: 'user', content: 'Hello Proxy' }], { provider: 'evo', model: 'evo-llm-swarm' });
    expect(result.success).toBe(true);
    expect(result.content).toBe('Bridge Response');
    expect(callBridgeProxySpy).toHaveBeenCalledOnce();
  });
});
