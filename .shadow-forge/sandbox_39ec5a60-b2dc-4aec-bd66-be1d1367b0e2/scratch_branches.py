import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the new filter to defs
electric_branches_def = """<filter id="electric-branches">
                                      {/* Rapidly firing electric branches */}
                                      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="3" result="noise">
                                        <animate attributeName="baseFrequency" values="0.01 0.05; 0.03 0.09; 0.015 0.06; 0.025 0.04; 0.01 0.05" dur="0.25s" repeatCount="indefinite" />
                                      </feTurbulence>
                                      {/* Extreme threshold to turn clouds into sharp branching veins */}
                                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -19" in="noise" result="alphaNoise" />
                                      <feComposite in="SourceGraphic" in2="alphaNoise" operator="in" />
                                    </filter>"""

# Find where to insert it (just after electric-static-glow)
pattern_insert = r'(<filter id="electric-static-glow">.*?</filter>)'
content = re.sub(pattern_insert, r'\1\n                                    ' + electric_branches_def, content, flags=re.DOTALL)


# Now update the glowing stripes rect to use the new filter
old_rect = '<rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />'
new_rect = '<rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#tiger-dual-glow)" filter="url(#electric-branches)" />'

content = content.replace(old_rect, new_rect)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added electric-branches filter and applied it to the glowing stripes layer.")
