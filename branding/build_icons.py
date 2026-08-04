from PIL import Image
import os

ROOT = r'D:\Websites\Diagnostic-app\android\app\src\main\res'
FLAT = r'D:\Websites\Diagnostic-app\branding\logo_concept_3.png'
FOREGROUND = r'D:\Websites\Diagnostic-app\branding\logo_foreground_alpha.png'

LEGACY_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

FOREGROUND_SIZES = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
}

flat = Image.open(FLAT).convert('RGBA')
fg = Image.open(FOREGROUND).convert('RGBA')

for bucket, size in LEGACY_SIZES.items():
    resized = flat.resize((size, size), Image.LANCZOS)
    out_dir = os.path.join(ROOT, bucket)
    resized.save(os.path.join(out_dir, 'ic_launcher.png'))
    resized.save(os.path.join(out_dir, 'ic_launcher_round.png'))
    print(f'{bucket}: legacy {size}x{size} written')

for bucket, size in FOREGROUND_SIZES.items():
    resized = fg.resize((size, size), Image.LANCZOS)
    out_dir = os.path.join(ROOT, bucket)
    os.makedirs(out_dir, exist_ok=True)
    resized.save(os.path.join(out_dir, 'ic_launcher_foreground.png'))
    print(f'{bucket}: foreground {size}x{size} written')

print('done')
