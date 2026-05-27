import express from 'express';
import { UniversalImageAdaptor } from '../lib/ai/UniversalImageAdaptor.js';

export default function registerEvoDiffuserRoutes(app) {
  app.post('/api/diffuser/generate', async (req, res) => {
    try {
      const { prompt, steps = 30, cfg = 7, engine = 'dalle' } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      // Initialize the adaptor with environment keys
      const adaptor = new UniversalImageAdaptor({
        openai: process.env.OPENAI_API_KEY
      });

      console.log(`[EvoDiffuser] Generating via ${engine}: ${prompt}`);
      
      const result = await adaptor.generate(prompt, engine, { steps, cfg });
      
      if (!result.success) {
        console.error(`[EvoDiffuser] Error:`, result.error);
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('[EvoDiffuser] Unhandled Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
