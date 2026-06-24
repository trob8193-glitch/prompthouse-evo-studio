import os
import sys
import glob
import random
import uuid
from PIL import Image, ImageDraw, ImageFilter

def find_blobs(img):
    """Finds bounding boxes of isolated parts in a transparent image."""
    # Convert to grayscale alpha mask
    alpha = img.split()[-1]
    w, h = alpha.size
    
    # Simple bounding box extraction (we could do full connected components, 
    # but a simple grid scan or relying on the overall bounding box if we just slice it might be too crude).
    # Since DALL-E images have space between parts, we can do a naive row/col sweep 
    # or just use scipy.ndimage (but we want zero dependencies beyond Pillow).
    
    # To keep it robust without extra libraries, we'll do a simple connected components DFS algorithm.
    visited = set()
    blobs = []
    
    pixels = alpha.load()
    
    # Downscale slightly for faster processing of blobs
    # Actually, we can just scan the image
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if pixels[x, y] > 10 and (x, y) not in visited:
                # Found a new blob, run DFS
                blob_pixels = []
                stack = [(x, y)]
                
                min_x, min_y = x, y
                max_x, max_y = x, y
                
                while stack:
                    cx, cy = stack.pop()
                    if (cx, cy) in visited:
                        continue
                    visited.add((cx, cy))
                    
                    if cx < min_x: min_x = cx
                    if cy < min_y: min_y = cy
                    if cx > max_x: max_x = cx
                    if cy > max_y: max_y = cy
                    
                    # Check neighbors
                    for dx, dy in [(-2,0), (2,0), (0,-2), (0,2)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            if (nx, ny) not in visited and pixels[nx, ny] > 10:
                                stack.append((nx, ny))
                
                # If blob is reasonably large
                if max_x - min_x > 30 and max_y - min_y > 30:
                    # Crop original high-res image
                    box = (min_x, min_y, max_x, max_y)
                    blobs.append(img.crop(box))
                    
    return blobs

def composite_avatar(input_dir, output_path):
    print("Loading sprite sheets...")
    sheets = glob.glob(os.path.join(input_dir, "*_transparent.png"))
    
    if not sheets:
        print("No transparent sprite sheets found!")
        return None

    all_blobs = []
    for sheet in sheets:
        try:
            img = Image.open(sheet).convert("RGBA")
            blobs = find_blobs(img)
            all_blobs.extend(blobs)
        except Exception as e:
            print(f"Error loading {sheet}: {e}")

    if not all_blobs:
        print("No parts extracted.")
        return None

    # Sort blobs by area
    all_blobs.sort(key=lambda b: b.size[0] * b.size[1], reverse=True)
    
    # Classify blobs naively by size
    large_blobs = [b for b in all_blobs if b.size[0] * b.size[1] > 20000]
    med_blobs = [b for b in all_blobs if 5000 < b.size[0] * b.size[1] <= 20000]
    small_blobs = [b for b in all_blobs if b.size[0] * b.size[1] <= 5000]
    
    if not large_blobs:
        large_blobs = all_blobs

    # Select parts
    head_base = random.choice(large_blobs)
    jaw = random.choice(med_blobs) if med_blobs else None
    optics = random.choice(small_blobs) if small_blobs else None
    armor = random.choice(small_blobs) if small_blobs else None

    # Canvas
    canvas_size = 512
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0,0,0,0))
    
    # 1. Glow Layer (Background core)
    # Create an emerald glow (#10b981 = 16, 185, 129)
    glow = Image.new("RGBA", (canvas_size, canvas_size), (0,0,0,0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse((156, 156, 356, 356), fill=(16, 185, 129, 200))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=40))
    canvas.alpha_composite(glow)

    # 2. Base Head
    hw, hh = head_base.size
    hx = (canvas_size - hw) // 2
    hy = (canvas_size - hh) // 2
    canvas.alpha_composite(head_base, (hx, hy))

    # 3. Jaw
    if jaw:
        jw, jh = jaw.size
        jx = (canvas_size - jw) // 2
        jy = hy + hh - (jh // 2) - 20 # Bottom of head
        canvas.alpha_composite(jaw, (jx, jy))

    # 4. Optics / Eyes
    if optics:
        ow, oh = optics.size
        ox = (canvas_size - ow) // 2
        oy = hy + int(hh * 0.3) # Upper middle of head
        canvas.alpha_composite(optics, (ox, oy))

    # 5. Armor
    if armor:
        aw, ah = armor.size
        ax = (canvas_size - aw) // 2 + random.randint(-40, 40)
        ay = hy - (ah // 2) + random.randint(0, 20) # Top of head
        canvas.alpha_composite(armor, (ax, ay))

    # Resize down to 256x256 for optimal app loading
    canvas = canvas.resize((256, 256), Image.Resampling.LANCZOS)
    canvas.save(output_path, "PNG")
    print(f"Composited avatar saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python avatar_compositor.py <input_dir> <output_path>")
        sys.exit(1)
    
    composite_avatar(sys.argv[1], sys.argv[2])
