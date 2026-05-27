import fetch from 'node-fetch';
import OpenAI from 'openai';
import { LocalCache } from './LocalCache.js';

/**
 * PH EVO STUDIO — UNIVERSAL AI ADAPTOR
 * ═══════════════════════════════════════════════════════════════
 * Manages multiple AI providers with automatic fallback and free-tier logic.
 */
export class UniversalAIAdaptor {
  constructor(keys = {}) {
    this.keys = keys;
    this.openai = keys.openai ? new OpenAI({ apiKey: keys.openai }) : null;
    this.cache = new LocalCache();
  }

  updateKeys(keys) {
    this.keys = { ...this.keys, ...keys };
    if (this.keys.openai) {
      this.openai = new OpenAI({ apiKey: this.keys.openai });
    }
  }

  /**
   * Simple convenience wrapper: send a text prompt, get back { success, content, provider }.
   */
  async routeRequest(prompt, options = {}) {
    const messages = [{ role: 'user', content: prompt }];
    return await this.chat(messages, options);
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
      from_cache: result.from_cache || false
    };
  }

  async chat(messages, options = {}) {
    const cached = this.cache.get(messages, options);
    if (cached) return { ...cached, from_cache: true };

    const requestedProvider = options.provider || this.getBestProvider();
    
    // Construct fallback chain ensuring requested provider is first, followed by local fallbacks
    const baseSequence = ['gemini', 'openai', 'ollama_evo', 'ollama_llama3'];
    const sequence = [...new Set([requestedProvider, ...baseSequence])];

    let lastError = '';

    for (const p of sequence) {
      let result;
      try {
        if (p === 'gemini' && this.keys.gemini) {
          result = await this.callGemini(messages, options);
        } else if (p === 'openai' && this.keys.openai) {
          result = await this.callOpenAI(messages, options);
        } else if (p === 'ollama' || p === 'ollama_evo') {
          result = await this.callOllama(messages, { ...options, model: 'evo-lm' });
        } else if (p === 'ollama_llama3') {
          result = await this.callOllama(messages, { ...options, model: 'llama3' });
        } else {
          continue;
        }

        if (result && result.success) {
          this.cache.set(messages, options, result);
          return result;
        } else if (result) {
          lastError += `[${p}: ${result.error}] `;
          process.stdout.write(`\\x1b[33m[AI Adaptor] ${p} failed: ${result.error}. Cascading to next fallback...\\x1b[0m\\n`);
        }
      } catch (e) {
        lastError += `[${p}: ${e.message}] `;
        process.stdout.write(`\\x1b[33m[AI Adaptor] ${p} error: ${e.message}. Cascading to next fallback...\\x1b[0m\\n`);
      }
    }

    return { success: false, error: `All AI providers failed. Details: ${lastError}`, provider: 'none' };
  }

  getBestProvider() {
    if (this.keys.openai) return 'openai';
    if (this.keys.gemini) return 'gemini';
    return 'ollama_evo'; // Fallback to local
  }

  async callOllama(messages, options) {
    try {
      const model = options.model || 'evo-lm';
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return { success: true, content: data.message?.content || '', provider: 'ollama' };
    } catch (e) {
      return { success: false, error: e.message, provider: 'ollama' };
    }
  }

  async callOpenAI(messages, options) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages,
      });
      return { 
        success: true, 
        content: completion.choices[0].message.content, 
        provider: 'openai' 
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'openai' };
    }
  }

  async callGemini(messages, options) {
    const apiKey = this.keys.gemini;
    const model = options.model || "gemini-1.5-pro";
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
}
