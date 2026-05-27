const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

const studyRoutes = `
// ─── SOVEREIGN STUDY CENTER ROUTES ─────────────────────────────────────────

app.post('/api/study/initiate', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { protocolId } = req.body;
    Log.info(\`📚 [Bridge] User initiated Study Protocol: \${protocolId}\`);
    
    // In a real scenario, this would trigger the SovereignStudyCenter on the server
    // For now, we simulate the training outcome
    res.json({ 
      success: true, 
      status: 'STUDY_ACTIVE', 
      iq_gain: 0.05, 
      realization: 'Protocol ' + protocolId + ' has increased architectural resonance.' 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
`;

// Inject before WITNESS ROUTES
content = content.replace('// ─── SOVEREIGN WITNESS ROUTES ───────────────────────────────────────────────', studyRoutes + '\n// ─── SOVEREIGN WITNESS ROUTES ───────────────────────────────────────────────');

fs.writeFileSync(path, content);
console.log('Successfully injected Study routes.');
