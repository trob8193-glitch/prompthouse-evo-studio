import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Zap, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';

export function ProofToValueView() {
  const [proofs] = useState([
    { id: 'proof_1', type: 'deploy', amount: 1500, claim: 'Deployed OmniOrchestrator to Production', timestamp: '2 mins ago', status: 'verified' },
    { id: 'proof_2', type: 'feature', amount: 800, claim: 'Implemented neural split-tether bus', timestamp: '1 hour ago', status: 'verified' },
    { id: 'proof_3', type: 'audit', amount: 200, claim: 'Nuclear Security Audit Passed', timestamp: '3 hours ago', status: 'verified' },
    { id: 'proof_4', type: 'commerce', amount: 450, claim: 'Stripe Rail Checkout Session Created', timestamp: 'Pending Verification...', status: 'pending' },
  ]);

  const verifiedValue = proofs.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
  const pendingValue = proofs.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
      
      <div className="p-8 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-teal-400 flex items-center gap-3">
            <Wallet size={24} className="text-emerald-400" />
            Proof-to-Value Ledger
          </h2>
          <p className="text-sm text-emerald-500/50 mt-1 uppercase tracking-widest font-bold">Immutable Value Generation Tracking</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="text-emerald-400 font-bold tracking-wider text-sm">CRYPTOGRAPHICALLY VERIFIED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-black/20">
        <div className="bg-black/60 border border-[rgba(255,255,255,0.05)] rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full transform scale-150"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 z-10">Total Verified Value</span>
          <div className="text-6xl font-black text-white font-mono z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center">
            <span className="text-emerald-500 mr-2">$</span>
            {verifiedValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-black/60 border border-[rgba(255,255,255,0.05)] rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full transform scale-150"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 z-10">Pending Settlement</span>
          <div className="text-5xl font-black text-slate-300 font-mono z-10 flex items-center">
            <span className="text-amber-500 mr-2">$</span>
            {pendingValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-0">
        <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-widest border-b border-[rgba(255,255,255,0.05)] pb-2">Recent Value Proofs</h3>
        <div className="space-y-4">
          {proofs.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={p.id} 
              className={`flex justify-between items-center bg-black/40 p-5 rounded-2xl border ${p.status === 'verified' ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-amber-500/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {p.type === 'deploy' ? <Zap size={18} /> : <DollarSign size={18} />}
                </div>
                <div>
                  <div className={`text-sm font-bold ${p.status === 'verified' ? 'text-gray-200' : 'text-gray-400'}`}>{p.claim}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{p.timestamp}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full ${p.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {p.status}
                </div>
                <div className={`text-xl font-mono font-bold ${p.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  +${p.amount}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
            View Full Ledger <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
