import React from 'react';

export function ControllersTab({ botControllers, cardStyle }) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {botControllers.map(([bot, role, detail]) => (
        <div key={bot} style={{ ...cardStyle, background: '#020617', display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 24 }}>🤖</div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 900 }}>{bot}</h3>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>{role}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
