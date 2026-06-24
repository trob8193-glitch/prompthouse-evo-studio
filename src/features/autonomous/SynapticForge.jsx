import React from 'react';

export default function SynapticForge() {
  return (
    <div className="w-full h-full flex-col gap-4 p-8 bg-linear-to-br from-indigo-900/40 via-purple-900/10 to-black overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-scan opacity-30 pointer-events-none mix-blend-overlay"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500 tracking-tight drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
          Synaptic Forge
        </h1>
        <div className="flex gap-4">
          <button className="glass-extreme px-6 py-2 rounded-3xl text-pink-400 font-bold tracking-widest text-sm hover:bg-pink-500/20 transition-all border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]" onClick={() => { const textarea = document.querySelector('textarea'); if (textarea?.value) { void('[SynapticForge] Compiling prompt:', textarea.value.substring(0, 100)); } }}>
            COMPILE
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 relative z-10">
        {/* Prompt Builder Area */}
        <div className="flex-2 flex-col gap-4">
          <div className="text-xs font-bold text-purple-300 uppercase tracking-[0.2em]">Prompt Architecture</div>
          <div className="flex-1 glass-extreme rounded-2xl border-2 border-purple-500/20 p-6 flex-col hover:border-purple-500/50 transition-colors shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]">
            <textarea 
              className="w-full h-full bg-transparent resize-none outline-none text-white font-mono text-lg"
              placeholder="// Insert foundational thought vectors here..."
            ></textarea>
            <div className="mt-4 flex justify-between items-center text-xs text-purple-400 font-mono">
              <span>Tokens: 0 / 8192</span>
              <span>Model: OMNI-SYNAPSE-V4</span>
            </div>
          </div>
        </div>

        {/* Forge Modules */}
        <div className="flex-1 flex-col gap-4">
          <div className="text-xs font-bold text-pink-300 uppercase tracking-[0.2em]">Active Catalysts</div>
          
          <div className="glass-extreme rounded-3xl p-4 border-pink-500/20 hover:border-pink-500/50 cursor-pointer transform hover:translate-x-2 transition-all">
            <h3 className="font-bold text-pink-400 mb-1">Reasoning Engine</h3>
            <p className="text-xs text-dim">Injects extreme multi-step deduction logic into the prompt context.</p>
          </div>
          
          <div className="glass-extreme rounded-3xl p-4 border-purple-500/20 hover:border-purple-500/50 cursor-pointer transform hover:translate-x-2 transition-all">
            <h3 className="font-bold text-purple-400 mb-1">Creative Overdrive</h3>
            <p className="text-xs text-dim">Bypasses standard temperature limits. Hallucinations expected and encouraged.</p>
          </div>

          <div className="glass-extreme rounded-3xl p-4 border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer transform hover:translate-x-2 transition-all opacity-50 border-dashed">
            <h3 className="font-bold text-cyan-400 mb-1">+ ADD CATALYST</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
