import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the brightness boost from evo-hollow to preserve deep dark fur detail
pattern_brightness = r'<feComponentTransfer in="hollowedImage">\s*<feFuncR type="linear" slope="1\.4" intercept="0\.05" />\s*<feFuncG type="linear" slope="1\.4" intercept="0\.05" />\s*<feFuncB type="linear" slope="1\.4" intercept="0\.05" />\s*<feFuncA type="identity" />\s*</feComponentTransfer>'
# We just remove it entirely (hollowedImage is the final output then)
content = re.sub(pattern_brightness, '', content)

# 2. Increase the detail and contrast of the overlay image
old_overlay = """                                  {/* Overlay Original Image Details for Sovereignty */}
                                  {currentBot.id === 'sovereignty' && (
                                    <image 
                                      href={currentBot.avatar} 
                                      width="100%" 
                                      height="100%" 
                                      preserveAspectRatio="xMidYMid meet" 
                                      opacity="0.4"
                                      style={{ mixBlendMode: 'screen' }}
                                    />
                                  )}"""

new_overlay = """                                  {/* Overlay Original Image Details for Sovereignty */}
                                  {currentBot.id === 'sovereignty' && (
                                    <image 
                                      href={currentBot.avatar} 
                                      width="100%" 
                                      height="100%" 
                                      preserveAspectRatio="xMidYMid meet" 
                                      opacity="0.75"
                                      style={{ 
                                        mixBlendMode: 'screen',
                                        filter: 'contrast(1.5) saturate(1.5) drop-shadow(0 0 5px rgba(168, 85, 247, 0.4))'
                                      }}
                                    />
                                  )}"""

content = content.replace(old_overlay, new_overlay)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Enhanced overlay details with contrast/saturate and removed washed-out brightness from base shell.")
