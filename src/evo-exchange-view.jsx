/**
 * PromptHouse Evo Studio — Evo Exchange View
 * Owner: Evo | Truth State: built
 */
import React, { useState, useEffect } from 'react';
import { BRIDGE_URL } from './config/bridge-config.js';
import { useSovereignStore } from './store.js';

export function EvoExchangeView() {
  const [recipes, setRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(BRIDGE_URL + '/api/exchange/listings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.result) {
          setRecipes(data.result);
        }
        setLoading(false);
      })
      .catch(err => {
        void('Failed to load listings', err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'agent', label: 'Agents' },
    { id: 'extension', label: 'Extensions' },
    { id: 'template', label: 'Templates' },
  ];

  const filtered = activeCategory === 'all' 
    ? recipes 
    : recipes.filter(r => (r.type || 'template') === activeCategory);

  return (
    <div className="flex flex-col gap-4 animate-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">🏪 Evo Exchange</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Private marketplace for your tools, agents, and templates. Gated until Commerce Rail is live.</div>
        </div>
        <button className="glass-extreme text-fuchsia-400 border border-fuchsia-500/30 hover:border-fuchsia-400 transition-all shadow-[0_0_15px_rgba(217,70,239,0.1)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-fuchsia-500/10 hover:scale-[1.02] active:scale-95 glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm" onClick={() => useSovereignStore.getState().addNotification({ msg: 'Publishing to public exchange requires Enterprise Sovereignty.', type: 'warning' })}>
          🌐 Go Public
        </button>
      </div>

      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        {categories.map(c => (
          <button 
            key={c.id} 
            className={`tab-glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95 ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">🏪</div>
            <div className="empty-title">No assets found</div>
            <div className="empty-sub">Capture signals and generate recipes to see them here.</div>
          </div>
        ) : filtered.map(r => (
          <div key={r.id} className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl bot-glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ '--bot-accent': '#38bdf8' }}>
            <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex flex-col gap-4 gap-12">
              <div className="flex items-center justify-between">
                <span className="badge badge-cyan">{r.type || 'template'}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{r.consentScope || 'private'}</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {(r.instructions || r.signature || '').slice(0, 100)}...
                </div>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-dim)' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-gold)' }}>$0.00</span>
                <button className="bg-[#f5c842] text-black font-bold py-1 px-3 rounded shadow-[0_0_15px_rgba(245,200,66,0.3)] text-xs uppercase" onClick={() => void('Selling module...')}>Sell Module</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ marginTop: 24, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Marketplace Commerce Blocked</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Live transactions and public listings are currently disabled. 
            To enable, configure your Stripe API keys in the <strong>Commerce Rail</strong> and obtain owner approval.
          </div>
        </div>
      </div>
    </div>
  );
}
