import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the tiger-eye-holes mask to the <defs>
defs_pattern = r'(<filter id="electric-static-glow">.*?</filter>\s*</defs>)'
eye_holes_def = """<filter id="electric-static-glow">
                                      <feTurbulence type="fractalNoise" baseFrequency="1.5 1.0" numOctaves="4" result="noise">
                                        <animate attributeName="baseFrequency" values="1.5 1.0; 3.5 2.5; 1.5 1.0" dur="0.04s" repeatCount="indefinite" />
                                      </feTurbulence>
                                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -5" in="noise" result="alphaNoise" />
                                      <feComposite in="SourceGraphic" in2="alphaNoise" operator="in" />
                                    </filter>
                                    
                                    <mask id="tiger-eye-holes">
                                      <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                      {/* Left Eye Hole */}
                                      <g style={{ transformOrigin: '38.5% 39%', transform: 'rotate(20deg) scale(1.066)' }}>
                                        <ellipse cx="38.5%" cy="39%" rx="7%" ry="7%" fill="black" />
                                      </g>
                                      {/* Right Eye Hole */}
                                      <g style={{ transformOrigin: '61.5% 39%', transform: 'rotate(-20deg) scale(1.066)' }}>
                                        <ellipse cx="61.5%" cy="39%" rx="7%" ry="7%" fill="black" />
                                      </g>
                                    </mask>
                                  </defs>"""

content = re.sub(defs_pattern, eye_holes_def, content, flags=re.DOTALL)

# 2. Re-arrange the front layer: Eyes first, then a <g mask="url(#tiger-eye-holes)"> containing both images.
front_layer_old = """                                <image 
                                  href={currentBot.avatar} 
                                  width="100%" 
                                  height="100%" 
                                  preserveAspectRatio="xMidYMid meet" 
                                  opacity="1"
                                  filter={currentBot.id === 'evo' || currentBot.id === 'sovereignty' ? `url(#evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})` : `url(#hollow-filter-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                                />
                                {/* Overlay Original Image Details for Sovereignty */}
                                {currentBot.id === 'sovereignty' && (
                                  <image 
                                    href={currentBot.avatar} 
                                    width="100%" 
                                    height="100%" 
                                    preserveAspectRatio="xMidYMid meet" 
                                    opacity="0.8"
                                    style={{ mixBlendMode: 'screen' }}
                                  />
                                )}
                                {currentBot.id === 'sovereignty' && (
                                    <g className="tiger-pupils" opacity="1">
                                      {/* Left Eye (Slanted, over shell) */}
                                      <g style={{ transformOrigin: '38.5% 39%', transform: 'rotate(20deg) scale(1.066)' }}>
                                        <ellipse cx="38.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="38.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="38.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Slanted, over shell) */}
                                      <g style={{ transformOrigin: '61.5% 39%', transform: 'rotate(-20deg) scale(1.066)' }}>
                                        <ellipse cx="61.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="61.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="61.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                    </g>
                                )}"""

front_layer_new = """                                {currentBot.id === 'sovereignty' && (
                                    <g className="tiger-pupils" opacity="1">
                                      {/* Left Eye (Slanted, UNDER shell) */}
                                      <g style={{ transformOrigin: '38.5% 39%', transform: 'rotate(20deg) scale(1.066)' }}>
                                        <ellipse cx="38.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="38.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="38.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Slanted, UNDER shell) */}
                                      <g style={{ transformOrigin: '61.5% 39%', transform: 'rotate(-20deg) scale(1.066)' }}>
                                        <ellipse cx="61.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="61.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="61.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                    </g>
                                )}
                                
                                <g mask={currentBot.id === 'sovereignty' ? "url(#tiger-eye-holes)" : undefined}>
                                  <image 
                                    href={currentBot.avatar} 
                                    width="100%" 
                                    height="100%" 
                                    preserveAspectRatio="xMidYMid meet" 
                                    opacity="1"
                                    filter={currentBot.id === 'evo' || currentBot.id === 'sovereignty' ? `url(#evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})` : `url(#hollow-filter-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                                  />
                                  {/* Overlay Original Image Details for Sovereignty */}
                                  {currentBot.id === 'sovereignty' && (
                                    <image 
                                      href={currentBot.avatar} 
                                      width="100%" 
                                      height="100%" 
                                      preserveAspectRatio="xMidYMid meet" 
                                      opacity="0.85"
                                      style={{ mixBlendMode: 'screen' }}
                                    />
                                  )}
                                </g>"""

# Using a simpler string replace since the block is mostly exact
content = content.replace(front_layer_old, front_layer_new)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied tiger-eye-holes mask to the shell and moved SVG eyes beneath it.")
