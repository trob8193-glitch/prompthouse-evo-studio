import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

replacement = [
    '                                  <defs>\n',
    '                                    <linearGradient id="tiger-dual-glow" x1="0%" y1="0%" x2="100%" y2="100%">\n',
    '                                      <stop offset="0%" stopColor={zapColor1} />\n',
    '                                      <stop offset="50%" stopColor={zapColor2} />\n',
    '                                      <stop offset="100%" stopColor={zapColor1} />\n',
    '                                      <animate attributeName="x1" values="0%;100%;0%" dur="2s" repeatCount="indefinite" />\n',
    '                                      <animate attributeName="y1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />\n',
    '                                    </linearGradient>\n',
    '                                    <filter id="electric-static-glow">\n',
    '                                      <feTurbulence type="fractalNoise" baseFrequency="1.2 0.8" numOctaves="3" result="noise">\n',
    '                                        <animate attributeName="baseFrequency" values="1.2 0.8; 2.5 1.5; 1.2 0.8" dur="0.08s" repeatCount="indefinite" />\n',
    '                                      </feTurbulence>\n',
    '                                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" in="noise" result="alphaNoise" />\n',
    '                                      <feComposite in="SourceGraphic" in2="alphaNoise" operator="in" />\n',
    '                                    </filter>\n',
    '                                  </defs>\n',
    '\n',
    '                                  {/* Solid Silhouette Base (Dark shape) */}\n',
    '                                  <g mask="url(#bot-silhouette-mask)">\n',
    '                                    <rect x="-50%" y="-50%" width="200%" height="200%" fill="#030303" />\n',
    '                                  </g>\n',
    '\n',
    '                                  {/* Electric Static Dual Glow Stripes */}\n',
    '                                  <g style={{ filter: `drop-shadow(0 0 4px ${zapColor1}) drop-shadow(0 0 8px ${zapColor2}) drop-shadow(0 0 12px ${zapColor1})` }} className="mix-blend-screen">\n',
    '                                    <g mask="url(#bot-outline-mask)">\n',
    '                                      <rect x="0" y="0" width="100%" height="100%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />\n',
    '                                    </g>\n',
    '                                  </g>\n'
]

new_lines = lines[:724] + replacement + lines[755:]

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Static edit complete")
