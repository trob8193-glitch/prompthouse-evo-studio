import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

/**
 * PH EVO STUDIO — UNIVERSAL TRANSPORT (MULTI-MODEL)
 * ═══════════════════════════════════════════════════════════════
 * Switches between Gemini and OpenAI based on mission requirements.
 * Absolute Real-World Connectivity. No mocks.
 */

export const universalSend = async (messages, systemPrompt = '', options = {}) => {
  const provider = options.provider || 'gemini';
  const apiKey = options.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
  const baseUrl = options.baseUrl;
  
  if (provider === 'openai' || options.custom) {
    console.log(`📡 [Transport] Dispatching ${options.custom ? 'Custom' : 'OpenAI'} Request...`);
    const openai = new OpenAI({ 
      apiKey: apiKey,
      baseURL: baseUrl || undefined 
    });
    
    const response = await openai.chat.completions.create({
      model: options.model || "gpt-4o",
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });
    
    return response.choices[0].message.content;
  }

  if (provider === 'local') {
    console.log(`📡 [Transport] Dispatching Local-World (Ollama) Request...`);
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          model: options.model || "llama3",
          prompt: `${systemPrompt}\n\n${messages[messages.length - 1].content}`,
          stream: false
        })
      });
      const data = await response.json();
      return data.response;
    } catch (e) {
      console.error(`❌ [Transport] Local Inference Failure (Is Ollama running?): ${e.message}`);
      throw e;
    }
  }

  // DEFAULT: GEMINI
  console.log(`📡 [Transport] Dispatching Real-World Gemini Request...`);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: options.model || "gemini-1.5-pro",
    systemInstruction: systemPrompt
  });

  const prompt = messages[messages.length - 1].content;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
