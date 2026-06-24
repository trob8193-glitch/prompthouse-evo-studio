import React from 'react';

export function GradesTab({ gradeGates, cardStyle, badgeStyle, getScoreColor }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {gradeGates.map(gate => (
        <div key={gate.gate} style={{ ...cardStyle, background: '#020617', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 0 }}>
          <div style={{ width: 140 }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>{gate.gate}</div>
            <div style={{ marginTop: 6 }}><span style={badgeStyle(gate.truth)}>{gate.truth}</span></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${gate.score}%`, height: '100%', background: getScoreColor(gate.score) }} />
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{gate.proof}</div>
          </div>
          <div style={{ width: 60, textAlign: 'right', fontSize: 24, fontWeight: 900, color: getScoreColor(gate.score) }}>
            {gate.score}%
          </div>
        </div>
      ))}
    </div>
  );
}
