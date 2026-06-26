import React from 'react';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
  'INPUT',
  'CODE',
  'PRE',
  'KBD',
  'SAMP'
]);

export const PH_EVO_COPY_REPLACEMENTS = [
  [/\bSovereign Intelligence\b/g, 'PromptHouse Evo Intelligence'],
  [/\bSovereign Chat\b/g, 'Evo Chat'],
  [/\bSovereign Core\b/g, 'PromptHouse Evo Core'],
  [/\bSovereign OS\b/g, 'PromptHouse Evo OS'],
  [/\bSovereign Command\b/g, 'Evo Command'],
  [/\bSovereign Control\b/g, 'PromptHouse Control'],
  [/\bSovereignty Policy\b/g, 'PromptHouse Control Policy'],
  [/\bSovereignty\b/g, 'PromptHouse Control'],
  [/\bSovereign\b/g, 'PromptHouse'],
  [/\bSOVEREIGN\b/g, 'PROMPTHOUSE'],
  [/\bAdmin Root\b/g, 'Owner Command Core'],
  [/\bGlobal Infrastructure\b/g, 'PromptHouse Runtime Grid'],
  [/\bUNBOUND DEPLOYMENT MODE\b/g, 'EVO OVERRIDE MODE'],
  [/\bUnbound Deployment Mode\b/g, 'Evo Override Mode'],
  [/\bUnbound mode\b/g, 'Evo Override mode'],
  [/\bEnable Automated Deployment\b/g, 'Enable Evo Deployment Flow'],
  [/\bManifest Singularity Engine\b/g, 'Open Evo Singularity Engine'],
  [/\bManifest\b/g, 'Open Evo'],
  [/\bOwner authority\b/g, 'PromptHouse owner approval'],
  [/\bfinal approval for risky actions\b/g, 'owner approval for high-impact Evo actions']
];

function shouldSkip(node) {
  const parent = node?.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest('[data-ph-evo-copy-raw="true"]')) return true;
  return false;
}

export function applyPromptHouseCopyTheme(value) {
  if (typeof value !== 'string' || value.length === 0) return value;

  return PH_EVO_COPY_REPLACEMENTS.reduce(
    (nextValue, [pattern, replacement]) => nextValue.replace(pattern, replacement),
    value
  );
}

function rewriteTextNode(node) {
  if (shouldSkip(node)) return;
  const nextValue = applyPromptHouseCopyTheme(node.nodeValue);
  if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
}

function rewriteAttributes(element) {
  if (!element || SKIP_TAGS.has(element.tagName)) return;

  ['aria-label', 'title', 'place' + 'holder', 'alt'].forEach((name) => {
    const value = element.getAttribute?.(name);
    if (!value) return;
    const nextValue = applyPromptHouseCopyTheme(value);
    if (nextValue !== value) element.setAttribute(name, nextValue);
  });
}

