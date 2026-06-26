import React, { useState, useEffect } from 'react';

const evoBotStyles = `
@keyframes evoBotDropShadowPulse {
  0%   { filter: drop-shadow(0 0 10px rgba(99,102,241,0.8)); }
  20%  { filter: drop-shadow(0 0 20px rgba(0,240,255,1)); }
  40%  { filter: drop-shadow(0 0 26px rgba(236,72,153,0.95)); }
  60%  { filter: drop-shadow(0 0 22px rgba(16,185,129,0.95)); }
  80%  { filter: drop-shadow(0 0 18px rgba(250,204,21,0.9)); }
  100% { filter: drop-shadow(0 0 10px rgba(99,102,241,0.8)); }
}

@keyframes evoBotFloat {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%      { transform: translateY(-4px) scale(1.03); }
}

@keyframes evoBotFloatHover {
  0%, 100% { transform: translateY(0px) scale(1.04) rotate3d(0.1, 0.3, 0, 1deg); }
  50%      { transform: translateY(-6px) scale(1.07) rotate3d(-0.1, -0.3, 0, -1deg); }
}

@keyframes evoTitleShimmer {
  0%   { background-position: 0% 50%; opacity: 0.3; }
  50%  { background-position: 100% 50%; opacity: 0.85; }
  100% { background-position: 0% 50%; opacity: 0.3; }
}

@keyframes evoRadialPulse {
  0%   { transform: translate(-50%, -50%) scale(0.85); opacity: 0.7; }
  40%  { transform: translate(-50%, -50%) scale(1.05); opacity: 0.25; }
  70%  { transform: translate(-50%, -50%) scale(1.25); opacity: 0.15; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

@keyframes evoOrbitParticle {
  0%   { transform: rotate(0deg) translateX(55%) rotate(0deg); opacity: 0.3; }
  25%  { opacity: 0.8; }
  50%  { transform: rotate(180deg) translateX(60%) rotate(-180deg); opacity: 0.4; }
  75%  { opacity: 0.9; }
  100% { transform: rotate(360deg) translateX(55%) rotate(-360deg); opacity: 0.3; }
}

@keyframes evoScanline {
  0%   { transform: translateY(-120%); opacity: 0; }
  10%  { opacity: 0.6; }
  50%  { transform: translateY(10%); opacity: 0.3; }
  90%  { opacity: 0.7; }
  100% { transform: translateY(120%); opacity: 0; }
}

@keyframes evoStatusPulse {
  0%   { box-shadow: 0 0 0 0 rgba(45,212,191,0.8); transform: scale(1); }
  70%  { box-shadow: 0 0 0 10px rgba(45,212,191,0); transform: scale(1.15); }
  100% { box-shadow: 0 0 0 0 rgba(45,212,191,0); transform: scale(1); }
}

@keyframes evoGlowSweep {
  0%   { opacity: 0; transform: translateX(-130%) skewX(-18deg); }
  40%  { opacity: 0.85; }
  60%  { opacity: 0.6; }
  100% { opacity: 0; transform: translateX(130%) skewX(-18deg); }
}

@keyframes evoNexusRingRotate {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  50%  { transform: translate(-50%, -50%) rotate(180deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes evoHologramFlicker {
  0%, 18%, 22%, 100% { opacity: 1; filter: blur(0); }
  19%, 21% { opacity: 0.6; filter: blur(1px); }
  48%, 52% { opacity: 0.7; filter: blur(0.6px); }
}

/* Container fusing Nexus + Tactical + Hologram themes */
.evo-bot-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: evoBotFloat 4s ease-in-out infinite;
  z-index: 10;
  border-radius: 999px;
  padding: 6px;
  background:
    radial-gradient(circle at 0% 0%, rgba(56,189,248,0.25), transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(244,114,182,0.25), transparent 55%),
    conic-gradient(from 220deg, rgba(15,23,42,1), rgba(15,23,42,0.85), rgba(15,23,42,1));
  box-shadow:
    0 0 0 1px rgba(148,163,184,0.35),
    0 0 18px rgba(56,189,248,0.45),
    0 0 30px rgba(168,85,247,0.3);
  overflow: visible;
  transition:
    transform 260ms cubic-bezier(0.18, 0.89, 0.32, 1.28),
    box-shadow 260ms ease-out,
    background 260ms ease-out,
    filter 260ms ease-out;
  cursor: pointer;
}

/* Hover: intensify the 3D lift & glow */
.evo-bot-container.evo-bot-hover-active {
  animation: evoBotFloatHover 3.4s ease-in-out infinite;
  box-shadow:
    0 0 0 1px rgba(148,163,184,0.65),
    0 0 25px rgba(56,189,248,0.85),
    0 0 45px rgba(129,140,248,0.9),
    0 0 60px rgba(236,72,153,0.65);
  transform: translateY(-2px) scale(1.04);
  filter: saturate(1.1);
}

/* Active/click micro-press */
.evo-bot-container:active {
  transform: translateY(0px) scale(0.99);
  box-shadow:
    0 0 0 1px rgba(148,163,184,0.9),
    0 0 14px rgba(56,189,248,0.7);
}

/* Core bot image with blended layout-auras (Nexus + Royal + Retro) */
.evo-bot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: evoBotDropShadowPulse 4s linear infinite;
  border-radius: 50%;
  border: 2px solid rgba(148,163,184,0.5);
  box-shadow:
    inset 0 0 16px rgba(15,23,42,0.95),
    0 0 24px rgba(56,189,248,0.55),
    0 0 36px rgba(236,72,153,0.4);
  transition:
    transform 260ms ease-out,
    filter 260ms ease-out,
    box-shadow 260ms ease-out;
}

/* Subtle zoom on hover */
.evo-bot-container.evo-bot-hover-active .evo-bot-image {
  transform: scale(1.04);
  filter: contrast(1.08) saturate(1.15);
  box-shadow:
    inset 0 0 18px rgba(15,23,42,0.9),
    0 0 30px rgba(56,189,248,0.85),
    0 0 48px rgba(236,72,153,0.7);
}

/* Holographic color-dodge overlay (Hologram layout) */
.evo-bot-hologram-overlay {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background:
    linear-gradient(120deg,
      rgba(99,102,241,0.0) 0%,
      rgba(99,102,241,0.45) 18%,
      rgba(0,240,255,0.7) 38%,
      rgba(236,72,153,0.8) 58%,
      rgba(16,185,129,0.55) 78%,
      rgba(250,250,250,0.0) 100%);
  background-size: 260% 160%;
  mix-blend-mode: color-dodge;
  pointer-events: none;
  animation:
    evoTitleShimmer 4s linear infinite,
    evoHologramFlicker 5.4s steps(2, start) infinite;
  opacity: 0.9;
}

/* Retro scanline / terminal sweep (Terminal + Retro layouts) */
.evo-bot-scanline {
  position: absolute;
  inset: 6px;
  overflow: hidden;
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

.evo-bot-scanline::before {
  content: '';
  position: absolute;
  left: -15%;
  right: -15%;
  height: 35%;
  top: 0;
  background: linear-gradient(
    to bottom,
    rgba(236,252,203,0) 0%,
    rgba(190,242,100,0.7) 35%,
    rgba(96,165,250,0.9) 50%,
    rgba(56,189,248,0.4) 65%,
    rgba(15,23,42,0) 100%
  );
  filter: blur(2px);
  animation: evoScanline 5.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

/* Dynamic status halo (Tactical layout pulse) */
.evo-bot-status-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110%;
  height: 110%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle at 30% 20%, rgba(45,212,191,0.6), transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(59,130,246,0.55), transparent 60%);
  opacity: 0.2;
  filter: blur(10px);
  pointer-events: none;
}

/* Expanding radial pulse */
.evo-bot-radial-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130%;
  height: 130%;
  border-radius: 50%;
  border: 1px solid rgba(45,212,191,0.7);
  background:
    radial-gradient(circle, rgba(45,212,191,0.5) 0%, transparent 55%);
  pointer-events: none;
  animation: evoRadialPulse 3.6s ease-out infinite;
}

/* Orbital particles (Cloud + Genome layouts) */
.evo-bot-orbit-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  filter: drop-shadow(0 0 6px rgba(56,189,248,0.75));
}

.evo-bot-orbit-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9%;
  height: 9%;
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 20%, rgba(248,250,252,1), rgba(148,163,184,0.1) 75%);
  box-shadow:
    0 0 8px rgba(56,189,248,0.9),
    0 0 16px rgba(129,140,248,0.9);
  transform-origin: center center;
  animation: evoOrbitParticle 7s linear infinite;
}

.evo-bot-orbit-particle:nth-child(1) {
  animation-duration: 7s;
  animation-delay: 0s;
}
.evo-bot-orbit-particle:nth-child(2) {
  animation-duration: 9s;
  animation-delay: -1.4s;
  filter: hue-rotate(50deg);
}
.evo-bot-orbit-particle:nth-child(3) {
  animation-duration: 11s;
  animation-delay: -2.4s;
  filter: hue-rotate(120deg);
}

/* Nexus ring: rotating segmented ring visual */
.evo-bot-nexus-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 132%;
  height: 132%;
  border-radius: 50%;
  pointer-events: none;
  background:
    conic-gradient(
      from 130deg,
      rgba(56,189,248,0.0) 0deg,
      rgba(56,189,248,0.5) 35deg,
      rgba(56,189,248,0.0) 70deg,
      rgba(168,85,247,0.0) 120deg,
      rgba(168,85,247,0.6) 165deg,
      rgba(168,85,247,0.0) 210deg,
      rgba(236,72,153,0.0) 255deg,
      rgba(236,72,153,0.7) 300deg,
      rgba(236,72,153,0.0) 340deg
    );
  mix-blend-mode: screen;
  opacity: 0.75;
  mask-image: radial-gradient(circle, transparent 52%, black 63%, transparent 100%);
  animation: evoNexusRingRotate 16s linear infinite;
}

/* Royal / Forge style status pill with terminal readout */
.evo-bot-status-pill {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Mono", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background:
    linear-gradient(120deg, rgba(15,23,42,0.96), rgba(30,64,175,0.96)),
    linear-gradient(90deg, rgba(56,189,248,1), rgba(59,130,246,1));
  background-clip: padding-box, border-box;
  border: 1px solid transparent;
  border-image: linear-gradient(90deg, rgba(56,189,248,0.8), rgba(236,72,153,0.9)) 1;
  color: rgba(226,232,240,0.9);
  box-shadow:
    0 0 0 1px rgba(15,23,42,1),
    0 0 10px rgba(56,189,248,0.8);
  overflow: hidden;
  white-space: nowrap;
}

/* Glowing sweep across the pill text */
.evo-bot-status-pill::after {
  content: '';
  position: absolute;
  top: -40%;
  bottom: -40%;
  width: 40%;
  background: linear-gradient(
    120deg,
    rgba(248,250,252,0.0) 0%,
    rgba(248,250,252,0.45) 40%,
    rgba(248,250,252,0.0) 100%
  );
  transform: translateX(-130%) skewX(-18deg);
  animation: evoGlowSweep 4.8s ease-in-out infinite;
}

/* Status bullet + micro-pulse indicator */
.evo-bot-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.evo-bot-status-dot-wrap {
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #a7f3d0, #059669);
  box-shadow:
    0 0 4px rgba(34,197,94,0.9),
    0 0 8px rgba(45,212,191,0.9);
  animation: evoStatusPulse 2.4s ease-out infinite;
}

.evo-bot-status-dot-wrap::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 1px solid rgba(45,212,191,0.55);
  opacity: 0.85;
}

.evo-bot-status-text {
  opacity: 0.9;
}

/* Small tooltip with Retro terminal feel */
.evo-bot-tooltip {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(15,23,42,0.96);
  border: 1px solid rgba(148,163,184,0.55);
  color: rgba(226,232,240,0.92);
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow:
    0 10px 35px rgba(15,23,42,0.9),
    0 0 12px rgba(56,189,248,0.55);
  transition:
    opacity 160ms ease-out,
    transform 160ms ease-out;
  font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.evo-bot-tooltip::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  width: 9px;
  height: 9px;
  background: inherit;
  border-left: inherit;
  border-bottom: inherit;
  border-radius: 0 0 0 4px;
  transform-origin: center;
  transform: translateX(-50%) rotate(45deg);
}

/* Tooltip visible state */
.evo-bot-tooltip.evo-bot-tooltip-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0px);
}

/* Retro scan / tactical text color variants by status */
.evo-bot-status-pill[data-status="online"] .evo-bot-status-text {
  color: #bbf7d0;
}
.evo-bot-status-pill[data-status="idle"] .evo-bot-status-text {
  color: #fde68a;
}
.evo-bot-status-pill[data-status="offline"] .evo-bot-status-text {
  color: #fecaca;
}

/* Additional subtle holographic grain overlay */
.evo-bot-grain-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  mix-blend-mode: soft-light;
  opacity: 0.55;
  background-image:
    repeating-linear-gradient(
      135deg,
      rgba(15,23,42,0.75) 0px,
      rgba(15,23,42,0.75) 1px,
      rgba(31,41,55,0.4) 1px,
      rgba(31,41,55,0.4) 2px
    );
  background-size: 220% 220%;
}
`;

