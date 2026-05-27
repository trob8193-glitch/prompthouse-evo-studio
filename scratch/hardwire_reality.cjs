const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update NUCLEAR AUDIT route with real logic
const realAuditLogic = `
// ─── NUCLEAR TRUTH AUDIT ROUTES ───────────────────────────────────────────

app.post('/api/truth/nuclear-audit', maybeRequireAuthOrMaster, async (req, res) => {
  try {
    Log.info('☣️ [Bridge] Initiating REAL PHYSICAL NUCLEAR TRUTH Audit...');
    const { NuclearTruthAuditor } = await import('./src/core/autonomy/NuclearTruthAuditor.js');
    const auditor = new NuclearTruthAuditor();
    const result = await auditor.performFullAudit();
    
    res.json({ 
      success: true, 
      status: 'AUDIT_COMPLETE', 
      ...result,
      realization: \`Nuclear Audit confirmed \${result.integrity}% Absolute Operational Reality.\` 
    });
  } catch (e) {
    Log.error(\`☣️ [NuclearTruth] Audit Failed: \${e.message}\`);
    res.status(500).json({ error: e.message });
  }
});
`;

// 2. Update STUDY CENTER route with real logic
const realStudyLogic = `
// ─── SOVEREIGN STUDY CENTER ROUTES ─────────────────────────────────────────

app.post('/api/study/initiate', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { protocolId } = req.body;
    Log.info(\`📚 [Bridge] Executing PHYSICAL Study Protocol: \${protocolId}\`);
    
    const { SovereignStudyCenter } = await import('./src/core/autonomy/SovereignStudyCenter.js');
    const center = new SovereignStudyCenter();
    const result = await center.initiateStudy(protocolId);
    
    res.json(result);
  } catch (e) {
    Log.error(\`📚 [StudyCenter] Protocol Failed: \${e.message}\`);
    res.status(500).json({ error: e.message });
  }
});
`;

// Replace the simulated routes
content = content.replace(/\/\/ ─── NUCLEAR TRUTH AUDIT ROUTES ───────────────────────────────────────────[\s\S]*?\/\/ ─── SOVEREIGN WITNESS ROUTES ───────────────────────────────────────────────/, realAuditLogic + '\n' + realStudyLogic + '\n// ─── SOVEREIGN WITNESS ROUTES ───────────────────────────────────────────────');

// Remove the old STUDY CENTER route if it exists elsewhere
content = content.replace(/\/\/ ─── SOVEREIGN STUDY CENTER ROUTES ─────────────────────────────────────────[\s\S]*?app\.post\('\/api\/study\/initiate'[\s\S]*?\}\);/, '');

fs.writeFileSync(path, content);
console.log('Successfully hard-wired Absolute Reality into Bridge Server.');
