import React from 'react';

export function ApexAdminTab({ nuclearAudit, selfImplementationState, cardStyle }) {
  return (
    <div style={{ ...cardStyle, background: '#020617', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
      <div style={{ color: '#ef4444', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 900 }}>Admin Root · Automated Deployment</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: '8px 0 24px 0', color: 'white' }}>Global Telemetry Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Modules Scanned</div>
          <div style={{ color: '#6ee7b7', fontSize: 32, fontWeight: 900 }}>{nuclearAudit?.summary?.modulesScanned ?? '-'}</div>
          <div style={{ color: '#6ee7b7', fontSize: 10, marginTop: 4 }}>Nuclear Truth inventory</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Nuclear Truth Score</div>
          <div style={{ color: '#fde047', fontSize: 32, fontWeight: 900 }}>{nuclearAudit?.score ?? '-'}%</div>
          <div style={{ color: '#fde047', fontSize: 10, marginTop: 4 }}>Audit-backed</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Broken API Wires</div>
          <div style={{ color: '#67e8f9', fontSize: 32, fontWeight: 900 }}>{nuclearAudit?.summary?.brokenWires ?? '-'}</div>
          <div style={{ color: '#67e8f9', fontSize: 10, marginTop: 4 }}>Route integrity</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Self-Implementation Active</div>
          <div style={{ color: 'white', fontSize: 32, fontWeight: 900 }}>{selfImplementationState?.active ? 'YES' : 'NO'}</div>
          <div style={{ color: '#cbd5e1', fontSize: 10, marginTop: 4 }}>Policy-backed runtime state</div>
        </div>
      </div>
      
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: 13, lineHeight: 1.5 }}>
        <strong>WARNING:</strong> Unbound mode removes manual guardrails. Production deploy and live commerce remain policy-gated until explicit owner approval and proof receipts exist.
      </div>
    </div>
  );
}
