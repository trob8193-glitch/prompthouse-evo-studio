import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the perfect hollow filter to defs
perfect_hollow = """<filter id="perfect-hollow">
                                      {/* Extract luminosity to alpha */}
                                      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 0" in="SourceGraphic" result="lum" />
                                      {/* Threshold: dark pixels (<50% lum) become alpha=1, bright pixels (>50% lum) become alpha=0 */}
                                      <feComponentTransfer in="lum" result="invAlpha">
                                        <feFuncA type="discrete" tableValues="1 0" />
                                      </feComponentTransfer>
                                      {/* Intersect with original alpha so we don't make the transparent background opaque */}
                                      <feComposite in="invAlpha" in2="SourceGraphic" operator="in" result="finalMask" />
                                      {/* Apply the mask to the original image */}
                                      <feComposite in="SourceGraphic" in2="finalMask" operator="in" />
                                    </filter>"""

pattern_insert = r'(<filter id="electric-branches">.*?</filter>)'
content = re.sub(pattern_insert, r'\1\n                                    ' + perfect_hollow, content, flags=re.DOTALL)


# 2. Update the image layer to use the original avatar with the new perfect filter
old_image = """                                  {/* BASE HOLLOWED SHELL (Using pre-generated 100% transparent mask) */}
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

new_image = """                                  {/* BASE PERFECT HOLLOWED SHELL */}
                                  <image 
                                    href={currentBot.avatar} 
                                    width="100%" 
                                    height="100%" 
                                    preserveAspectRatio="xMidYMid meet" 
                                    opacity="1"
                                    filter={currentBot.id === 'sovereignty' ? "url(#perfect-hollow)" : "none"}
                                    style={{
                                      filter: currentBot.id === 'sovereignty' ? 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.2))' : 'none',
                                    }}
                                  />"""

content = content.replace(old_image, new_image)


with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied the perfect mathematical SVG filter to hollow the stripes 100% while preserving background.")
