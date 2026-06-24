import cv2
import numpy as np

# Load original tiger
img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)
a = img[:,:,3]

# Invert brightness: bright stripes/eyes become 0 (holes), dark metal becomes 255 (solid)
alpha_new = 255 - gray

# Increase contrast so metal is fully solid and holes are fully transparent
alpha_new = cv2.convertScaleAbs(alpha_new, alpha=2.5, beta=-100)

# Keep the original outer background perfectly transparent
alpha_new[a < 128] = 0

# Save the new alpha mask
cv2.imwrite('public/bots/tiger_punched_alpha.png', alpha_new)
print("Punched holes mask created successfully!")
