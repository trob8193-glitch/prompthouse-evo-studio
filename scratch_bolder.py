import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_filter = """                                 <filter id="extract-bot-outline">
                                   <feColorMatrix type="matrix" values="
                                     0 0 0 0 1
                                     0 0 0 0 1
                                     0 0 0 0 1
                                     1 1 1 0 0
                                   " in="SourceGraphic" result="alphaMap" />
                                   <feMorphology operator="dilate" radius="0.5" in="alphaMap" result="thickOutline" />
                                   <feMorphology operator="erode" radius="0.5" in="alphaMap" result="thinOutline" />
                                   <feComposite operator="out" in="thickOutline" in2="thinOutline" result="outline" />
                                 </filter>"""

new_filter = """                                 <filter id="extract-bot-outline">
                                   <feColorMatrix type="matrix" values="
                                     0 0 0 0 1
                                     0 0 0 0 1
                                     0 0 0 0 1
                                     2.5 2.5 2.5 0 0
                                   " in="SourceGraphic" result="rawAlpha" />
                                   <feComponentTransfer in="rawAlpha" result="alphaMap">
                                     <feFuncA type="linear" slope="2" />
                                   </feComponentTransfer>
                                   <feMorphology operator="dilate" radius="1.5" in="alphaMap" result="thickOutline" />
                                   <feMorphology operator="erode" radius="0.2" in="alphaMap" result="thinOutline" />
                                   <feComposite operator="out" in="thickOutline" in2="thinOutline" result="outline" />
                                 </filter>"""

content = content.replace(old_filter, new_filter)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Outline filter updated to be bolder and more detailed.")
