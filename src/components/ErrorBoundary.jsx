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
          minHeight: '100%', padding: 48, background: '#0a0e1a', color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: 520, width: '100%', background: '#111827', border: '1px solid #1e293b',
            borderRadius: 16, padding: 40, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
              Component Error
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              {this.props.fallbackMessage || 'This section encountered an error and was safely contained.'}
            </p>
            <pre style={{
              textAlign: 'left', fontSize: 11, color: '#ef4444', background: '#0f172a',
              border: '1px solid #1e293b', borderRadius: 8, padding: 16, marginBottom: 24,
              overflow: 'auto', maxHeight: 120, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={this.handleReset}
              style={{
                background: '#6366f1', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 24px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
