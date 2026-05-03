import React from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Activity, Shield, Zap } from 'lucide-react';

export const ModularDashboard = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Command</h1>
          <p className="text-slate-400 mt-1">Autonomous Orchestration & Performance Deck</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
            <Shield size={14} /> SECURITY: VERIFIED
          </div>
          <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20 flex items-center gap-2">
            <Zap size={14} /> BRIDGE: ACTIVE
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-indigo-400" /> Active Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold">Training Vein</span>
                <p className="text-sm mt-1">Ingesting approved PromptLink data...</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold">Model Foundry</span>
                <p className="text-sm mt-1">DatasetForge: IDLE</p>
              </div>
            </div>
          </section>
          
          <section className="bg-slate-900 border border-slate-800 rounded-2xl">
            <PerformanceMonitor />
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="font-bold mb-2">Evo LM Sovereignty</h3>
            <p className="text-xs text-indigo-300 leading-relaxed">
              Your studio is currently operating in "No-Bullshit" mode. All claims are backed by proof receipts stored in your local Memory Box.
            </p>
            <button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg transition-colors">
              VIEW PROOF CONSOLE
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};