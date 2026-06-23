import cv2
import numpy as np

# Load the original tiger
img = cv2.imread('public/bots/ph_evo_colored_tiger_transparent.png', cv2.IMREAD_UNCHANGED)
b, g, r, a = cv2.split(img)

# Convert to HSV to safely boost saturation
hsv = cv2.cvtColor(cv2.merge([b, g, r]), cv2.COLOR_BGR2HSV)
h_chan, s_chan, v_chan = cv2.split(hsv)

# Boost Saturation by 2.5x to make the blue and purple ridiculously vibrant
s_float = s_chan.astype(np.float32) * 2.5
s_chan = np.clip(s_float, 0, 255).astype(np.uint8)

# Boost Contrast on the Value channel to make it look like sleek, high-contrast metal
v_float = v_chan.astype(np.float32)
# Deepen shadows and brighten highlights
v_float = (v_float - 128) * 1.5 + 128
v_chan = np.clip(v_float, 0, 255).astype(np.uint8)

# Merge back and convert to BGR
enhanced_hsv = cv2.merge([h_chan, s_chan, v_chan])
enhanced_bgr = cv2.cvtColor(enhanced_hsv, cv2.COLOR_HSV2BGR)

# Re-attach the original alpha channel
enhanced_img = cv2.merge([
    enhanced_bgr[:,:,0], 
    enhanced_bgr[:,:,1], 
    enhanced_bgr[:,:,2], 
    a
])

cv2.imwrite('public/bots/tiger_enhanced.png', enhanced_img)
print("Enhanced metallic colors generated!")
