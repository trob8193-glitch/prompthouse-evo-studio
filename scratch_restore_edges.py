import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the entire evo-hollow filter
old_filter_pattern = r'<filter id={`evo-hollow-\${currentBot\.name\.replace\(/\[\^a-zA-Z0-9\]/g, \'\'\)}`}>.*?</filter>'

new_filter = """<filter id={`evo-hollow-${currentBot.name.replace(/[^a-zA-Z0-9]/g, '')}`}>
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

new_content = re.sub(old_filter_pattern, new_filter, content, flags=re.DOTALL)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("evo-hollow filter restored with edge detection (stripes) and 100% transparent hollow cutouts.")
