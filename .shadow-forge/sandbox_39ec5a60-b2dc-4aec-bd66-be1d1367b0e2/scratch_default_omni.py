import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change the fallback so it defaults to omni!
# Original: const currentBot = bots.find(b => b.id === currentBotId) || bots[1];
content = content.replace("bots[1]", "bots[0]")

# Make sure the currentBotId is omni
content = content.replace("currentBotId = 'sovereignty'", "currentBotId = 'omni'")

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
