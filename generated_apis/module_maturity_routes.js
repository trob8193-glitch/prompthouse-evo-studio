import {
  runModuleMaturityAudit,
  writeModuleMaturityReceipt,
} from '../src/core/maturity/index.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerModuleMaturityRoutes(app) {
  app.get('/api/module-maturity/status', (req, res) => {
    try {
      const report = runModuleMaturityAudit();
      ok(res, { report });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/module-maturity/modules', (req, res) => {
    try {
      const report = runModuleMaturityAudit();
      ok(res, {
        modules: report.modules,
        summary: report.summary,
        averageScore: report.averageScore,
        truthState: report.truthState,
        checklist: report.checklist,
      });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/module-maturity/modules/:moduleId', (req, res) => {
    try {
      const report = runModuleMaturityAudit();
      const module = report.modules.find((item) => item.id === req.params.moduleId);
      if (!module) return fail(res, `Unknown module: ${req.params.moduleId}`, 404);
      ok(res, { module, checklist: report.checklist });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/module-maturity/receipt', (req, res) => {
    try {
      const receipt = writeModuleMaturityReceipt();
      ok(res, { receipt: { file: receipt.file, report: receipt.report } });
    } catch (error) {
      fail(res, error);
    }
  });
}
