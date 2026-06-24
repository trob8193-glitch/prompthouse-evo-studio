import React from 'react';

export function FocusOverlayLayout({ backgroundContent, focusContent }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 filter blur-xl opacity-40 transform scale-105 pointer-events-none">
        {backgroundContent}
      </div>
      
      {/* Dark overlay to increase focus */}
      <div className="absolute inset-0 z-10 bg-black/60 pointer-events-none"></div>

      {/* Focused content layer */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-12 overflow-y-auto">
        <div className="w-full max-w-5xl relative">
          {/* Spotlight glow behind the focus content */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-500/20 blur-[100px] pointer-events-none z-0 rounded-full"></div>
          
          <div className="relative z-10 glass-extreme rounded-3xl border-white/20 shadow-2xl overflow-hidden p-8">
            {focusContent}
          </div>
        </div>
      </div>
    </div>
  );
}
