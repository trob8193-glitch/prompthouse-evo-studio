import { runNuclearTruthAudit } from '../../src/core/audit/NuclearTruthAudit.js';

export function registerNuclearTruthRoutes(app) {
  app.get('/api/audit/nuclear-truth', (req, res) => {
    try {
      const report = runNuclearTruthAudit(process.cwd());
      res.json({
        success: true,
        report
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
