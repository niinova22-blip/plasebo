# -*- coding: utf-8 -*-
"""App Store kartlari — kuresel (Ingilizce) duzen, Eylul 2026.

    python scripts/store-shots-global.py

`raw-en/` altindaki gercek uygulama karelerini kullanir. `store-shots-pro.py`
acik zeminli ve sakin bir duzendi; bu surum kuresel magaza icin:

  - koyu, alacakaranlik tonlu degrade zemin (kucuk onizlemede one cikar),
  - kalin sans baslik; ikinci satir vurgu renginde,
  - arama kelimelerini (breathing, calm, focus, sleep, mood) iceren,
    fayda odakli ama tibbi iddia icermeyen basliklar (Guideline 1.4 / 2.3).

Cikti: store/graphics/screenshots/global-en/ios[/6.9-inch-1320|/6.5-inch]
"""
import importlib.util
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

os.environ['RAW_DIR'] = 'raw-en'
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('store_shots', os.path.join(HERE, 'store-shots.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

ROOT = base.ROOT
W, H = base.W, base.H
BOLD, MED = base.SANS_BOLD, base.SANS_MED

WHITE = (255, 255, 255)
SUB = (214, 208, 232)

# (ham kare, 1. satir, 2. satir (vurgu), yardimci baslik, ust renk, alt renk, vurgu, isik)
CARDS = [
    ('01-ana-ekran', 'Calm your mind', 'in 2 minutes a day',
     'One color, one sound, one breath.',
     (38, 32, 72), (92, 66, 140), (201, 170, 255), (170, 130, 255)),
    ('02-ritual', 'Relax with calming', 'colors & sounds',
     'A soothing guided session, every day.',
     (30, 36, 80), (70, 92, 160), (160, 200, 255), (120, 160, 255)),
    ('03-nefes', 'Guided breathing', 'that slows you down',
     'Box breathing, 4-7-8 and more.',
     (22, 44, 70), (48, 104, 136), (140, 225, 230), (90, 200, 220)),
    ('04-istatistik', 'Track your mood', 'and see your progress',
     'Effect score, streaks and daily insights.',
     (40, 30, 66), (118, 70, 130), (255, 180, 214), (230, 120, 190)),
    ('05-arsiv', 'Build a mindful', 'daily habit',
     'Every session saved, privately on your phone.',
     (34, 34, 60), (80, 80, 130), (190, 196, 255), (140, 150, 255)),
    ('06-plus', 'Free daily ritual.', 'Plus measures it.',
     'On-device face-scan mood check & breath analysis.',
     (44, 28, 60), (128, 76, 120), (255, 200, 170), (240, 150, 140)),
]

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
    return Image.alpha_composite(canvas, layer)


def fit_font(path, text, max_w, start):
    size = start
    while size > 40:
        f = ImageFont.truetype(path, size)
        if f.getlength(text) <= max_w:
            return f
        size -= 2
    return ImageFont.truetype(path, size)


def with_status_bar(shot, iw, ih):
    """Ham karenin ustune iOS durum cubugu (9:41, sinyal, Wi-Fi, pil) ekler.

    Ham karelerde durum cubugu kirpilmis; dogrudan konunca dinamik ada
    icerigin (baslik, ilerleme cubugu) ustune biniyordu. Kare, cubuk kadar
    asagi itilir (dikeyde ~%5 sikistirma, gozle fark edilmiyor).
    """
    sb = round(ih * 0.056)
    img = Image.new('RGB', (iw, ih), shot.getpixel((4, 4)))
    img.paste(shot.resize((iw, ih - sb), Image.LANCZOS), (0, sb))
    bg = shot.getpixel((4, 4))
    dark_bg = sum(bg) / 3 < 128
    fg = (255, 255, 255) if dark_bg else (20, 20, 24)
    d = ImageDraw.Draw(img)
    s = iw / 390.0
    tf = ImageFont.truetype(base.SANS_BOLD, round(15 * s))
    cy = round(sb * 0.58)
    d.text((round(40 * s), cy), '9:41', font=tf, fill=fg, anchor='lm')
    # sinyal cubuklari
    x = iw - round(96 * s)
    for i in range(4):
        h = round((4 + i * 2.2) * s)
        d.rounded_rectangle([x + i * round(4.6 * s), cy + round(5 * s) - h, x + i * round(4.6 * s) + round(3 * s),
                             cy + round(5 * s)], radius=round(1 * s), fill=fg)
    # Wi-Fi: uc yay
    wx, wy = iw - round(66 * s), cy + round(5 * s)
    for rr in (11, 7.5, 4):
        r = round(rr * s)
        d.arc([wx - r, wy - r, wx + r, wy + r], 225, 315, fill=fg, width=max(2, round(2 * s)))
    d.ellipse([wx - round(1.6 * s), wy - round(3 * s), wx + round(1.6 * s), wy], fill=fg)
    # pil
    bx = iw - round(46 * s)
    bw, bh = round(24 * s), round(11.5 * s)
    d.rounded_rectangle([bx, cy - bh // 2, bx + bw, cy + bh // 2], radius=round(3 * s),
                        outline=fg, width=max(1, round(1.2 * s)))
    d.rounded_rectangle([bx + round(2 * s), cy - bh // 2 + round(2 * s), bx + bw - round(2 * s),
                         cy + bh // 2 - round(2 * s)], radius=round(1.5 * s), fill=fg)
    d.rounded_rectangle([bx + bw + round(1.5 * s), cy - round(2 * s), bx + bw + round(3 * s), cy + round(2 * s)],
                        radius=1, fill=fg)
    return img


def make_card(size, shot, l1, l2, sub, top, bottom, accent, light):
    cw, ch = size
    k = cw / 1290.0
    canvas = gradient(size, top, bottom).convert('RGBA')
    canvas = glow(canvas, int(cw * 0.5), int(ch * 0.62), int(620 * k), light, 120)
    canvas = glow(canvas, int(cw * 0.95), int(ch * 0.08), int(380 * k), light, 70)
    d = ImageDraw.Draw(canvas)

    max_w = cw - round(2 * 90 * k)
    start = round(118 * k)
    f1 = fit_font(BOLD, l1, max_w, start)
    f2 = fit_font(BOLD, l2, max_w, start)
    f = f1 if f1.size < f2.size else f2
    y = round(150 * k)
    for text, color in ((l1, WHITE), (l2, accent)):
        tw = f.getlength(text)
        d.text(((cw - tw) / 2, y), text, font=f, fill=color)
        y += round(f.size * 1.14)
    sf = fit_font(MED, sub, max_w, round(48 * k))
    d.text(((cw - sf.getlength(sub)) / 2, y + round(30 * k)), sub, font=sf, fill=SUB)

    # Telefon kartin icine TAMAMEN sigar: alt koseler, ana ekran cubugu ve
    # golge gorunur. Eski duzende telefon kartin altindan tasip kesik
    # duruyordu; boyut artik genislikten degil kalan yukseklikten hesaplaniyor.
    y0 = round(y + 30 * k + sf.size + 70 * k)
    bottom_margin = round(120 * k)
    bezel = round(18 * k)
    rim = round(6 * k)                       # metal kenar
    outer_h = ch - y0 - bottom_margin
    inner_h = outer_h - 2 * (bezel + rim)
    inner_w = round(inner_h * W / H)
    outer_w = inner_w + 2 * (bezel + rim)
    x0 = (cw - outer_w) // 2
    r_out = round(outer_w * 0.135)
    r_in = r_out - bezel - rim

    # zemin golgesi: telefonun altinda yere dusen yumusak elips + genel golge
    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([x0 + round(20 * k), y0 + round(40 * k), x0 + outer_w - round(20 * k),
                          y0 + outer_h + round(10 * k)], radius=r_out, fill=(0, 0, 0, 120))
    sd.ellipse([x0 + round(60 * k), y0 + outer_h - round(10 * k), x0 + outer_w - round(60 * k),
                y0 + outer_h + round(60 * k)], fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(round(40 * k)))
    canvas = Image.alpha_composite(canvas, shadow)

    body = Image.new('RGBA', (outer_w + 2 * round(6 * k), outer_h), (0, 0, 0, 0))
    ox = round(6 * k)                        # yan tuslar icin pay
    bd = ImageDraw.Draw(body)
    btn = (58, 58, 68, 255)
    bw = round(7 * k)
    # yan tuslar: solda sessiz + ses, sagda guc
    for top, length in ((0.17, 0.045), (0.25, 0.085), (0.355, 0.085)):
        bd.rounded_rectangle([ox - bw, round(outer_h * top), ox + 2, round(outer_h * (top + length))],
                             radius=bw // 2, fill=btn)
    bd.rounded_rectangle([ox + outer_w - 2, round(outer_h * 0.27), ox + outer_w + bw, round(outer_h * 0.39)],
                         radius=bw // 2, fill=btn)
    # metal kenar (acik gri) ve siyah cerceve
    bd.rounded_rectangle([ox, 0, ox + outer_w - 1, outer_h - 1], radius=r_out, fill=(92, 92, 104, 255))
    bd.rounded_rectangle([ox + 1, 1, ox + outer_w - 2, outer_h - 2], radius=r_out - 1,
                         outline=(200, 200, 214, 255), width=max(2, round(2 * k)))
    bd.rounded_rectangle([ox + rim, rim, ox + outer_w - 1 - rim, outer_h - 1 - rim],
                         radius=r_out - rim, fill=(6, 6, 9, 255))
    inner = with_status_bar(shot.convert('RGB'), inner_w, inner_h)
    mask = Image.new('L', (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, inner_w - 1, inner_h - 1], radius=r_in, fill=255)
    sx, sy = ox + rim + bezel, rim + bezel
    body.paste(inner, (sx, sy), mask)
    isl_w, isl_h = round(inner_w * 0.29), round(inner_w * 0.085)
    ImageDraw.Draw(body).rounded_rectangle(
        [sx + (inner_w - isl_w) // 2, sy + round(inner_w * 0.03),
         sx + (inner_w + isl_w) // 2, sy + round(inner_w * 0.03) + isl_h],
        radius=isl_h // 2, fill=(0, 0, 0, 255))
    # cam yansimasi: sol ustten hafif capraz parilti
    gloss = Image.new('RGBA', body.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    gd.polygon([(sx, sy), (sx + int(inner_w * 0.55), sy), (sx, sy + int(inner_h * 0.42))], fill=(255, 255, 255, 18))
    gmask = Image.new('L', body.size, 0)
    ImageDraw.Draw(gmask).rounded_rectangle([sx, sy, sx + inner_w - 1, sy + inner_h - 1], radius=r_in, fill=255)
    body = Image.composite(Image.alpha_composite(body, gloss), body, gmask)

    canvas.paste(body, (x0 - ox, y0), body)
    return canvas.convert('RGB')


def main():
    out_root = os.path.join(ROOT, 'store', 'graphics', 'screenshots', 'global-en')
    for sub, size in SIZES:
        out_dir = os.path.join(out_root, sub)
        os.makedirs(out_dir, exist_ok=True)
        for name, l1, l2, sub_text, top, bottom, accent, light in CARDS:
            shot = base.real_shot(name)
            if shot is None:
                sys.exit('ham kare yok: ' + name)
            path = os.path.join(out_dir, name + '.png')
            make_card(size, shot, l1, l2, sub_text, top, bottom, accent, light).save(path)
            print(path, size)


if __name__ == '__main__':
    main()
