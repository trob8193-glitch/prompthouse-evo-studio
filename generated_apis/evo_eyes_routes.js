export default function registerEvoEyesRoutes(app) {
  app.get('/api/agi/evo-eyes/audits', (req, res) => {
    res.json({
      success: true,
      audits: [
        { id: 1, timestamp: new Date().toISOString(), type: 'UI_DRIFT', severity: 'LOW', result: 'PASS' },
        { id: 2, timestamp: new Date().toISOString(), type: 'LAYOUT_SHIFT', severity: 'NONE', result: 'PASS' }
      ]
    });
  });
}
