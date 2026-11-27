"""Generate the site's link-preview card (images/og.jpg, 1200x630). Run: python tools/og.py"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
F = Path('C:/Windows/Fonts')
W, H = 1200, 630
bg, ink, muted, accent = (248, 244, 236), (31, 24, 48), (106, 98, 128), (91, 58, 156)

im = Image.new('RGB', (W, H), bg)
d = ImageDraw.Draw(im)
# soft purple glow, top-right
glow = Image.new('L', (W, H), 0)
ImageDraw.Draw(glow).ellipse((700, -350, 1500, 350), fill=70)
im.paste(Image.new('RGB', (W, H), (205, 190, 235)), (0, 0), glow.resize((W // 8, H // 8)).resize((W, H), Image.BICUBIC))

serif = lambda s: ImageFont.truetype(str(F / 'georgia.ttf'), s)
serif_i = lambda s: ImageFont.truetype(str(F / 'georgiai.ttf'), s)
sans = lambda s: ImageFont.truetype(str(F / 'segoeui.ttf'), s)
sans_b = lambda s: ImageFont.truetype(str(F / 'seguisb.ttf'), s)

d.rounded_rectangle((80, 80, 330, 122), radius=21, fill=(236, 228, 247))
d.text((100, 89), 'PORTFOLIO · 2026', font=sans_b(20), fill=accent)
d.text((76, 160), 'Audi Joel', font=serif(104), fill=ink)
d.text((76, 272), 'Rahardja', font=serif_i(104), fill=accent)
d.text((82, 420), 'Computer Science · AI stream · BINUS University', font=sans_b(30), fill=accent)
d.text((82, 468), 'Speech, NLP & retrieval systems — measured, not guessed.', font=sans(28), fill=muted)
d.text((82, 520), 'IEEE Xplore · ICORIS 2026 (first author)', font=sans(28), fill=muted)

out = root / 'images' / 'og.jpg'
im.save(out, 'JPEG', quality=86, optimize=True, progressive=True)
print(out.name, out.stat().st_size // 1024, 'KB')
