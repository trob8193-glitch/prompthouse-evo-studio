import React, { useMemo } from 'react';
import { motion as fm, AnimatePresence } from 'framer-motion';
import { useEvoStore } from '../store.js';
import { BOT_ROSTER } from '../engine.js';

// Mapping views to bots (matching bot-orb logic)
const VIEW_BOT_MAP = {
  builder:   'evo',
  mission:   'conductor',
  chain:     'builder',
  vault:     'memory',
  battle:    'verifier',
  export:    'ledger',
  chat:      'evo',
  intent:    'companion',
  dna:       'verifier',
  templates: 'memory',
  repair:    'dev',
  botstage:  'sovereignty',
  agentctl:  'heartbeat',
  autobuilder: 'builder',
  code:      'dev',
  arch:      'conductor',
  cli:       'builder',
  flutter:   'dev',
  packs:     'evo',
  cast:      'sovereignty',
  modules:   'ledger',
  history:   'memory',
};

// Fallback palette if a bot is missing
const DEFAULT_PALETTE = { accent: '#f5c842' };

export function GlobalCommandBorder({ children }) {
  const { activeView, appMotionState, animationIntensity, reducedMotion, cinematicMode } = useEvoStore();
  
  const botId = VIEW_BOT_MAP[activeView] || 'evo';
  const bot = BOT_ROSTER.find(b => b.id === botId) || { palette: DEFAULT_PALETTE };
  const color = bot.palette.accent;

  // Determine border state based on user settings and app state
  const isReduced = reducedMotion || animationIntensity === 0;
  
  const speedMap = { idle: 4, active: 2.5, live: 1.5 };
  const duration = isReduced ? 0 : (speedMap[appMotionState] || 3) * (100 / Math.max(animationIntensity, 1));
  
  const thicknessMap = { idle: 2, active: 4, live: 6 };
  const thickness = isReduced ? 2 : (thicknessMap[appMotionState] || 2);

  // Box shadow intensity mapping
  const glowMap = { idle: 0.2, active: 0.4, live: 0.7 };
  const glowAlpha = isReduced ? 0 : (glowMap[appMotionState] * (animationIntensity / 100));

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-void)' }}>
      {/* Background Cinematic Energy */}
      {cinematicMode && !isReduced && (
        <AnimatePresence mode="wait">
          <fm.div
            key={`bg-${botId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: glowAlpha * 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 60%)`,
              zIndex: 0
            }}
          />
        </AnimatePresence>
      )}

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>

      {/* Animated Edge Border */}
      <AnimatePresence mode="popLayout">
        <fm.div
          key={`border-${botId}`}
          initial={{ borderColor: 'transparent', boxShadow: 'none' }}
          animate={{
            borderColor: [color, `${color}44`, color],
            boxShadow: [
              `inset 0 0 0px ${color}00`,
              `inset 0 0 ${thickness * 4}px rgba(${hexToRgb(color)}, ${glowAlpha})`,
              `inset 0 0 0px ${color}00`
            ]
          }}
          exit={{ borderColor: 'transparent', boxShadow: 'none' }}
          transition={{
            duration: duration,
            repeat: isReduced ? 0 : Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderStyle: 'solid',
            borderWidth: thickness,
            zIndex: 9999, // On top of everything except maybe extreme modals
          }}
        />
      </AnimatePresence>
    </div>
  );
}

// Utility to convert hex to RGB for rgba strings
function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `${r}, ${g}, ${b}`;
}
