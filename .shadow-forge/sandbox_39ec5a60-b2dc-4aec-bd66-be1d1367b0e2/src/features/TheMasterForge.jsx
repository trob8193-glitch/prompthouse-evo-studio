import React from 'react';
import { Hammer, CloudLightning, Shield, LayoutTemplate } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { useSovereignStore } from '../store.js';

export default function TheMasterForge() {
  const addTerminalCommand = useSovereignStore(s => s.addTerminalCommand);

  const handleDeploy = () => {
    addTerminalCommand('npm run build && echo "Deployment sent to Singularity Engine"');
  };
  return (
    <IDEPageLayout
      title={<><Hammer color="#ff3366" size={18} /> The Master Forge</>}
      description="Omni-Fusion Node: Combines Feature Foundry, SaaS Builder, Launch Proofs, Proof Center, and Deployment logic into the ultimate creation nexus."
      actions={
        <button 
          onClick={handleDeploy}
          className="glass-extreme text-rose-400 hover:border-rose-400/80 hover:bg-rose-900/20 transition-all rounded-xl px-4 py-2 text-xs font-black inline-flex items-center gap-2"
        >
          <CloudLightning size={14} /> Deploy to Singularity
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2">
        
        {/* The Foundry */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 bg-black/40 backdrop-blur-xl flex-col h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <LayoutTemplate color="#ff3366" size={24} />
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Feature Foundry</h2>
          </div>
          <div className="flex-1 border-white/10 rounded-2xl bg-black/60 p-4 relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-rose-900/20 via-black to-black"></div>
             <div className="relative text-center">
                <Hammer className="mx-auto mb-4 animate-bounce" color="#ff3366" size={32} />
                <div className="text-sm font-black text-white uppercase tracking-widest mb-2">Drop Code to Forge</div>
                <div className="text-xs text-gray-500 font-bold">The AI will automatically structure, style, and wire it.</div>
             </div>
          </div>
        </div>

        {/* Proof State */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 flex-col justify-center">
          <Shield color="#00ff88" size={24} className="mb-4" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Launch Proof</div>
          <div className="text-3xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">CRYPTOGRAPHIC</div>
        </div>
        
        {/* Deployment Status */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 flex-col justify-center">
          <CloudLightning color="#00f0ff" size={24} className="mb-4" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Build Pipeline</div>
          <div className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">READY</div>
        </div>

        {/* SaaS Configuration */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 bg-black/40">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">SaaS Payload Config</h2>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Authentication</span>
                <span className="text-xs font-black text-purple-400">Firebase Auth</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Database</span>
                <span className="text-xs font-black text-cyan-400">Firestore (Rules Locked)</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Edge Routing</span>
                <span className="text-xs font-black text-green-400">Cloudflare</span>
             </div>
          </div>
        </div>

      </div>
    </IDEPageLayout>
  );
}
