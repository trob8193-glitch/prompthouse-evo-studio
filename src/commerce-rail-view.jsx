/**
 * PromptHouse Evo Studio — Commerce Rail View
 * Owner: Compiler Bearcat | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { createCommerceProduct, createPricingTable } from './commerce-rail.js';

export function CommerceRailView() {
  const [mode, setMode] = useState('mock'); // mock | test | live
  const [form, setForm] = useState({ productName: 'PH Studio Pro', price: 2999, currency: 'usd', description: 'Access to all bots and sovereign modules.' });
  const [result, setResult] = useState(null);
  const [pricingTable, setPricingTable] = useState(null);

  useEffect(() => {
    setPricingTable(createPricingTable('local_session'));
  }, []);

  const generateProduct = useCallback(() => {
    const res = createCommerceProduct('local_session', { ...form, mode });
    setResult(res);
  }, [form, mode]);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">💵 Commerce Rail</div>
          <div className="page-subtitle">Product specs, checkout links, and pricing table generation. Live Stripe requires owner approval.</div>
        </div>
        <div className="flex-row gap-8">
          {['mock', 'test', 'live'].map(m => (
            <button 
              key={m} 
              className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode(m)}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="flex-col gap-16">
          <div className="card">
            <div className="card-header"><div className="card-title">Generate Product Link</div></div>
            <div className="card-body flex-col">
              <div className="field">
                <label className="field-label">Product Name</label>
                <input className="field-input" value={form.productName} onChange={e => setForm(f => ({...f, productName: e.target.value}))} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label className="field-label">Price (in cents)</label>
                  <input className="field-input" type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
                </div>
                <div className="field">
                  <label className="field-label">Currency</label>
                  <select className="field-select" value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Description</label>
                <textarea className="field-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={generateProduct}>💎 Generate Product Spec</button>
            </div>
          </div>

          {result && (
            <div className="card" style={{ border: result.blocked ? '1px solid #f87171' : '1px solid #4ade80' }}>
              <div className="card-header"><div className="card-title">{result.blocked ? '❌ Generation Blocked' : '✅ Generation Success'}</div></div>
              <div className="card-body flex-col">
                {result.blocked ? (
                  <div style={{ fontSize: 12, color: '#f87171' }}>{result.reason}</div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{result.receipt}</div>
                    <div className="field">
                      <label className="field-label">Payment Link</label>
                      <div className="flex-row gap-8">
                        <input className="field-input" readOnly value={result.mockLink} style={{ flex: 1 }} />
                        <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(result.mockLink)}>Copy</button>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Integration Code</label>
                      <div style={{ background: '#030408', padding: 12, borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4ade80', whiteSpace: 'pre-wrap' }}>
                        {result.injectionCode}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-col gap-16">
          <div className="card">
            <div className="card-header"><div className="card-title">Pricing Table Preview</div></div>
            <div className="card-body">
              {pricingTable ? (
                <div className="flex-col gap-12">
                  {pricingTable.tiers.map(t => (
                    <div key={t.name} className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                      <div className="card-body">
                        <div className="flex-between">
                          <span style={{ fontWeight: 800 }}>{t.name}</span>
                          <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>${(t.price / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex-col gap-4" style={{ marginTop: 8 }}>
                          {t.features.map(f => (
                            <div key={f} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>• {f}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">Loading pricing table...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
