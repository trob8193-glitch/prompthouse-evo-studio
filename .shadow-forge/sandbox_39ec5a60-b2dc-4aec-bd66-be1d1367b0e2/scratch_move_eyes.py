import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the SVG eyes in the front layer
old_front_eyes = """                                      {/* Left Eye (Slanted, UNDER shell) */}
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
                                      </g>"""

new_front_eyes = """                                      {/* Left Eye (Slanted, UNDER shell) */}
                                      <g style={{ transformOrigin: '35% 49%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        <ellipse cx="35%" cy="49%" rx="5%" ry="5%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="35%" cy="49%" rx="2%" ry="3%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="35%" cy="49%" rx="0.5%" ry="2%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Slanted, UNDER shell) */}
                                      <g style={{ transformOrigin: '65% 49%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="65%" cy="49%" rx="5%" ry="5%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="65%" cy="49%" rx="2%" ry="3%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="65%" cy="49%" rx="0.5%" ry="2%" fill="#000000" />
                                      </g>"""

content = content.replace(old_front_eyes, new_front_eyes)


# Update the hole punch mask
old_holes = """                                      {/* Left Eye Hole */}
                                      <g style={{ transformOrigin: '42% 35%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        <ellipse cx="42%" cy="35%" rx="8%" ry="8%" fill="black" />
                                      </g>
                                      {/* Right Eye Hole */}
                                      <g style={{ transformOrigin: '58% 35%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="58%" cy="35%" rx="8%" ry="8%" fill="black" />
                                      </g>"""

new_holes = """                                      {/* Left Eye Hole */}
                                      <g style={{ transformOrigin: '35% 49%', transform: 'rotate(15deg) scale(1.066)' }}>
                                        <ellipse cx="35%" cy="49%" rx="5%" ry="5%" fill="black" />
                                      </g>
                                      {/* Right Eye Hole */}
                                      <g style={{ transformOrigin: '65% 49%', transform: 'rotate(-15deg) scale(1.066)' }}>
                                        <ellipse cx="65%" cy="49%" rx="5%" ry="5%" fill="black" />
                                      </g>"""

content = content.replace(old_holes, new_holes)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved eyes and holes to 35%, 49% and 65%, 49%.")
