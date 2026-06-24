import cv2
import numpy as np

# Load the emissive map
emissive = cv2.imread('public/bots/tiger_emissive_only.png', cv2.IMREAD_UNCHANGED)

# Get the exact eye contours from the original image
img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)
roi = gray[350:650, 250:774]
_, thresh = cv2.threshold(roi, 40, 255, cv2.THRESH_BINARY_INV)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key=cv2.contourArea, reverse=True)

# The two largest dark blobs in this region are the eyes
c1 = contours[0] + [250, 350]
c2 = contours[1] + [250, 350]

M1 = cv2.moments(c1)
cX1 = int(M1["m10"] / M1["m00"])

if cX1 < 512:
    left_eye, right_eye = c1, c2
else:
    left_eye, right_eye = c2, c1

# Create a blank glow layer
glow_layer = np.zeros_like(emissive[:,:,:3])

# BGR colors: Magenta (239, 70, 217), Blue (246, 130, 59)
# We fill the exact eye shapes with these colors
cv2.drawContours(glow_layer, [left_eye], -1, (239, 70, 217), cv2.FILLED)
cv2.drawContours(glow_layer, [right_eye], -1, (246, 130, 59), cv2.FILLED)

# Add a slight blur to make it look like a glowing light source
glow_layer = cv2.GaussianBlur(glow_layer, (11, 11), 0)

# Add the glowing eyes to the RGB channels of the emissive map
# Using cv2.add to clamp values at 255
emissive[:,:,:3] = cv2.add(emissive[:,:,:3], glow_layer)

cv2.imwrite('public/bots/tiger_emissive_only.png', emissive)
print("Glowing eyes successfully injected!")
