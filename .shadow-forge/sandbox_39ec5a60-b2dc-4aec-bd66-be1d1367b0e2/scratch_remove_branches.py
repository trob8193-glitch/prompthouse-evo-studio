import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the electric branches layer correctly!
pattern_branches_layer = r"\{currentBot\.id === 'sovereignty' && \(\s*<g mask=\"url\(#bot-outline-mask\)\">.*?filter=\"url\(#electric-branches\)\".*?</g>\s*\)\}"
content = re.sub(pattern_branches_layer, "", content, flags=re.DOTALL)

# Also remove the aura pulsing animations just in case they meant the slow purple glow
pattern_aura_animate = r'<animate attributeName="stopOpacity".*?repeatCount="indefinite"\s*/>'
content = re.sub(pattern_aura_animate, "", content)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed the electric branches layer and any aura animations.")
