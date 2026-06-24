import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SovereignTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="flex flex-col gap-4 gap-4 h-full overflow-hidden relative">
      {/* 3D Orbital Dock Container */}
      <div 
        className="flex items-center justify-center p-6 w-full shrink-0 relative z-20"
        style={{ perspective: '1200px' }}
      >
        <div 
          className="flex gap-4 p-3 bg-black/40 backdrop-blur-2xl rounded-full border-t border-b border-cyan-500/30 shadow-[0_20px_50px_rgba(0,240,255,0.15)]"
          style={{ transform: 'rotateX(15deg)', transformStyle: 'preserve-3d' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                  isActive 
                    ? 'text-white scale-110 shadow-[0_0_30px_rgba(0,240,255,0.6)]' 
                    : 'text-cyan-900 hover:text-cyan-400 hover:scale-105'
                }`}
                style={{
                  transform: isActive ? 'translateZ(30px)' : 'translateZ(0px)',
                  background: isActive ? 'linear-gradient(180deg, rgba(0,240,255,0.2) 0%, rgba(0,0,0,0.8) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,240,255,0.8)' : '1px solid transparent'
                }}
              >
                {/* Active Light Beam */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -bottom-4 left-1/2 w-16 h-1 bg-cyan-400 rounded-full blur-sm"
                    style={{ translateX: '-50%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                )}
                {/* Active Underglow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnder"
                    className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                )}
                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] flex items-center gap-2">
                  {tab.icon && <tab.icon size={14} />} {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Holographic Content Projection area */}
      <div className="flex-1 relative z-10 mt-[-20px] pt-10 px-6 overflow-hidden">
        {/* Hologram top edge beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[30px] bg-linear-to-b from-cyan-500/10 to-transparent blur-md" />
        
        <div className="h-full overflow-y-auto custom-scrollbar pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, rotateX: 10 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              style={{ transformOrigin: 'top center', perspective: '1000px' }}
              className="h-full"
            >
              <div className="h-full bg-black/20 rounded-3xl border-white/5 backdrop-blur-sm p-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
                {tabs.find((t) => t.id === activeTab)?.component}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
