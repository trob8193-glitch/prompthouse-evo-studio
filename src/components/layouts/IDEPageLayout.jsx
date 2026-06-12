import React from 'react';

/**
 * IDE Page Layout Wrapper
 * Standardizes the layout of all dashboard pages to look like IDE editor panels.
 */
export function IDEPageLayout({ title, description, actions, children, noPadding = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      background: 'transparent',
    }}>
      {/* Editor Header / Breadcrumb Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(5,5,8,0.5)', backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
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
        padding: noPadding ? 0 : 24,
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );
}

export default IDEPageLayout;
