import cv2
import numpy as np

img = cv2.imread('public/bots/tiger_emissive_only.png', cv2.IMREAD_GRAYSCALE)
h, w = img.shape

_, thresh = cv2.threshold(img, 200, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

contours = sorted(contours, key=cv2.contourArea, reverse=True)

print(f"Image size: {w}x{h}")
for i, c in enumerate(contours[:10]):
    M = cv2.moments(c)
    if M["m00"] != 0:
        cX = int(M["m10"] / M["m00"])
        cY = int(M["m01"] / M["m00"])
        print(f"Blob {i}: Area {cv2.contourArea(c)}, Center ({cX}, {cY})")
