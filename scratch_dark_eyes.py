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

img = Image.open(local_file).convert('RGB')
width, height = img.size

def find_darkest_center(x_start, x_end, y_start, y_end):
    min_lum = 255
    darkest_pixels = []
    
    for y in range(int(height * y_start), int(height * y_end)):
        for x in range(int(width * x_start), int(width * x_end)):
            r, g, b = img.getpixel((x, y))
            lum = (r + g + b) / 3
            if lum < min_lum:
                min_lum = lum
                
    for y in range(int(height * y_start), int(height * y_end)):
        for x in range(int(width * x_start), int(width * x_end)):
            r, g, b = img.getpixel((x, y))
            lum = (r + g + b) / 3
            if lum <= min_lum + 10: 
                darkest_pixels.append((x, y))
                
    if not darkest_pixels:
        return 0, 0
        
    avg_x = sum(p[0] for p in darkest_pixels) / len(darkest_pixels)
    avg_y = sum(p[1] for p in darkest_pixels) / len(darkest_pixels)
    return avg_x / width * 100, avg_y / height * 100

lx, ly = find_darkest_center(0.35, 0.48, 0.30, 0.50)
rx, ry = find_darkest_center(0.52, 0.65, 0.30, 0.50)

print(f"Left eye socket center: cx={lx:.1f}%, cy={ly:.1f}%")
print(f"Right eye socket center: cx={rx:.1f}%, cy={ry:.1f}%")

min_x, max_x = width, 0
min_y, max_y = height, 0

for y in range(height):
    for x in range(width):
        r, g, b = img.getpixel((x, y))
        if r > 5 or g > 5 or b > 5:
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)

print(f"Tiger image bounds: X({min_x} to {max_x}), Y({min_y} to {max_y})")
print(f"Image actual size: {width}x{height}")
