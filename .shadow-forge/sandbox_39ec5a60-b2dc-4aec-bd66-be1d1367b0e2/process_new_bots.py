import cv2
import numpy as np
from PIL import Image
import io
import os
from rembg import remove

images = [
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\new_evo_lion_1781503776257.png", "evo.png", "evo_glow.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\new_dev_panther_1781503786379.png", "dev.png", "dev_glow.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\new_builder_bear_1781503794303.png", "builder.png", "builder_glow.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\new_verifier_owl_1781503803565.png", "verifier.png", "verifier_glow.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\new_conductor_wolf_1781503813403.png", "conductor.png", "conductor_glow.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\new_sovereignty_tiger_1781503822839.png", "sovereignty.png", "sovereignty_glow.png"),
]

output_dir = r"C:\Users\Noname\Documents\Codex\2026-05-03\prompthouse-evo-studio-files-in-my\public\bots"

for input_path, base_name, glow_name in images:
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
    
    # Fill in the pupil (black center) by using morphological closing or just dilation
    kernel = np.ones((5, 5), np.uint8)
    dilated_green = cv2.dilate(green_mask_uint8, kernel, iterations=2)
    
    # 3. Create the BASE layer (make the original green eyes 100% transparent)
    base_arr = arr.copy()
    base_arr[dilated_green > 0, 3] = 0  # Perfect hole punch
    
    # 4. Create the GLOW layer (ONLY the green eyes, everything else transparent)
    glow_arr = np.zeros_like(arr)
    
    # To keep the pupil, we retain the original image, but shift the green hue to RED
    hsv_glow = hsv.copy()
    hsv_glow[dilated_green > 0, 0] = 0 # Shift hue to 0 (Red)
    # To ensure it's a vibrant red that hue-rotate catches well, we max out saturation for the glowing parts
    # But ONLY for the glowing parts, NOT the black pupil!
    # The pupil has low value (v), so we only boost saturation where value is high
    bright_parts = (dilated_green > 0) & (v > 50)
    hsv_glow[bright_parts, 1] = 255 # Max saturation for the glow
    
    rgb_glow = cv2.cvtColor(hsv_glow, cv2.COLOR_HSV2RGB)
    
    glow_arr[dilated_green > 0, :3] = rgb_glow[dilated_green > 0]
    glow_arr[dilated_green > 0, 3] = arr[dilated_green > 0, 3] # Keep original alpha
    
    # Save the files
    Image.fromarray(base_arr).save(os.path.join(output_dir, base_name))
    Image.fromarray(glow_arr).save(os.path.join(output_dir, glow_name))
    print(f"Saved {base_name} and {glow_name}")
