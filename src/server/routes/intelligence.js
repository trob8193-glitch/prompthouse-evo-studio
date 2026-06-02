import express from 'express';
import { IntelligenceCore } from '../../core/engines/IntelligenceCore.js';

export default function createIntelligenceRouter(dependencies) {
  const router = express.Router();
  const { intelligenceCore, maybeRequireAuthOrMaster, bondedNodes, globalFirewallSavings } = dependencies;

  router.post('/execute', maybeRequireAuthOrMaster, async (req, res) => {
    try {
      const { module, action, payload } = req.body;
      if (!module || !action) {
        return res.status(400).json({ error: 'Module and action are required.' });
      }
      const result = await intelligenceCore.executeAction(module, action, payload);
      
      // Track cumulative savings
      if (result.metrics && globalFirewallSavings) {
        globalFirewallSavings.tokens += result.metrics.tokensSaved || 0;
        globalFirewallSavings.dollars += result.metrics.moneySaved || 0;
      }
      
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/nodes/probe', maybeRequireAuthOrMaster, (req, res) => {
    res.json({
      success: true,
      nodes: bondedNodes || []
    });
  });

  return router;
}
