import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The block to move
eyes_block = """                                {currentBot.id === 'sovereignty' && (
                                    <g className="tiger-pupils" opacity="1">
                                      {/* Left Eye (Slanted, under shell) */}
                                      <g style={{ transformOrigin: '38.5% 39%', transform: 'rotate(20deg) scale(1.066)' }}>
                                        <ellipse cx="38.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="38.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="38.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Slanted, under shell) */}
                                      <g style={{ transformOrigin: '61.5% 39%', transform: 'rotate(-20deg) scale(1.066)' }}>
                                        <ellipse cx="61.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="61.5%" cy="39%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="61.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                    </g>
                                )}"""

# Let's just use regex to swap the image and the eyes block
# We know the structure:
# {currentBot.id === 'sovereignty' && ( ... eyes ... )}
# <image ... />

pattern = r"({\s*currentBot\.id === 'sovereignty'.*?<\/g>\s*)}\s*)(<image\s*href=\{currentBot\.avatar\}.*?\/>)"
replacement = r"\3\n\1"

# Wait, regex dotall might be tricky here because there could be multiple {currentBot.id === 'sovereignty' ...
# Let's just do a string replace of the exact code

old_code = """                                {currentBot.id === 'sovereignty' && (
                                    <g className="tiger-pupils" opacity="1">
                                      {/* Left Eye (Slanted, under shell) */}
                                      <g style={{ transformOrigin: '38.5% 39%', transform: 'rotate(20deg) scale(1.066)' }}>
                                        <ellipse cx="38.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="38.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="38.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                      
                                      {/* Right Eye (Slanted, under shell) */}
                                      <g style={{ transformOrigin: '61.5% 39%', transform: 'rotate(-20deg) scale(1.066)' }}>
                                        <ellipse cx="61.5%" cy="39%" rx="8%" ry="8%" fill="url(#electric-eye-glow)" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
                                        <ellipse cx="61.5%" cy="39%" rx="2.5%" ry="4.5%" fill="#00ff00" filter="drop-shadow(0 0 5px #00ff00)" />
                                        <ellipse cx="61.5%" cy="39%" rx="0.5%" ry="3.5%" fill="#000000" />
                                      </g>
                                    </g>
                                )}
                                <image 
                                  href={currentBot.avatar} 
                                  width="100%" 
                                  height="100%" 
                                  preserveAspectRatio="xMidYMid meet" 
                                  opacity="1"
                                  filter={currentBot.id === 'evo' || currentBot.id === 'sovereignty' ? `url(#evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})` : `url(#hollow-filter-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                                />"""

new_code = """                                <image 
                                  href={currentBot.avatar} 
                                  width="100%" 
                                  height="100%" 
                                  preserveAspectRatio="xMidYMid meet" 
                                  opacity="1"
                                  filter={currentBot.id === 'evo' || currentBot.id === 'sovereignty' ? `url(#evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})` : `url(#hollow-filter-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                                />
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

content = content.replace(old_code, new_code)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved tiger eyes above the image so they are not blocked by the shell.")
