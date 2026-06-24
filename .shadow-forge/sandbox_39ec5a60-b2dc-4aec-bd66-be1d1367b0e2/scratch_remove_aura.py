import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the animations inside the aura gradients
pattern_aura_animate = r'<animate attributeName="stopOpacity".*?repeatCount="indefinite"\s*/>'
content = re.sub(pattern_aura_animate, "", content)

# I should also make sure there's no other aura animations or rotating circles behind it.
# Wait, earlier I saw an <animate attributeName="stopOpacity" values="0.6;0.2;0.6" ... />
# Is there a rotating ring behind it?
# Let's remove the rotating ring if it exists, or just the glow animations.
# `isAnimated` was tracking whether to show the aura.
# Let's also remove the `animate-pulse` from any `div`s that might be behind it.
# Actually, the `<animate>` tags inside the `<stop>` are exactly what creates the pulsing glow behind the head!

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed all aura pulsing animations from behind the bot's head.")
