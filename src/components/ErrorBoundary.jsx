import React from 'react';

/**
 * PH EVO STUDIO — ERROR BOUNDARY
 * ═══════════════════════════════════════════════════════════════
 * Catches render-time crashes in any child tree and displays
 * a professional recovery UI instead of a white screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100%', padding: 48, background: 'var(--bg-deep)', color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
        }}>
          <div style={{
            maxWidth: 520, width: '100%',
            background: 'rgba(15, 10, 30, 0.72)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid var(--accent-red)',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.18), 0 8px 32px rgba(0,0,0,0.6)',
            borderRadius: 20, padding: 40, textAlign: 'center',
          }}>
            {/* Glowing header bar */}
            <div style={{
              width: 56, height: 56, margin: '0 auto 20px',
              background: 'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)',
              border: '1px solid var(--accent-red)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 26,
              boxShadow: '0 0 20px rgba(239,68,68,0.4)',
            }}>⚠️</div>

            <h2 style={{
              color: 'var(--text-primary)', fontSize: 18, fontWeight: 800,
              marginBottom: 8, letterSpacing: '-0.02em',
            }}>
              Component Error
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              {this.props.fallbackMessage || 'This section encountered an error and was safely contained.'}
            </p>

            {/* Error message block */}
            <pre style={{
              textAlign: 'left', fontSize: 11, color: 'var(--accent-red)',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: 16, marginBottom: 28,
              overflow: 'auto', maxHeight: 120, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>

            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, var(--accent-red), rgba(239,68,68,0.7))',
                color: 'var(--text-primary)', border: '1px solid var(--accent-red)',
                borderRadius: 10, padding: '10px 28px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
                boxShadow: '0 0 16px rgba(239,68,68,0.3)',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(239,68,68,0.55)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(239,68,68,0.3)'}
            >
              ↺ Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
