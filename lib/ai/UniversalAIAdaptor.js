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
    this.last_packet = null;
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
    
    // CAPTURE PACKET FOR WITNESSING
    this.last_packet = {
      id: `packet_${Date.now()}`,
      timestamp: Date.now(),
      payload: JSON.stringify(formattedMessages, null, 2),
      response: result.content || result.error,
      provider: result.provider,
      success: result.success
    };

    return {
      message: result.content || result.error,
      truth_state: result.success ? 'VERIFIED' : 'ERROR',
      provider: result.provider,
      from_cache: result.from_cache || false
    };
  }

  getLastPacket() {
    return this.last_packet;
  }

  async chat(messages, options = {}) {
    const provider = options.provider || this.getBestProvider();
    
    // Check cache
    const cached = this.cache.get(messages, options);
    if (cached) {
      return { ...cached, from_cache: true };
    }
    
    // HYBRID REASONING: Speculative Drafting
    if (options.hybrid && provider !== 'none') {
      return await this.speculativeDraft(messages, options);
    }

    let result;
    if (provider === 'gemini') {
      result = await this.callGemini(messages, options);
    } else if (provider === 'openai' && this.openai) {
      result = await this.callOpenAI(messages, options);
    } else {
      result = { error: 'No valid AI provider or keys found.', provider };
    }

    // Save to cache
    if (result.success) {
      this.cache.set(messages, options, result);
    }

    return result;
  }

  async speculativeDraft(messages, options) {
    
    
    // 1. LOCAL DRAFT (Free via Ollama)
    const draftResult = await this.callLocalEvo(messages);
    if (!draftResult.success) return await this.chat(messages, { ...options, hybrid: false });

    // 2. API AUDIT (Cheap via verification-only tokens)
    const auditMessages = [
      { role: 'system', content: 'You are a Sovereign Truth Auditor. Review the following DRAFT code. Verify logic integrity, fix any placeholders, and ensure it meets production standards. Output ONLY the finalized, production-grade code.' },
      { role: 'user', content: `DRAFT CODE:\n${draftResult.content}\n\nORIGINAL OBJECTIVE:\n${messages[messages.length-1].content}` }
    ];

    
    const finalResult = await this.chat(auditMessages, { ...options, hybrid: false });
    
    return {
      ...finalResult,
      hybrid: true,
      draft_provider: 'local-evo'
    };
  }

  async callLocalEvo(messages) {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages,
          stream: false
        })
      });
      const data = await response.json();
      return { success: true, content: data.message.content, provider: 'local-evo' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getBestProvider() {
    if (this.keys.openai) return 'openai';
    if (this.keys.gemini) return 'gemini';
    return 'none';
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
