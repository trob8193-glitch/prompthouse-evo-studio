import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'import HoloSphere' not in content:
    content = "import HoloSphere from './HoloSphere';\n" + content
    with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added HoloSphere import to EvoCopilot.jsx")
else:
    print("HoloSphere already imported.")
