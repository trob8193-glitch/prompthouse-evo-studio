import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignStore } from './store.js';

// Restored View Imports
import SovereignChat from './features/SovereignChat';
import RareCapabilities from './features/RareCapabilities';
import EvoEyesView from './features/EvoEyesView';

/**
 * PH EVO STUDIO — V3 MODULAR VIEWS (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Dynamic modular view engine. Renders the tactical, intelligence,
 * and history modules based on the active mission state.
 */

export default function V3Views() {
  const { activeTab } = useSovereignStore();

  return (
    <div className="h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {activeTab === 'chat' && <SovereignChat />}
          {activeTab === 'capabilities' && <RareCapabilities />}
          {activeTab === 'vision' && <EvoEyesView />}
          
          {activeTab === 'orchard' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">The Orchard</div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Connectome Active • Syncing Forest</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
