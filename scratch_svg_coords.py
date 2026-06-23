import sys
from PIL import Image
import glob

files = glob.glob('C:\\Users\\Noname\\.gemini\\antigravity-ide\\brain\\b61cbce7-e448-4541-8758-9f346cc57736\\sovereignty_bot_*.png')
latest_file = max(files)
img = Image.open(latest_file).convert('RGB')
width, height = img.size

# Find bounds of the tiger bot
min_x, max_x = width, 0
min_y, max_y = height, 0

for y in range(int(height * 0.1), int(height * 0.9)):
    for x in range(int(width * 0.2), int(width * 0.8)):
        r, g, b = img.getpixel((x, y))
        if r > 20 or g > 20 or b > 20: # Not black
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)

print(f"Tiger bounds: X({min_x} to {max_x}), Y({min_y} to {max_y})")
print(f"SVG Width: {max_x - min_x}, Height: {max_y - min_y}")

# The SVG is width="100%" height="100%", but usually it's a square.
# Let's assume the bounding box IS the 100% SVG box. (It might be slightly padded)
svg_w = max_x - min_x
svg_h = max_y - min_y

real_left_x = 708
real_left_y = 142

pct_x = (real_left_x - min_x) / svg_w * 100
pct_y = (real_left_y - min_y) / svg_h * 100

print(f"Calculated SVG coordinates for left eye: cx={pct_x:.1f}%, cy={pct_y:.1f}%")

real_right_x = 825
pct_rx = (real_right_x - min_x) / svg_w * 100
print(f"Calculated SVG coordinates for right eye: cx={pct_rx:.1f}%, cy={pct_y:.1f}%")
