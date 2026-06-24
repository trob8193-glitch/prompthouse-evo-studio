import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REMOVE the top overlay layer completely to just leave the base hollow mask
pattern_overlay = r"\{\/\* Overlay Original Image Details for Sovereignty \*\/.*?\}\)\}"
content = re.sub(pattern_overlay, "", content, flags=re.DOTALL)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed the top overlay completely so only the hollow mask and electrical core are visible.")
