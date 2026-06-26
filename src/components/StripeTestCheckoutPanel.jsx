import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ExternalLink, ShoppingCart, Eye, ClipboardCheck } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { getStripeTestCheckoutReadiness, createStripeTestCheckoutSession } from '../services/stripe-checkout-client.js';
import { 
  createStripeBrowserRunRecord, 
  updateStripeBrowserRunManualStatus, 
  STRIPE_BROWSER_RUN_STATUSES 
} from '../services/stripe-checkout-browser-run-client.js';

export default function StripeTestCheckoutPanel() {
  const [readiness, setReadiness] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [browserRun, setBrowserRun] = useState(null);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getStripeTestCheckoutReadiness();
        if (cancelled) return;
        if (result.ok && result.data) {
          setReadiness(result.data);
        } else {
          setError(result.error || 'Failed to fetch Stripe readiness');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
        setPanelMounted(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCreateSession = async () => {
    setSessionLoading(true);
    setSessionResult(null);
    setBrowserRun(null);
    try {
      const result = await createStripeTestCheckoutSession(approvalEnvelope, {
        amount: 100,
        currency: 'usd'
      });
      setSessionResult(result);
    } catch (err) {
      setSessionResult({ ok: false, truthState: 'ERROR', error: err.message });
    } finally {
      setSessionLoading(false);
    }
  };

  const handleRecordBrowserRun = async () => {
    if (!sessionResult || !sessionResult.ok) return;
    setRecordingLoading(true);
    try {
      const result = await createStripeBrowserRunRecord(approvalEnvelope, sessionResult);
      if (result.ok) {
        setBrowserRun(result.record);
      }
    } catch (err) {
      console.error('Failed to record browser run:', err);
    } finally {
      setRecordingLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!browserRun) return;
    setVerificationLoading(true);
    try {
      const result = await updateStripeBrowserRunManualStatus(browserRun.id, status, 'Manual verification from Studio UI');
      if (result.ok) {
        setBrowserRun({ ...browserRun, status });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setVerificationLoading(false);
    }
  };

  const fluxGradient = useMemo(() => {
    if (readiness?.mode === 'test' && readiness?.ready) {
      return 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(16,185,129,0.16), rgba(244,114,182,0.12))';
    }
    if (error) {
      return 'linear-gradient(135deg, rgba(248,113,113,0.12), rgba(239,68,68,0.22))';
    }
    return 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(59,130,246,0.14))';
  }, [readiness, error]);

  const panelStyle = {
    position: 'relative',
    background: 'radial-gradient(circle at top left, rgba(59,130,246,0.14) 0, transparent 55%), radial-gradient(circle at bottom right, rgba(16,185,129,0.1) 0, transparent 55%), var(--bg-surface)',
    borderRadius: '18px',
    padding: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.45)',
    boxShadow: hovered
      ? '0 0 0 1px rgba(59,130,246,0.65), 0 18px 45px rgba(15,23,42,0.9)'
      : '0 14px 40px rgba(15,23,42,0.75)',
    backdropFilter: 'blur(18px)',
    transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 200ms ease, background 350ms ease',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
  };

  const neonRingStyle = {
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',
    background: readiness?.ready
      ? 'conic-gradient(from 140deg, rgba(56,189,248,0.16), rgba(59,130,246,0.65), rgba(244,114,182,0.3), rgba(34,197,94,0.4), rgba(56,189,248,0.2))'
      : 'conic-gradient(from 200deg, rgba(248,113,113,0.45), rgba(234,88,12,0.6), rgba(248,113,113,0.25))',
    WebkitMask:
      'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: panelMounted ? 0.85 : 0,
    transition: 'opacity 600ms ease-out',
    pointerEvents: 'none',
  };

  const gridOverlayStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(148,163,184,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.09) 1px, transparent 1px)',
    backgroundSize: '18px 18px',
    mixBlendMode: 'soft-light',
    opacity: 0.45,
    pointerEvents: 'none',
    zIndex: 0,
  };

  const holoSheenStyle = {
    position: 'absolute',
    inset: '-40%',
    background:
      'radial-gradient(circle at 0% 0%, rgba(96,165,250,0.2) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(16,185,129,0.18) 0, transparent 60%)',
    opacity: hovered ? 0.6 : 0.35,
    mixBlendMode: 'screen',
    transition: 'opacity 260ms ease',
    pointerEvents: 'none',
    zIndex: 0,
  };

  const headerChipStyle = {
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(148,163,184,0.9)',
    padding: '4px 9px',
    borderRadius: '999px',
    border: '1px solid rgba(148,163,184,0.55)',
    background:
      'linear-gradient(120deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))',
    boxShadow: '0 0 12px rgba(15,23,42,0.9)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const pulseDotStyle = (activeColor) => ({
    width: '7px',
    height: '7px',
    borderRadius: '999px',
    background: activeColor,
    boxShadow: `0 0 12px ${activeColor}`,
    position: 'relative',
  });

  const particleLayerStyle = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  };

  const particle = (top, left, delay, size, opacity, color) => ({
    position: 'absolute',
    top,
    left,
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    opacity,
    filter: 'blur(1px)',
    animation: `ph-orbit 10s linear infinite`,
    animationDelay: delay,
  });

  const { ready, truthState, mode, blockers } = readiness || {};

  const statusColor =
    ready && mode === 'test'
      ? 'var(--accent-green)'
      : error
        ? 'var(--accent-red)'
        : 'var(--accent-orange)';

  const stripeModeColor =
    mode === 'test'
      ? 'rgba(56,189,248,0.75)'
      : 'rgba(248,113,113,0.9)';

  return (
    <div
      id="stripe-test-checkout-panel"
      className={`ph-panel-shell nexus-shell anim-nexus fusion-hologram-tactical ${panelMounted ? 'anim-terminal' : ''}`}
      style={{
        ...panelStyle,
        backgroundImage: `${fluxGradient}, ${panelStyle.background}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        @keyframes ph-orbit {
          0% { transform: translate3d(0,0,0) scale(1); opacity: 0.4; }
          25% { transform: translate3d(10px,-6px,0) scale(1.1); opacity: 0.75; }
          50% { transform: translate3d(0,-12px,0) scale(0.9); opacity: 0.3; }
          75% { transform: translate3d(-8px,-4px,0) scale(1.05); opacity: 0.7; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: 0.4; }
        }

        @keyframes ph-pulse-soft {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(56,189,248,0.55); opacity: 0.8; }
          50% { transform: scale(1.28); box-shadow: 0 0 20px rgba(56,189,248,0.9); opacity: 1; }
        }

        @keyframes ph-gradient-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ph-holo-border {
          position: relative;
          border-radius: 999px;
          overflow: hidden;
        }
        .ph-holo-border::before {
          content: '';
          position: absolute;
          inset: -80%;
          background: conic-gradient(
            from 180deg,
            rgba(56,189,248,0.0),
            rgba(56,189,248,0.45),
            rgba(129,140,248,0.65),
            rgba(244,114,182,0.7),
            rgba(34,197,94,0.5),
            rgba(56,189,248,0.0)
          );
          opacity: 0.85;
          mix-blend-mode: screen;
          animation: ph-gradient-wave 14s linear infinite;
        }
        .ph-holo-border > * {
          position: relative;
          z-index: 1;
        }

        .ph-micro-press:active {
          transform: translateY(1px) scale(0.995);
          box-shadow: 0 6px 18px rgba(15,23,42,0.7);
        }

        .ph-soft-hover {
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        .ph-soft-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 35px rgba(15,23,42,0.9);
          border-color: rgba(129,140,248,0.65);
        }

        .ph-status-pulse::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          border: 1px solid rgba(56,189,248,0.6);
          opacity: 0.0;
          animation: ph-pulse-soft 2.5s ease-out infinite;
        }

        .ph-retro-scanline {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to bottom, rgba(15,23,42,0.5) 1px, transparent 1px);
          background-size: 100% 3px;
          mix-blend-mode: soft-light;
          opacity: 0.25;
          pointer-events: none;
          z-index: 0;
        }

        .ph-terminal-glow {
          text-shadow: 0 0 18px rgba(56,189,248,0.85);
        }

        .ph-outline-text {
          -webkit-text-stroke: 0.6px rgba(15,23,42,0.9);
        }
      `}</style>

      <div style={neonRingStyle} className="anim-nexus" />
      <div style={gridOverlayStyle} className="anim-tactical" />
      <div style={holoSheenStyle} className="anim-hologram" />
      <div style={particleLayerStyle}>
        <div
          className="anim-genome"
          style={particle('16%', '12%', '-3s', '7px', 0.65, 'rgba(56,189,248,0.8)')}
        />
        <div
          className="anim-genome"
          style={particle('68%', '82%', '-6s', '6px', 0.55, 'rgba(244,114,182,0.85)')}
        />
        <div
          className="anim-genome"
          style={particle('40%', '55%', '-1s', '5px', 0.55, 'rgba(94,234,212,0.9)')}
        />
      </div>
      <div className="ph-retro-scanline anim-retro" />

      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            className="anim-terminal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '12px',
              background:
                'radial-gradient(circle at 30% 10%, rgba(248,250,252,0.45), transparent 52%), radial-gradient(circle at 80% 100%, rgba(56,189,248,0.45), transparent 60%), linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.96))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 0 18px rgba(56,189,248,0.55), 0 15px 36px rgba(15,23,42,0.9)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '2px',
                borderRadius: '10px',
                border: '1px solid rgba(148,163,184,0.35)',
                mixBlendMode: 'screen',
              }}
            />
            <CreditCard
              size={18}
              color="rgba(226,232,240,0.98)"
              style={{ filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.9))' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              className="ph-terminal-glow ph-outline-text"
              style={{
                fontWeight: 800,
                color: 'var(--text-primary)',
                fontSize: '14px',
                letterSpacing: '0.03em',
              }}
            >
              Stripe Test Checkout Flow
            </span>
            <div style={headerChipStyle} className="anim-terminal ph-holo-border">
              <span
                className="anim-cloud"
                style={{
                  width: '5px',
                  height: '12px',
                  borderRadius: '999px',
                  background:
                    'linear-gradient(to bottom, rgba(56,189,248,0.2), rgba(56,189,248,0.8))',
                  boxShadow: '0 0 10px rgba(56,189,248,0.8)',
                }}
              />
              <span style={{ fontSize: '9px' }}>Layout Fusion: NEXUS × TERMINAL × HOLOGRAM</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <TruthBadge state={truthState || 'ERROR'} compact />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              color: 'rgba(148,163,184,0.98)',
            }}
          >
            <div
              style={pulseDotStyle(
                ready && mode === 'test'
                  ? 'rgba(34,197,94,0.95)'
                  : 'rgba(248,113,113,0.9)'
              )}
              className="ph-status-pulse anim-genome"
            />
            <span>
              {loading
                ? 'Initializing Stripe bridge...'
                : ready && mode === 'test'
                  ? 'Bridge Synchronized: TEST NET'
                  : error
                    ? 'Bridge Failure Detected'
                    : 'Bridge Misconfigured'}
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div
          className="anim-clean"
          style={{
            marginTop: '4px',
            padding: '14px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.5)',
            background:
              'linear-gradient(120deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Loading readiness...</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'rgba(148,163,184,0.95)',
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '999px',
                background: 'rgba(148,163,184,0.95)',
                boxShadow: '0 0 10px rgba(148,163,184,0.95)',
                animation: 'ph-pulse-soft 1.4s ease-in-out infinite',
              }}
            />
            <span>Synchronizing...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div
          className="anim-royal ph-soft-hover ph-micro-press"
          style={{
            marginTop: '4px',
            padding: '14px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(248,113,113,0.45)',
            background:
              'linear-gradient(120deg, rgba(30,64,175,0.15), rgba(127,29,29,0.9))',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--accent-red)',
          }}
        >
          <AlertTriangle size={14} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 600 }}>Bridge Unavailable</span>
            <span style={{ color: 'rgba(254,226,226,0.96)' }}>
              {error}
            </span>
            <span style={{ fontSize: '10px', opacity: 0.9 }}>
              Check your Stripe keys, webhook endpoint, and local tunnel configuration.
            </span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            style={{ marginBottom: '16px', position: 'relative', zIndex: 1 }}
            className="anim-hologram"
          >
            {mode === 'test' ? (
              <div
                className="ph-soft-hover ph-micro-press"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px 11px',
                  borderRadius: '10px',
                  border: '1px solid rgba(34,197,94,0.55)',
                  background:
                    'linear-gradient(130deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7), rgba(22,101,52,0.9))',
                  boxShadow:
                    '0 0 18px rgba(34,197,94,0.4), 0 12px 24px rgba(22,101,52,0.8)',
                  fontSize: '12px',
                  color: 'rgba(187,247,208,1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} color="rgba(187,247,208,1)" />
                  <span style={{ fontWeight: 600 }}>Stripe Test Mode Active</span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'rgba(190,242,100,0.96)',
                  }}
                >
                  Sandbox · Safe for experiments
                </span>
              </div>
            ) : (
              <div
                className="ph-soft-hover"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 11px',
                  borderRadius: '10px',
                  border: '1px solid rgba(251,146,60,0.65)',
                  background:
                    'linear-gradient(130deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9), rgba(180,83,9,0.85))',
                  fontSize: '12px',
                  color: 'rgba(255,237,213,0.98)',
                }}
              >
                <AlertTriangle size={14} color="rgba(253,186,116,1)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontWeight: 600 }}>
                    {blockers?.[0] || 'Stripe configuration issue'}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>
                    Switch to test mode to enable automated commerce verification.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div
            className="anim-tactical"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '18px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                padding: '10px 11px',
                borderRadius: '10px',
                border: '1px solid rgba(148,163,184,0.55)',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 10px 25px rgba(15,23,42,0.85)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Checkout Readiness</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    border: `1px solid ${
                      ready ? 'rgba(34,197,94,0.65)' : 'rgba(148,163,184,0.7)'
                    }`,
                    color: ready ? 'rgba(190,242,100,1)' : 'rgba(148,163,184,0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {ready ? 'Ready' : 'Blocked'}
                </span>
              </div>
              <div
                style={{
                  height: '4px',
                  borderRadius: '999px',
                  background: 'rgba(15,23,42,1)',
                  overflow: 'hidden',
                  border: '1px solid rgba(30,64,175,0.7)',
                }}
              >
                <div
                  className="anim-nexus"
                  style={{
                    height: '100%',
                    width: ready ? '100%' : '36%',
                    background: ready
                      ? 'linear-gradient(90deg, rgba(56,189,248,1), rgba(129,140,248,1), rgba(45,212,191,1))'
                      : 'linear-gradient(90deg, rgba(148,163,184,0.9), rgba(248,113,113,0.9))',
                    boxShadow: ready
                      ? '0 0 18px rgba(56,189,248,0.85)'
                      : '0 0 14px rgba(248,113,113,0.9)',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: 'rgba(148,163,184,0.98)',
                }}
              >
                <span>Webhook</span>
                <span>{ready ? 'Reachable' : 'Unverified'}</span>
              </div>
            </div>

            <div
              style={{
                padding: '10px 11px',
                borderRadius: '10px',
                border: '1px solid rgba(129,140,248,0.7)',
                background:
                  'radial-gradient(circle at 10% 0%, rgba(56,189,248,0.22), transparent 70%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.25), transparent 70%), rgba(15,23,42,0.96)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow:
                  '0 0 18px rgba(56,189,248,0.55), 0 18px 36px rgba(15,23,42,0.95)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Current Mode</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '3px 7px',
                    borderRadius: '6px',
                    border: `1px solid ${stripeModeColor}`,
                    color: stripeModeColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                  }}
                >
                  {mode || 'Unknown'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '1px',
                  fontSize: '10px',
                  color: 'rgba(148,163,184,0.98)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: stripeModeColor,
                    boxShadow: `0 0 12px ${stripeModeColor}`,
                    marginTop: '2px',
                  }}
                />
                <span>
                  {mode === 'test'
                    ? 'All charges are simulated. Safe to run end-to-end flows.'
                    : 'Live mode detected · run with extreme caution.'}
                </span>
              </div>
            </div>
          </div>

          {ready && mode === 'test' && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(51,65,85,0.9)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                className="anim-forge"
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '42%',
                  height: '1px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(56,189,248,0.9), rgba(129,140,248,0.8), transparent)',
                  boxShadow:
                    '0 0 16px rgba(56,189,248,0.95), 0 0 22px rgba(129,140,248,0.9)',
                }}
              />
              <OwnerApprovalPanel
                scope="commerce"
                onApprovalGranted={setApprovalEnvelope}
                title="Stripe Commerce Gate"
              />

              <button
                onClick={handleCreateSession}
                disabled={!approvalEnvelope || sessionLoading}
                className="anim-nexus ph-soft-hover ph-micro-press"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  marginTop: '16px',
                  background: !approvalEnvelope
                    ? 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.95))'
                    : 'linear-gradient(135deg, rgba(56,189,248,1), rgba(129,140,248,1), rgba(244,114,182,1))',
                  color: !approvalEnvelope ? 'var(--text-dim)' : '#0b1020',
                  border: !approvalEnvelope
                    ? '1px solid rgba(51,65,85,0.85)'
                    : '1px solid rgba(191,219,254,0.9)',
                  cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: !approvalEnvelope
                    ? '0 10px 30px rgba(15,23,42,0.9)'
                    : '0 0 26px rgba(56,189,248,0.9), 0 18px 40px rgba(15,23,42,1)',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ShoppingCart size={16} />
                  {sessionLoading ? 'Creating Session...' : 'Create Stripe Test Checkout Session'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    opacity: 0.9,
                  }}
                >
                  {approvalEnvelope
                    ? sessionLoading
                      ? 'Dispatching to Stripe...'
                      : 'Ready · requires browser verification'
                    : 'Requires signed owner approval'}
                </span>
              </button>

              {sessionResult && sessionResult.ok && (
                <div
                  className="anim-hologram"
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    background:
                      'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(22,101,52,0.9))',
                    border: '1px solid rgba(34,197,94,0.5)',
                    boxShadow:
                      '0 0 16px rgba(34,197,94,0.4), 0 14px 30px rgba(15,23,42,0.95)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-20%',
                      background:
                        'radial-gradient(circle at 0% 0%, rgba(56,189,248,0.3), transparent 60%), radial-gradient(circle at 100% 100%, rgba(16,185,129,0.3), transparent 60%)',
                      opacity: 0.4,
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'rgba(190,242,100,1)',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                      }}
                    >
                      Checkout Session
                    </span>
                    <TruthBadge state={sessionResult.truthState} compact />
                  </div>
                  <div
                    style={{
                      color: 'rgba(187,247,208,1)',
                      marginBottom: '10px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    Session created successfully. Complete a Stripe-hosted test payment and then mark the verification steps below.
                  </div>
                  <a
                    href={sessionResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (
                        browserRun &&
                        browserRun.status === STRIPE_BROWSER_RUN_STATUSES.NOT_STARTED
                      ) {
                        handleUpdateStatus(STRIPE_BROWSER_RUN_STATUSES.OPENED_IN_BROWSER);
                      }
                    }}
                    className="ph-soft-hover ph-micro-press"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'rgba(56,189,248,1)',
                      fontWeight: 700,
                      textDecoration: 'none',
                      padding: '6px 9px',
                      borderRadius: '999px',
                      border: '1px solid rgba(56,189,248,0.7)',
                      background:
                        'linear-gradient(120deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))',
                      boxShadow: '0 0 18px rgba(56,189,248,0.7)',
                      fontSize: '11px',
                      marginBottom: '6px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <span>Open Stripe Checkout</span>
                    <ExternalLink size={12} />
                  </a>

                  {!browserRun ? (
                    <button
                      onClick={handleRecordBrowserRun}
                      disabled={recordingLoading}
                      className="ph-soft-hover ph-micro-press anim-genome"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        marginTop: '10px',
                        background:
                          'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))',
                        border: '1px dashed rgba(148,163,184,0.8)',
                        color: 'rgba(226,232,240,1)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={14} />{' '}
                        {recordingLoading
                          ? 'Recording...'
                          : 'Record Browser Verification Run'}
                      </span>
                      <span style={{ fontSize: '10px', opacity: 0.9 }}>
                        Attach manual verification transcript
                      </span>
                    </button>
                  ) : (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(55,65,81,0.95)',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'rgba(209,213,219,1)',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Manual Verification Steps
                        </span>
                        <TruthBadge
                          state={
                            browserRun.status ===
                            STRIPE_BROWSER_RUN_STATUSES.TEST_PAYMENT_COMPLETED
                              ? 'VERIFIED'
                              : 'LOCAL_ONLY'
                          }
                          compact
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        {[
                          {
                            status: STRIPE_BROWSER_RUN_STATUSES.CHECKOUT_PAGE_RENDERED,
                            label: 'Page Rendered Success',
                            icon: <Eye size={12} />,
                            description: 'Stripe checkout page loads without errors.',
                          },
                          {
                            status: STRIPE_BROWSER_RUN_STATUSES.TEST_PAYMENT_COMPLETED,
                            label: 'Test Payment Completed',
                            icon: <ClipboardCheck size={12} />,
                            description: 'Test card completes a full payment flow.',
                          },
                          {
                            status: STRIPE_BROWSER_RUN_STATUSES.FAILED,
                            label: 'Verification Failed',
                            icon: <AlertTriangle size={12} />,
                            description: 'Something broke during manual validation.',
                          },
                        ].map((step) => {
                          const isActive = browserRun.status === step.status;
                          return (
                            <button
                              key={step.status}
                              onClick={() => handleUpdateStatus(step.status)}
                              disabled={verificationLoading || isActive}
                              className="ph-soft-hover ph-micro-press anim-tactical"
                              style={{
                                padding: '7px 9px',
                                borderRadius: '7px',
                                border: '1px solid rgba(55,65,81,0.95)',
                                background: isActive
                                  ? 'linear-gradient(120deg, rgba(15,23,42,0.96), rgba(15,23,42,0.85), rgba(56,189,248,0.25))'
                                  : 'linear-gradient(120deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))',
                                color: isActive
                                  ? 'rgba(56,189,248,1)'
                                  : 'rgba(209,213,219,1)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                boxShadow: isActive
                                  ? '0 0 16px rgba(56,189,248,0.75)'
                                  : 'none',
                                opacity:
                                  verificationLoading && !isActive ? 0.6 : 1,
                              }}
                            >
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '7px',
                                }}
                              >
                                {step.icon}
                                <span>{step.label}</span>
                                {isActive && <span>✓</span>}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  color: 'rgba(148,163,184,1)',
                                  maxWidth: '54%',
                                }}
                              >
                                {step.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sessionResult && !sessionResult.ok && (
                <div
                  className="anim-terminal"
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    background:
                      'linear-gradient(135deg, rgba(127,29,29,1), rgba(30,64,175,0.75))',
                    border: '1px solid rgba(248,113,113,0.55)',
                    color: 'rgba(254,226,226,1)',
                    boxShadow:
                      '0 0 20px rgba(248,113,113,0.7), 0 14px 30px rgba(15,23,42,0.95)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={14} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600 }}>
                      Failed to create Stripe test session
                    </span>
                    <span>{sessionResult.error || 'Unknown error'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:57:00.885Z