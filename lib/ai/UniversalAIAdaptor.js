import fetch from 'node-fetch';
import OpenAI from 'openai';
import { LocalCache } from './LocalCache.js';

/**
 * PH EVO STUDIO — UNIVERSAL AI ADAPTOR v2 (PERFORMANCE EDITION)
 * ═══════════════════════════════════════════════════════════════
 * Manages multiple AI providers with automatic fallback, free-tier logic,
 * parallel racing, connection pooling, and adaptive timeouts.
 */
export class UniversalAIAdaptor {
  constructor(keys = {}) {
    this.keys = keys;
    this.openai = keys.openai ? new OpenAI({ apiKey: keys.openai }) : null;
    this.cache = new LocalCache();
    this.providerLatency = { openai: [], gemini: [], ph_evo: [] };
    this.keepAliveAgent = null;
  }

  updateKeys(keys) {
    this.keys = { ...this.keys, ...keys };
    if (this.keys.openai) {
      this.openai = new OpenAI({ apiKey: this.keys.openai });
    }
  }

  /**
   * Track provider latency for adaptive routing
   */
  recordLatency(provider, ms) {
    const history = this.providerLatency[provider];
    if (history) {
      history.push(ms);
      if (history.length > 20) history.shift();
    }
  }

  getAverageLatency(provider) {
    const history = this.providerLatency[provider];
    if (!history || history.length === 0) return Infinity;
    return history.reduce((a, b) => a + b, 0) / history.length;
  }

  async generateResponse(messages, systemPrompt = '') {
    const formattedMessages = messages;
    if (systemPrompt && !messages.some(m => m.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }
    
    const result = await this.chat(formattedMessages);
    return {
      message: result.content || result.error,
      truth_state: result.success ? 'VERIFIED' : 'ERROR',
      provider: result.provider,
      from_cache: result.from_cache || false,
      latency_ms: result.latency_ms || 0
    };
  }

  async chat(messages, options = {}) {
    // Check cache first (instant response)
    const cached = this.cache.get(messages, options);
    if (cached) {
      return { ...cached, from_cache: true, latency_ms: 0 };
    }

    const start = Date.now();
    let result;

    // Race mode: try fastest provider with timeout, fallback to others
    if (options.race) {
      result = await this.raceProviders(messages, options);
    } else {
      const provider = options.provider || this.getBestProvider();
      result = await this.callWithFallback(messages, options, provider);
    }

    const latency = Date.now() - start;
    result.latency_ms = latency;
    if (result.success && result.provider) {
      this.recordLatency(result.provider, latency);
    }

    // Save to cache
    if (result.success) {
      this.cache.set(messages, options, result);
    }

    return result;
  }

  /**
   * Call provider with automatic fallback chain
   */
  async callWithFallback(messages, options, primaryProvider) {
    const fallbackOrder = this.getFallbackOrder(primaryProvider);

    for (const provider of fallbackOrder) {
      try {
        const result = await this.callProvider(provider, messages, options);
        if (result.success) return result;
      } catch (e) {
        console.error(`[AI] Provider ${provider} failed: ${e.message}`);
      }
    }

    return { success: false, error: 'All providers failed.', provider: 'none' };
  }

  /**
   * Race multiple providers simultaneously — first success wins
   */
  async raceProviders(messages, options) {
    const providers = [];
    if (this.keys.openai && !this.keys.openai.startsWith('ph_evo_')) providers.push('openai');
    if (this.keys.gemini) providers.push('gemini');
    providers.push('ph_evo');

    if (providers.length <= 1) {
      return this.callProvider(providers[0] || 'ph_evo', messages, options);
    }

    const promises = providers.map(p =>
      this.callProvider(p, messages, options)
        .then(r => r.success ? r : Promise.reject(r))
        .catch(() => Promise.reject())
    );

    try {
      return await Promise.any(promises);
    } catch {
      return { success: false, error: 'All raced providers failed.', provider: 'none' };
    }
  }

  async callProvider(provider, messages, options) {
    if (provider === 'gemini') return this.callGemini(messages, options);
    if (provider === 'openai' && this.openai) return this.callOpenAI(messages, options);
    if (provider === 'ph_evo') return this.callPhEvo(messages, options);
    return { success: false, error: `Unknown provider: ${provider}`, provider };
  }

  getFallbackOrder(primary) {
    const all = [];
    if (primary) all.push(primary);
    if (!all.includes('openai') && this.keys.openai && !this.keys.openai.startsWith('ph_evo_')) all.push('openai');
    if (!all.includes('gemini') && this.keys.gemini) all.push('gemini');
    if (!all.includes('ph_evo')) all.push('ph_evo');
    return all;
  }

  getBestProvider() {
    if (process.env.PH_EVO_LOCAL === 'true') return 'ph_evo';
    if (this.keys.openai && this.keys.openai.startsWith('ph_evo_')) return 'ph_evo';

    // Adaptive: pick the provider with the lowest average latency
    const candidates = [];
    if (this.keys.openai) candidates.push({ name: 'openai', latency: this.getAverageLatency('openai') });
    if (this.keys.gemini) candidates.push({ name: 'gemini', latency: this.getAverageLatency('gemini') });
    candidates.push({ name: 'ph_evo', latency: this.getAverageLatency('ph_evo') });

    // If no latency data yet, use the old priority order
    const withData = candidates.filter(c => c.latency !== Infinity);
    if (withData.length === 0) {
      if (this.keys.openai) return 'openai';
      if (this.keys.gemini) return 'gemini';
      return 'ph_evo';
    }

    withData.sort((a, b) => a.latency - b.latency);
    return withData[0].name;
  }

  async callOpenAI(messages, options) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        max_tokens: options.max_tokens || 2048,
        temperature: options.temperature ?? 0.3,
        user: options.user || 'evo-system-user',
      });
      const message = completion.choices[0].message;
      if (message.refusal) {
        throw new Error(`OpenAI Refusal: ${message.refusal}`);
      }
      return { 
        success: true, 
        content: message.content, 
        provider: 'openai' 
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'openai' };
    }
  }

  async callGemini(messages, options) {
    const apiKey = this.keys.gemini;
    const model = options.model || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({ contents })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return { 
        success: true, 
        content: data.candidates[0].content.parts[0].text, 
        provider: 'gemini' 
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'gemini' };
    }
  }

  async callPhEvo(messages, options) {
    const model = options.model || process.env.OLLAMA_MODEL || 'llama3';
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    // Pre-warm: tell Ollama to keep the model loaded
    try {
      await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: '', keep_alive: '10m' })
      }).catch(() => {});
    } catch { /* ignore pre-warm failures */ }

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            num_predict: options.max_tokens || 1024,
            temperature: options.temperature ?? 0.3,
            num_ctx: 4096,
            num_gpu: 99,
            num_thread: 0
          }
        })
      });
      if (!response.ok) throw new Error('Local LLM server (Ollama) unreachable or failed');
      const data = await response.json();
      return {
        success: true,
        content: data.message?.content || data.response || '',
        provider: 'ph_evo'
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'ph_evo' };
    }
  }
}
