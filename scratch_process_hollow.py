import sys
from PIL import Image

def process_hollow():
    img = Image.open('public/bots/sovereignty.webp').convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
                
            # Neon stripes, eyes, and mouth are very bright.
            # We can use the maximum color channel to detect them.
            max_c = max(r, g, b)
            
            if max_c > 180:
                # 100% transparent
                pixels[x, y] = (0, 0, 0, 0)
            elif max_c > 120:
                # Smooth blending for anti-aliasing the edges of the holes
                ratio = (180 - max_c) / 60.0
                new_a = int(a * ratio)
                pixels[x, y] = (r, g, b, new_a)

    img.save('public/bots/sovereignty_hollow.png')
    print("Successfully generated sovereignty_hollow.png with 100% transparent stripes, mouth, and eyes!")

if __name__ == "__main__":
    process_hollow()
