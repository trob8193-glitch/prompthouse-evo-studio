/**
 * PromptHouse Evo Studio — Evo Exchange View
 * Owner: Evo | Truth State: built
 */
import React, { useState, useEffect } from 'react';
import { getAllRecipes } from './worktwin-vault.js';

export function EvoExchangeView() {
  const [recipes, setRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'agent', label: 'Agents' },
    { id: 'extension', label: 'Extensions' },
    { id: 'template', label: 'Templates' },
  ];

  const filtered = activeCategory === 'all' 
    ? recipes 
    : recipes.filter(r => r.type === activeCategory);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🏪 Evo Exchange</div>
          <div className="page-subtitle">Private marketplace for your tools, agents, and templates. Gated until Commerce Rail is live.</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => alert('Publishing to public exchange requires Enterprise Sovereignty.')}>
          🌐 Go Public
        </button>
      </div>

      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        {categories.map(c => (
          <button 
            key={c.id} 
            className={`tab-btn ${activeCategory === c.id ? 'active' : ''}`}
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
          <div key={r.id} className="card bot-card" style={{ '--bot-accent': '#38bdf8' }}>
            <div className="card-body flex-col gap-12">
              <div className="flex-between">
                <span className="badge badge-cyan">{r.type}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{r.status}</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {r.promptRecipe?.slice(0, 100)}...
                </div>
              </div>
              <div className="flex-between" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-dim)' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-gold)' }}>$0.00</span>
                <button className="btn btn-secondary btn-sm" disabled>🔒 Blocked</button>
              </div>
            </div>
          </div>
        ))}

        {/* Example Premium Listings (Mocked) */}
        <div className="card bot-card" style={{ '--bot-accent': '#f5c842', opacity: 0.8 }}>
          <div className="card-body flex-col gap-12">
            <div className="flex-between">
              <span className="badge badge-violet">PREMIUM</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Official</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Omnipotent Agent V3</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                The ultimate autonomous builder agent with full file-system and terminal access.
              </div>
            </div>
            <div className="flex-between" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-dim)' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-gold)' }}>$49.99</span>
              <button className="btn btn-secondary btn-sm" disabled>🔒 Blocked</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: 24 }}>
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
