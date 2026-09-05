# -*- coding: utf-8 -*-
"""Aday tema paletlerinin ve yeni ritual metninin maketlerini uretir.

    python scripts/theme-mockups.py [cikti_klasoru]

Cikti verilmezse masaustune yazar.

Bunlar gercek ekran goruntusu degil: iOS uygulamasi Windows'ta
calistirilamadigi icin duzen, tipografi ve renkler uygulamanin kendi
sabitlerinden alinarak yeniden ciziliyor. Amac, bir tema secimini
derleme harcamadan gozle karsilastirabilmek.

Her palet bes renkten olusuyor (zemin, yuzey, metin, ikincil, vurgu);
geri kalan her sey bu besinin tonu. Kural bilincli: uygulamanin su anki
paletinde yedi renk var ve ikisi (mor + neon yesil) ayni anda ekranda
oldugunda goz nereye bakacagini bilemiyor.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'node_modules', '@expo-google-fonts')
SERIF = os.path.join(FONTS, 'dm-serif-display', '400Regular', 'DMSerifDisplay_400Regular.ttf')
SANS = os.path.join(FONTS, 'space-grotesk', '400Regular', 'SpaceGrotesk_400Regular.ttf')
SANS_MED = os.path.join(FONTS, 'space-grotesk', '500Medium', 'SpaceGrotesk_500Medium.ttf')
SANS_BOLD = os.path.join(FONTS, 'space-grotesk', '700Bold', 'SpaceGrotesk_700Bold.ttf')
STORY = os.path.join(FONTS, 'eb-garamond', '500Medium_Italic', 'EBGaramond_500Medium_Italic.ttf')

W, H = 390, 844  # iPhone nokta olculeri
S = 2            # 2x


def hexc(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


class Palette:
    """Bes renk + isim. Geri kalan ton, bu beslinin karisimindan cikiyor."""

    def __init__(self, key, name, note, bg, surface, text, sub, accent, dark_bg=None):
        self.key = key
        self.name = name
        self.note = note
        self.bg = hexc(bg)
        self.surface = hexc(surface)
        self.text = hexc(text)
        self.sub = hexc(sub)
        self.accent = hexc(accent)
        # Ritual her temada koyu kaliyor; acik temalarda zemin olarak
        # metnin kendisi degil, ondan turetilmis daha koyu bir ton kullaniliyor.
        self.dark_bg = hexc(dark_bg) if dark_bg else self.bg

    def mix(self, a, b, t):
        return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

    @property
    def border(self):
        return self.mix(self.bg, self.text, 0.12)

    @property
    def accent_soft(self):
        return self.mix(self.bg, self.accent, 0.18)


PALETTES = [
    Palette(
        'sis', 'Sis',
        'Yumusak gece. Saf siyah yok, saf beyaz yok; ikisi de goz kamastiriyor.',
        bg='#15161A', surface='#1F2128', text='#E6E3DB', sub='#8A8882',
        accent='#6E88A8', dark_bg='#15161A',
    ),
    Palette(
        'kum', 'Kum',
        'Kagit tonu. Gunduz kullanimda en dinlendirici olan; vurgu adacayi yesili.',
        bg='#F4F1EA', surface='#FBF9F4', text='#3A3833', sub='#A29D93',
        accent='#8B9E8F', dark_bg='#22231F',
    ),
    Palette(
        'kil', 'Kil',
        'Ilik toprak. Kum ile ayni sakinlik, vurgusu daha canli (terracotta).',
        bg='#F6F2EE', surface='#FFFDFA', text='#3B3531', sub='#A99C93',
        accent='#C08B72', dark_bg='#241F1C',
    ),
]


def f(path, size):
    return ImageFont.truetype(path, round(size * S))


def center(d, cx, y, text, font, fill):
    w = d.textlength(text, font=font)
    d.text((cx * S - w / 2, y * S), text, font=font, fill=fill)


def wrap(d, text, font, max_w):
    words, lines, cur = text.split(' '), [], ''
    for word in words:
        trial = (cur + ' ' + word).strip()
        if d.textlength(trial, font=font) <= max_w * S:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def home_frame(p):
    """Ana ekran: selamlama, seri, hedefler, gunun formul karti."""
    img = Image.new('RGB', (W * S, H * S), p.bg)
    d = ImageDraw.Draw(img, 'RGBA')

    d.text((24 * S, 62 * S), 'Merhaba,', font=f(SANS, 12), fill=p.sub)
    d.text((24 * S, 80 * S), 'Deniz', font=f(SERIF, 24), fill=p.text)
    d.ellipse([322 * S, 66 * S, 366 * S, 110 * S], fill=p.accent_soft,
              outline=p.accent, width=max(1, S))

    # Seri cubugu
    d.rounded_rectangle([24 * S, 128 * S, 366 * S, 176 * S], radius=14 * S,
                        fill=p.surface, outline=p.border, width=max(1, S))
    d.text((40 * S, 143 * S), '12 gunluk seri', font=f(SANS_MED, 13), fill=p.text)
    for i in range(7):
        x = 250 + i * 15
        done = i < 5
        d.ellipse([x * S, 150 * S, (x + 8) * S, 158 * S],
                  fill=p.accent if done else None,
                  outline=p.border if not done else p.accent, width=max(1, S))

    # Hedef secimi
    y = 200
    d.text((24 * S, y * S), 'FORMULU BELIRLEYEN HEDEF', font=f(SANS_MED, 9), fill=p.sub)
    x = 24
    for i, label in enumerate(['Odak', 'Sukunet', 'Enerji', 'Uyku']):
        w = d.textlength(label, font=f(SANS, 11)) / S + 26
        on = i == 0
        d.rounded_rectangle([x * S, (y + 18) * S, (x + w) * S, (y + 46) * S],
                            radius=12 * S,
                            fill=p.accent if on else p.surface,
                            outline=None if on else p.border, width=max(1, S))
        d.text((x * S + 13 * S, (y + 26) * S), label, font=f(SANS, 11),
               fill=p.bg if on else p.sub)
        x += w + 8

    # Gunun formulu
    y = 268
    d.rounded_rectangle([24 * S, y * S, 366 * S, (y + 200) * S], radius=18 * S,
                        fill=p.surface, outline=p.border, width=max(1, S))
    d.text((44 * S, (y + 24) * S), 'Berrak Sabah', font=f(SERIF, 21), fill=p.text)
    d.text((44 * S, (y + 58) * S), 'renk · ses · nefes  ·  2 dk',
           font=f(SANS, 11), fill=p.sub)
    for i, (name, val) in enumerate(
        [('Renk', 'Gokyuzu Mavisi'), ('Ses', 'Handpan'), ('Nefes', '4-7-8')]
    ):
        yy = y + 92 + i * 28
        d.ellipse([44 * S, yy * S, 56 * S, (yy + 12) * S], fill=p.accent)
        d.text((66 * S, (yy - 2) * S), name, font=f(SANS_MED, 11), fill=p.text)
        d.text((160 * S, (yy - 2) * S), val, font=f(SANS, 11), fill=p.sub)

    # Ana eylem
    d.rounded_rectangle([24 * S, 500 * S, 366 * S, 552 * S], radius=16 * S, fill=p.accent)
    center(d, W / 2, 517, 'Ritueli Baslat', f(SANS_BOLD, 15), p.bg)

    # Alt sekme cubugu
    d.rectangle([0, 772 * S, W * S, H * S], fill=p.surface)
    d.line([0, 772 * S, W * S, 772 * S], fill=p.border, width=max(1, S))
    for i, label in enumerate(['Formul', 'Istatistik', 'Arsiv', 'Ayarlar']):
        cx = W / 8 + i * W / 4
        center(d, cx, 792, label, f(SANS, 10), p.accent if i == 0 else p.sub)
    return img


def ritual_frame(p, sentence, ghost=None):
    """Ritual ekrani — yeni akan metin bicimiyle.

    Metin artik cekirdegin icine degil ekran genisligine gore olculuyor
    (base * 0.74) ve punto base * 0.056; arkasinda formul renginde
    yumusak bir parilti var. Maketteki parilti, metnin ayri bir katmana
    cizilip bulandirilmasiyla uretiliyor — uygulamada ayni etki iki kat
    metinle kuruluyor.
    """
    img = Image.new('RGB', (W * S, H * S), p.dark_bg)
    d = ImageDraw.Draw(img, 'RGBA')

    # Yukselen baloncuklar
    import random
    random.seed(7)
    for _ in range(16):
        size = random.randint(6, 22)
        x = random.randint(0, W - size)
        y = random.randint(90, H - 60)
        alpha = int(255 * (0.04 + size / 22 * 0.10))
        d.ellipse([x * S, y * S, (x + size) * S, (y + size) * S],
                  fill=p.text + (alpha,))

    # Ust bar
    d.text((20 * S, 58 * S), '<-', font=f(SANS, 16), fill=p.text)
    d.rounded_rectangle([56 * S, 66 * S, 330 * S, 70 * S], radius=2 * S,
                        fill=p.text + (45,))
    d.rounded_rectangle([56 * S, 66 * S, (56 + (330 - 56) * 0.55) * S, 70 * S],
                        radius=2 * S, fill=p.accent)
    d.text((344 * S, 60 * S), '2/3', font=f(SANS, 12), fill=p.sub)

    # Nefes dairesi
    cx, cy, r = W / 2, 320, 108
    for rad, alpha in ((r * 1.9, 22), (r * 1.35, 34)):
        d.ellipse([(cx - rad) * S, (cy - rad) * S, (cx + rad) * S, (cy + rad) * S],
                  fill=p.accent + (alpha,))
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
              outline=p.text + (55,), width=max(1, S))
    core = r * 0.65
    d.ellipse([(cx - core) * S, (cy - core) * S, (cx + core) * S, (cy + core) * S],
              fill=p.accent + (225,), outline=p.text + (80,), width=max(1, S))

    # --- Akan metin -------------------------------------------------
    size = round(390 * 0.056)          # uygulamadaki sentenceSize
    max_w = 390 * 0.74                 # uygulamadaki sentenceMaxWidth
    font_line = f(STORY, size)
    line_h = round(size * 1.42)

    def draw_sentence(text, y_top, alpha, glow):
        lines = wrap(d, text, font_line, max_w)
        if glow:
            layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
            ld = ImageDraw.Draw(layer)
            yy = y_top
            for line in lines:
                w = ld.textlength(line, font=font_line)
                ld.text((cx * S - w / 2, yy * S), line, font=font_line,
                        fill=p.accent + (int(alpha * 0.75),))
                yy += line_h
            layer = layer.filter(ImageFilter.GaussianBlur(6 * S))
            img.paste(Image.alpha_composite(img.convert('RGBA'), layer).convert('RGB'), (0, 0))
        yy = y_top
        dd = ImageDraw.Draw(img, 'RGBA')
        for line in lines:
            w = dd.textlength(line, font=font_line)
            dd.text((cx * S - w / 2, yy * S), line, font=font_line,
                    fill=(255, 255, 255, alpha))
            yy += line_h

    if ghost:
        draw_sentence(ghost, cy - 58, 90, False)
    draw_sentence(sentence, cy - line_h / 2, 255, True)

    d = ImageDraw.Draw(img, 'RGBA')
    # Faz + sayac
    center(d, W / 2, 470, 'NEFES VER · 2. tur', f(SANS_MED, 13), p.text)
    center(d, W / 2, 492, 'Verisi alistan uzun tut.', f(SANS, 11), p.sub)
    center(d, W / 2, 526, '6', f(SERIF, 58), p.text)

    d.rounded_rectangle([24 * S, 748 * S, 366 * S, 796 * S], radius=14 * S, fill=p.accent)
    center(d, W / 2, 764, 'Ritueli Bitir', f(SANS_BOLD, 14), p.dark_bg)
    return img


def sheet(palette):
    """Bir palet icin iki telefon yan yana + baslik."""
    gap, pad, head = 28, 34, 118
    frames = [home_frame(palette), ritual_frame(
        palette,
        'Sen dalga degilsin.',
        ghost='Bir dalga yukseliyor.',
    )]
    sw = pad * 2 + len(frames) * W + (len(frames) - 1) * gap
    sh = head + H + pad
    out = Image.new('RGB', (sw * S, sh * S), (250, 249, 246))
    d = ImageDraw.Draw(out)
    d.text((pad * S, 30 * S), palette.name, font=f(SERIF, 30), fill=(26, 26, 30))
    d.text((pad * S, 72 * S), palette.note, font=f(SANS, 12), fill=(110, 110, 118))

    # Palet serisi
    x = sw - pad - 5 * 26
    for color in (palette.bg, palette.surface, palette.text, palette.sub, palette.accent):
        d.rounded_rectangle([x * S, 34 * S, (x + 22) * S, 56 * S], radius=5 * S,
                            fill=color, outline=(200, 198, 192), width=max(1, S))
        x += 26

    x = pad
    for frame in frames:
        out.paste(frame, (x * S, head * S))
        x += W + gap
    return out


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.expanduser('~'), 'Desktop'
    )
    os.makedirs(out_dir, exist_ok=True)
    written = []
    for i, palette in enumerate(PALETTES, start=1):
        path = os.path.join(out_dir, f'tema-{i}-{palette.key}.png')
        sheet(palette).save(path)
        written.append(path)
    print('Yazildi:')
    for path in written:
        print('  ', path)


if __name__ == '__main__':
    main()
