import { createCapabilityManifest, writeCapabilityReceipt } from '../src/core/capabilities/EvoCapabilityContract.js';
import { HardenedCommandGateway } from '../src/core/terminal/HardenedCommandGateway.js';

export default function registerEvoCapabilityRoutes(app) {
  const gateway = new HardenedCommandGateway({ rootDir: process.cwd() });

  app.get('/api/evo-capabilities/manifest', (_req, res) => {
    res.json({ success: true, manifest: createCapabilityManifest({ label: 'api_manifest' }) });
  });

  app.get('/api/evo-capabilities/commands', (_req, res) => {
    res.json({ success: true, commands: gateway.listAllowedCommands() });
  });

  app.post('/api/evo-capabilities/receipt', (req, res) => {
    try {
      const body = req.body || {};
      const receipt = writeCapabilityReceipt({
        action: body.action || 'manual_receipt',
        capabilityId: body.capabilityId || 'manual',
        truthState: body.truthState || 'RECORDED',
        details: body.details || {},
        claims: Array.isArray(body.claims) ? body.claims : [],
      });
      res.json({ success: true, receipt });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.post('/api/evo-capabilities/command/run', async (req, res) => {
    try {
      const body = req.body || {};
      const result = await gateway.run(body.command, {
        cwd: body.cwd || '.',
        approvalToken: body.approvalToken || req.headers['x-evo-approval-token'] || null,
      });
      res.status(result.success ? 200 : 403).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
