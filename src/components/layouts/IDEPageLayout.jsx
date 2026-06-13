import React from 'react';
import { motion } from 'framer-motion';

/**
 * IDE Page Layout Wrapper (Remastered)
 * Standardizes the layout of all dashboard pages to look like premium IDE editor panels.
 * Injects global page transitions and an ambient, living background.
 */
export function IDEPageLayout({ title, description, actions, children, noPadding = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
        background: 'transparent', position: 'relative', overflow: 'hidden'
      }}
    >
      {/* Ambient "Living" Mesh Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.15 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vh', background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 60%)', filter: 'blur(100px)', mixBlendMode: 'screen', animation: 'ambientPulse1 14s infinite alternate ease-in-out' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vh', background: 'radial-gradient(circle, rgba(138,43,226,0.3) 0%, transparent 60%)', filter: 'blur(120px)', mixBlendMode: 'screen', animation: 'ambientPulse2 18s infinite alternate ease-in-out' }} />
      </div>

      <style>{`
        @keyframes ambientPulse1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          100% { transform: translate(5%, 5%) scale(1.1); opacity: 0.9; }
        }
        @keyframes ambientPulse2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          100% { transform: translate(-5%, -5%) scale(1.2); opacity: 0.8; }
        }
      `}</style>

      {/* Editor Header / Breadcrumb Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(180deg, rgba(8,8,12,0.8) 0%, rgba(8,8,12,0.4) 100%)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        flexShrink: 0, zIndex: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ 
            fontSize: 16, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', 
            display: 'flex', alignItems: 'center', gap: 12,
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            <div style={{ width: 4, height: 16, background: '#00f0ff', borderRadius: 2, boxShadow: '0 0 10px #00f0ff' }} />
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em' }}>
              {description}
            </div>
          )}
        </div>
        
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {actions}
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: noPadding ? 0 : 32,
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </div>
    </motion.div>
  );
}

export default IDEPageLayout;
