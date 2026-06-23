import cv2
import numpy as np

img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)
original_alpha = img[:,:,3]

# The black eyes and black stripes have very low brightness.
# We threshold everything darker than 40 to 0 (completely hollow).
# Everything brighter than 40 becomes 255 (completely solid).
_, mask = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)

# Soften the edges of the hole punches slightly so they aren't completely jagged
mask = cv2.GaussianBlur(mask, (3, 3), 0)

# Ensure the original outer transparent background remains 100% transparent
mask[original_alpha < 128] = 0

cv2.imwrite('public/bots/tiger_hollow_black.png', mask)
print("Hollow black mask generated!")
