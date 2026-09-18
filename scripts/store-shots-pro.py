# -*- coding: utf-8 -*-
"""App Store kartlari — profesyonel duzen (Eylul 2026).

    python scripts/store-shots-pro.py [--en]

`store-shots.py` ile ayni gercek ham kareleri (`store/graphics/screenshots/raw/`)
kullanir; yalnizca kart tasarimini yukseltir:

  - alacakaranlik tonlu degrade zemin ve yumusak isik lekesi,
  - buyuk serif baslik + altinda tek satirlik yardimci baslik,
  - telefonun altinda yumusak golge, ekran cercevesinde ince parlak kenar,
  - 6.9" icin 1320x2868 ve 1290x2796, 6.5" icin 1242x2688.

Basliklar fayda odaklidir ve tibbi iddia icermez (Guideline 1.4).
"""
import importlib.util
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

EN = '--en' in sys.argv
if EN:
    os.environ['RAW_DIR'] = 'raw-en'

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('store_shots', os.path.join(HERE, 'store-shots.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

ROOT = base.ROOT
SERIF, SANS_MED = base.SERIF, base.SANS_MED
W, H = base.W, base.H

# (ham kare, baslik, yardimci baslik, zemin ust rengi, zemin alt rengi)
CARDS = [
    ('01-ana-ekran', 'Günde 2 dakika,\nsana ait bir ritüel',
     'Bir renk, bir ses, bir nefes.', (253, 247, 241), (226, 214, 222)),
    ('02-ritual', 'Önce bir renk.\nİki dakika, sadece izle.',
     'Akan metin ve geri sayımla ilk adım.', (236, 240, 247), (196, 210, 228)),
    ('03-nefes', 'Sonra nefes:\nadım adım say.',
     'Ekrandaki ritimle nefes al.', (238, 243, 246), (200, 214, 226)),
    ('04-istatistik', 'Ölçüm ekranda,\ntahmin değil.',
     'Seri, etki skoru ve devamlılık.', (253, 247, 241), (222, 218, 232)),
    ('05-arsiv', 'Her ritüel kayıtlı,\nhepsi telefonunda.',
     'Geçmiş ritüellerine istediğin an dön.', (250, 244, 240), (228, 216, 222)),
    ('06-plus', 'Ritüel ücretsiz.\nPlus ölçümü açar.',
     'Plasebo Plus: yüz taraması ve nefes analizi.', (236, 240, 247), (186, 202, 224)),
]

CARDS_EN = [
    ('01-ana-ekran', 'Two minutes a day,\na ritual that is yours',
     'One color, one sound, one breath.', (253, 247, 241), (226, 214, 222)),
    ('02-ritual', 'First, a color.\nTwo minutes, just look.',
     'Flowing text and a countdown guide you.', (236, 240, 247), (196, 210, 228)),
    ('03-nefes', 'Then breathe:\ncount it step by step.',
     'Follow the rhythm on screen.', (238, 243, 246), (200, 214, 226)),
    ('04-istatistik', 'Measured on screen,\nnot guessed.',
     'Streaks, effect score and consistency.', (253, 247, 241), (222, 218, 232)),
    ('05-arsiv', 'Every ritual saved,\nall on your phone.',
     'Revisit past rituals any time.', (250, 244, 240), (228, 216, 222)),
    ('06-plus', 'The ritual is free.\nPlus does the measuring.',
     'Plasebo Plus: face scan and breath analysis.', (236, 240, 247), (186, 202, 224)),
]
if EN:
    CARDS = CARDS_EN

SIZES = [
    ('ios', (1290, 2796)),
    ('ios/6.9-inch-1320', (1320, 2868)),
    ('ios/6.5-inch', (1242, 2688)),
]


def gradient(size, top, bottom):
    w, h = size
    col = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / float(h - 1)
        col.putpixel((0, y), tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return col.resize((w, h))


def glow(canvas, cx, cy, r, color, alpha):
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(r // 2))
    canvas.paste(layer, (0, 0), layer)


def make_card(size, shot, headline, sub, top, bottom):
    cw, ch = size
    k = cw / 1290.0
    canvas = gradient(size, top, bottom).convert('RGBA')
    glow(canvas, int(cw * 0.85), int(ch * 0.30), int(520 * k), base.GLOW, 110)
    glow(canvas, int(cw * 0.10), int(ch * 0.85), int(460 * k), (255, 255, 255), 130)
    d = ImageDraw.Draw(canvas)

    hf = ImageFont.truetype(SERIF, round(104 * k))
    y = round(130 * k)
    for line in headline.split('\n'):
        d.text((round(96 * k), y), line, font=hf, fill=base.TEXT)
        y += round(120 * k)
    sf = ImageFont.truetype(SANS_MED, round(46 * k))
    d.text((round(100 * k), y + round(22 * k)), sub, font=sf, fill=base.SUB)

    bezel = round(22 * k)
    outer_w = round(cw * 0.86)
    inner_w = outer_w - 2 * bezel
    inner_h = round(inner_w * H / W)
    outer_h = inner_h + 2 * bezel
    x0 = (cw - outer_w) // 2
    y0 = round(640 * k)

    body = Image.new('RGBA', (outer_w, outer_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, outer_w - 1, outer_h - 1], radius=round(122 * k), fill=(26, 28, 34, 255))
    bd.rounded_rectangle([1, 1, outer_w - 2, outer_h - 2], radius=round(121 * k),
                         outline=(255, 255, 255, 60), width=max(2, round(3 * k)))
    inner = shot.convert('RGB').resize((inner_w, inner_h), Image.LANCZOS)
    mask = Image.new('L', (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, inner_w - 1, inner_h - 1], radius=round(100 * k), fill=255)
    body.paste(inner, (bezel, bezel), mask)
    isl_w, isl_h = round(inner_w * 0.30), round(36 * k)
    ImageDraw.Draw(body).rounded_rectangle(
        [(outer_w - isl_w) // 2, bezel + round(16 * k), (outer_w + isl_w) // 2, bezel + round(16 * k) + isl_h],
        radius=isl_h // 2, fill=(12, 13, 16, 255))

    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [x0, y0 + round(30 * k), x0 + outer_w, y0 + outer_h], radius=round(122 * k), fill=(40, 40, 70, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(round(38 * k)))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(body, (x0, y0), body)
    return canvas.convert('RGB')


def main():
    out_root = os.path.join(ROOT, 'store', 'graphics', 'screenshots', 'pro-en' if EN else 'pro')
    for sub, size in SIZES:
        out_dir = os.path.join(out_root, sub)
        os.makedirs(out_dir, exist_ok=True)
        for name, headline, sub_text, top, bottom in CARDS:
            shot = base.real_shot(name)
            if shot is None:
                sys.exit('ham kare yok: ' + name)
            path = os.path.join(out_dir, name + '.png')
            make_card(size, shot, headline, sub_text, top, bottom).save(path)
            print(path, size)


if __name__ == '__main__':
    main()
