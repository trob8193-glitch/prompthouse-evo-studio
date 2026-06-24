import io
import os
import cv2
import numpy as np
from PIL import Image
from rembg import remove

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    
    # Load and remove background
    with open(input_path, 'rb') as f:
        input_data = f.read()
    output_data = remove(input_data)
    
    # Open as PIL Image and convert to numpy array (RGBA)
    img = Image.open(io.BytesIO(output_data)).convert("RGBA")
    arr = np.array(img)
    
    # Save the output (solid body, transparent background)
    out_img = Image.fromarray(arr)
    out_img.save(output_path)
    
    # Generate _glow.png overlay ONLY for the eyes
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    
    # To find pupils (the glowing colored parts), we convert to HSV
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]
    
    # STRICT filter: Extremely high saturation and brightness
    mask_glow = (s > 100) & (v > 150) & (alpha > 128)
    mask_glow_uint8 = (mask_glow * 255).astype(np.uint8)
    
    # Filter by connected components to only keep the 4 largest blobs (eyes)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask_glow_uint8, connectivity=8)
    
    sizes = [(i, stats[i, cv2.CC_STAT_AREA]) for i in range(1, num_labels)]
    sizes.sort(key=lambda x: x[1], reverse=True)
    
    refined_mask = np.zeros_like(mask_glow_uint8)
    for i, size in sizes[:4]: # Keep top 4 largest glowing components
        if size > 5:
            refined_mask[labels == i] = 255
            
    # MASSIVE dilation to guarantee the hole completely swallows the white core and the whole eye!
    kernel = np.ones((7, 7), np.uint8)
    dilated_mask = cv2.dilate(refined_mask, kernel, iterations=3)
    
    # PUNCH HOLE: Make ONLY the strictly isolated eye pupils 100% transparent!
    arr[dilated_mask > 0, 3] = 0
    
    # Save the output
    out_img = Image.fromarray(arr)
    out_img.save(output_path)
    print(f"Saved {output_path}")

images = [
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\bot_evo_1781492419309.png", "evo.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\bot_dev_1781492429280.png", "dev.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\bot_builder_1781492439294.png", "builder.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\bot_conductor_1781492449062.png", "conductor.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\bot_verifier_1781492458862.png", "verifier.png"),
    (r"C:\Users\Noname\.gemini\antigravity-ide\brain\806120f5-3a91-4afc-a62d-358e6f27363c\bot_sovereignty_1781492468454.png", "sovereignty.png"),
]

output_dir = r"C:\Users\Noname\Documents\Codex\2026-05-03\prompthouse-evo-studio-files-in-my\public\bots"
for in_path, out_name in images:
    out_path = os.path.join(output_dir, out_name)
    process_image(in_path, out_path)

print("Done processing all images.")
