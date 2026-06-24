import React from 'react';
import { motion } from 'framer-motion';

/**
 * IDE Page Layout Wrapper (Global Metamorphosis Engine)
 * Now permanently locked to the HYPER-DIMENSIONAL MASTER UI: Holographic AR Visor
 */
export function IDEPageLayout({ title, description, actions, children, noPadding = false }) {
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
        background: '#020205', position: 'relative', overflow: 'hidden',
        color: '#e2e8f0'
      }}
    >
      {/* Dynamic SVG Visor Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 240, 255, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)',
        transformOrigin: 'top center'
      }}>
        <div className="absolute inset-0 bg-linear-to-t from-[#020205] via-transparent to-[#020205]" />
      </div>

      {/* AR HUD Targeting Lines */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl z-0" />
      <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-xl z-0" />
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-xl z-0" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl z-0" />

      {/* Floating Holographic Island Header */}
      <div className="relative z-20 px-8 pt-8 pb-4 flex justify-center">
        <div className="w-full max-w-5xl flex items-center justify-between p-4 bg-black/60 backdrop-blur-3xl border-cyan-500/30 rounded-4xl shadow-[0_20px_60px_rgba(0,240,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-6 px-4">
            {/* Reactor Core Icon visual anchor */}
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <div className="absolute inset-2 bg-cyan-400 rounded-full blur-xs animate-pulse" />
              <div className="absolute inset-3 bg-white rounded-full shadow-[0_0_10px_white]" />
            </div>

            <div className="flex flex-col gap-4 gap-4">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-100 to-cyan-500 tracking-tight uppercase">
                {title}
              </div>
              {description && (
                <div className="text-xs text-cyan-500/70 font-bold tracking-[0.2em] uppercase mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  {description}
                </div>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-3 pr-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative z-10 custom-scrollbar" style={{ padding: noPadding ? 0 : '0 2rem 2rem' }}>
        <div className="max-w-[1600px] mx-auto h-full">
          {children}
        </div>
      </div>
      
      {/* Global CSS Overrides for this extreme mode */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.6); }
      `}</style>

    </motion.div>
  );
}

export default IDEPageLayout;
