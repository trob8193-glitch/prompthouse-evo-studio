import React from 'react';

export function LogTab({ cycle, log, cardStyle, badgeStyle }) {
  return (
    <div style={{ ...cardStyle, background: '#020617' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Self-Build Cycle Log</h2>
        <span style={badgeStyle('recommended')}>Cycle {cycle}</span>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {log.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
              <span style={{ color: item.includes('blocked') || item.includes('Weakest') ? '#fca5a5' : '#6ee7b7' }}>
                {item.includes('blocked') || item.includes('Weakest') ? '⚠️' : '✅'}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
