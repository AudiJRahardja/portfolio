"""Crop a browser screenshot to 16:10 and save it as WebP (for cards) + JPEG (for link previews).

Usage: python tools/shot.py <input.png|jpg> <slug> <left> <top> <right> <bottom>
Writes images/projects/<slug>.webp (1280x800) and images/projects/<slug>.jpg (1200x750).
"""
import sys
from pathlib import Path
from PIL import Image

src, slug = sys.argv[1], sys.argv[2]
box = tuple(int(v) for v in sys.argv[3:7])
out = Path(__file__).resolve().parent.parent / 'images' / 'projects'
out.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert('RGB').crop(box)
w, h = im.size
target = 16 / 10
# trim to an exact 16:10 window, keeping the top of the page
if w / h > target:
    nw = round(h * target); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
else:
    im = im.crop((0, 0, w, round(w / target)))

im.resize((1280, 800), Image.LANCZOS).save(out / f'{slug}.webp', 'WEBP', quality=80, method=6)
im.resize((1200, 750), Image.LANCZOS).save(out / f'{slug}.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
for f in (out / f'{slug}.webp', out / f'{slug}.jpg'):
    print(f.name, f.stat().st_size // 1024, 'KB')
