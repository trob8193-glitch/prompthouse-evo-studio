import os
import cv2
import numpy as np

def process_images():
    input_dir = 'public/bots'
    
    for filename in os.listdir(input_dir):
        if filename.endswith('.png') and not filename.endswith('_glow.png') and not filename.endswith('_edges.png'):
            filepath = os.path.join(input_dir, filename)
            out_filepath = filepath.replace('.png', '_edges.png')
            print(f"Processing {filepath} to {out_filepath}...")
            
            # Read image
            img = cv2.imread(filepath, cv2.IMREAD_UNCHANGED)
            if img is None:
                continue
                
            if img.shape[2] == 4:
                # Use only the non-transparent parts for edge detection
                alpha = img[:, :, 3]
                gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
                
                # Apply strong blur to eliminate fur/texture and keep only major components
                blurred = cv2.GaussianBlur(gray, (9, 9), 0)
                
                # Use Canny with extremely high thresholds
                edges = cv2.Canny(blurred, 100, 200)
                
                # Mask out edges that fall outside the original image's opaque areas
                edges[alpha < 128] = 0
                
                # Dilate slightly to make the main component glow more substantial
                kernel = np.ones((2,2), np.uint8)
                edges = cv2.dilate(edges, kernel, iterations=1)
                
                # Create result image with white pixels and alpha channel = edges
                result = np.zeros((edges.shape[0], edges.shape[1], 4), dtype=np.uint8)
                result[:, :, 0] = 255
                result[:, :, 1] = 255
                result[:, :, 2] = 255
                result[:, :, 3] = edges
                
                cv2.imwrite(out_filepath, result)
                print(f"Saved {out_filepath}")

if __name__ == '__main__':
    process_images()
