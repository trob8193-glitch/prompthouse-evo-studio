import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('opacity="0.85"\\n                                      style={{ mixBlendMode: \'screen\' }}', 'opacity="0.4"\\n                                      style={{ mixBlendMode: \'screen\' }}')

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Lowered overlay opacity to 0.4.")
