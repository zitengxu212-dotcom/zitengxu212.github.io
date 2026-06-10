"""Compress all project images to WebP ≤200KB per tech spec."""
import os
from PIL import Image

BASE = r'e:\Desktop\个人网站\images'
CARD_MAX_W = 800
GALLERY_MAX_W = 2000
WEBP_QUALITY = 82
TARGET_KB = 200
MIN_QUALITY = 40  # don't go below this

total_before = 0
total_after = 0
converted = 0

def compress_to_target(img, out_path, max_w, is_card):
    """Save as WebP, lowering quality iteratively until ≤TARGET_KB."""
    global total_before, total_after, converted

    # Resize if needed
    if img.width > max_w:
        ratio = max_w / img.width
        new_h = int(img.height * ratio)
        img = img.resize((max_w, new_h), Image.LANCZOS)

    # Convert RGBA/P → RGB for lossy WebP
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    q = WEBP_QUALITY
    while q >= MIN_QUALITY:
        img.save(out_path, 'WEBP', quality=q, method=6)
        kb = os.path.getsize(out_path) / 1024
        if kb <= TARGET_KB:
            break
        q -= 5

    return os.path.getsize(out_path)


# ── Process project folders ──
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
        is_card = fname.startswith('1.')  # card cover → 800px, others → 2000px
        max_w = CARD_MAX_W if is_card else GALLERY_MAX_W

        out_name = os.path.splitext(fname)[0] + '.webp'
        out_path = os.path.join(folder_path, out_name)

        size_after = compress_to_target(img, out_path, max_w, is_card)
        total_after += size_after
        converted += 1

        # Delete original if different format
        if out_name != fname:
            os.remove(fpath)

        kb_before = size_before / 1024
        kb_after = size_after / 1024
        pct = (1 - size_after / size_before) * 100 if size_before else 0
        flag = ' !!OVER' if kb_after > TARGET_KB else ''
        print(f'  {folder}/{fname}  {kb_before:.0f}KB -> {kb_after:.0f}KB  ({pct:.0f}%){flag}')

# ── Process root-level images ──
for fname in sorted(os.listdir(BASE)):
    fpath = os.path.join(BASE, fname)
    if not os.path.isfile(fpath):
        continue
    ext = os.path.splitext(fname)[1].lower()
    if ext not in ('.jpg', '.jpeg', '.png'):
        continue

    size_before = os.path.getsize(fpath)
    total_before += size_before

    img = Image.open(fpath)
    out_name = os.path.splitext(fname)[0] + '.webp'
    out_path = os.path.join(BASE, out_name)

    # Root images: keep original dimensions, just convert
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    q = WEBP_QUALITY
    while q >= MIN_QUALITY:
        img.save(out_path, 'WEBP', quality=q, method=6)
        if os.path.getsize(out_path) / 1024 <= TARGET_KB:
            break
        q -= 5

    size_after = os.path.getsize(out_path)
    total_after += size_after
    converted += 1

    if out_name != fname:
        os.remove(fpath)

    kb_before = size_before / 1024
    kb_after = size_after / 1024
    pct = (1 - size_after / size_before) * 100 if size_before else 0
    print(f'  [root] {fname}  {kb_before:.0f}KB -> {kb_after:.0f}KB  ({pct:.0f}%)')

print(f'\nTotal: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB')
print(f'Files converted: {converted}')
