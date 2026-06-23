import cv2
import numpy as np
from PIL import Image
import io
import os
import glob
from rembg import remove

# Find all new un-processed bots
images = [
    ("companion", glob.glob(r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\companion_fox_*.png")[0]),
    ("boundary", glob.glob(r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\boundary_rhino_*.png")[0]),
    ("ledger", glob.glob(r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\ledger_raven_*.png")[0]),
    ("memory", glob.glob(r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\memory_elephant_*.png")[0]),
    ("heartbeat", glob.glob(r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\heartbeat_cheetah_*.png")[0])
]

output_dir = r"C:\Users\Noname\Documents\Codex\2026-05-03\prompthouse-evo-studio-files-in-my\public\bots"

for name, input_path in images:
    base_name = f"{name}.png"
    glow_name = f"{name}_glow.png"
    print(f"Processing {input_path}...")
    
    with open(input_path, "rb") as i:
        input_data = i.read()
    
    # 1. Remove the black background
    output_data = remove(input_data)
    img_rgba = Image.open(io.BytesIO(output_data)).convert("RGBA")
    arr = np.array(img_rgba)
    
    # 2. Find the green eyes
    rgb = arr[:, :, :3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    h = hsv[:, :, 0]
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]
    
    # Identify the pure #00FF00 green
    green_mask = (h > 40) & (h < 80) & (s > 150) & (v > 150)
    green_mask_uint8 = (green_mask * 255).astype(np.uint8)
    
    kernel = np.ones((5, 5), np.uint8)
    dilated_green = cv2.dilate(green_mask_uint8, kernel, iterations=2)
    
    # 3. Create the BASE layer
    base_arr = arr.copy()
    base_arr[dilated_green > 0, 3] = 0  # Perfect hole punch
    
    # 4. Create the GLOW layer
    glow_arr = np.zeros_like(arr)
    hsv_glow = hsv.copy()
    hsv_glow[dilated_green > 0, 0] = 0 # Shift hue to 0 (Red)
    bright_parts = (dilated_green > 0) & (v > 50)
    hsv_glow[bright_parts, 1] = 255 # Max saturation for the glow
    
    rgb_glow = cv2.cvtColor(hsv_glow, cv2.COLOR_HSV2RGB)
    
    glow_arr[dilated_green > 0, :3] = rgb_glow[dilated_green > 0]
    glow_arr[dilated_green > 0, 3] = arr[dilated_green > 0, 3] # Keep original alpha
    
    # Save the files
    Image.fromarray(base_arr).save(os.path.join(output_dir, base_name))
    Image.fromarray(glow_arr).save(os.path.join(output_dir, glow_name))
    print(f"Saved {base_name} and {glow_name}")