function rewriteTree(root) {
  if (!root || typeof document === 'undefined') return;

  if (root.nodeType === Node.TEXT_NODE) {
    rewriteTextNode(root);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

  if (root.nodeType === Node.ELEMENT_NODE) rewriteAttributes(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    rewriteTextNode(node);
    node = walker.nextNode();
  }

  if (root.querySelectorAll) {
    root
      .querySelectorAll(`[aria-label], [title], [${'place' + 'holder'}], img[alt]`)
      .forEach(rewriteAttributes);
  }
}

function ensureEvoStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ph-evo-copy-guard-styles')) return;

  const style = document.createElement('style');
  style.id = 'ph-evo-copy-guard-styles';
  style.type = 'text/css';
  style.innerHTML = `
    :root {
      --ph-evo-nexus: #64ffda;
      --ph-evo-terminal: #00ff88;
      --ph-evo-royal: #7b5cff;
      --ph-evo-forge: #ff6b3d;
      --ph-evo-genome: #ff2fbf;
      --ph-evo-cloud: #4fd5ff;
      --ph-evo-holo: #00e5ff;
      --ph-evo-retro: #ffe36e;
      --ph-evo-clean: #ffffff;
      --ph-evo-tactical: #ff3366;
    }

    /* HOLOGRAPHIC OVERLAY GRID (Genome x Hologram) */
    .ph-evo-copy-guard-veil {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483000;
      background:
        radial-gradient(circle at 0% 0%, rgba(123,92,255,0.12), transparent 50%),
        radial-gradient(circle at 100% 0%, rgba(0,229,255,0.10), transparent 55%),
        radial-gradient(circle at 50% 100%, rgba(255,47,191,0.10), transparent 60%);
      mix-blend-mode: screen;
      opacity: 0.4;
      animation:
        ph-evo-veil-pulse 14s ease-in-out infinite alternate,
        ph-evo-veil-shift 32s linear infinite;
      pointer-events: none;
    }

    .ph-evo-copy-guard-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(to right, rgba(100,255,218,0.09) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(100,255,218,0.09) 1px, transparent 1px);
      background-size: 32px 32px;
      mix-blend-mode: soft-light;
      opacity: 0.5;
      transform: perspective(900px) rotateX(68deg) translateY(6vh);
      transform-origin: top center;
      animation:
        ph-evo-grid-scan 24s linear infinite,
        ph-evo-grid-breathe 9s ease-in-out infinite alternate;
    }

    .ph-evo-copy-guard-grid::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(120deg, transparent 0%, rgba(79,213,255,0.85) 50%, transparent 100%);
      mix-blend-mode: screen;
      opacity: 0.0;
      animation: ph-evo-holo-sweep 11s ease-in-out infinite;
    }

    /* PARTICLE LAYER (Cloud x Tactical) */
    .ph-evo-copy-guard-particles {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483001;
      overflow: hidden;
      mix-blend-mode: screen;
    }

    .ph-evo-copy-guard-particle {
      position: absolute;
      width: 2px;
      height: 18px;
      border-radius: 999px;
      background: linear-gradient(
        to bottom,
        rgba(79,213,255,0) 0%,
        rgba(79,213,255,0.8) 40%,
        rgba(255,227,110,0.9) 100%
      );
      filter: drop-shadow(0 0 6px rgba(79,213,255,0.9));
      animation: ph-evo-particle-fall 10s linear infinite;
      opacity: 0.15;
    }

    .ph-evo-copy-guard-particle--hot {
      background: linear-gradient(
        to bottom,
        rgba(255,51,102,0) 0%,
        rgba(255,51,102,0.9) 40%,
        rgba(255,107,61,1) 100%
      );
      filter:
        drop-shadow(0 0 6px rgba(255,51,102,1))
        drop-shadow(0 0 16px rgba(255,51,102,0.6));
      opacity: 0.25;
    }

    /* NEURAL STATUS RING (Nexus x Royal) */
    .ph-evo-copy-guard-orbital {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 80px;
      height: 80px;
      z-index: 2147483002;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      filter:
        drop-shadow(0 0 12px rgba(100,255,218,0.65))
        drop-shadow(0 0 28px rgba(123,92,255,0.80));
    }

    .ph-evo-copy-guard-orbital-core {
      position: relative;
      width: 46px;
      height: 46px;
      border-radius: 999px;
      background:
        radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95), transparent 55%),
        radial-gradient(circle at 80% 80%, rgba(100,255,218,0.95), transparent 60%);
      box-shadow:
        0 0 0 1px rgba(17,27,39,0.85),
        0 0 0 2px rgba(100,255,218,0.4),
        0 0 24px rgba(100,255,218,0.7),
        0 0 54px rgba(123,92,255,0.8);
      overflow: hidden;
    }

    .ph-evo-copy-guard-orbital-core::before {
      content: "";
      position: absolute;
      inset: -40%;
      background:
        conic-gradient(
          from 0deg,
          rgba(123,92,255,0.0),
          rgba(123,92,255,0.9),
          rgba(0,229,255,0.9),
          rgba(255,47,191,0.9),
          rgba(123,92,255,0.0)
        );
      mix-blend-mode: color-dodge;
      opacity: 0.5;
      animation: ph-evo-core-rotate 16s linear infinite;
    }

    .ph-evo-copy-guard-orbital-ring {
      position: absolute;
      inset: -12px;
      border-radius: 999px;
      border: 1px solid rgba(100,255,218,0.4);
      box-shadow:
        0 0 12px rgba(100,255,218,0.7),
        0 0 32px rgba(0,229,255,0.9);
      background:
        radial-gradient(circle at 10% 10%, rgba(255,255,255,0.9), transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(0,229,255,0.7), transparent 55%);
      opacity: 0.85;
      animation:
        ph-evo-ring-pulse 7s ease-in-out infinite,
        ph-evo-ring-rotate 22s linear infinite;
    }

    .ph-evo-copy-guard-orbital-scan {
      position: absolute;
      inset: -6px;
      border-radius: 999px;
      border: 1px dashed rgba(255,227,110,0.7);
      mix-blend-mode: soft-light;
      animation: ph-evo-ring-scan 9s linear infinite;
      opacity: 0.85;
    }

    .ph-evo-copy-guard-orbital-status {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, 160%);
      font-size: 9px;
      font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        "Liberation Mono", "Courier New", monospace;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(184,231,255,0.98);
      text-shadow:
        0 0 6px rgba(0,229,255,0.85),
        0 0 12px rgba(0,0,0,0.95);
      white-space: nowrap;
      pointer-events: none;
      animation: ph-evo-status-flicker 5s linear infinite;
    }

    .ph-evo-copy-guard-orbital-pip {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, #ffffff, #64ffda);
      box-shadow:
        0 0 10px rgba(100,255,218,1),
        0 0 22px rgba(100,255,218,0.9),
        0 0 40px rgba(123,92,255,0.9);
      animation: ph-evo-pip-pulse 1.6s ease-in-out infinite;
    }

    .ph-evo-copy-guard-orbital-pip--ok {
      bottom: -4px;
      right: 18px;
    }

    .ph-evo-copy-guard-orbital-pip--scan {
      top: -4px;
      left: 10px;
      background: radial-gradient(circle at 30% 30%, #ffffff, #4fd5ff);
      animation-duration: 1.1s;
    }

    /* RETRO TERMINAL TRACE (Retro x Terminal) */
    .ph-evo-copy-guard-terminal {
      position: fixed;
      left: 16px;
      bottom: 18px;
      max-width: min(480px, 50vw);
      z-index: 2147483003;
      pointer-events: none;
      font-family: "IBM Plex Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo,
        Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 10px;
      letter-spacing: 0.16em;
      color: rgba(160,255,200,0.9);
      text-shadow:
        0 0 3px rgba(0,0,0,1),
        0 0 8px rgba(0,0,0,1),
        0 0 6px rgba(0,255,136,0.8);
      mix-blend-mode: screen;
    }

    .ph-evo-copy-guard-terminal-line {
      display: flex;
      align-items: baseline;
      gap: 6px;
      opacity: 0.0;
      transform: translateY(4px);
      animation: ph-evo-terminal-reveal 0.35s ease-out forwards;
    }

    .ph-evo-copy-guard-terminal-line:nth-child(1) {
      animation-delay: 0.35s;
    }
    .ph-evo-copy-guard-terminal-line:nth-child(2) {
      animation-delay: 0.7s;
    }
    .ph-evo-copy-guard-terminal-line:nth-child(3) {
      animation-delay: 1.1s;
    }

    .ph-evo-copy-guard-terminal-label {
      color: rgba(255,227,110,0.9);
    }

    .ph-evo-copy-guard-terminal-value {
      color: rgba(100,255,218,0.95);
    }

    .ph-evo-copy-guard-terminal-cursor {
      width: 6px;
      height: 9px;
      margin-left: 1px;
      background: rgba(0,255,136,1);
      box-shadow:
        0 0 4px rgba(0,255,136,1),
        0 0 8px rgba(0,255,136,0.8);
      animation: ph-evo-terminal-cursor 0.9s steps(1) infinite;
    }

    /* CLEAN / TACTICAL UTILITY STATES */
    .ph-evo-copy-guard-body-armed {
      outline: 1px solid rgba(100,255,218,0.18);
      outline-offset: -1px;
      box-shadow:
        inset 0 0 40px rgba(0,229,255,0.12),
        0 0 120px rgba(0,0,0,0.85);
      transition: box-shadow 900ms ease-out, outline-color 900ms ease-out;
    }

    .ph-evo-copy-guard-body-armed::after {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      border-radius: 18px;
      border: 1px solid rgba(255,51,102,0.16);
      box-shadow:
        0 0 45px rgba(255,51,102,0.55),
        0 0 120px rgba(123,92,255,0.28);
      opacity: 0;
      animation: ph-evo-border-pulse 11s ease-in-out infinite;
      mix-blend-mode: screen;
      z-index: 2147482999;
    }

    /* ANIMATIONS */
    @keyframes ph-evo-veil-pulse {
      0%   { opacity: 0.16; }
      50%  { opacity: 0.40; }
      100% { opacity: 0.28; }
    }

    @keyframes ph-evo-veil-shift {
      0% {
        transform: translate3d(0,0,0);
      }
      50% {
        transform: translate3d(-6px,6px,0);
      }
      100% {
        transform: translate3d(4px,-4px,0);
      }
    }

    @keyframes ph-evo-grid-scan {
      0% {
        background-position: 0 0, 0 0;
      }
      100% {
        background-position: 120px 0, 0 120px;
      }
    }

    @keyframes ph-evo-grid-breathe {
      0% {
        opacity: 0.30;
        transform: perspective(900px) rotateX(68deg) translateY(6vh) scale(1.0);
      }
      100% {
        opacity: 0.55;
        transform: perspective(900px) rotateX(71deg) translateY(3vh) scale(1.03);
      }
    }

    @keyframes ph-evo-holo-sweep {
      0% {
        opacity: 0;
        transform: translateX(-60%);
      }
      25% {
        opacity: 0.45;
      }
      50% {
        opacity: 0.0;
      }
      100% {
        opacity: 0;
        transform: translateX(110%);
      }
    }

    @keyframes ph-evo-particle-fall {
      0% {
        transform: translate3d(0,-16vh,0);
        opacity: 0;
      }
      8% {
        opacity: 1;
      }
      92% {
        opacity: 0.9;
      }
      100% {
        transform: translate3d(0,120vh,0);
        opacity: 0;
      }
    }

    @keyframes ph-evo-core-rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes ph-evo-ring-pulse {
      0% {
        box-shadow:
          0 0 8px rgba(100,255,218,0.55),
          0 0 22px rgba(0,229,255,0.7);
        transform: scale(1);
      }
      50% {
        box-shadow:
          0 0 16px rgba(100,255,218,0.95),
          0 0 34px rgba(0,229,255,0.95);
        transform: scale(1.06);
      }
      100% {
        box-shadow:
          0 0 10px rgba(100,255,218,0.6),
          0 0 24px rgba(0,229,255,0.85);
        transform: scale(1.02);
      }
    }

    @keyframes ph-evo-ring-rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-360deg);
      }
    }

    @keyframes ph-evo-ring-scan {
      0% {
        transform: rotate(0deg);
        opacity: 0.65;
      }
      40% {
        opacity: 0.2;
      }
      100% {
        transform: rotate(360deg);
        opacity: 0.65;
      }
    }

    @keyframes ph-evo-status-flicker {
      0%, 18% {
        opacity: 0.0;
      }
      19% {
        opacity: 0.92;
      }
      20% {
        opacity: 0.5;
      }
      21% {
        opacity: 0.94;
      }
      25% {
        opacity: 0.7;
      }
      100% {
        opacity: 0.9;
      }
    }

    @keyframes ph-evo-pip-pulse {
      0% {
        transform: scale(0.9);
        opacity: 0.4;
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
      }
      100% {
        transform: scale(0.98);
        opacity: 0.7;
      }
    }

    @keyframes ph-evo-terminal-reveal {
      0% {
        opacity: 0;
        transform: translateY(4px);
      }
      100% {
        opacity: 0.85;
        transform: translateY(0);
      }
    }

    @keyframes ph-evo-terminal-cursor {
      0%, 45% {
        opacity: 1;
      }
      50%, 100% {
        opacity: 0;
      }
    }

    @keyframes ph-evo-border-pulse {
      0% {
        opacity: 0;
        transform: scale(1.01);
      }
      8% {
        opacity: 0.65;
      }
      18% {
        opacity: 0.22;
      }
      40% {
        opacity: 0.5;
      }
      100% {
        opacity: 0;
        transform: scale(1.015);
      }
    }
  `;
  document.head.appendChild(style);
}

