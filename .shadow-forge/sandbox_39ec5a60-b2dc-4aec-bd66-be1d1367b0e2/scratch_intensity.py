import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make the changes

# 1. Update gradient speed
content = content.replace(
    '<animate attributeName="x1" values="0%;100%;0%" dur="2s" repeatCount="indefinite" />',
    '<animate attributeName="x1" values="0%;100%;0%" dur="1s" repeatCount="indefinite" />'
)
content = content.replace(
    '<animate attributeName="y1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />',
    '<animate attributeName="y1" values="0%;100%;0%" dur="1.5s" repeatCount="indefinite" />'
)

# 2. Update filter texture and speed
content = content.replace(
    '<feTurbulence type="fractalNoise" baseFrequency="1.2 0.8" numOctaves="3" result="noise">',
    '<feTurbulence type="fractalNoise" baseFrequency="1.5 1.0" numOctaves="4" result="noise">'
)
content = content.replace(
    '<animate attributeName="baseFrequency" values="1.2 0.8; 2.5 1.5; 1.2 0.8" dur="0.08s" repeatCount="indefinite" />',
    '<animate attributeName="baseFrequency" values="1.5 1.0; 3.5 2.5; 1.5 1.0" dur="0.04s" repeatCount="indefinite" />'
)

# 3. Update feColorMatrix intensity
content = content.replace(
    '<feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" in="noise" result="alphaNoise" />',
    '<feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -5" in="noise" result="alphaNoise" />'
)

# 4. Update drop-shadow glow intensity
content = content.replace(
    '<g style={{ filter: `drop-shadow(0 0 4px ${zapColor1}) drop-shadow(0 0 8px ${zapColor2}) drop-shadow(0 0 12px ${zapColor1})` }} className="mix-blend-screen">',
    '<g style={{ filter: `drop-shadow(0 0 6px ${zapColor1}) drop-shadow(0 0 12px ${zapColor2}) drop-shadow(0 0 20px ${zapColor1}) drop-shadow(0 0 30px ${zapColor2})` }} className="mix-blend-screen">'
)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied.")
