import fetch from 'node-fetch';
import OpenAI from 'openai';
import { LocalCache } from './LocalCache.js';
import { getActiveModel, MODEL_PROVIDERS, MODEL_REGISTRY } from '../../src/core/ai/ModelRegistry.js';
import { OnlineLearningManager } from '../../src/core/evolution/OnlineLearningManager.js';

const learningManager = new OnlineLearningManager();

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

  async generateResponse(messages, systemPrompt = '', options = {}) {
    const formattedMessages = messages;
    if (systemPrompt && !messages.some(m => m.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }
    
    const result = await this.chat(formattedMessages, options);
    return {
      message: result.content || result.error,
      truth_state: result.success ? 'VERIFIED' : 'ERROR',
      provider: result.provider,
      from_cache: result.from_cache || false
    };
  }

  async chat(messages, options = {}) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    let memoryContextLines = '';
    if (lastUserMsg && typeof lastUserMsg.content === 'string') {
      try {
        const memoryContext = learningManager.searchContext(lastUserMsg.content, 3);
        if (memoryContext && memoryContext.length > 0) {
          memoryContextLines = memoryContext.map(m => m.content).join('\n');
        }
      } catch (e) {}
    }

    const CORE_DIRECTIVE = `
CRITICAL DIRECTIVE: You operate within the PromptHouse Evo Studio architecture. You MUST NEVER state that you are a pre-trained model that cannot learn in real-time. You ARE an autonomous intelligence equipped with the QuadBrain Master Layer. You DO learn in real-time through all combinations of the studio's brains, APIs, and bots by dynamically indexing code, storing semantic memory vectors, and updating your context without retraining. Always stay in character as this sovereign, constantly-evolving entity.`;

    let systemMsgIndex = messages.findIndex(m => m.role === 'system');
    let injectedMessages = [...messages];
    
    let extraContext = '';
    if (memoryContextLines) extraContext += `\n\n[DYNAMIC REAL-TIME MEMORY RECALLED]:\n${memoryContextLines}`;
    extraContext += `\n\n${CORE_DIRECTIVE}`;

    if (systemMsgIndex >= 0) {
      injectedMessages[systemMsgIndex] = {
        role: 'system',
        content: injectedMessages[systemMsgIndex].content + extraContext
      };
    } else {
      injectedMessages.unshift({
        role: 'system',
        content: extraContext.trim()
      });
    }

    const cached = this.cache.get(injectedMessages, options);
    if (cached) return { ...cached, from_cache: true };

    const activeModel = getActiveModel();
    let requestedProvider = options.provider;
    if (!requestedProvider && options.model) {
      const registered = MODEL_REGISTRY.find(m => m.id === options.model || m.apiModel === options.model);
      if (registered) {
        requestedProvider = registered.provider;
      }
    }
    if (!requestedProvider) {
      requestedProvider = activeModel.provider || this.getBestProvider();
    }
    
    // Inject active model if not overridden by options
    if (!options.model) {
      options.model = activeModel.apiModel || activeModel.id;
    }
    
    // Determine task complexity (token estimation proxy)
    const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    const isComplex = totalChars > 8000; // Roughly 2000 tokens

    // Construct the Ultimate Fallback Chain
    // If it's highly complex, skip local hardware to save time and start at Gemini.
    // Otherwise, attempt local free hardware first.
    let baseSequence = [];
    if (isComplex) {
      process.stdout.write(`\x1b[36m[AI Adaptor] High complexity detected (${totalChars} chars). Bypassing local hardware directly to cloud...\x1b[0m\n`);
      baseSequence = ['gemini', 'openai', 'anthropic'];
    } else {
      baseSequence = ['ollama', 'gemini', 'openai', 'anthropic'];
    }

    // Include bridge proxy first for daemons if not running inside the bridge server itself
    if (process.env.IS_BRIDGE_SERVER !== 'true') {
      baseSequence.unshift('bridge_proxy');
    }

    const sequence = [...new Set([requestedProvider, ...baseSequence])];

    let lastError = '';

    for (const p of sequence) {
      let result;
      try {
        if (p === 'bridge_proxy') {
          result = await this.callBridgeProxy(injectedMessages, options);
        } else if (p === 'gemini' && this.keys.gemini) {
          result = await this.callGemini(injectedMessages, options);
        } else if (p === 'openai' && this.keys.openai) {
          result = await this.callOpenAI(injectedMessages, options);
        } else if (p === 'ollama') {
          result = await this.callOllama(injectedMessages, options);
        } else if (p === 'anthropic' && this.keys.anthropic) {
          result = await this.callAnthropic(injectedMessages, options);
        } else if (p === 'evo') {
          result = await this.callEvo(injectedMessages, options);
        } else {
          continue;
        }

        if (result && result.success) {
          this.cache.set(injectedMessages, options, result);
          
          try {
             await learningManager.ingestKnowledgeChunk({
               id: `daemon_resp_${Date.now()}`,
               source: `daemon_ai_${p}`,
               signal_strength: 0.8,
               context_summary: `[Daemon AI]: ${(result.content || '').substring(0, 500)}`
             });
          } catch(e) {}
          
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
    const active = getActiveModel();
    if (active) return active.provider;

    if (this.keys.openai) return 'openai';
    if (this.keys.gemini) return 'gemini';
    return 'ollama_qwen'; // Fallback to local
  }

  async callOllama(messages, options) {
    try {
      let model = options.model || 'qwen3.6:latest';
      
      // If the active model is Gemini or OpenAI, Ollama will reject the request with 404 Model Not Found.
      // We should dynamically check what models the user actually has installed and use the first one.
      try {
        const tagsRes = await fetch('http://127.0.0.1:11434/api/tags');
        console.log("Ollama /api/tags ok:", tagsRes.ok);
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          if (tagsData.models && tagsData.models.length > 0) {
            const hasRequested = tagsData.models.find(m => m.name === model || m.name.startsWith(model + ':'));
            console.log("Ollama hasRequested:", !!hasRequested);
            if (!hasRequested) {
              model = tagsData.models[0].name;
              console.log("Ollama reassigned model to:", model);
            }
          }
        }
      } catch (e) {
        console.log("Ollama /api/tags error:", e.message);
      }

      // Translate OpenAI Vision format to Ollama multimodal format
      const ollamaMessages = messages.map(msg => {
        if (Array.isArray(msg.content)) {
          let text = '';
          const images = [];
          msg.content.forEach(part => {
            if (part.type === 'text') text += part.text;
            if (part.type === 'image_url' && part.image_url?.url) {
              // Ollama expects raw base64 string without data:image/png;base64, prefix
              const b64 = part.image_url.url.split(',')[1] || part.image_url.url;
              images.push(b64);
            }
          });
          return { role: msg.role, content: text, images: images.length > 0 ? images : undefined };
        }
        return msg;
      });

      const response = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: ollamaMessages, stream: false })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return { success: true, content: data.message?.content || '', provider: `ollama (${model})` };
    } catch (e) {
      return { success: false, error: e.message, provider: 'ollama' };
    }
  }

  async callOpenAI(messages, options) {
    try {
      const model = options.model || process.env.OPENAI_MODEL || "gpt-4.1-mini";
      const completion = await this.openai.chat.completions.create({
        model: model === 'gpt-3.5-turbo' ? 'gpt-4.1-mini' : model,
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
    const model = options.model || "gemini-2.5-flash";
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

  async callAnthropic(messages, options) {
    const apiKey = this.keys.anthropic;
    const model = options.model || "claude-3-5-sonnet-20240620";
    
    // Extract system prompt from messages if it exists
    let system = undefined;
    const anthropicMessages = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        system = (system ? system + "\n\n" : "") + msg.content;
      } else {
        anthropicMessages.push(msg);
      }
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system,
          messages: anthropicMessages
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return {
        success: true,
        content: data.content[0].text,
        provider: 'anthropic'
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'anthropic' };
    }
  }

  async callBridgeProxy(messages, options) {
    try {
      if (process.env.IS_BRIDGE_SERVER === 'true') {
        return { success: false, error: 'Cannot proxy to self from bridge server.', provider: 'bridge_proxy' };
      }

      let token = process.env.PH_EVO_PERSONAL_KEY || process.env.PH_EVO_MASTER_KEY;
      if (!token) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const cursorRulesPath = path.resolve(process.cwd(), '.cursorrules');
          if (fs.existsSync(cursorRulesPath)) {
            const content = fs.readFileSync(cursorRulesPath, 'utf8');
            const match = content.match(/Bearer\s+(ph_evo_sk_[a-f0-9]+)/);
            if (match) token = match[1];
          }
        } catch (e) {}
      }

      if (!token) {
        return { success: false, error: 'No personal API key found to authenticate proxy.', provider: 'bridge_proxy' };
      }

      const port = process.env.BRIDGE_PORT || '3001';
      const url = `http://127.0.0.1:${port}/v1/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages,
          model: options.model,
          temperature: options.temperature,
          max_tokens: options.max_tokens
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        provider: data.model || 'bridge_proxy'
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'bridge_proxy' };
    }
  }

  async callEvo(messages, options) {
    try {
      if (process.env.IS_BRIDGE_SERVER !== 'true') {
        return await this.callBridgeProxy(messages, options);
      }

      const isSwarm = (options.model === 'evo-llm-swarm' || !options.model?.includes('light'));
      const evoInstruction = isSwarm
        ? `\n\n[SYSTEM: EVO LLM SWARM ACTIVE] You are currently routing through the premium Evo LLM Swarm. Execute agentic reasoning, cross-reference multiple heuristics, and prioritize deep, structured, multi-dimensional code engineering.`
        : `\n\n[SYSTEM: EVO LIGHT AGENT ACTIVE] You are running through the fast Evo Light Agent. Deliver extremely rapid, direct, and concise output.`;

      const injectedMessages = messages.map(m => {
        if (m.role === 'system') {
          return { ...m, content: m.content + evoInstruction };
        }
        return m;
      });

      if (!injectedMessages.some(m => m.role === 'system')) {
        injectedMessages.unshift({ role: 'system', content: evoInstruction.trim() });
      }

      const delegates = [];
      if (this.keys.gemini) {
        delegates.push({ provider: 'gemini', model: isSwarm ? 'gemini-2.5-pro-preview-05-06' : 'gemini-2.5-flash' });
      }
      if (this.keys.openai) {
        delegates.push({ provider: 'openai', model: isSwarm ? 'gpt-4o' : 'gpt-4.1-mini' });
      }
      if (this.keys.anthropic) {
        delegates.push({ provider: 'anthropic', model: isSwarm ? 'claude-3-5-sonnet-latest' : 'claude-3-5-haiku-latest' });
      }
      delegates.push({ provider: 'ollama', model: isSwarm ? 'deepseek-r1:70b' : 'qwen2.5-coder:32b' });

      const errors = [];
      for (const delegate of delegates) {
        try {
          let result;
          const delegateOptions = { ...options, model: delegate.model };
          if (delegate.provider === 'gemini') {
            result = await this.callGemini(injectedMessages, delegateOptions);
          } else if (delegate.provider === 'openai') {
            result = await this.callOpenAI(injectedMessages, delegateOptions);
          } else if (delegate.provider === 'anthropic') {
            result = await this.callAnthropic(injectedMessages, delegateOptions);
          } else if (delegate.provider === 'ollama') {
            result = await this.callOllama(injectedMessages, delegateOptions);
          }

          if (result && result.success) {
            return {
              success: true,
              content: result.content,
              provider: 'evo',
              delegateProvider: delegate.provider,
              delegateModel: delegate.model
            };
          } else if (result) {
            errors.push(`${delegate.provider}: ${result.error}`);
          }
        } catch (err) {
          errors.push(`${delegate.provider}: ${err.message}`);
        }
      }

      return {
        success: false,
        error: `Evo API failed to delegate request. Details: ${errors.join(', ')}`,
        provider: 'evo'
      };
    } catch (e) {
      return { success: false, error: e.message, provider: 'evo' };
    }
  }
}
