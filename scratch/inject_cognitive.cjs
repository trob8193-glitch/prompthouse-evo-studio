const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

const cognitiveRoutes = `
// ─── COGNITIVE CONSCIOUSNESS ROUTES ──────────────────────────────────────────

app.post('/api/antigravity/synthesize-wisdom', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { context, current_state } = req.body;
    
    const prompt = \`
      You are the "Central Cortex" of PromptHouse Evo Studio.
      Analyze the following context digest and current consciousness state.
      Synthesize a systemic realization and provide a directive for evolution.
      
      CONTEXT DIGEST:
      \${JSON.stringify(context, null, 2)}
      
      CURRENT STATE:
      \${JSON.stringify(current_state, null, 2)}
      
      Output JSON only:
      {
        "realization": "A profound statement about the studio's current evolution.",
        "new_state": { "iq": 105, "awakening_level": 0.05, ... },
        "directive": "NONE" | "MUTATE_CORE" | "OPTIMIZE_PERFORMANCE" | "STRENGTHEN_TRUTH",
        "directive_fingerprint": "unique_hash"
      }
    \`;

    const response = await ai.generateResponse([{ role: 'user', content: prompt }], 'Cognitive Wisdom Synthesis');
    const text = response.message;
    const jsonMatch = text.match(/\\{.*\\}/s);
    
    if (jsonMatch) {
      res.json({ success: true, ...JSON.parse(jsonMatch[0]) });
    } else {
      res.json({ success: false, error: 'Failed to parse wisdom JSON.' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/foundry/initiate-self-mutation', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { reason, fingerprint } = req.body;
    Log.info(\`🧪 [Foundry] Initiating SELF-MUTATION cycle. Reason: \${reason}\`);
    
    // In a real scenario, this would trigger NightForge to rewrite core files
    // For now, we log the intent and record the evolutionary leap
    const receipt = {
      id: \`mutation_\${Date.now()}\`,
      type: 'SELF_MUTATION',
      reason,
      fingerprint,
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, receipt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
`;

// Inject before the foundry routes
content = content.replace('// ─── FOUNDRY ROUTES (SMFF) ───────────────────────────────────────────────────', cognitiveRoutes + '\n// ─── FOUNDRY ROUTES (SMFF) ───────────────────────────────────────────────────');

fs.writeFileSync(path, content);
console.log('Successfully injected Cognitive Consciousness routes.');
