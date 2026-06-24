import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change the condition so the HoloSphere renders for Sovereignty (so the user can actually see it!)
content = content.replace("currentBot.id === 'omni' ?", "currentBot.id === 'sovereignty' ?")

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated EvoCopilot to show HoloSphere for Sovereignty.")
