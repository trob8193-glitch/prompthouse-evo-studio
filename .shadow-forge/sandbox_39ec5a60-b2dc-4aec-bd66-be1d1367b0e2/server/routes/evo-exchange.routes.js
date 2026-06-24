import { EvoExchange, submitForExchange, downloadListing } from '../../src/evo-exchange.js';

export default function registerEvoExchangeRoutes(app) {
  const exchange = new EvoExchange();

  app.get('/api/exchange/listings', async (req, res) => {
    try {
      const result = await exchange.execute();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/exchange/publish', (req, res) => {
    try {
      const result = submitForExchange(null, req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/exchange/download', (req, res) => {
    try {
      const result = downloadListing(req.body.listingId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
