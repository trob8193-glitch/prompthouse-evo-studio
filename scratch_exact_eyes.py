import sys
from PIL import Image
import glob

files = glob.glob('C:\\Users\\Noname\\.gemini\\antigravity-ide\\brain\\b61cbce7-e448-4541-8758-9f346cc57736\\sovereignty_bot_*.png')
if not files:
    print("No screenshot found.")
    sys.exit(0)

latest_file = max(files)
img = Image.open(latest_file).convert('RGB')

# The bot is in a square container.
# In the 1536x729 viewport, let's just search for the brightest pixels that are white/cyan (the real tiger eyes).
# The real tiger eyes are white/cyan glowing slits.
width, height = img.size

left_eye_pixels = []
right_eye_pixels = []

for y in range(int(height * 0.1), int(height * 0.6)):
    for x in range(int(width * 0.2), int(width * 0.8)):
        r, g, b = img.getpixel((x, y))
        # Look for white/cyan (high R, G, B, but not the pure green bug eyes which are 0, 255, 0)
        # The bug eyes are pure #00ff00. We want the real tiger eyes which are white/blue/cyan.
        if r > 200 and g > 200 and b > 200:
            if x < width / 2:
                left_eye_pixels.append((x, y))
            else:
                right_eye_pixels.append((x, y))

if left_eye_pixels:
    lx = sum(p[0] for p in left_eye_pixels) / len(left_eye_pixels)
    ly = sum(p[1] for p in left_eye_pixels) / len(left_eye_pixels)
    print(f"Left real eye approx at absolute pixel: {lx}, {ly}")

if right_eye_pixels:
    rx = sum(p[0] for p in right_eye_pixels) / len(right_eye_pixels)
    ry = sum(p[1] for p in right_eye_pixels) / len(right_eye_pixels)
    print(f"Right real eye approx at absolute pixel: {rx}, {ry}")

# Also find the green bug eyes to calculate relative percentage!
left_bug = []
for y in range(int(height * 0.1), int(height * 0.9)):
    for x in range(int(width * 0.2), int(width * 0.5)):
        r, g, b = img.getpixel((x, y))
        if g > 200 and r < 50 and b < 50:
            left_bug.append((x, y))

if left_bug and left_eye_pixels:
    bx = sum(p[0] for p in left_bug) / len(left_bug)
    by = sum(p[1] for p in left_bug) / len(left_bug)
    print(f"Left bug eye at absolute pixel: {bx}, {by}")
    
    # We know the bug eye is currently at cx="35%" cy="49%" in SVG coordinates.
    # We can calculate the real eye SVG coordinates!
    # Let SVG_width = (bx - something).
    # Actually, we can just find the bounding box of the whole tiger head!
