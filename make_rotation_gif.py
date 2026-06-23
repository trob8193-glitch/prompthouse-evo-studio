from PIL import Image
import sys

def create_smooth_rotating_gif(files, dest_path):
    images = [Image.open(f).convert("RGBA") for f in files]
    
    frames = []
    
    # We will transition between the images in order: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0
    # To make it smooth, we use crossfades between each step
    
    sequence = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
    
    for idx in range(len(sequence)):
        current_idx = sequence[idx]
        next_idx = sequence[(idx + 1) % len(sequence)]
        
        img1 = images[current_idx]
        img2 = images[next_idx]
        
        # Hold current frame briefly
        for _ in range(3):
            frames.append(img1)
            
        # Crossfade to next frame
        for i in range(1, 6):
            alpha = i / 6.0
            blended = Image.blend(img1, img2, alpha=alpha)
            frames.append(blended)

    # Save as GIF
    frames[0].save(dest_path, save_all=True, append_images=frames[1:], duration=80, loop=0, disposal=2)
    print(f"Saved smooth GIF to {dest_path}")

if __name__ == "__main__":
    if len(sys.argv) < 9:
        print("Usage: python make_rotation_gif.py <7 input images> <dest_path>")
        sys.exit(1)
        
    files = sys.argv[1:8]
    dest = sys.argv[8]
    create_smooth_rotating_gif(files, dest)
