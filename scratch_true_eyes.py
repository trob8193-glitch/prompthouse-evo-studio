import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the front layer SVG eyes
pattern_eyes = r"\{currentBot\.id === 'sovereignty' && \(\s*<g className=\"tiger-pupils\" opacity=\"1\">.*?</g>\s*\)\}"

master_eyes = """{currentBot.id === 'sovereignty' && (
                                    <g className="tiger-pupils" opacity="1">
                                      {/* Left Eye (Aggressive Slit, UNDER shell) */}
                                      <g style={{ transformOrigin: '44.1% 36.0%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        {/* Outer electric aura */}
                                        <ellipse cx="44.1%" cy="36.0%" rx="6%" ry="2.5%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        {/* Bright green neon slit */}
                                        <ellipse cx="44.1%" cy="36.0%" rx="4.5%" ry="1.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        {/* Core pupil */}
                                        <ellipse cx="44.1%" cy="36.0%" rx="1.5%" ry="1.0%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Aggressive Slit, UNDER shell) */}
                                      <g style={{ transformOrigin: '55.9% 36.0%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="55.9%" cy="36.0%" rx="6%" ry="2.5%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="55.9%" cy="36.0%" rx="4.5%" ry="1.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="55.9%" cy="36.0%" rx="1.5%" ry="1.0%" fill="#000000" />
                                      </g>
                                    </g>
                                )}"""

content = re.sub(pattern_eyes, master_eyes, content, flags=re.DOTALL)


# Update the tiger-eye-holes mask to match perfectly
pattern_holes = r'<mask id="tiger-eye-holes">.*?</mask>'

master_holes = """<mask id="tiger-eye-holes">
                                      <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                      {/* Left Eye Hole - Perfectly matching the slit size */}
                                      <g style={{ transformOrigin: '44.1% 36.0%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        <ellipse cx="44.1%" cy="36.0%" rx="4.6%" ry="1.6%" fill="black" />
                                      </g>
                                      {/* Right Eye Hole - Perfectly matching the slit size */}
                                      <g style={{ transformOrigin: '55.9% 36.0%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="55.9%" cy="36.0%" rx="4.6%" ry="1.6%" fill="black" />
                                      </g>
                                    </mask>"""

content = re.sub(pattern_holes, master_holes, content, flags=re.DOTALL)


with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied exact eye socket coordinates based on raw image analysis.")
