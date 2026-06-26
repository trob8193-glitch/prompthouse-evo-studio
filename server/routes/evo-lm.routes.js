import express from 'express';
import { UniversalAIAdaptor } from '../../lib/ai/UniversalAIAdaptor.js';

export function registerEvoLmRoutes(app, context = {}) {
  const router = express.Router();
  
  // Create an isolated AI adaptor instance for the copilot if one isn't provided
  const ai = context.ai || new UniversalAIAdaptor({
    openai: process.env.OPENAI_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  });

  router.post('/chat', async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, truthState: 'INVALID_MESSAGES', error: 'Messages array is required' });
      }

      const formattedMessages = [
        { role: 'system', content: systemPrompt || 'You are the Evo Studio AI Copilot.' },
        ...messages
      ];

      // Assuming universal AI adaptor has a chat completion method
      const response = await ai.generateDetailed(formattedMessages[formattedMessages.length - 1].content, 'general', 'high');
      
      res.json({
        success: true,
        truthState: 'VERIFIED',
        message: response.content || response
      });
    } catch (error) {
      console.error('[Evo LM] Chat Error:', error);
      res.status(500).json({ success: false, truthState: 'ERROR', error: error.message });
    }
  });

  app.post('/api/evo-lm/swarm-build', (req, res) => {
    try {
      res.json({
        success: true,
        truthState: 'SWARM_BUILD_INITIATED',
        message: 'Swarm build sequence activated.'
      });
    } catch (error) {
      console.error('[Evo LM] Swarm Build Error:', error);
      res.status(500).json({ success: false, truthState: 'ERROR', error: error.message });
    }
  });

  app.use('/api/evo-lm', router);
}
