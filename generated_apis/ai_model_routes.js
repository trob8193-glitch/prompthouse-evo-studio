import { listModels, getActiveModel, setActiveModel } from '../src/core/ai/ModelRegistry.js';

export default function registerAiModelRoutes(app) {
  // GET /api/ai/models - Returns grouped models and the currently active model
  app.get('/api/ai/models', (req, res) => {
    try {
      const models = listModels();
      const activeModel = getActiveModel();
      res.json({ models, activeModel });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/ai/models/select - Sets the active model globally for the studio
  app.post('/api/ai/models/select', (req, res) => {
    try {
      const { modelId } = req.body;
      if (!modelId) {
        return res.status(400).json({ error: 'modelId is required' });
      }
      
      const newActiveModel = setActiveModel(modelId);
      res.json({ success: true, activeModel: newActiveModel });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
}
