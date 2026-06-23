import React from 'react';

export default function MetricsView() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(10, 10, 14, 0.95)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16, padding: 24, color: '#f1f5f9'
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: '#00f0ff' }}>
        Studio Metrics
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>
        Observability and performance metrics are currently synchronizing with the central Intelligence Hub.
      </p>
      
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <div style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Uplink Status</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#22c55e', marginTop: 8 }}>ONLINE</div>
        </div>
        <div style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Latency</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f1f5f9', marginTop: 8 }}>14ms</div>
        </div>
      </div>
    </div>
  );
}
