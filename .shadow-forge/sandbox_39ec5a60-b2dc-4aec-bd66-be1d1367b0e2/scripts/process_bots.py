import os
import cv2
import numpy as np
from rembg import remove

def process_images():
    input_dir = 'public/bots'
    output_dir = 'public/bots'
    
    for filename in os.listdir(input_dir):
        if filename.endswith('.png'):
            filepath = os.path.join(input_dir, filename)
            print(f"Processing {filepath}...")
            
            # Read image
            with open(filepath, 'rb') as f:
                input_data = f.read()
                
            # Remove background
            output_data = remove(input_data)
            
            # Convert to numpy array for cv2 processing
            nparr = np.frombuffer(output_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
            
            if img.shape[2] == 4:
                # Find brightest spots (likely glowing eyes/pupils)
                # Convert to grayscale
                gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
                # Threshold to find very bright pixels (e.g. > 240)
                _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
                
                # Make those bright spots fully transparent
                # img[:,:,3] is the alpha channel
                # Where mask is 255, set alpha to 0
                img[mask == 255, 3] = 0
                
                # Save the processed image back
                cv2.imwrite(filepath, img)
                print(f"Saved {filepath}")

if __name__ == '__main__':
    process_images()
