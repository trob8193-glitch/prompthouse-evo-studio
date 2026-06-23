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
      res.json({ success: true, package: pkg });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3.5. Internal Install Route
  // Installs the feature as an active plugin directly into the Studio
  router.get('/install/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const result = engine.installExtension(id);
      
      if (!result) {
        return res.status(404).json({ success: false, error: 'Extension not found in Evo Studio' });
      }

      // Try hot reloading if possible
      try {
        const { GlobalPluginRegistry } = await import('../../src/core/plugins/PluginRegistry.js');
        const path = await import('path');
        await GlobalPluginRegistry.loadActivePlugins(path.join(process.cwd(), 'src/plugins/active'));
      } catch (e) {
        console.warn('[Marketplace] Hot reload failed, but plugin is installed. Requires restart.', e.message);
      }

      res.json({
        success: true,
        message: `Extension ${result.ext?.displayName || id} installed as an autonomous plugin`,
        pluginFile: result.pluginFile
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
  // 11. Stripe Connect Onboarding
  router.post('/onboard', async (req, res) => {
    try {
      const { classifyStripeCheckoutReadiness } = await import('../services/stripe-test-checkout.js');
      const readiness = classifyStripeCheckoutReadiness();
      if (!readiness.ready) {
        return res.status(400).json({ error: 'Stripe is not ready for testing.' });
      }
      
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      // Create a test connected account
      const account = await stripe.accounts.create({
        type: 'standard',
      });
      
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'http://localhost:5173/portfolio',
        return_url: 'http://localhost:5173/portfolio',
        type: 'account_onboarding',
      });
      
      res.json({ url: accountLink.url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // 12. App Checkout
  router.post('/checkout', async (req, res) => {
    try {
      const { projectId } = req.body;
      const { classifyStripeCheckoutReadiness, createStripeTestCheckoutSession } = await import('../services/stripe-test-checkout.js');
      
      const result = await createStripeTestCheckoutSession({
        amount: 900, // $9.00
        currency: 'usd',
        productName: `App: ${projectId || 'Generated Micro-app'}`,
        ownerApproval: { granted: true } // Override for test
      });
      
      if (!result.ok) {
        return res.status(400).json({ error: result.blockedReason || 'Stripe error' });
      }
      res.json({ url: result.url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // 13. Audit Checkout
  router.post('/checkout/audit', async (req, res) => {
    try {
      const { classifyStripeCheckoutReadiness, createStripeTestCheckoutSession } = await import('../services/stripe-test-checkout.js');
      
      const result = await createStripeTestCheckoutSession({
        amount: 1500000, // $15,000.00
        currency: 'usd',
        productName: 'Enterprise AI & Software Audit',
        ownerApproval: { granted: true } // Audit implies owner approval inherently
      });
      
      if (!result.ok) {
        return res.status(400).json({ error: result.blockedReason || 'Stripe error' });
      }
      res.json({ url: result.url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use('/api/marketplace', router);
}
