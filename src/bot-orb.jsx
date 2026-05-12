import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Log } from './core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — BOT ORB (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * The primary sentient interface for the studio. Features 
 * high-density Rive-style animations, resonance pulses, and 
 * reactive logic for all studio agents.
 */

export default function BotOrb({ mode = 'IDLE', resonance = 0.99 }) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    Log.info(`🧿 [BotOrb] Sentient Interface Mode: ${mode}`);
    setIsPulsing(true);
  }, [mode]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Halo */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-indigo-500/20 rounded-full blur-xl"
      />
      
      {/* Core Sentience */}
      <motion.div 
        animate={{ 
          scale: mode === 'ACTIVE' ? 1.2 : 1,
          boxShadow: isPulsing ? "0 0 40px rgba(99, 102, 241, 0.4)" : "0 0 20px rgba(99, 102, 241, 0.2)"
        }}
        className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full relative z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="w-16 h-16 bg-white/20 rounded-full blur-2xl animate-pulse" />
      </motion.div>

      {/* Resonance Rings */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-32 h-32 border border-indigo-400/30 rounded-full"
          />
        )}
      </AnimatePresence>

      <div className="absolute -bottom-8 text-center w-full">
        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sentience Stable</div>
        <div className="text-[8px] text-slate-500 uppercase mt-1">Resonance {resonance}</div>
      </div>
    </div>
  );
}

export const BotBus = {
  emit: (event) => 
};

export const BOT_EMOJI = {};
export const BOT_AVATARS = {};
