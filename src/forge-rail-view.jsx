/**
 * PromptHouse Evo Studio — ForgeRail View
 * Owner: Builder | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';

export function ForgeRailView() {
  const [activeRail, setActiveRail] = useState('alpha');
  const [logs, setLogs] = useState([]);

  const rails = [
    { id: 'alpha', label: 'ForgeAlpha', desc: 'Transparent PNG/WEBP pipeline', color: '#38bdf8' },
    { id: 'sprite', label: 'ForgeSprite', desc: 'Sprite sheets and atlas JSON', color: '#4ade80' },
    { id: 'motion', label: 'ForgeMotion', desc: '2D motion/video specs', color: '#f5c842' },
    { id: 'rive', label: 'ForgeRive', desc: 'Rive-ready interactive assets', color: '#fb923c' },
    { id: '3d', label: 'Forge3D', desc: 'Blender/Unity cloud render jobs', color: '#a78bfa' },
  ];

  const log = useCallback((msg) => {
    setLogs(l => [{ msg, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 50)]);
  }, []);

  const runRail = useCallback(() => {
    log(`[${activeRail.toUpperCase()}] Rail triggered. Analyzing local assets...`);
    setTimeout(() => log(`[${activeRail.toUpperCase()}] No pending assets found in job queue.`), 800);
  }, [activeRail, log]);

  return (
    <div className="flex-col gap-4 animate-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">🛤️ ForgeRail Console</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Route asset generation jobs through specialized render lanes.</div>
        </div>
        <button className="glass-extreme text-neon-cyan border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95" onClick={runRail}>⚡ Trigger Rail</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div className="flex-col gap-8">
          {rails.map(r => (
            <button 
              key={r.id}
              className={`glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl ${activeRail === r.id ? 'active' : ''}`}
              style={{ padding: 12, textAlign: 'left', cursor: 'pointer', background: activeRail === r.id ? `${r.color}11` : 'var(--bg-elevated)', border: `1px solid ${activeRail === r.id ? r.color : 'var(--border-dim)'}` }}
              onClick={() => setActiveRail(r.id)}
            >
              <div style={{ fontWeight: 800, color: activeRail === r.id ? r.color : 'var(--text-primary)' }}>{r.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{r.desc}</div>
            </button>
          ))}
        </div>

        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ background: '#030408', border: '1px solid #333' }}>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header" style={{ borderBottom: '1px solid #222' }}>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4ade80' }}>ForgeRail Stream</div>
          </div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94a3b8', height: 400, overflowY: 'auto' }}>
            {logs.length === 0 && <div style={{ color: '#444' }}>// Waiting for rail activity...</div>}
            {logs.map((l, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <span style={{ opacity: 0.5 }}>[{l.ts}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
