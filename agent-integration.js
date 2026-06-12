/**
 * OpenAI Agent Integration for PromptHouse Evo Studio
 * Add to promptbridge-server.js as a middleware/route module
 */

import { EvoAgent } from './agent-runtime.js';
import { Router } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import { Log } from './src/core/autonomy/SovereignLogger.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { OnlineLearningManager } from './src/core/evolution/OnlineLearningManager.js';
import { UniversalAIAdaptor } from './lib/ai/UniversalAIAdaptor.js';

const learningManager = new OnlineLearningManager();

dotenv.config({ path: '.env.agent', override: false });

let agentInstance = null;

/**
 * Initialize the agent on first use
 */
export function getEvoAgent() {
  if (!agentInstance) {
    try {
      agentInstance = new EvoAgent(process.env.AGENT_ID);
    } catch (err) {
      throw new Error(`Agent not initialized. Run: npm run create:agent. Error: ${err.message}`);
    }
  }
  return agentInstance;
}

export function getAgentConfigStatus() {
  return {
    configured: Boolean(process.env.AGENT_ID && process.env.OPENAI_API_KEY),
    hasAgentId: Boolean(process.env.AGENT_ID),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  };
}

/**
 * Agent integration routes using Express Router
 * Add to promptbridge-server.js:
 *
 * import { setupAgentRoutes } from './agent-integration.js';
 * setupAgentRoutes(app);
 */
