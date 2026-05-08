import fetch from 'node-fetch';
import OpenAI from 'openai';

/**
 * PH EVO STUDIO — UNIVERSAL AI ADAPTOR
 * ═══════════════════════════════════════════════════════════════
 * Manages multiple AI providers with automatic fallback and free-tier logic.
 */
export class UniversalAIAdaptor {
  constructor(keys = {}) {
    this.keys = keys;
    this.openai = keys.openai ? new OpenAI({ apiKey: keys.openai }) : null;
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
      provider: result.provider
    };
  }

  async chat(messages, options = {}) {
    const provider = options.provider || this.getBestProvider();
    
    if (provider === 'gemini') {
      return await this.callGemini(messages, options);
    }
    
    if (provider === 'openai' && this.openai) {
      return await this.callOpenAI(messages, options);
    }

    return { error: 'No valid AI provider or keys found.', provider };
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
    const model = options.model || "gemini-pro";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
