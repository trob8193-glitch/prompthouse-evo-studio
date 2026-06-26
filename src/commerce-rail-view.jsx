/**
 * PromptHouse Evo Studio — Commerce Rail View (V5 PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Professional monetization interface. Connected to StripeAdaptor.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Tag, Globe, CheckCircle, AlertTriangle, ExternalLink, DollarSign, Activity, Package } from 'lucide-react';
import { createCommerceProduct, createPricingTable } from './commerce-rail.js';

import { Log } from './core/autonomy/SovereignLogger.js';

export function CommerceRailView() {
  const [form, setForm] = useState({ 
    productName: 'PH Studio Pro', 
    price: 29900, 
    currency: 'usd', 
    description: 'Access to all evo studio modules and autonomous evolution features.' 
  });
  const [result, setResult] = useState(null);
  const [pricingTable, setPricingTable] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPricing = useCallback(async () => {
    try {
      const table = await createPricingTable();
      if (table && table.tiers) setPricingTable(table);
    } catch (e) {
      Log.error('Failed to fetch pricing:', e);
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
    <div className="flex flex-col gap-6 animate-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4 shrink-0">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-teal-500 tracking-tighter mb-1 flex items-center gap-2">
            <CreditCard size={28} className="text-emerald-400" /> Commerce Rail
          </div>
          <div className="text-xs font-bold text-emerald-500/50 uppercase tracking-widest">
            Generate professional product specs and live Stripe checkout sessions.
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 min-h-0">
        {/* Product Generation */}
        <div className="flex flex-col gap-6">
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(16,185,129,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} className="text-indigo-400" /> Generate Product Spec
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Product Name</label>
                <div className="relative">
                  <input 
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-bold" 
                    value={form.productName} 
                    onChange={e => setForm(f => ({...f, productName: e.target.value}))} 
                  />
                  <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Price (cents)</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-bold" 
                      type="number" 
                      value={form.price} 
                      onChange={e => setForm(f => ({...f, price: parseInt(e.target.value)}))} 
                    />
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Currency</label>
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-bold appearance-none cursor-pointer uppercase tracking-widest" 
                    value={form.currency} 
                    onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                  >
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-bold resize-none custom-scrollbar" 
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm(f => ({...f, description: e.target.value}))} 
                />
              </div>

              <button 
                onClick={generateProduct} 
                disabled={loading}
                className={`mt-2 py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                  loading
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}
              >
                {loading ? <Activity size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {loading ? 'Generating...' : 'Generate Checkout Session'}
              </button>
            </div>
          </div>

          {result && (
            <div className={`glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(16,185,129,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 border ${result.success ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className="bg-white/5 border-b border-white/5 p-5">
                <div className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.success ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  {result.success ? 'Checkout Ready' : 'Generation Failed'}
                </div>
              </div>
              
              <div className="p-6">
                {result.success ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#0a0a0f] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono">
                      <span className="text-slate-500 font-bold uppercase tracking-widest shrink-0">Session ID:</span>
                      <code className="text-indigo-400 font-bold truncate break-all">{result.sessionId}</code>
                    </div>
                    
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-all rounded-xl py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    >
                      Launch Checkout <ExternalLink size={14} />
                    </a>
                    
                    <div className="bg-[#0a0a0f] border border-white/5 rounded-xl p-4 flex flex-col gap-2 text-[11px] font-mono">
                      <label className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Integration Code</label>
                      <pre className="text-green-400 m-0 overflow-x-auto custom-scrollbar pb-2">{result.injectionCode}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-[11px] text-red-400 font-mono font-bold leading-relaxed break-words">
                    {result.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Table Preview */}
        <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(16,185,129,0.05)] bg-[#030408] border-2 border-white/5 backdrop-blur-xl flex flex-col overflow-hidden relative min-h-[500px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="bg-white/5 border-b border-white/5 p-5 relative z-10">
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> Pricing Table Preview
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col gap-5">
            {pricingTable ? pricingTable.tiers.map((tier, i) => (
              <div key={i} className="bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all rounded-2xl p-6 group shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-200 group-hover:text-white transition-colors tracking-tight mb-1">{tier.name}</h3>
                    <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">${(tier.price / 100).toFixed(2)}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Enterprise
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-6">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-3 text-[11px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" /> 
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-white/10 rounded-3xl p-12 bg-black/20">
                <Activity size={32} className="animate-spin opacity-50 text-emerald-500 mb-4" />
                <div className="text-sm font-bold text-slate-300">Loading pricing data...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommerceRailView;
