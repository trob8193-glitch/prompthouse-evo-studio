import cv2
import numpy as np

# Load the enhanced vibrant image
img = cv2.imread('public/bots/tiger_enhanced.png', cv2.IMREAD_UNCHANGED)
if img is None:
    img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)

gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)
original_alpha = img[:,:,3]

# Use Otsu's method to automatically find the perfect threshold
# between the dark stripes/eyes and the bright metallic surface
_, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

# Ensure the original outer background stays completely transparent
mask[original_alpha < 128] = 0

cv2.imwrite('public/bots/tiger_hollow_black.png', mask)
print("Perfect hollow mask generated using Otsu's thresholding!")
