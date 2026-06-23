import sys
from PIL import Image

try:
    img = Image.open('public/bots/sovereignty.webp')
    print(f"Mode: {img.mode}, Size: {img.size}")
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        print("Image has transparency.")
    else:
        print("Image does NOT have transparency.")
except Exception as e:
    print(f"Error: {e}")
