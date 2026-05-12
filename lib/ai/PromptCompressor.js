import fetch from 'node-fetch';

/**
 * Prompt Compressor
 * Uses the local Evo LLM (Ollama) to compress prompt context.
 * Saves API costs by reducing token count.
 */
export class PromptCompressor {
  constructor(ollamaUrl = 'http://localhost:11434') {
    this.ollamaUrl = ollamaUrl;
    this.model = 'llama3'; // Fallback to standard model if 'evo-lm' is not found
  }

  async compress(text) {
    
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { 
              role: 'system', 
              content: 'You are a prompt compression engine. Summarize the following technical context into a dense, high-density summary. Keep all file paths, function names, and critical logic. Remove all fluff, explanations, and filler words. Output ONLY the compressed context.' 
            },
            { role: 'user', content: text }
          ],
          stream: false
        }),
        signal: AbortSignal.timeout(30000) // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      const compressed = data.message?.content || data.response || '';
      
      
      return compressed;
    } catch (e) {
      console.error(`[COMPRESSOR] Failed to compress:`, e.message);
      // Fallback: Return original text if compression fails
      return text;
    }
  }
}
