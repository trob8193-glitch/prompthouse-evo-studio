import React from 'react';

export default function CommerceDashboard() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(10, 10, 14, 0.95)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16, padding: 24, color: '#f1f5f9'
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: '#00f0ff' }}>
        Commerce Dashboard
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>
        This module is currently syncing with the intelligence layer and will be active shortly.
      </p>
    </div>
  );
}
