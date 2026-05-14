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
    
    // [WIRING] Audit against Rift Grid Boundaries (Port 3002)
    let truthState = result.success ? 'VERIFIED' : 'ERROR';
    try {
      const boundaryRes = await fetch('http://127.0.0.1:3002/status', { signal: AbortSignal.timeout(1000) });
      const boundary = await boundaryRes.json();
      if (boundary.probes?.some(p => p.type === 'BOUNDARY_VIOLATION' && p.severity === 'CRITICAL')) {
        truthState = 'SIMULATED_TIMELINE';
      }
    } catch {
      // Default to VERIFIED if bridge is silent
    }

    // CAPTURE PACKET FOR WITNESSING
    this.last_packet = {
      id: `packet_${Date.now()}`,
      timestamp: Date.now(),
      payload: JSON.stringify(formattedMessages, null, 2),
      response: result.content || result.error,
      provider: result.provider,
      success: result.success,
      truth_state: truthState
    };

    return {
      message: result.content || result.error,
      truth_state: truthState,
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
    // Prefer Gemini first — more reliable for cost-aware routing
    if (this.keys.gemini) return 'gemini';
    if (this.keys.openai) return 'openai';
    return 'none';
  }

  async callOpenAI(messages, options) {
    console.log(`🤖 [OpenAI] Attempting chat with model: ${options.model || 'default'}`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
      });
      return { 
        success: true, 
        content: completion.choices[0].message.content, 
        provider: 'openai' 
      };
    } catch (e) {
      console.error(`❌ [OpenAI] chat failed: ${e.message}`);
      return { success: false, error: e.message, provider: 'openai' };
    }
  }

  async callGemini(messages, options) {
    const apiKey = this.keys.gemini;
    const model = options.model || process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
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
      console.error(`❌ [Gemini] chat failed: ${e.message}`);
      return { success: false, error: e.message, provider: 'gemini' };
    }
  }

  /**
   * Generate vector embeddings using Google's text-embedding-004 model.
   * @param {string} text 
   * @returns {Promise<number[]>}
   */
  async generateEmbedding(text) {
    const apiKey = this.keys.gemini;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Cannot generate embeddings.");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] }
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      return data.embedding.values;
    } catch (e) {
      console.error(`❌ [Gemini] Embedding failed: ${e.message}`);
      throw e;
    }
  }
}
