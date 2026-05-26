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
    const provider = options.provider || this.getBestProvider();
    
    // Check cache
    const cached = this.cache.get(messages, options);
    if (cached) {
      return { ...cached, from_cache: true };
    }
    
    let result;
    if (provider === 'gemini') {
      result = await this.callGemini(messages, options);
    } else if (provider === 'openai' && this.openai) {
      result = await this.callOpenAI(messages, options);
    } else if (provider === 'ph_evo') {
      result = await this.callPhEvo(messages, options);
    } else {
      result = { error: 'No valid AI provider or keys found.', provider };
    }

    // Save to cache
    if (result.success) {
      this.cache.set(messages, options, result);
    }

    return result;
  }

  getBestProvider() {
    if (process.env.PH_EVO_LOCAL === 'true') return 'ph_evo';
    if (this.keys.openai && this.keys.openai.startsWith('ph_evo_')) return 'ph_evo';
    if (this.keys.openai) return 'openai';
    if (this.keys.gemini) return 'gemini';
    return 'ph_evo';
  }

  async callOpenAI(messages, options) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages,
        max_tokens: options.max_tokens || 4096,
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

  async callPhEvo(messages, options) {
    const model = options.model || 'llama3';
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false })
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
