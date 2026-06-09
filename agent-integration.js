/**
 * OpenAI Agent Integration for PromptHouse Evo Studio
 * Add to promptbridge-server.js as a middleware/route module
 */

import { EvoAgent } from './agent-runtime.js';
import { Router } from 'express';
import dotenv from 'dotenv';
import { Log } from './src/core/autonomy/SovereignLogger.js';

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
export function setupAgentRoutes(app, { agentFactory = getEvoAgent } = {}) {
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
  router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.',
      });
    }

    try {
      const agent = agentFactory();
      const response = await agent.chat(message, { verbose: false }).catch(err => {
        Log.error(`[Agent] Chat execution failed: ${err.message}`);
        throw err;
      });

      res.json({
        success: true,
        response,
        message: response,
        threadId: agent.threadId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      Log.error(`[Agent] Error processing chat: ${err.message}`);
      res.status(500).json({
        success: false,
        error: err.message,
        help: 'Ensure AGENT_ID is set in .env.agent and OpenAI API key is valid.',
      });
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
