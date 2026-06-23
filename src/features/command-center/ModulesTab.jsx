import React from 'react';

export function ModulesTab({ modules, cardStyle, badgeStyle, getScoreColor }) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {modules.map(mod => (
        <div key={mod.id} style={{ ...cardStyle, background: '#020617', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} className="hover:border-yellow-400">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{mod.icon}</span>
            <span style={badgeStyle(mod.status)}>{mod.status}</span>
          </div>
          <h3 style={{ margin: '12px 0 4px 0', fontSize: 16, fontWeight: 900 }}>{mod.name}</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Owner: {mod.owner}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#cbd5e1', minHeight: 36 }}>{mod.proof}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${mod.score}%`, height: '100%', background: getScoreColor(mod.score) }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: getScoreColor(mod.score) }}>{mod.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
