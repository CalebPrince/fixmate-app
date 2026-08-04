from PIL import Image
import sys

src = sys.argv[1]
dst = sys.argv[2]

img = Image.open(src).convert('RGBA')
pixels = img.load()
w, h = img.size

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # distance from white, used as inverse alpha so anti-aliased edges fade smoothly
        whiteness = min(r, g, b)
        if whiteness > 250:
            pixels[x, y] = (r, g, b, 0)
        elif whiteness > 200:
            alpha = int(255 * (250 - whiteness) / (250 - 200))
            pixels[x, y] = (r, g, b, alpha)

img.save(dst)
print('saved', dst, img.size, img.mode)
