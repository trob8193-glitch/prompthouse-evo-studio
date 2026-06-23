import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the tiger-pupils completely (the glowing green eyes)
pattern_eyes = r"\{currentBot\.id === 'sovereignty' && \(\s*<g className=\"tiger-pupils\" opacity=\"1\">.*?</g>\s*\)\}"
content = re.sub(pattern_eyes, "", content, flags=re.DOTALL)

# 2. Remove the electric branches layer (the animated background)
pattern_branches_layer = r"\{currentBot\.id === 'sovereignty' && \(\s*<g mask=\"url\(#bot-outline-mask\)\">\s*<rect.*?filter=\"url\(#electric-branches\)\".*?/>\s*</g>\s*\)\}"
content = re.sub(pattern_branches_layer, "", content, flags=re.DOTALL)

# 3. Clean up the tiger-eye-holes mask since perfect-hollow handles it natively
pattern_eye_holes = r"<mask id=\"tiger-eye-holes\">.*?</mask>"
content = re.sub(pattern_eye_holes, "", content, flags=re.DOTALL)

# 4. Remove the mask="url(#tiger-eye-holes)" from the main image
content = content.replace('mask="url(#tiger-eye-holes)"', '')

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed glowing eyes, animated electric branches layer, and legacy eye hole masks.")
