import React from 'react';
import { Globe, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

export default function OmniMarketplaceNexus() {
  return (
    <IDEPageLayout
      title={<><Globe color="#ffaa00" size={18} /> Omni-Marketplace Nexus</>}
      description="Omni-Fusion Node: Combines Commerce, Module Marketplace, Studio Listings, and SaaS Checkout logic into one master exchange."
      actions={
        <button className="glass-extreme text-amber-400 hover:border-amber-400/80 transition-all rounded-xl px-4 py-2 text-xs font-black inline-flex items-center gap-2" onClick={() => { safeFetchBridge('/api/stripe/health').then(d => console.log('[Commerce] Ledger:', d)).catch(() => {}); }}>
          <DollarSign size={14} /> View Ledger
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2">
        
        {/* Marketplace Hub */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 bg-black/40 backdrop-blur-xl flex-col h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <Package color="#ffaa00" size={24} />
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Available Modules</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             {[1, 2, 3].map(i => (
               <div key={i} className="p-4 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center">
                 <div>
                   <div className="text-sm font-black text-white mb-1">Quantum Encryption Node {i}</div>
                   <div className="text-xs text-gray-400 font-semibold">Military-grade hashing for SaaS payloads.</div>
                 </div>
                 <div className="text-amber-400 font-black text-sm">$49.99</div>
               </div>
             ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 flex-col justify-center">
          <DollarSign color="#00ff88" size={24} className="mb-4" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gross Volume</div>
          <div className="text-3xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">$12,450.00</div>
        </div>
        
        {/* Subscriptions */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 flex-col justify-center">
          <ShoppingCart color="#8a2be2" size={24} className="mb-4" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active SaaS Subs</div>
          <div className="text-3xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(138,43,226,0.3)]">142</div>
        </div>

        {/* Pricing & Checkout Settings */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 bg-black/40">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">Commerce Firewall</h2>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Stripe Gateway</span>
                <span className="text-xs font-black text-green-400 px-3 py-1 rounded-full bg-green-400/10 border-green-400/30">CONNECTED</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Fraud Sentinel</span>
                <span className="text-xs font-black text-green-400 px-3 py-1 rounded-full bg-green-400/10 border-green-400/30">ACTIVE</span>
             </div>
          </div>
          <button className="w-full mt-6 glass-extreme text-amber-400 hover:border-amber-400/80 transition-all rounded-xl px-4 py-3 text-xs font-black inline-flex items-center justify-center gap-2" onClick={() => { safeFetchBridge('/api/stripe/health').then(d => console.log('[Commerce] Gateway config:', d)).catch(() => {}); }}>
            Configure Gateways
          </button>
        </div>

      </div>
    </IDEPageLayout>
  );
}
