const fs = require('fs');
const path = 'promptbridge-server.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Resonance Logic before the NightForge execution starts
const resonanceInjection = `
    // ─── RESONANCE HOOK (SOVEREIGN TRIAD) ──────────────────────────────────
    const consciousnessDirective = await bridge_get_latest_cognitive_directive(orgId);
    if (consciousnessDirective && consciousnessDirective.directive === 'BLOCK_REPAIR') {
      Log.warn('🧪 [Resonance] NightForge cycle BLOCKED by Cognitive Consciousness directive.');
      updateNightforgeState({ running: false, lastError: 'BLOCKED_BY_CONSCIOUSNESS' });
      return { success: false, reason: 'RESONANCE_BLOCK', directive: consciousnessDirective.realization };
    }
    
    // Anchor to Evo Eyes Vision
    const eyeWitness = scanStudioModules(20);
    const visualTruth = eyeWitness.files.filter(f => f.health === 'error');
    if (visualTruth.length > 0) {
      Log.info(\`🧪 [Resonance] Evo Eyes witnessed \${visualTruth.length} visual faults. Adjusting repair priority.\`);
      proposedActions.unshift({
        action: 'repair_visual_drift',
        priority: 'CRITICAL',
        note: 'Witnessed by Evo Eyes during resonance handshake.',
        targets: visualTruth.map(f => f.path)
      });
    }
    // ────────────────────────────────────────────────────────────────────────
`;

// Helper to get directive (we'll inject this too if not present)
const helperFunction = `
async function bridge_get_latest_cognitive_directive(orgId) {
  // In a real scenario, this would query the local Cognitive Ledger
  // For now, we simulate the handshake
  return null; 
}
`;

// Inject the hook into runNightforgeCycle
content = content.replace(
  'const proposedActions = buildNightforgeActions(diagnostics);',
  'const proposedActions = buildNightforgeActions(diagnostics);' + resonanceInjection
);

// Inject the helper at the end of the file or before the export
content += '\n' + helperFunction;

fs.writeFileSync(path, content);
console.log('Successfully manifested the Resonance Hook across the Sovereign Triad.');