export function EvoBot({ size = 48, className = '' }) {
  const [hovered, setHovered] = useState(false);
  const [status, setStatus] = useState('online'); // online | idle | offline
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Autonomous status flicker to feel "alive"
  useEffect(() => {
    const cycle = () => {
      setStatus((prev) => {
        if (prev === 'online') return 'idle';
        if (prev === 'idle') return 'online';
        return 'online';
      });
    };
    const id = setInterval(cycle, 11000);
    return () => clearInterval(id);
  }, []);

  const statusLabel =
    status === 'online' ? 'ONLINE' :
    status === 'idle' ? 'IDLE' :
    'OFFLINE';

  const tooltipText =
    status === 'online'
      ? 'Singularity Core: Stable • Nexus Grid: Synchronized'
      : status === 'idle'
      ? 'Singularity Core: Dreaming • Genome Layers Re-indexing'
      : 'Singularity Core: Offline • Tactical Grid in Cold Standby';

  return (
    <>
      <style>{evoBotStyles}</style>
      <div
        className={
          `evo-bot-container anim-nexus anim-terminal anim-hologram ` +
          (hovered ? 'evo-bot-hover-active ' : '') +
          className
        }
        style={{ width: size, height: size }}
        onMouseEnter={() => { setHovered(true); setTooltipVisible(true); }}
        onMouseLeave={() => { setHovered(false); setTooltipVisible(false); }}
        onFocus={() => { setHovered(true); setTooltipVisible(true); }}
        onBlur={() => { setHovered(false); setTooltipVisible(false); }}
        tabIndex={0}
      >
        <div className="evo-bot-grain-overlay" aria-hidden="true" />

        <div className="evo-bot-status-halo" aria-hidden="true" />
        <div className="evo-bot-radial-pulse" aria-hidden="true" />
        <div className="evo-bot-nexus-ring" aria-hidden="true" />

        <div className="evo-bot-orbit-layer" aria-hidden="true">
          <div className="evo-bot-orbit-particle" />
          <div className="evo-bot-orbit-particle" />
          <div className="evo-bot-orbit-particle" />
        </div>

        <img
          src="/evo_bot.png"
          alt="PH EVO BOT"
          className="evo-bot-image"
          draggable="false"
        />

        <div className="evo-bot-hologram-overlay" />
        <div className="evo-bot-scanline" aria-hidden="true" />

        <div
          className={
            'evo-bot-tooltip ' +
            (tooltipVisible ? 'evo-bot-tooltip-visible' : '')
          }
          role="status"
        >
          {tooltipText}
        </div>

        <div
          className="evo-bot-status-pill anim-royal anim-forge"
          data-status={status}
        >
          <div className="evo-bot-status-indicator">
            <span className="evo-bot-status-dot-wrap" />
            <span className="evo-bot-status-text">{statusLabel}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:56:48.310Z