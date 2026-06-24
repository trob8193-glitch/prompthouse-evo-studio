import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """                                <image 
                                  href={currentBot.avatar} 
                                  width="100%" 
                                  height="100%" 
                                  preserveAspectRatio="xMidYMid meet" 
                                  opacity="1"
                                  filter={currentBot.id === 'evo' || currentBot.id === 'sovereignty' ? `url(#evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})` : `url(#hollow-filter-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})`}
                                />
                                {currentBot.id === 'sovereignty' && ("""

new_code = """                                <image 
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
                                {currentBot.id === 'sovereignty' && ("""

content = content.replace(old_code, new_code)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added detailed original bot image as a screen overlay.")