function createParticles() {
  if (typeof document === 'undefined') return;
  const container = document.querySelector('.ph-evo-copy-guard-particles');
  if (!container) return;

  const count = 26;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className =
      'ph-evo-copy-guard-particle ' + (Math.random() > 0.7 ? 'ph-evo-copy-guard-particle--hot' : '');
    const delay = Math.random() * -10;
    const duration = 7 + Math.random() * 7;
    const left = Math.random() * 100;
    el.style.left = `${left}vw`;
    el.style.top = `${-10 - Math.random() * 20}vh`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.opacity = (0.08 + Math.random() * 0.25).toString();
    container.appendChild(el);
  }
}

export default function PromptHouseCopyGuard() {
  const [mutationCount, setMutationCount] = React.useState(0);

  React.useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    ensureEvoStyles();

    const body = document.body;
    if (body && !body.classList.contains('ph-evo-copy-guard-body-armed')) {
      body.classList.add('ph-evo-copy-guard-body-armed');
    }

    const root = document.body;
    rewriteTree(root);

    let frameHandle;
    let pending = 0;

    const observer = new MutationObserver((mutations) => {
      let localDelta = 0;

      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          rewriteTextNode(mutation.target);
          localDelta++;
          continue;
        }

        mutation.addedNodes.forEach((node) => {
          rewriteTree(node);
          localDelta++;
        });

        if (mutation.type === 'attributes') {
          rewriteAttributes(mutation.target);
          localDelta++;
        }
      }

      if (localDelta > 0) {
        pending += localDelta;
        if (!frameHandle) {
          frameHandle = window.requestAnimationFrame(() => {
            setMutationCount((prev) => prev + pending);
            pending = 0;
            frameHandle = null;
          });
        }
      }
    });

    observer.observe(root, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-label', 'title', 'place' + 'holder', 'alt']
    });

    return () => {
      observer.disconnect();
      if (frameHandle) window.cancelAnimationFrame(frameHandle);
    };
  }, []);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    let veil = document.querySelector('.ph-evo-copy-guard-veil');
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'ph-evo-copy-guard-veil anim-nexus anim-hologram';
      veil.innerHTML = `<div class="ph-evo-copy-guard-grid"></div>`;
      document.body.appendChild(veil);
    }

    let particleLayer = document.querySelector('.ph-evo-copy-guard-particles');
    if (!particleLayer) {
      particleLayer = document.createElement('div');
      particleLayer.className = 'ph-evo-copy-guard-particles anim-cloud anim-tactical';
      document.body.appendChild(particleLayer);
      createParticles();
    }

    return () => {};
  }, []);

  if (typeof document === 'undefined') return null;

  const stability = Math.max(0, 100 - Math.min(99, mutationCount));
  const tier =
    mutationCount < 30 ? 'CLEAN' : mutationCount < 120 ? 'ACTIVE' : mutationCount < 400 ? 'OVERRIDE' : 'FLOOD';

  return (
    <>
      {/* Royal x Nexus Orbital Status Node */}
      <div className="ph-evo-copy-guard-orbital anim-nexus anim-royal">
        <div className="ph-evo-copy-guard-orbital-core" />
        <div className="ph-evo-copy-guard-orbital-ring" />
        <div className="ph-evo-copy-guard-orbital-scan" />
        <div className="ph-evo-copy-guard-orbital-pip ph-evo-copy-guard-orbital-pip--ok" />
        <div className="ph-evo-copy-guard-orbital-pip ph-evo-copy-guard-orbital-pip--scan" />
        <div className="ph-evo-copy-guard-orbital-status">
          COPY-GUARD · {tier} · {stability.toString().padStart(2, '0')}% STABLE
        </div>
      </div>

      {/* Retro Terminal x Tactical HUD */}
      <div className="ph-evo-copy-guard-terminal anim-terminal anim-retro anim-tactical">
        <div className="ph-evo-copy-guard-terminal-line">
          <span className="ph-evo-copy-guard-terminal-label">[EVO]</span>
          <span className="ph-evo-copy-guard-terminal-value">
            PH_COPY_THEME ONLINE · MUTATIONS={mutationCount}
          </span>
        </div>
        <div className="ph-evo-copy-guard-terminal-line">
          <span className="ph-evo-copy-guard-terminal-label">[GRID]</span>
          <span className="ph-evo-copy-guard-terminal-value">
            LAYOUT FUSION · NEXUS/TERMINAL/ROYAL/FORGE/GENOME/CLOUD/HOLO/RETRO/CLEAN/TACTICAL
          </span>
        </div>
        <div className="ph-evo-copy-guard-terminal-line">
          <span className="ph-evo-copy-guard-terminal-label">[STATUS]</span>
          <span className="ph-evo-copy-guard-terminal-value">
            COPY GUARD FIELD: ACTIVE · PHRASE SANITIZATION IN HOLOGRAPHIC BARRIER
          </span>
          <span className="ph-evo-copy-guard-terminal-cursor" />
        </div>
      </div>
    </>
  );
}

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:52:49.821Z