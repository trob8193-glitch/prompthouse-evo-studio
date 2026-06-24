import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the image to use the new native hollow PNG and remove the SVG filter
old_image = """                                  {/* BASE HOLLOWED SHELL */}
                                  <image 
                                    href={currentBot.avatar} 
                                    width="100%" 
                                    height="100%" 
                                    preserveAspectRatio="xMidYMid meet" 
                                    opacity="1"
                                    filter={currentBot.id === 'sovereignty' ? `url(#evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')})` : 'none'}
                                    style={{
                                      filter: currentBot.id === 'sovereignty' ? 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.2))' : 'none',
                                    }}
                                  />"""

new_image = """                                  {/* BASE HOLLOWED SHELL (Using pre-generated 100% transparent mask) */}
                                  <image 
                                    href={currentBot.id === 'sovereignty' ? '/bots/sovereignty_hollow.png' : currentBot.avatar} 
                                    width="100%" 
                                    height="100%" 
                                    preserveAspectRatio="xMidYMid meet" 
                                    opacity="1"
                                    style={{
                                      filter: currentBot.id === 'sovereignty' ? 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.2))' : 'none',
                                    }}
                                  />"""

content = content.replace(old_image, new_image)

# 2. We no longer need the SVG filter definition at the top since the image is natively transparent
# but we can leave it for safety, or we can just leave it as is since it's no longer applied to the image.

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated EvoCopilot.jsx to use the newly generated natively transparent hollow mask.")
