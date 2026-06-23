import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_filter = """                                <filter id={`evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')}`}>
                                  <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0.33 0.33 0.33 0 0" result="lum" />
                                  <feComponentTransfer in="lum" result="hollowMask">
                                    <feFuncA type="linear" slope="-50" intercept="6" />
                                  </feComponentTransfer>
                                  <feComposite in="SourceGraphic" in2="hollowMask" operator="in" result="hollowedImage" />
                                  
                                  <feComponentTransfer in="hollowedImage">
                                    <feFuncR type="linear" slope="1.4" intercept="0.05" />
                                    <feFuncG type="linear" slope="1.4" intercept="0.05" />
                                    <feFuncB type="linear" slope="1.4" intercept="0.05" />
                                    <feFuncA type="identity" />
                                  </feComponentTransfer>
                                </filter>"""

new_filter = """                                <filter id={`evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')}`}>
                                  <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0.33 0.33 0.33 0 0" result="lum" />
                                  <feComponentTransfer in="lum" result="hollowMask">
                                    <feFuncA type="linear" slope="50" intercept="-5" />
                                  </feComponentTransfer>
                                  <feMorphology in="hollowMask" operator="dilate" radius="2.0" result="dilated" />
                                  <feMorphology in="hollowMask" operator="erode" radius="0.1" result="eroded" />
                                  <feComposite in="dilated" in2="eroded" operator="out" result="outlineAlpha" />
                                  
                                  <feComponentTransfer in="outlineAlpha" result="invertedAlpha">
                                    <feFuncA type="linear" slope="-1000" intercept="100" />
                                  </feComponentTransfer>
                                  <feComposite in="SourceGraphic" in2="invertedAlpha" operator="in" result="hollowedImage" />
                                  
                                  <feComponentTransfer in="hollowedImage">
                                    <feFuncR type="linear" slope="1.4" intercept="0.05" />
                                    <feFuncG type="linear" slope="1.4" intercept="0.05" />
                                    <feFuncB type="linear" slope="1.4" intercept="0.05" />
                                    <feFuncA type="identity" />
                                  </feComponentTransfer>
                                </filter>"""

content = content.replace(old_filter, new_filter)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Evo-hollow updated to perfectly match dilated outline holes.")
