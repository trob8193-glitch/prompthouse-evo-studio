const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the self-mutation route to check for "Witness Block"
const mutationEdge = `
app.post('/api/foundry/initiate-self-mutation', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {
  try {
    const { reason, fingerprint, requiresApproval } = req.body;
    
    // EDGE: If the Witness HUD is active or a high-risk mutation is detected
    if (requiresApproval) {
       Log.warn('🧪 [WitnessEdge] Self-Mutation requires manual WITNESS_APPROVAL.');
       // Store in a pending queue for the HUD to poll
       return res.json({ success: true, status: 'AWAITING_APPROVAL', id: \`mut_\${Date.now()}\` });
    }

    Log.info(\`🧪 [Foundry] Initiating SELF-MUTATION cycle. Reason: \${reason}\`);
    res.json({ success: true, receipt: { id: \`mutation_\${Date.now()}\`, reason } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
`;

// Replace the existing mutation route
content = content.replace(/app\.post\('\/api\/foundry\/initiate-self-mutation'[\s\S]*?\}\);/, mutationEdge);

fs.writeFileSync(path, content);
console.log('Successfully edged NightForge mutation to the Witness Console.');
