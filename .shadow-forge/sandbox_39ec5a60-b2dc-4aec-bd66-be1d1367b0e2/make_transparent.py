from PIL import Image
import sys

def make_transparent(img_path, dest_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # Change all dark pixels to transparent
        if item[0] < 20 and item[1] < 20 and item[2] < 20:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(dest_path, "PNG")
    print(f"Saved transparent image to {dest_path}")

if __name__ == "__main__":
    src = sys.argv[1]
    dest = sys.argv[2]
    make_transparent(src, dest)
