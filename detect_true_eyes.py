import cv2
import numpy as np

img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)

# The eyes are dark slits in the center of the face.
# Crop to the central region to avoid edge artifacts.
# X from 250 to 774. Y from 350 to 650.
roi = gray[350:650, 250:774]

# Threshold to find dark spots (eyes). Eyes are usually very dark, so < 40 brightness.
_, thresh = cv2.threshold(roi, 40, 255, cv2.THRESH_BINARY_INV)

contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key=cv2.contourArea, reverse=True)

print("Dark blobs in central region (X:250-774, Y:350-650):")
for i, c in enumerate(contours[:10]):
    M = cv2.moments(c)
    if M["m00"] != 0:
        cX = int(M["m10"] / M["m00"]) + 250
        cY = int(M["m01"] / M["m00"]) + 350
        
        # Calculate bounding box to get width/height ratio (eyes are wide slits)
        x,y,w,h = cv2.boundingRect(c)
        ratio = w / float(h) if h > 0 else 0
        
        print(f"Blob {i}: Area {cv2.contourArea(c)}, Center ({cX}, {cY}), WxH: {w}x{h}, Ratio: {ratio:.2f}")
