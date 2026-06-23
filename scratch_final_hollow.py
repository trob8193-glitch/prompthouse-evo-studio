import os
import urllib.request
from PIL import Image
import sys

url = "https://prompthouse.com/bots/sovereignty.webp"
local_file = "sovereignty.webp"

req = urllib.request.Request(
    url, 
    data=None, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
)

try:
    with urllib.request.urlopen(req) as response, open(local_file, 'wb') as out_file:
        out_file.write(response.read())
except Exception as e:
    print(f"Failed to download: {e}")
    sys.exit(1)

print("Downloaded sovereignty.webp successfully.")

# Create directory if needed
os.makedirs('public/bots', exist_ok=True)

img = Image.open(local_file).convert('RGBA')
pixels = img.load()
width, height = img.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
            
        max_c = max(r, g, b)
        if max_c > 180:
            pixels[x, y] = (0, 0, 0, 0)
        elif max_c > 120:
            ratio = (180 - max_c) / 60.0
            new_a = int(a * ratio)
            pixels[x, y] = (r, g, b, new_a)

img.save('public/bots/sovereignty_hollow.png')
print("Successfully generated public/bots/sovereignty_hollow.png with 100% transparent stripes!")

# NOW remove the top overlay from EvoCopilot.jsx
import re
with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_overlay = r"\{\/\* Overlay Original Image Details for Sovereignty \*\/.*?\}\)\}"
content = re.sub(pattern_overlay, "", content, flags=re.DOTALL)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed top overlay.")
