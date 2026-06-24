import cv2
import numpy as np
import sys

def process_bot_images(src_path, shell_path, glow_path):
    img = cv2.imread(src_path)
    if img is None:
        print("Failed to load image")
        sys.exit(1)
        
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Define range of green color in HSV
    lower_green = np.array([35, 50, 50])
    upper_green = np.array([85, 255, 255])
    
    # Threshold the HSV image to get only green colors
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Smooth the mask for the glow
    mask_blurred = cv2.GaussianBlur(mask, (21, 21), 0)
    
    # 1. Save the Glow
    b, g, r = cv2.split(img)
    rgba_glow = [b, g, r, mask_blurred]
    dst_glow = cv2.merge(rgba_glow, 4)
    cv2.imwrite(glow_path, dst_glow)
    print("Glow saved to", glow_path)
    
    # 2. Save the Shell (remove green)
    # Where mask is high, we set the original image pixels to black
    img_shell = img.copy()
    img_shell[mask > 10] = [0, 0, 0]
    
    cv2.imwrite(shell_path, img_shell)
    print("Shell saved to", shell_path)

if __name__ == "__main__":
    src = sys.argv[1]
    shell = sys.argv[2]
    glow = sys.argv[3]
    process_bot_images(src, shell, glow)
