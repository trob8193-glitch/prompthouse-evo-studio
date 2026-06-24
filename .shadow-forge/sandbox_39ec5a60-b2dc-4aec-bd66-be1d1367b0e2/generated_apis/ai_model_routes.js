import fetch from 'node-fetch';
import { listModels, getActiveModel, setActiveModel, registerDynamicModel, MODEL_PROVIDERS, MODEL_TIERS } from '../src/core/ai/ModelRegistry.js';

export default function registerAiModelRoutes(app) {
  
  // Internal helper to dynamically discover and register local Ollama models
  async function discoverLocalModels() {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      const data = await res.json();
      
      if (data && Array.isArray(data.models)) {
        for (const m of data.models) {
          const modelName = m.name; // e.g. "llama3:latest", "mistral:latest"
          const cleanName = modelName.replace(':latest', '');
          
          // Determine capabilities based on known model names
          const caps = ['offline', 'zero-cost'];
          if (cleanName.includes('coder') || cleanName.includes('qwen') || cleanName.includes('llama')) caps.push('code');
          if (cleanName.includes('mistral') || cleanName.includes('mixtral')) caps.push('reasoning');

          // Register dynamically into the central registry
          registerDynamicModel({
            id: `ollama-${cleanName}`,
            displayName: `${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)} (Local)`,
            provider: MODEL_PROVIDERS.OLLAMA,
            tier: MODEL_TIERS.LOCAL,
            contextWindow: 8192,
            capabilities: caps,
            apiModel: modelName,
            costPer1kTokens: 0,
            online: true,
          });
        }
      }
    } catch (e) {
      // Ollama not running or unreachable, just silently fail and use existing models
      console.log('🌌 [ModelRouter] Local Ollama discovery skipped (offline).');
    }
  }

  // GET /api/ai/models - Returns grouped models and the currently active model
  app.get('/api/ai/models', async (req, res) => {
    try {
      // Auto-discover local models right before serving the list to the UI
      await discoverLocalModels();

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
