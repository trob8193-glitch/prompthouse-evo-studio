import cv2
import numpy as np
import os

input_path = 'public/bots/ph_evo_colored_tiger_transparent.png'
output_path = 'public/bots/sovereignty_perfect_outline.png'

print(f"Loading {input_path}...")
img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

if img is None:
    print(f"Failed to load {input_path}")
    exit(1)

# Ensure it has an alpha channel
if img.shape[2] == 4:
    # Use the alpha channel to create the mask
    alpha = img[:, :, 3]
    _, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
else:
    # Fallback to non-black
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 5, 255, cv2.THRESH_BINARY)

# Find ONLY the external contours (this ignores inner holes like eyes/mouth)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Create a blank transparent image
outline_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)

# Draw the contours with a fuchsia/purple color
color_bgr = (247, 85, 168, 255) # BGR + Alpha
cv2.drawContours(outline_img, contours, -1, color_bgr, thickness=5)

# Add a glow effect
glow = cv2.GaussianBlur(outline_img, (25, 25), 0)
final_img = cv2.addWeighted(outline_img, 1.0, glow, 1.5, 0)

# Save the perfectly traced hollow outline
cv2.imwrite(output_path, final_img)
print(f"Perfect hollow outline traced and saved to {output_path}!")
