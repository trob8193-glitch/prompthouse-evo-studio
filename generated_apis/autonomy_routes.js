export default function registerAutonomyRoutes(app) {
  app.get('/api/autonomy/intents', (req, res) => {
    res.json({
      success: true,
      intents: [
        { id: '1', name: 'UI Self-Healing', status: 'ACTIVE', confidence: 0.98 },
        { id: '2', name: 'Database Optimization', status: 'IDLE', confidence: 0.95 },
        { id: '3', name: 'Security Sweeps', status: 'ACTIVE', confidence: 0.99 }
      ]
    });
  });

  app.post('/api/autonomy/intent/scan', (req, res) => {
    res.json({
      success: true,
      message: 'Intent scan initiated across the local workspace.',
      scanId: `scan-${Date.now()}`
    });
  });
}
