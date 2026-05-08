/**
 * PromptHouse Evo Studio — Commerce Rail View (V5 PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Professional monetization interface. Connected to StripeAdaptor.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Tag, Globe, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { createCommerceProduct, createPricingTable } from './commerce-rail.js';

export function CommerceRailView() {
  const [form, setForm] = useState({ 
    productName: 'PH Studio Pro', 
    price: 29900, 
    currency: 'usd', 
    description: 'Access to all sovereign studio modules and autonomous evolution features.' 
  });
  const [result, setResult] = useState(null);
  const [pricingTable, setPricingTable] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPricing = useCallback(async () => {
    try {
      const table = await createPricingTable();
      if (table && table.tiers) setPricingTable(table);
    } catch (e) {
      console.error('Failed to fetch pricing:', e);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const generateProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await createCommerceProduct('local_session', form);
      setResult(res);
    } catch (e) {
      setResult({ success: false, error: e.message });
    }
    setLoading(false);
  }, [form]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Commerce Rail</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Generate professional product specs and live Stripe checkout sessions.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        {/* Product Generation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Tag size={18} color="#6366f1" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Generate Product Spec</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Product Name</label>
                <input 
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }}
                  value={form.productName} 
                  onChange={e => setForm(f => ({...f, productName: e.target.value}))} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Price (cents)</label>
                  <input 
                    style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }}
                    type="number" 
                    value={form.price} 
                    onChange={e => setForm(f => ({...f, price: parseInt(e.target.value)}))} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Currency</label>
                  <select 
                    style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }}
                    value={form.currency} 
                    onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                  >
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Description</label>
                <textarea 
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13, resize: 'none' }}
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm(f => ({...f, description: e.target.value}))} 
                />
              </div>

              <button 
                onClick={generateProduct} 
                disabled={loading}
                style={{ 
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#4f46e5', color: 'white', 
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {loading ? <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <CreditCard size={16} />}
                Generate Checkout Session
              </button>
            </div>
          </div>

          {result && (
            <div style={{ background: '#111827', border: `1px solid ${result.success ? '#22c55e44' : '#ef444444'}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                {result.success ? <CheckCircle size={18} color="#22c55e" /> : <AlertTriangle size={18} color="#ef4444" />}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                  {result.success ? 'Checkout Ready' : 'Generation Failed'}
                </h3>
              </div>
              
              {result.success ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Session ID: <code style={{ color: '#6366f1' }}>{result.sessionId}</code></div>
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ 
                      padding: '10px 14px', background: '#22c55e', color: 'white', borderRadius: 8, textAlign: 'center', 
                      fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    Launch Checkout <ExternalLink size={14} />
                  </a>
                  <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, border: '1px solid #1e293b' }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Integration Code</label>
                    <pre style={{ margin: 0, fontSize: 10, color: '#22c55e', overflowX: 'auto' }}>{result.injectionCode}</pre>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#ef4444' }}>{result.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Table Preview */}
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Globe size={18} color="#10b981" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Pricing Table Preview</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pricingTable ? pricingTable.tiers.map((tier, i) => (
              <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>{tier.name}</h3>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>${(tier.price / 100).toFixed(2)}</div>
                  </div>
                  <div style={{ padding: '4px 8px', background: '#10b98114', border: '1px solid #10b98144', borderRadius: 6, fontSize: 9, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Enterprise</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                      <CheckCircle size={12} color="#10b981" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 12 }}>Loading pricing data...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommerceRailView;
