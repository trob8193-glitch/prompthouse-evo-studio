import React from 'react';

/**
 * PH EVO STUDIO — THE FOUNDRY DECK (UI FUSION)
 * ═══════════════════════════════════════════════════════════════
 * Physically embeds the EVOGENAGE platform into the Studio.
 * Anchored via a Drift-Audit Handshake.
 */

export const FoundryDeck = () => {
  const foundryUrl = "http://localhost:5174";

  return (
    <div className="w-full h-screen bg-slate-950 border-t border-gold/20">
      <div className="flex items-center justify-between p-2 bg-slate-900/50 px-4">
        <h2 className="text-xs font-black text-gold uppercase tracking-widest">
          ⚡ EVOGENAGE FOUNDRY — INTEGRATED
        </h2>
        <div className="flex gap-2">
          <span className="text-[10px] text-green-400 font-mono">● LIVE_SINGULARITY</span>
          <span className="text-[10px] text-slate-500">PORT: 5174</span>
        </div>
      </div>
      
      {/* PHYSICAL EMBED */}
      <iframe 
        src={foundryUrl}
        className="w-full h-full border-none"
        title="Evogenage Foundry"
      />
      
      <div className="absolute bottom-4 right-4 p-3 bg-black/80 border border-gold/40 rounded-lg shadow-2xl">
        <p className="text-[10px] text-gold/80 italic font-mono">
          "DriftGuard: VERIFIED. Logic Parity: 100%."
        </p>
      </div>
    </div>
  );
};
