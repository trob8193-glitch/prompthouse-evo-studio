import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the solid core from the background layer
background_core_pattern = r'\{\/\* Electric Static Solid Core \*\/\}.*?<\/g>'
content = re.sub(background_core_pattern, '', content, flags=re.DOTALL)

# 2. Rewrite the front layer to include the glowing stripes and place eyes underneath
front_layer_old = r'\{currentBot\.id === \'sovereignty\' && \(\s*<g className="tiger-pupils" opacity="1">.*?</g>\s*\)\}'

# We'll just replace the entire front layer group content carefully.
# It's better to find the `<g mask={currentBot.id === 'sovereignty' ? "url(#tiger-eye-holes)" : undefined}>`
# and replace everything from the start of `tiger-pupils` up to that point.

pattern = r"(\{currentBot\.id === 'sovereignty' && \(\s*<g className=\"tiger-pupils\" opacity=\"1\">.*?</g>\s*\)\}\s*<g mask=\{currentBot\.id === 'sovereignty' \? \"url\(#tiger-eye-holes\)\" : undefined\}>)"

new_front = """{currentBot.id === 'sovereignty' && (
                                  {/* Electric Static Thin Stripes (Moved here to fix parallax) */}
                                  <g mask="url(#bot-outline-mask)">
                                    <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />
                                  </g>
                                )}
                                
                                {currentBot.id === 'sovereignty' && (
                                    <g className="tiger-pupils" opacity="1">
                                      {/* Left Eye (Slanted, UNDER shell) */}
                                      <g style={{ transformOrigin: '42% 35%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        <ellipse cx="42%" cy="35%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="42%" cy="35%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="42%" cy="35%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Slanted, UNDER shell) */}
                                      <g style={{ transformOrigin: '58% 35%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="58%" cy="35%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="58%" cy="35%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="58%" cy="35%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                    </g>
                                )}
                                
                                <g mask={currentBot.id === 'sovereignty' ? "url(#tiger-eye-holes)" : undefined}>"""

content = re.sub(pattern, new_front, content, flags=re.DOTALL)

# 3. We also need to update tiger-eye-holes coordinates to match the new eye coordinates
holes_pattern = r'<mask id="tiger-eye-holes">.*?</mask>'
new_holes = """<mask id="tiger-eye-holes">
                                      <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                      {/* Left Eye Hole */}
                                      <g style={{ transformOrigin: '42% 35%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        <ellipse cx="42%" cy="35%" rx="8%" ry="8%" fill="black" />
                                      </g>
                                      {/* Right Eye Hole */}
                                      <g style={{ transformOrigin: '58% 35%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="58%" cy="35%" rx="8%" ry="8%" fill="black" />
                                      </g>
                                    </mask>"""

content = re.sub(holes_pattern, new_holes, content, flags=re.DOTALL)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated eye coordinates and moved glowing stripes to front layer.")
