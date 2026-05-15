import React from 'react';
import {
  normalizeTruthState,
  getTruthStateLabel,
  getTruthStateDescription,
  getTruthStateTone,
} from '../constants/truth-states.js';

/**
 * PH EVO STUDIO — TRUTH BADGE
 * ═══════════════════════════════════════════════════════════════
 * Reusable visual badge that renders a truth state with correct
 * tone, label, and accessibility metadata.
 */

const TONE_STYLES = {
  success: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: 'rgba(74, 222, 128, 0.25)' },
  danger:  { bg: 'var(--accent-red-dim)',   color: 'var(--accent-red)',   border: 'rgba(248, 113, 113, 0.25)' },
  warning: { bg: 'var(--accent-orange-dim)', color: 'var(--accent-orange)', border: 'rgba(251, 146, 60, 0.25)' },
  info:    { bg: 'var(--accent-cyan-dim)',  color: 'var(--accent-cyan)',  border: 'rgba(34, 211, 238, 0.25)' },
  neutral: { bg: 'rgba(255,255,255,0.04)',  color: 'var(--text-dim)',     border: 'rgba(255,255,255,0.08)' },
};

export default function TruthBadge({ state, compact = false, title, className = '' }) {
  const normalized = normalizeTruthState(state);
  const label = getTruthStateLabel(normalized);
  const description = getTruthStateDescription(normalized);
  const tone = getTruthStateTone(normalized);
  const style = TONE_STYLES[tone] || TONE_STYLES.neutral;
  const displayTitle = title || description;

  if (compact) {
    return (
      <span
        className={className}
        title={displayTitle}
        aria-label={`Truth state: ${label}. ${displayTitle}`}
        role="status"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '9px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: style.color,
          padding: '2px 6px',
          borderRadius: '4px',
          background: style.bg,
          border: `1px solid ${style.border}`,
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: style.color,
          flexShrink: 0,
        }} />
        {label}
      </span>
    );
  }

  return (
    <div
      className={className}
      title={displayTitle}
      aria-label={`Truth state: ${label}. ${displayTitle}`}
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        fontWeight: 700,
        color: style.color,
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        background: style.bg,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: style.color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${style.color}`,
      }} />
      {label}
    </div>
  );
}
