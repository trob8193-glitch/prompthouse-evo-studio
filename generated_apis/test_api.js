export default function registerRoutes(app) {
  app.get('/api/generated/test', (req, res) => {
    res.json({
      success: true,
      message: "Hello from the Dynamic API Loader! This was generated automatically.",
      timestamp: new Date().toISOString()
    });
  });
}
