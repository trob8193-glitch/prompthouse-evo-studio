import React from 'react';

/**
 * PH EVO STUDIO — SCREEN TEMPLATE
 * ═══════════════════════════════════════════════════════════════
 * Standard wrapper for all major studio screens.
 */
export default function ScreenTemplate({ title, subtitle, children }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 900, 
          color: '#f8fafc', 
          margin: 0, 
          letterSpacing: '-0.8px',
          background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 6, fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </header>
      
      <div className="screen-content">
        {children}
      </div>
    </div>
  );
}
