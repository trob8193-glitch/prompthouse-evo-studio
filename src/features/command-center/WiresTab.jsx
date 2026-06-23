import React from 'react';

export function WiresTab({ cardStyle }) {
  return (
    <div style={{ ...cardStyle, background: '#020617' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900 }}>Required Wires</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {[
          "BrowserBridge → PromptBase → WorkTwin Capture",
          "PromptBase → Swarm Fission → Test Arena",
          "ForgeFriction → User Repair Prompt → Sovereignty Override",
          "Temporal Stackchain → Codegen → Forge Rhino Release Check",
          "VectorPack → Evo LM → PromptLink Provider Router",
          "LiveForge → ForgeRender → Proof Deck",
          "ForgeRender → Asset Vault → Evo Exchange",
          "DeployRail → Provider → Proof Receipt → Rollback Plan",
          "Commerce Rail → Stripe/Test Mode → Approval Receipt",
          "NightForge → Patch Bundle/PR → Tests → Proof Deck",
        ].map((wire, i) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#67e8f9' }}>🔗</span> {wire}
          </div>
        ))}
      </div>
    </div>
  );
}
