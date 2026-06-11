import express from 'express';
import { StudioMarketplaceEngine } from '../../src/core/marketplace/StudioMarketplaceEngine.js';

export function registerStudioMarketplaceRoutes(app) {
  const router = express.Router();
  const engine = new StudioMarketplaceEngine(process.cwd());

  // 1. Universal Catalog Route
  // Useful for Wi-Fi devices, apps, or UI extensions that just want a JSON list of what's available
  router.get('/catalog', (req, res) => {
    try {
      const catalog = engine.harvestMarketplaceCatalog();
      res.json({ success: true, catalog });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 2. Open VSX / VS Code Gallery Compatible Search Route
  // IDEs will hit POST /api/marketplace/-/query to search for extensions
  router.post('/-/query', (req, res) => {
    try {
      // VS Code sends query filters in the body.
      // E.g. {"filters":[{"criteria":[{"filterType":10,"value":"search_term"}]}]}
      let queryText = '';
      if (req.body?.filters?.[0]?.criteria) {
        const criteria = req.body.filters[0].criteria.find(c => c.filterType === 10);
        if (criteria) queryText = criteria.value;
      }

      const response = engine.queryOpenVsx(queryText);
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. Download/Install Route
  // Delivers the packaged feature to the bonded device
  router.get('/download/:id', (req, res) => {
    try {
      const id = req.params.id;
      const pkg = engine.packageExtension(id);
      
      if (!pkg) {
        return res.status(404).json({ success: false, error: 'Extension not found in Evo Studio' });
      }

      // For a real IDE this would stream a .vsix. For our hybrid engine, we send the JSON package.
      res.json({
        success: true,
        message: 'Extension retrieved from PromptHouse Evo Marketplace',
        package: pkg
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. JetBrains Plugin Repository (XML)
  router.get('/jetbrains/updatePlugins.xml', (req, res) => {
    try {
      res.type('application/xml');
      res.send(engine.generateJetBrainsXmlFeed());
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5. Sublime Text Package Control (JSON)
  router.get('/sublime/packages.json', (req, res) => {
    try {
      res.json(engine.generateSublimePackagesJson());
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6. Neovim Lua Endpoint
  router.get('/neovim/:id.lua', (req, res) => {
    try {
      const id = req.params.id;
      res.type('text/plain');
      res.send(engine.generateNeovimLua(id));
    } catch (error) {
      res.status(500).send(`-- Error loading Lua blueprint: ${error.message}`);
    }
  });

  // ─── AI-NATIVE ECOSYSTEM ROUTES ──────────────────────────────────────────────

  // 7. Antigravity IDE — Agent Skill Export
  router.get('/antigravity/:id/SKILL.md', (req, res) => {
    try {
      const id = req.params.id;
      const skill = engine.generateAntigravitySkill(id);
      if (!skill) {
        return res.status(404).json({ success: false, error: 'Blueprint not found in Evo Studio' });
      }
      res.type('text/markdown');
      res.send(skill);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 8. Ollama — Local Model Modelfile Export
  router.get('/ollama/:id/Modelfile', (req, res) => {
    try {
      const id = req.params.id;
      const modelfile = engine.generateOllamaModelfile(id);
      if (!modelfile) {
        return res.status(404).json({ success: false, error: 'Blueprint not found in Evo Studio' });
      }
      res.type('text/plain');
      res.send(modelfile);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 9. Codex / OpenAI — Function Calling Tool Schema Export
  router.get('/codex/:id/schema.json', (req, res) => {
    try {
      const id = req.params.id;
      const schema = engine.generateCodexToolSchema(id);
      if (!schema) {
        return res.status(404).json({ success: false, error: 'Blueprint not found in Evo Studio' });
      }
      res.json(schema);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 10. Supported Formats Discovery
  router.get('/formats', (req, res) => {
    res.json({
      success: true,
      marketplace: 'PromptHouse Evo Studio',
      supportedFormats: engine.getSupportedFormats(),
      endpoints: {
        universal: 'GET /api/marketplace/catalog',
        vscode:    'POST /api/marketplace/-/query',
        jetbrains: 'GET /api/marketplace/jetbrains/updatePlugins.xml',
        sublime:   'GET /api/marketplace/sublime/packages.json',
        neovim:    'GET /api/marketplace/neovim/:id.lua',
        antigravity: 'GET /api/marketplace/antigravity/:id/SKILL.md',
        ollama:    'GET /api/marketplace/ollama/:id/Modelfile',
        codex:     'GET /api/marketplace/codex/:id/schema.json',
        download:  'GET /api/marketplace/download/:id'
      }
    });
  });

  app.use('/api/marketplace', router);
}
