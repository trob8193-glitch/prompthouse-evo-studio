const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

const witnessRoutes = `
// ─── SOVEREIGN WITNESS ROUTES ───────────────────────────────────────────────

app.get('/api/witness/latest-packet', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    const packet = ai.getLastPacket();
    res.json({ success: true, packet });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/witness/report-truth', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { filePath, report } = req.body;
    // Store truth report in memory for frontend polling
    // In a real scenario, this would go to a websocket or a shared ledger
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
`;

// Inject before ANCESTRAL MEMORY ROUTES
content = content.replace('// ─── ANCESTRAL MEMORY ROUTES ────────────────────────────────────────────────', witnessRoutes + '\n// ─── ANCESTRAL MEMORY ROUTES ────────────────────────────────────────────────');

fs.writeFileSync(path, content);
console.log('Successfully injected Witness routes.');
