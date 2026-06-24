import cv2
import numpy as np

# Load the original image
img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
b, g, r, a = cv2.split(img)

# Convert RGB channels to float for math
color_float = cv2.merge([b, g, r]).astype(np.float32)

# Subtract 80 to force all dark metal areas to <= 0 (pure black)
# This prevents the metal from emitting any light
color_float -= 80
color_float[color_float < 0] = 0

# Boost the brightness of the remaining stripes and eyes by 2x!
color_float *= 2.0
color_float[color_float > 255] = 255

# Re-merge with the original alpha channel
emissive_out = cv2.merge([
    color_float[:,:,0].astype(np.uint8),
    color_float[:,:,1].astype(np.uint8),
    color_float[:,:,2].astype(np.uint8),
    a
])

# Save the isolated emissive map
cv2.imwrite('public/bots/tiger_emissive_only.png', emissive_out)
print("Emissive mask generated successfully!")
