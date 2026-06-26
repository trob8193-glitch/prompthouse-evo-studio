import React, { useState, useEffect } from 'react';
import { Activity, Clock, ExternalLink } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getDeploymentReceipts } from '../services/deployment-client.js';

export default function DeploymentReceiptsPanel() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let active = true;
    getDeploymentReceipts(20).then(res => {
      if (!active) return;
      if (res.ok && res.data?.receipts) setReceipts(res.data.receipts);
      else setError(res.error || 'Bridge unavailable');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filteredReceipts = receipts.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'success') return r.truthState === 'truthy' || r.truthState === 'verified';
    if (activeFilter === 'pending') return r.truthState === 'pending';
    if (activeFilter === 'error') return r.truthState === 'false' || r.truthState === 'failed';
    return true;
  });

  const recentActivityLevel = (() => {
    if (!receipts.length) return 'low';
    const last = receipts[0];
    const delta = Date.now() - new Date(last.createdAt).getTime();
    if (delta < 5 * 60 * 1000) return 'high';
    if (delta < 60 * 60 * 1000) return 'medium';
    return 'low';
  })();

  const activityColor =
    recentActivityLevel === 'high'
      ? 'var(--accent-cyan)'
      : recentActivityLevel === 'medium'
      ? 'var(--accent-amber)'
      : 'var(--accent-violet)';

  const panelGlow =
    recentActivityLevel === 'high'
      ? '0 0 32px rgba(45,212,191,0.35)'
      : recentActivityLevel === 'medium'
      ? '0 0 24px rgba(251,191,36,0.28)'
      : '0 0 20px rgba(139,92,246,0.28)';

  return (
    <div
      className={`
        nexus-shell hologram-chassis anim-nexus
        fusion-grid fusion-tactical-panel
      `}
      style={{
        position: 'relative',
        padding: '22px',
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.32)',
        background:
          'radial-gradient(circle at 0% 0%, rgba(59,130,246,0.20), transparent 55%), ' +
          'radial-gradient(circle at 100% 0%, rgba(236,72,153,0.16), transparent 50%), ' +
          'radial-gradient(circle at 50% 100%, rgba(45,212,191,0.14), transparent 55%), ' +
          'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))',
        boxShadow: `${panelGlow}, 0 0 0 1px rgba(15,23,42,0.9) inset`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backdropFilter: 'blur(26px) saturate(160%)',
        WebkitBackdropFilter: 'blur(26px) saturate(160%)',
        isolation: 'isolate',
      }}
    >
      {/* Holographic grid overlay */}
      <div
        className="anim-hologram-scan"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(148,163,184,0.10) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.14,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      {/* Rotating particle ring */}
      <div
        className="anim-genome-orbit"
        style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          borderRadius: '999px',
          border: '1px dashed rgba(94,234,212,0.35)',
          boxShadow: '0 0 30px rgba(34,211,238,0.32)',
          top: '-110px',
          right: '-80px',
          opacity: 0.4,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      {/* Subtle bottom glow */}
      <div
        className="anim-terminal-glow"
        style={{
          position: 'absolute',
          insetInline: '-20%',
          bottom: '-35%',
          height: '70%',
          background:
            'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.34), transparent 60%)',
          opacity: 0.7,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="anim-forge-core"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background:
                'conic-gradient(from 220deg, rgba(56,189,248,0.65), rgba(244,114,182,0.7), rgba(129,140,248,0.8), rgba(56,189,248,0.65))',
              padding: '1px',
              boxShadow:
                '0 0 18px rgba(56,189,248,0.55), 0 0 26px rgba(244,114,182,0.40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateZ(0)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '13px',
                background:
                  'radial-gradient(circle at 50% 0%, rgba(15,23,42,0.95), rgba(15,23,42,0.98))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                className="anim-cloud-pulse"
                style={{
                  position: 'absolute',
                  inset: '-40%',
                  background:
                    'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.38), transparent 60%)',
                  opacity: 0.7,
                  mixBlendMode: 'screen',
                }}
              />
              <Activity size={18} color="var(--accent-cyan)" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                className="anim-retro-scanline"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(56,189,248,0.9), rgba(248,250,252,0.96))',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Deployment Receipts
              </span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  border: '1px solid rgba(148,163,184,0.6)',
                  background:
                    'radial-gradient(circle at 0 0, rgba(148,163,184,0.42), transparent 60%)',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}
              >
                {receipts.length.toString().padStart(2, '0')} logs
              </span>
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span className="anim-terminal">
                Action History
              </span>
              <span
                style={{
                  width: '72px',
                  height: '1px',
                  background:
                    'linear-gradient(90deg, rgba(148,163,184,0.0), rgba(148,163,184,0.7), rgba(148,163,184,0.0))',
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        </div>

        {/* Status capsule */}
        <div
          className="anim-tactical-pulse"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            padding: '6px 9px',
            borderRadius: '999px',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))',
            border: '1px solid rgba(248,250,252,0.06)',
            boxShadow: '0 0 14px rgba(15,23,42,0.9)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '999px',
                background: activityColor,
                boxShadow: `0 0 10px ${activityColor}`,
              }}
            />
            <span
              style={{
                background:
                  recentActivityLevel === 'high'
                    ? 'linear-gradient(90deg, #22c55e, #a3e635)'
                    : recentActivityLevel === 'medium'
                    ? 'linear-gradient(90deg, #facc15, #f97316)'
                    : 'linear-gradient(90deg, #6366f1, #22d3ee)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {loading
                ? 'Syncing'
                : recentActivityLevel === 'high'
                ? 'Live Flux'
                : recentActivityLevel === 'medium'
                ? 'Warm'
                : 'Idle'}
            </span>
          </div>
          <div
            style={{
              width: '90px',
              height: '3px',
              borderRadius: '999px',
              overflow: 'hidden',
              background: 'rgba(15,23,42,0.8)',
            }}
          >
            <div
              className="anim-nexus-progress"
              style={{
                width: loading ? '34%' : '100%',
                height: '100%',
                background:
                  'linear-gradient(90deg, rgba(34,211,238,1), rgba(59,130,246,0.6))',
                boxShadow: '0 0 12px rgba(56,189,248,0.9)',
                transformOrigin: 'left',
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter strip */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginTop: '4px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--text-muted)',
          }}
        >
          <span
            style={{
              width: '4px',
              height: '14px',
              borderRadius: '999px',
              background:
                'linear-gradient(to bottom, rgba(56,189,248,0.85), rgba(129,140,248,0.7))',
              boxShadow: '0 0 10px rgba(56,189,248,0.7)',
            }}
          />
          <span className="anim-royal-fade">Signal Filter</span>
        </div>

        <div
          className="anim-retro-flicker"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px',
            borderRadius: '999px',
            background:
              'radial-gradient(circle at 50% 0, rgba(15,23,42,0.9), rgba(15,23,42,0.6))',
            border: '1px solid rgba(30,64,175,0.7)',
            boxShadow: '0 0 12px rgba(30,64,175,0.85)',
          }}
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'success', label: 'Verified' },
            { id: 'pending', label: 'Pending' },
            { id: 'error', label: 'Failed' },
          ].map(f => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`anim-terminal ${
                  active ? 'anim-nexus' : 'anim-clean-fade'
                }`}
                style={{
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  borderRadius: '999px',
                  padding: '2px 9px',
                  fontSize: '9px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: active ? '#0f172a' : 'rgba(148,163,184,0.9)',
                  background: active
                    ? 'linear-gradient(135deg, #22c55e, #2dd4bf, #38bdf8)'
                    : 'transparent',
                  boxShadow: active
                    ? '0 0 20px rgba(56,189,248,0.9)'
                    : 'none',
                  transition:
                    'background 160ms ease-out, color 160ms ease-out, transform 160ms ease-out, box-shadow 180ms ease-out',
                  transform: active ? 'translateY(-0.5px)' : 'none',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '310px',
          overflow: 'hidden',
        }}
      >
        <div
          className="anim-cloud-stream"
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            paddingTop: '2px',
            paddingBottom: '2px',
          }}
        >
          {loading && (
            <div
              className="anim-genome-loading"
              style={{
                padding: '24px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: 'var(--text-dim)',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  className="anim-nexus-spin"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '999px',
                    border: '2px solid rgba(148,163,184,0.35)',
                    borderTopColor: 'rgba(56,189,248,0.95)',
                    boxShadow: '0 0 12px rgba(56,189,248,0.7)',
                  }}
                />
                <span>Loading receipts from the deployment bridge…</span>
              </div>
            </div>
          )}

          {error && !loading && (
            <div
              className="anim-terminal-alert"
              style={{
                padding: '14px 12px',
                marginTop: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(248,113,113,0.55)',
                background:
                  'radial-gradient(circle at 0 0, rgba(248,113,113,0.22), transparent 65%)',
                color: 'var(--accent-red)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '999px',
                  background: 'rgba(248,113,113,1)',
                  boxShadow: '0 0 14px rgba(248,113,113,1)',
                }}
              />
              <span>
                Bridge anomaly detected:&nbsp;
                <span style={{ fontFamily: 'var(--font-mono)' }}>{error}</span>
              </span>
            </div>
          )}

          {!loading && !error && filteredReceipts.length === 0 && (
            <div
              className="anim-clean-fade"
              style={{
                padding: '18px 12px',
                marginTop: '4px',
                borderRadius: '12px',
                border: '1px dashed rgba(148,163,184,0.5)',
                background:
                  'radial-gradient(circle at 50% 0, rgba(148,163,184,0.25), rgba(15,23,42,0.9))',
                textAlign: 'center',
                color: 'var(--text-dim)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span>No deployment receipts match this filter yet.</span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  opacity: 0.7,
                }}
              >
                Awaiting new actions from the Singularity Engine…
              </span>
            </div>
          )}

          {filteredReceipts.map((r, index) => {
            const isHovered = hoveredId === r.id;
            const isRecent = index === 0;
            const itemBorder =
              r.truthState === 'truthy' || r.truthState === 'verified'
                ? 'rgba(45,212,191,0.8)'
                : r.truthState === 'pending'
                ? 'rgba(250,204,21,0.85)'
                : r.truthState === 'false' || r.truthState === 'failed'
                ? 'rgba(248,113,113,0.9)'
                : 'rgba(148,163,184,0.65)';

            const itemGlow =
              r.truthState === 'truthy' || r.truthState === 'verified'
                ? '0 0 20px rgba(45,212,191,0.24)'
                : r.truthState === 'pending'
                ? '0 0 20px rgba(250,204,21,0.22)'
                : r.truthState === 'false' || r.truthState === 'failed'
                ? '0 0 20px rgba(248,113,113,0.25)'
                : '0 0 12px rgba(148,163,184,0.16)';

            return (
              <div
                key={r.id}
                className={`
                  anim-genome
                  ${isRecent ? 'anim-nexus' : ''}
                  ${isHovered ? 'anim-tactical-hover' : 'anim-clean-fade'}
                `}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: `1px solid rgba(15,23,42,0.9)`,
                  background:
                    'radial-gradient(circle at 0 0, rgba(15,23,42,0.85), rgba(15,23,42,0.95))',
                  boxShadow: isHovered ? itemGlow : '0 0 10px rgba(15,23,42,0.8)',
                  transform: isHovered
                    ? 'translateY(-1px) translateZ(0)'
                    : 'translateZ(0)',
                  transition:
                    'transform 150ms ease-out, box-shadow 150ms ease-out, background 150ms ease-out, border-color 150ms ease-out',
                  cursor: r.deploymentUrl ? 'pointer' : 'default',
                  overflow: 'hidden',
                }}
                onClick={() => {
                  if (r.deploymentUrl) {
                    window.open(r.deploymentUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                {/* Accent leading bar */}
                <div
                  className="anim-terminal-pulse"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '12%',
                    bottom: '12%',
                    width: '2px',
                    borderRadius: '0 999px 999px 0',
                    background: `linear-gradient(to bottom, ${itemBorder}, transparent)`,
                    opacity: 0.9,
                  }}
                />

                {/* Inner holographic border */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '14px',
                    border: `1px solid rgba(15,23,42,0.9)`,
                    boxShadow: `0 0 0 1px rgba(15,23,42,0.9) inset`,
                    pointerEvents: 'none',
                    mixBlendMode: 'soft-light',
                  }}
                />

                {/* Top-right hologram flare */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-20%',
                    top: '-90%',
                    width: '60%',
                    height: '80%',
                    background:
                      'radial-gradient(circle at 50% 100%, rgba(56,189,248,0.4), transparent 60%)',
                    opacity: isHovered ? 0.7 : 0.35,
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '1px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {r.action}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-dim)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '999px',
                          background: 'rgba(148,163,184,0.9)',
                        }}
                      />
                      {r.provider}
                    </span>
                    {isRecent && (
                      <span
                        className="anim-royal-pulse"
                        style={{
                          fontSize: '9px',
                          padding: '1px 6px',
                          borderRadius: '999px',
                          border: '1px solid rgba(52,211,153,0.8)',
                          color: 'rgba(52,211,153,0.9)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.18em',
                          marginLeft: '4px',
                          background:
                            'radial-gradient(circle at 0 0, rgba(22,163,74,0.4), transparent 70%)',
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                      lineHeight: 1.4,
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {r.message}
                  </div>

                  {r.deploymentUrl && (
                    <div
                      style={{
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <a
                        href={r.deploymentUrl}
                        onClick={e => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="anim-hologram"
                        style={{
                          color: 'var(--accent-cyan)',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none',
                          maxWidth: '100%',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          background:
                            'radial-gradient(circle at 0 0, rgba(56,189,248,0.22), transparent 70%)',
                          border: '1px solid rgba(56,189,248,0.7)',
                        }}
                      >
                        <ExternalLink size={10} />
                        <span
                          style={{
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {r.deploymentUrl}
                        </span>
                      </a>
                      <span
                        style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-dim)',
                          opacity: 0.8,
                        }}
                      >
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right column: badge + time */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '6px',
                    marginLeft: '10px',
                  }}
                >
                  <div
                    className="anim-hologram"
                    style={{
                      transformOrigin: 'right center',
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      transition: 'transform 120ms ease-out',
                    }}
                  >
                    <TruthBadge state={r.truthState} compact />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(30,64,175,0.8)',
                    }}
                  >
                    <Clock size={9} />
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom retro timeline indicator */}
      <div
        style={{
          position: 'relative',
          marginTop: '4px',
          height: '18px',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1px solid rgba(51,65,85,0.9)',
          background:
            'linear-gradient(to right, rgba(15,23,42,0.96), rgba(15,23,42,0.95))',
          zIndex: 2,
        }}
      >
        <div
          className="anim-retro-scanline"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.4) 1px, transparent 1px)',
            backgroundSize: '3px 100%',
            opacity: 0.18,
            mixBlendMode: 'screen',
          }}
        />
        <div
          className="anim-nexus-progress"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(90deg, rgba(56,189,248,0), rgba(56,189,248,0.95), rgba(56,189,248,0))',
            opacity: 0.65,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: '8px',
            height: '100%',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(148,163,184,0.9)',
          }}
        >
          <span>GENOME / EVENT-TIME-LINE</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:55:55.996Z