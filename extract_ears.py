import cv2
import numpy as np

img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
h, w = img.shape[:2]

# Crop top 35% and left/right 35% for ears
left_ear = img[0:int(h*0.35), 0:int(w*0.35)]
right_ear = img[0:int(h*0.35), int(w*0.65):w]

cv2.imwrite('public/bots/tiger_left_ear.png', left_ear)
cv2.imwrite('public/bots/tiger_right_ear.png', right_ear)
print("Ears extracted successfully!")
