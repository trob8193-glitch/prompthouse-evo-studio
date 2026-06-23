import React from 'react';

export function InventionsTab({ cardStyle, badgeStyle }) {
  return (
    <div style={{ ...cardStyle, background: '#020617' }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ color: '#fde047', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Million-dollar breakout</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: '8px 0' }}>Evo WorkTwin Marketplace</h2>
          <p style={{ color: '#cbd5e1', fontSize: 14 }}>
            Browser-powered personal AI studio twin that captures approved workflows, mines repeatable patterns, generates reusable tools, proves ROI, and lets users keep, share, or sell the result.
          </p>
          <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
            {[
              "WorkTwin Capture: browser/API/studio approved context capture",
              "Pattern Miner: finds repeated tasks and friction",
              "Tool Autogenerator: builds agents/apps/extensions/templates",
              "Fission Forge: tests multiple versions and keeps winner",
              "Proof-to-Value Deck: time saved, steps removed, cost reduced",
              "Evo Exchange: private library + marketplace revenue loop",
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: 10, borderRadius: 8, fontSize: 13, color: '#e2e8f0' }}>
                • {item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 0.8, minWidth: 280 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 900 }}>Money Loop</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#cbd5e1', fontSize: 13 }}>
              <div>1. Capture approved workflow context.</div>
              <div>2. Detect repeatable work.</div>
              <div>3. Generate reusable tool/agent/extension.</div>
              <div>4. Preview in LiveForge.</div>
              <div>5. Score through Fission + Friction.</div>
              <div>6. Create Proof-to-Value receipt.</div>
              <div>7. Save to vault or sell through Evo Exchange.</div>
            </div>
            <div style={{ marginTop: 20 }}>
              <span style={badgeStyle('verified')}>retention + revenue engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
