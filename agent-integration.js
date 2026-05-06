/**
 * OpenAI Agent Integration for PromptHouse Evo Studio
 * Add to promptbridge-server.js as a middleware/route module
 */

import { EvoAgent } from './agent-runtime.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.agent' });

let agentInstance = null;

/**
 * Initialize the agent on first use
 */
function getEvoAgent() {
  if (!agentInstance) {
    try {
      agentInstance = new EvoAgent(process.env.AGENT_ID);
    } catch (err) {
      throw new Error(`Agent not initialized. Run: npm run create:agent. Error: ${err.message}`);
    }
  }
  return agentInstance;
}

/**
 * Agent integration routes
 * Add these to your Express app in promptbridge-server.js:
 * 
 * import { setupAgentRoutes } from './agent-integration.js';
 * setupAgentRoutes(app);
 */
export function setupAgentRoutes(app) {
  /**
   * Health check for agent
   */
  app.get('/api/agent/health', (req, res) => {
    try {
      const agent = getEvoAgent();
      res.json({
        success: true,
        status: 'ready',
        agentId: agent.agentId,
        threadId: agent.threadId,
      });
    } catch (err) {
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
  app.post('/api/agent/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.',
      });
    }

    try {
      const agent = getEvoAgent();
      const response = await agent.chat(message, { verbose: false });

      res.json({
        success: true,
        message: response,
        threadId: agent.threadId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Agent] Error:', err.message);
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
  app.get('/api/agent/thread', (req, res) => {
    try {
      const agent = getEvoAgent();
      res.json({
        success: true,
        threadId: agent.threadId,
        hasThread: !!agent.threadId,
        conversationLength: agent.conversationHistory.length,
      });
    } catch (err) {
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
  app.post('/api/agent/reset', (req, res) => {
    try {
      const agent = getEvoAgent();
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
  app.get('/api/agent/history', (req, res) => {
    try {
      const agent = getEvoAgent();
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

  console.log('✅ Agent routes registered: /api/agent/*');
}

export { EvoAgent };
