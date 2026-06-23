import urllib.request
from PIL import Image, ImageDraw
import sys

url = "https://prompthouse.com/bots/sovereignty.webp"
local_file = "sovereignty.webp"
png_file = "sovereignty_grid.png"

try:
    urllib.request.urlretrieve(url, local_file)
except Exception as e:
    print(f"Failed to download: {e}")
    sys.exit(1)

try:
    img = Image.open(local_file).convert("RGB")
    width, height = img.size
    
    draw = ImageDraw.Draw(img)
    # Draw a 10x10 grid with percentage labels
    for i in range(10):
        x = int(width * (i / 10))
        draw.line([(x, 0), (x, height)], fill="red", width=2)
        y = int(height * (i / 10))
        draw.line([(0, y), (width, y)], fill="red", width=2)
        
        # Text
        draw.text((x+5, 5), f"{i*10}%", fill="red")
        draw.text((5, y+5), f"{i*10}%", fill="red")
        
    img.save(png_file)
    print("Grid image saved to sovereignty_grid.png")
except Exception as e:
    print(f"Failed to process image: {e}")
