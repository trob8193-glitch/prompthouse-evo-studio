from pathlib import Path
from PIL import Image
for folder in ['public/bots', 'dist/bots']:
    p = Path(folder)
    if not p.exists():
        print(folder, 'MISSING')
        continue
    print('FOLDER', folder)
    for f in sorted(p.glob('*.png')):
        try:
            im = Image.open(f)
            mode = im.mode
            alpha = 'A' in mode
            has_transparent = False
            if alpha:
                alpha_data = im.getchannel('A')
                has_transparent = any(a == 0 for a in alpha_data.getdata())
            print(f.name, 'mode=', mode, 'alpha=', alpha, 'transparent_pixels=', has_transparent)
        except Exception as e:
            print('ERR', f.name, e)
