import sys
from PIL import Image
import glob

# Find the latest sovereignty bot screenshot
files = glob.glob('C:\\Users\\Noname\\.gemini\\antigravity-ide\\brain\\b61cbce7-e448-4541-8758-9f346cc57736\\sovereignty_bot_*.png')
if not files:
    print("No screenshot found.")
    sys.exit(0)

latest_file = max(files)
img = Image.open(latest_file).convert('RGB')
width, height = img.size

left_eye_pixels = []
right_eye_pixels = []

for y in range(height):
    for x in range(width):
        r, g, b = img.getpixel((x, y))
        # Look for bright green
        if g > 200 and r < 100 and b < 100:
            if x < width / 2:
                left_eye_pixels.append((x, y))
            else:
                right_eye_pixels.append((x, y))

if left_eye_pixels:
    lx = sum(p[0] for p in left_eye_pixels) / len(left_eye_pixels)
    ly = sum(p[1] for p in left_eye_pixels) / len(left_eye_pixels)
    print(f"Left eye approx at: {lx/width*100:.1f}%, {ly/height*100:.1f}%")

if right_eye_pixels:
    rx = sum(p[0] for p in right_eye_pixels) / len(right_eye_pixels)
    ry = sum(p[1] for p in right_eye_pixels) / len(right_eye_pixels)
    print(f"Right eye approx at: {rx/width*100:.1f}%, {ry/height*100:.1f}%")