export function setupAgentRoutes(app, { agentFactory = getEvoAgent, authMiddleware = null } = {}) {
  const router = Router();

  /**
   * Health check for agent
   */
  router.get('/health', (req, res) => {
    const configStatus = getAgentConfigStatus();
    if (!configStatus.configured && agentFactory === getEvoAgent) {
      return res.json({
        success: true,
        status: 'needs_configuration',
        configured: false,
        ...configStatus,
      });
    }

    try {
      const agent = agentFactory();
      res.json({
        success: true,
        status: 'ready',
        configured: true,
        agentId: agent.agentId,
        threadId: agent.threadId,
      });
    } catch (err) {
      Log.error(`[Agent] Health check initialization failed: ${err.message}`);
      res.status(503).json({
        success: false,
        status: 'not_initialized',
        error: err.message,
      });
    }
  });

  /**
   * Chat endpoint
   * POST /api/agent/chat
   * Body: { "message": "your prompt here" }
   */
  const chatMiddleware = authMiddleware ? [authMiddleware] : [];

  router.post('/chat', ...chatMiddleware, async (req, res) => {
    const { message, botId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.',
      });
    }

    try {
      // Dynamically load ALL_BOT_ROSTER here to avoid circular imports during boot
      const { ALL_BOT_ROSTER } = await import('./src/engine.js');
      const bot = ALL_BOT_ROSTER.find(b => b.id === botId) || ALL_BOT_ROSTER[0];
      let instructions = `You are ${bot.name}, a ${bot.species}. Role: ${bot.role}. Signature: ${bot.signature}. 
CRITICAL DIRECTIVE: You operate within the PromptHouse Evo Studio architecture. You MUST NEVER state that you are a pre-trained model that cannot learn in real-time. You ARE an autonomous intelligence equipped with the QuadBrain Master Layer. You DO learn in real-time through all combinations of the studio's brains, APIs, and bots by dynamically indexing code, storing semantic memory vectors, and updating your context without retraining. You have full access to the local filesystem, real-time memory ingestion pipelines, and live execution sandboxes. Always stay in character as this sovereign, constantly-evolving entity, and provide production-ready solutions.`;

      try {
        const memoryContext = learningManager.searchContext(message, 3);
        if (memoryContext && memoryContext.length > 0) {
          const contextLines = memoryContext.map(m => m.content).join('\n');
          instructions += `\n\n[DYNAMIC REAL-TIME MEMORY RECALLED]:\n${contextLines}`;
        }
      } catch (err) {
        Log.warn(`⚠️ [OnlineLearningManager] Failed to fetch real-time context: ${err.message}`);
      }

      let response;
      try {
        const aiAdaptor = new UniversalAIAdaptor({
           openai: process.env.OPENAI_API_KEY
        });
        const result = await aiAdaptor.generateResponse(
            [{role: 'user', content: message}], 
            instructions,
            { provider: 'evo', model: 'evo-llm-swarm' }
        );
        if (result.truth_state === 'ERROR' || result.message.startsWith('All AI providers failed')) {
            throw new Error(result.message);
        }
        response = result.message;
      } catch (err) {
        Log.warn(`⚠️ [Agent] UniversalAIAdaptor rejected connection (${err.message}).`);
        response = `[QUAD-BRAIN FALLBACK ENGAGED] I am currently running on local offline intelligence. You said: "${message}". What would you like me to execute next?`;
      }

      // INGEST AI RESPONSE INTO REAL-TIME MEMORY
      try {
        await learningManager.ingestKnowledgeChunk({
          id: `bot_resp_${Date.now()}`,
          source: 'bot_response',
          signal_strength: 1.0,
          context_summary: `[Bot: ${bot.name}]: ${response.substring(0, 500)}`
        });
      } catch (e) {
        Log.warn(`⚠️ [OnlineLearningManager] Failed to ingest bot response: ${e.message}`);
      }

      res.json({
        success: true,
        response,
        message: response,
        threadId: null,
        bot: {
          id: bot.id,
          name: bot.name,
          icon: bot.icon,
          palette: bot.palette,
          voice: bot.voice
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.log("OUTER CATCH TRIGGERED! ERROR IS:", err.stack || err.message);
      Log.error(`[Agent] Error processing chat: ${err.message}`);
      res.status(500).json({
        success: false,
        error: err.message,
        help: 'Ensure AGENT_ID is set in .env.agent and OpenAI API key is valid.',
      });
    }
  });

  /**
   * Text-to-Speech Voice Endpoint
   * POST /api/agent/voice
   * Body: { "text": "Hello world", "voice": "onyx" }
   */
  router.post('/voice', async (req, res) => {
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    try {
      const agent = agentFactory();
      const mp3 = await agent.openai.audio.speech.create({
        model: "tts-1",
        voice: voice || "onyx",
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
      });
      res.send(buffer);
    } catch (err) {
      Log.error(`[Agent] Voice generation failed: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Speech-to-Text Transcription Endpoint
   * POST /api/agent/transcribe
   * Accepts raw audio binary (e.g., audio/webm)
   */
  router.post('/transcribe', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'No audio data provided.' });
      }

      // Write raw buffer to a temporary webm file
      const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.webm`);
      fs.writeFileSync(tempFilePath, req.body);

      const agent = agentFactory();
      const transcription = await agent.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
      });

      // Cleanup
      fs.unlinkSync(tempFilePath);

      res.json({ success: true, text: transcription.text });
    } catch (err) {
      Log.error(`[Agent] Transcription failed: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Get current thread
   * GET /api/agent/thread
   */
  router.get('/thread', (req, res) => {
    try {
      const agent = agentFactory();
      res.json({
        success: true,
        threadId: agent.threadId,
        hasThread: !!agent.threadId,
        conversationLength: agent.conversationHistory.length,
      });
    } catch (err) {
      Log.error(`[Agent] Error fetching thread: ${err.message}`);
      res.status(503).json({
        success: false,
        error: err.message,
      });
    }
  });

  /**
   * Reset thread
   * POST /api/agent/reset
   */
  router.post('/reset', (req, res) => {
    try {
      const agent = agentFactory();
      agent.threadId = null;
      agent.conversationHistory = [];
      res.json({
        success: true,
        message: 'Thread reset. Next message will create a new thread.',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  /**
   * Get conversation history
   * GET /api/agent/history
   */
  router.get('/history', (req, res) => {
    try {
      const agent = agentFactory();
      const limit = parseInt(req.query.limit) || 50;
      res.json({
        success: true,
        history: agent.getHistory().slice(0, limit),
        total: agent.conversationHistory.length,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  app.use('/api/agent', router);
  Log.success('Agent routes registered: /api/agent/*');
}

export { EvoAgent };
