from PIL import Image
import sys

img_path = r"C:\Users\Noname\.gemini\antigravity-ide\brain\b61cbce7-e448-4541-8758-9f346cc57736\ph_evo_tiger_bot_1781677137220.png"
out_path = r"C:\Users\Noname\Documents\Codex\2026-05-03\prompthouse-evo-studio-files-in-my\public\bots\ph_evo_tiger_transparent.png"

img = Image.open(img_path).convert('RGBA')
data = list(img.getdata())
width, height = img.size

visited = set()
queue = [(0,0), (width-1,0), (0,height-1), (width-1,height-1)]
bg_pixels = set()

while queue:
    x, y = queue.pop(0)
    if (x, y) in visited:
        continue
    visited.add((x, y))
    
    idx = y * width + x
    r, g, b, a = data[idx]
    
    if r > 230 and g > 230 and b > 230:
        bg_pixels.add(idx)
        for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                queue.append((nx, ny))

new_data = [(255, 255, 255, 0) if i in bg_pixels else data[i] for i in range(len(data))]
img.putdata(new_data)
img.save(out_path)
print("Saved to", out_path)
