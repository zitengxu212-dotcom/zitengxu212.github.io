"""Compress all project images to ≤200KB per tech spec."""
import os
from PIL import Image

BASE = r'e:\Desktop\个人网站\主页图片'
CARD_MAX_W = 800
GALLERY_MAX_W = 2000
JPG_QUALITY = 82
PNG_MAX_KB = 500  # PNGs above this threshold get converted to JPG

total_before = 0
total_after = 0

for folder in sorted(os.listdir(BASE)):
    folder_path = os.path.join(BASE, folder)
    if not os.path.isdir(folder_path):
        continue
    for fname in sorted(os.listdir(folder_path)):
        fpath = os.path.join(folder_path, fname)
        if not os.path.isfile(fpath):
            continue
        ext = os.path.splitext(fname)[1].lower()
        if ext not in ('.jpg', '.jpeg', '.png'):
            continue

        size_before = os.path.getsize(fpath)
        total_before += size_before

        img = Image.open(fpath)
        is_card = fname.startswith('1.')  # card cover image

        # Convert RGBA → RGB for JPG output
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Resize
        max_w = CARD_MAX_W if is_card else GALLERY_MAX_W
        if img.width > max_w:
            ratio = max_w / img.width
            new_h = int(img.height * ratio)
            img = img.resize((max_w, new_h), Image.LANCZOS)

        # Decide output format
        if ext == '.png' and size_before > PNG_MAX_KB * 1024:
            # Large PNG → JPG
            out_name = os.path.splitext(fname)[0] + '.jpg'
            out_path = os.path.join(folder_path, out_name)
            img.save(out_path, 'JPEG', quality=JPG_QUALITY, optimize=True)
            if out_name != fname:
                os.remove(fpath)  # delete original PNG
                print(f'{folder}/{fname} → {out_name} (PNG→JPG)')
        elif ext == '.png':
            # Small PNG → optimize as PNG
            out_path = fpath
            img.save(out_path, 'PNG', optimize=True)
        else:
            # JPG → compress
            out_path = fpath
            img.save(out_path, 'JPEG', quality=JPG_QUALITY, optimize=True)

        size_after = os.path.getsize(out_path)
        total_after += size_after
        kb_before = size_before / 1024
        kb_after = size_after / 1024
        pct = (1 - size_after / size_before) * 100 if size_before else 0
        print(f'  {folder}/{fname}  {kb_before:.0f}KB → {kb_after:.0f}KB  ({pct:.0f}% saved)')

print(f'\nTotal: {total_before/1024/1024:.1f}MB → {total_after/1024/1024:.1f}MB')
