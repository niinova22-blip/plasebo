# -*- coding: utf-8 -*-
"""Plasebo Plus modelinin tasarim maketlerini PNG olarak uretir.

    python scripts/plus-mockups.py [cikti_klasoru]

Cikti verilmezse masaustundeki `plasebo-plus` klasorune yazar.

Bunlar gercek ekran goruntusu degil: iOS uygulamasi Windows'ta
calistirilamadigi icin duzen, tipografi ve renkler uygulamanin kendi
sabitlerinden yeniden ciziliyor. Amac, bir EAS derlemesi harcamadan
"ucretsiz kademe ve plan ekrani ekranda nasil gorunecek" sorusunu
yanitlamak.

Cizilen dort sayfa:

  1. Plan ekrani — one cikan uc ozellik ve iki fiyat karti
  2. Ucretsiz kademenin olcum yolu — kamera / elle puanlama
  3. Kilitler — sikayet ekrani ve ayarlar
  4. Kademe karsilastirmasi — free / plus tablosu
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'node_modules', '@expo-google-fonts')
SERIF = os.path.join(FONTS, 'dm-serif-display', '400Regular', 'DMSerifDisplay_400Regular.ttf')
SANS = os.path.join(FONTS, 'space-grotesk', '400Regular', 'SpaceGrotesk_400Regular.ttf')
SANS_MED = os.path.join(FONTS, 'space-grotesk', '500Medium', 'SpaceGrotesk_500Medium.ttf')
SANS_BOLD = os.path.join(FONTS, 'space-grotesk', '700Bold', 'SpaceGrotesk_700Bold.ttf')

W, H = 390, 844
S = 2

INK = (14, 14, 18)
SURFACE = (26, 26, 33)
BORDER = (52, 52, 62)
PULSE = (123, 110, 246)
GLOW = (168, 255, 120)
HAZE = (197, 194, 184)
WHITE = (255, 255, 255)
FAINT = (128, 126, 138)
WARN = (240, 160, 120)


def f(path, size):
    return ImageFont.truetype(path, round(size * S))


def phone(bg=INK):
    return Image.new('RGB', (W * S, H * S), bg)


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


def box(d, x0, y0, x1, y1, radius=16, fill=SURFACE, outline=BORDER, width=1):
    d.rounded_rectangle([x0 * S, y0 * S, x1 * S, y1 * S], radius=radius * S,
                        fill=fill, outline=outline, width=max(1, width * S))


def glyph(d, kind, cx, cy, size, color):
    """Uygulamadaki cizgi ikonlarin kaba karsiligi."""
    r = size / 2
    lw = max(1, round(1.5 * S))
    if kind == 'camera':
        d.rounded_rectangle([(cx - r) * S, (cy - r * 0.7) * S, (cx + r) * S, (cy + r * 0.75) * S],
                            radius=3 * S, outline=color, width=lw)
        d.ellipse([(cx - r * 0.36) * S, (cy - r * 0.36) * S,
                   (cx + r * 0.36) * S, (cy + r * 0.36) * S], outline=color, width=lw)
    elif kind == 'wind':
        for i, (yy, ln) in enumerate(((-0.42, 0.85), (0.0, 1.0), (0.42, 0.7))):
            y = cy + yy * r
            d.line([(cx - r) * S, y * S, (cx - r + 2 * r * ln * 0.8) * S, y * S],
                   fill=color, width=lw)
            d.arc([(cx - r + 2 * r * ln * 0.8 - r * 0.34) * S, (y - r * 0.34) * S,
                   (cx - r + 2 * r * ln * 0.8 + r * 0.34) * S, (y + r * 0.34) * S],
                  start=270, end=140, fill=color, width=lw)
    elif kind == 'chart':
        d.line([(cx - r) * S, (cy + r) * S, (cx - r) * S, (cy - r) * S], fill=color, width=lw)
        d.line([(cx - r) * S, (cy + r) * S, (cx + r) * S, (cy + r) * S], fill=color, width=lw)
        pts = [(-0.55, 0.35), (-0.1, -0.2), (0.3, 0.05), (0.75, -0.6)]
        for i in range(len(pts) - 1):
            d.line([(cx + pts[i][0] * r) * S, (cy + pts[i][1] * r) * S,
                    (cx + pts[i + 1][0] * r) * S, (cy + pts[i + 1][1] * r) * S],
                   fill=color, width=lw)
    elif kind == 'lock':
        d.rounded_rectangle([(cx - r * 0.75) * S, (cy - r * 0.1) * S,
                             (cx + r * 0.75) * S, (cy + r * 0.8) * S],
                            radius=2 * S, outline=color, width=lw)
        d.arc([(cx - r * 0.5) * S, (cy - r * 0.85) * S, (cx + r * 0.5) * S, (cy + r * 0.3) * S],
              start=180, end=360, fill=color, width=lw)


# ----------------------------------------------------------------------
# 1. Plan ekrani
# ----------------------------------------------------------------------

HIGHLIGHTS = [
    ('camera', 'Yüz taramasıyla ölçüm',
     'Önce ve sonra puanını sen tahmin etme — kamera ölçsün. Fotoğraf telefonundan çıkmaz.'),
    ('wind', 'Nefes analizi',
     'Ritüel sırasında nefesinin düzenliliğini, derinliğini ve dakikadaki sayısını ölçer.'),
    ('chart', 'Gün içi ölçüm ve sabah raporu',
     'Üç kısa ölçüm, ertesi sabah uyku ve nabzınla birleşen tek bir rapor.'),
]


def plans_frame():
    img = phone()
    d = ImageDraw.Draw(img, 'RGBA')

    d.text((20 * S, 56 * S), '‹ Geri', font=f(SANS_MED, 13), fill=HAZE)
    d.text((20 * S, 84 * S), 'Plasebo Plus', font=f(SERIF, 30), fill=WHITE)
    sub = 'Ritüel ücretsiz ve öyle kalacak. Plus, ritüelin sende işe yarayıp yaramadığını sana ölçerek söyler.'
    y = 124
    for line in wrap(d, sub, f(SANS, 12), 350):
        d.text((20 * S, y * S), line, font=f(SANS, 12), fill=HAZE)
        y += 17

    # One cikan uc ozellik
    y += 10
    for icon, title, desc in HIGHLIGHTS:
        lines = wrap(d, desc, f(SANS, 10), 250)
        h = 30 + len(lines) * 14
        box(d, 20, y, 370, y + h)
        box(d, 34, y + 12, 70, y + 48, radius=10, fill=None, outline=BORDER)
        glyph(d, icon, 52, y + 30, 17, PULSE)
        d.text((82 * S, (y + 12) * S), title, font=f(SANS_BOLD, 13), fill=WHITE)
        ly = y + 30
        for line in lines:
            d.text((82 * S, ly * S), line, font=f(SANS, 10), fill=HAZE)
            ly += 14
        y += h + 10

    # Fiyat kartlari
    y += 6
    box(d, 20, y, 370, y + 62)
    d.text((36 * S, (y + 16) * S), 'Aylık', font=f(SANS_BOLD, 14), fill=WHITE)
    price = '₺149,00'
    pw = d.textlength(price, font=f(SANS_BOLD, 18))
    d.text((354 * S - pw - d.textlength('/ay', font=f(SANS, 11)), (y + 14) * S),
           price, font=f(SANS_BOLD, 18), fill=WHITE)
    d.text((354 * S - d.textlength('/ay', font=f(SANS, 11)), (y + 22) * S),
           '/ay', font=f(SANS, 11), fill=HAZE)
    d.text((36 * S, (y + 38) * S), 'İstediğin an durdur', font=f(SANS, 11), fill=HAZE)

    y += 72
    box(d, 20, y, 370, y + 76, outline=PULSE, width=2)
    d.text((36 * S, (y + 14) * S), 'Yıllık', font=f(SANS_BOLD, 14), fill=WHITE)
    price = '₺1.159,99'
    pw = d.textlength(price, font=f(SANS_BOLD, 18))
    suff = d.textlength('/yıl', font=f(SANS, 11))
    d.text((354 * S - pw - suff, (y + 12) * S), price, font=f(SANS_BOLD, 18), fill=WHITE)
    d.text((354 * S - suff, (y + 20) * S), '/yıl', font=f(SANS, 11), fill=HAZE)
    d.text((36 * S, (y + 38) * S), '%35 indirim · ayda ₺96,67',
           font=f(SANS_BOLD, 12), fill=PULSE)
    d.text((36 * S, (y + 56) * S), 'Aylık plana göre çok daha ucuz',
           font=f(SANS, 11), fill=HAZE)

    # CTA
    y += 90
    d.rounded_rectangle([20 * S, y * S, 370 * S, (y + 50) * S], radius=14 * S, fill=PULSE)
    center(d, W / 2, y + 17, "Plus'a geç", f(SANS_BOLD, 15), INK)
    center(d, W / 2, y + 62, 'Satın alımları geri yükle', f(SANS, 12), HAZE)

    return img


# ----------------------------------------------------------------------
# 2. Ucretsiz kademenin olcum yolu
# ----------------------------------------------------------------------

def camera_frame(manual_exit=True, denied=True):
    """Kamera modali — izin verilmediginde elle puanlama cikisi."""
    img = phone()
    d = ImageDraw.Draw(img, 'RGBA')

    center(d, W / 2, 70, 'Kamerayla ölç', f(SERIF, 24), WHITE)
    for i, line in enumerate(wrap(
            d, 'Yüzünü çerçeveye al, doğal ifadenle bekle. Fotoğraf cihazından çıkmaz.',
            f(SANS, 11), 300)):
        center(d, W / 2, 108 + i * 16, line, f(SANS, 11), HAZE)

    box(d, 24, 160, 366, 560, radius=20, fill=(22, 22, 28), outline=BORDER)
    if denied:
        center(d, W / 2, 330, 'Kamera izni gerekiyor.', f(SANS, 13), HAZE)
        d.rounded_rectangle([150 * S, 360 * S, 240 * S, 396 * S], radius=10 * S,
                            fill=None, outline=HAZE, width=max(1, S))
        center(d, W / 2, 370, 'İzin ver', f(SANS_MED, 12), WHITE)
    else:
        d.ellipse([115 * S, 250 * S, 275 * S, 470 * S], outline=(255, 255, 255, 70),
                  width=max(1, S))

    if manual_exit:
        label = 'Kamera olmadan elle puanla'
        lw = d.textlength(label, font=f(SANS, 13))
        center(d, W / 2, 592, label, f(SANS, 13), HAZE)
        d.line([(W / 2 * S - lw / 2), 610 * S, (W / 2 * S + lw / 2), 610 * S],
               fill=HAZE, width=max(1, S))

    d.rounded_rectangle([24 * S, 660 * S, 190 * S, 712 * S], radius=14 * S,
                        fill=None, outline=BORDER, width=max(1, S))
    center(d, 107, 678, 'Vazgeç', f(SANS_BOLD, 14), WHITE)
    return img


def manual_score_frame(score=6):
    """Elle olcum ekrani — ScoreBeforeScreen."""
    img = phone()
    d = ImageDraw.Draw(img, 'RGBA')

    center(d, W / 2, 250, 'RİTÜEL ÖNCESİ ÖLÇÜM', f(SANS_MED, 11), HAZE)
    center(d, W / 2, 274, 'Şu an nasılsın?', f(SERIF, 26), WHITE)
    center(d, W / 2, 316, '“Zihnim dağınık, odaklanamıyorum”', f(SANS, 12), HAZE)

    center(d, W / 2, 350, str(score), f(SANS_BOLD, 48), PULSE)
    center(d, W / 2, 412, '1 = hiç yok  ·  10 = dayanılmaz', f(SANS, 11), FAINT)

    # Kaydirici
    y = 452
    d.rounded_rectangle([40 * S, y * S, 350 * S, (y + 6) * S], radius=3 * S, fill=BORDER)
    fill_x = 40 + (350 - 40) * ((score - 1) / 9)
    d.rounded_rectangle([40 * S, y * S, fill_x * S, (y + 6) * S], radius=3 * S, fill=PULSE)
    d.ellipse([(fill_x - 14) * S, (y - 11) * S, (fill_x + 14) * S, (y + 17) * S],
              fill=WHITE, outline=PULSE, width=max(1, 2 * S))

    # Seffaflik hapi
    box(d, 24, 520, 366, 576, radius=12, fill=(255, 255, 255, 16), outline=None)
    for i, line in enumerate(wrap(
            d, '⚗️ Bu ölçüm senin izlenimin. Araştırmalarda ölçülen de tam olarak bu.',
            f(SANS, 10), 310)):
        center(d, W / 2, 534 + i * 15, line, f(SANS, 10), HAZE)

    d.rounded_rectangle([20 * S, 762 * S, 370 * S, 812 * S], radius=14 * S, fill=PULSE)
    center(d, W / 2, 779, 'Ölçüm tamam', f(SANS_BOLD, 15), WHITE)
    return img


def prescription_frame(scans_left=0):
    """Recete karti — gunluk tarama hakkina gore farkli yol."""
    img = phone()
    d = ImageDraw.Draw(img, 'RGBA')

    center(d, W / 2, 70, 'REÇETE', f(SANS_MED, 11), HAZE)
    box(d, 20, 110, 370, 400, radius=20)
    d.text((40 * S, 136 * S), 'Zihin Berraklığı #47', font=f(SERIF, 22), fill=WHITE)
    for i, line in enumerate(wrap(
            d, '“Dağınık nöral bağlantıları tek odak noktasında toplar”',
            f(SANS, 11), 300)):
        d.text((40 * S, (172 + i * 16) * S), line, font=f(SANS, 11), fill=HAZE)

    rows = [('Uygulama', '1 × günlük'), ('Süre', '4 dakika'), ('Formül', 'Menekşe Protokolü')]
    y = 240
    for label, value in rows:
        d.text((40 * S, y * S), label, font=f(SANS, 12), fill=FAINT)
        vw = d.textlength(value, font=f(SANS_MED, 12))
        d.text((350 * S - vw, y * S), value, font=f(SANS_MED, 12), fill=WHITE)
        d.line([40 * S, (y + 24) * S, 350 * S, (y + 24) * S], fill=BORDER, width=1)
        y += 40

    center(d, W / 2, 440, 'Reçeteni kabul ediyor musun?', f(SERIF, 20), WHITE)

    d.rounded_rectangle([20 * S, 500 * S, 370 * S, 550 * S], radius=14 * S, fill=PULSE)
    center(d, W / 2, 517, 'Evet, uygula', f(SANS_BOLD, 15), WHITE)

    note = ('Bugünkü tarama hakkın dolu — ölçümü kamera yapacak.' if scans_left > 0
            else 'Bugünkü tarama hakkın doldu — ölçüm elle yapılacak.')
    center(d, W / 2, 566, note, f(SANS, 10), FAINT)

    d.rounded_rectangle([20 * S, 590 * S, 370 * S, 638 * S], radius=14 * S,
                        fill=None, outline=BORDER, width=max(1, S))
    center(d, W / 2, 606, 'Farklı şikayet', f(SANS_MED, 14), HAZE)
    return img


# ----------------------------------------------------------------------
# 3. Kilitler
# ----------------------------------------------------------------------

def complaint_frame(locked=True):
    img = phone()
    d = ImageDraw.Draw(img, 'RGBA')

    d.text((20 * S, 56 * S), '‹ Geri', font=f(SANS_MED, 13), fill=HAZE)
    d.text((20 * S, 88 * S), 'Bugün ne var?', font=f(SERIF, 28), fill=WHITE)
    d.text((20 * S, 132 * S), 'Dürüst ol. Beklenti protokolü dürüstlükle daha iyi çalışır.',
           font=f(SANS, 11), fill=HAZE)

    y = 176
    box(d, 20, y, 370, y + 58, outline=(BORDER if locked else PULSE),
        width=(1 if locked else 2))
    d.text((38 * S, (y + 20) * S), '🤖', font=f(SANS, 17), fill=WHITE)
    d.text((72 * S, (y + 20) * S), 'Fotoğraf analiziyle otomatik reçete',
           font=f(SANS_MED, 13), fill=WHITE)
    note = ('Bugünkü ölçüm hakkın doldu. Plasebo Plus ile sınırsız.' if locked
            else 'Bir fotoğraf çek, reçeteni yüz ifaden belirlesin.')
    d.text((24 * S, (y + 68) * S), note, font=f(SANS, 10),
           fill=(WARN if locked else FAINT))

    center(d, W / 2, y + 100, 'YA DA', f(SANS_MED, 10), FAINT)

    labels = ['Kendi cümlemle anlatayım', 'Zihnim dağınık, odaklanamıyorum',
              'Uykum düzensiz', 'İçim sıkışıyor', 'Enerjim yok']
    yy = y + 126
    for label in labels:
        box(d, 20, yy, 370, yy + 48)
        d.text((38 * S, (yy + 16) * S), label, font=f(SANS, 13), fill=WHITE)
        yy += 56
    return img


def settings_frame():
    img = phone()
    d = ImageDraw.Draw(img, 'RGBA')

    d.text((20 * S, 74 * S), 'Ayarlar', font=f(SERIF, 30), fill=WHITE)

    rows = [
        ('Plan', 'Ücretsiz', 'Plasebo Plus ölçüm katmanını açar.', True),
        ('Doz', 'Tek doz', 'Ritüel süresini kendin ayarlamak Plasebo Plus ile açılır.', True),
        ('24 saatlik döngü', 'Kapalı',
         'Gün içinde üç kısa nefes ölçümü ve ertesi sabah tek bir rapor. Plasebo Plus ile açılır.',
         True),
        ('Kör test', '', 'Bazı günler ritüel yerine eşit süreli bir bekleme gelir.', False),
    ]

    y = 140
    for label, value, hint, locked in rows:
        lines = wrap(d, hint, f(SANS, 10), 300)
        h = 42 + len(lines) * 14
        box(d, 20, y, 370, y + h)
        d.text((38 * S, (y + 14) * S), label, font=f(SANS_MED, 13), fill=WHITE)
        if value:
            vw = d.textlength(value, font=f(SANS, 12))
            d.text((326 * S - vw, (y + 15) * S), value, font=f(SANS, 12), fill=FAINT)
            d.text((338 * S, (y + 13) * S), '›', font=f(SANS, 15), fill=FAINT)
        if locked:
            glyph(d, 'lock', 348, y + 21, 13, WARN)
        ly = y + 38
        for line in lines:
            d.text((38 * S, ly * S), line, font=f(SANS, 10), fill=FAINT)
            ly += 14
        y += h + 12
    return img


# ----------------------------------------------------------------------
# Sayfa duzeni
# ----------------------------------------------------------------------

def sheet(items, title, subtitle, cols=None):
    cols = cols or len(items)
    thumb_w = 300
    gap = 34
    width = cols * thumb_w + (cols + 1) * gap
    head = 150
    thumb_h = round(thumb_w * H / W)
    canvas = Image.new('RGB', (width, head + thumb_h + 210), (22, 21, 30))
    d = ImageDraw.Draw(canvas)
    d.text((gap, 40), title, font=ImageFont.truetype(SERIF, 38), fill=WHITE)
    d.text((gap, 92), subtitle, font=ImageFont.truetype(SANS, 19), fill=HAZE)

    for i, (label, notes, img) in enumerate(items):
        x = gap + i * (thumb_w + gap)
        canvas.paste(img.resize((thumb_w, thumb_h), Image.LANCZOS), (x, head))
        ty = head + thumb_h + 18
        d.text((x, ty), label, font=ImageFont.truetype(SANS_BOLD, 20), fill=WHITE)
        for j, line in enumerate(notes):
            d.text((x, ty + 32 + j * 26), line, font=ImageFont.truetype(SANS, 15), fill=HAZE)
    return canvas


def tier_table():
    """Free / Plus karsilastirmasi — tek bakista model."""
    rows = [
        ('Dört günlük formül', 'sınırsız tekrar', 'sınırsız tekrar', False),
        ('Nokta atışı reçete', 'günde 1', 'sınırsız', True),
        ('Yüz taramalı ölçüm', 'günde 1', 'sınırsız', True),
        ('Nefes analizi', '—', 'açık', True),
        ('Gün içi ölçüm + sabah raporu', '—', 'açık', True),
        ('Refleks testi', 'açık', 'açık', False),
        ('Reçete takibi', '—', 'açık', True),
        ('Geçmiş', '7 gün', 'tümü', True),
        ('Çift doz', '—', 'açık', True),
        ('Reklam', 'seans sonu, günde 3', 'yok', True),
    ]
    width, row_h, head = 1100, 52, 220
    canvas = Image.new('RGB', (width, head + len(rows) * row_h + 90), (22, 21, 30))
    d = ImageDraw.Draw(canvas)

    d.text((40, 40), 'Plasebo Plus · kademe modeli', font=ImageFont.truetype(SERIF, 38), fill=WHITE)
    d.text((40, 92), 'Ritüel herkese açık. Plus, ölçümü açar.',
           font=ImageFont.truetype(SANS, 19), fill=HAZE)
    d.text((40, 126), '₺149,00/ay  ·  ₺1.159,99/yıl (%35 indirim · ayda ₺96,67)',
           font=ImageFont.truetype(SANS_MED, 17), fill=PULSE)

    col_x = (40, 560, 810)
    d.text((col_x[0], head - 40), 'ÖZELLİK', font=ImageFont.truetype(SANS_MED, 14), fill=FAINT)
    d.text((col_x[1], head - 40), 'FREE', font=ImageFont.truetype(SANS_MED, 14), fill=FAINT)
    d.text((col_x[2], head - 40), 'PLUS', font=ImageFont.truetype(SANS_MED, 14), fill=FAINT)
    d.line([40, head - 12, width - 40, head - 12], fill=BORDER, width=2)

    for i, (name, free, plus, differs) in enumerate(rows):
        y = head + i * row_h + 14
        d.text((col_x[0], y), name, font=ImageFont.truetype(SANS, 17), fill=WHITE)
        d.text((col_x[1], y), free, font=ImageFont.truetype(SANS, 17),
               fill=(WARN if free == '—' else HAZE))
        d.text((col_x[2], y), plus, font=ImageFont.truetype(SANS_BOLD if differs else SANS, 17),
               fill=(PULSE if differs else HAZE))
        d.line([40, y + 36, width - 40, y + 36], fill=(38, 38, 46), width=1)

    return canvas


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.expanduser('~'), 'Desktop', 'plasebo-plus'
    )
    os.makedirs(out_dir, exist_ok=True)

    tier_table().save(os.path.join(out_dir, '1-kademe-modeli.png'))

    sheet(
        [
            ('Plan ekranı',
             ['Öne çıkan üç özellik en üstte,', 'ölçümü anlatan ikisi ilk sırada.'],
             plans_frame()),
            ('Yıllık kart',
             ['"%35 indirim · ayda ₺96,67" satırı', 'ekranda yazan iki fiyattan hesaplanıyor.'],
             plans_frame()),
        ],
        'Plasebo Plus · plan ekranı',
        'Ritüel ücretsiz; satılan şey ölçüm katmanı.',
    ).save(os.path.join(out_dir, '2-plan-ekrani.png'))

    sheet(
        [
            ('1 · Hak varken',
             ['Ücretsiz kademede günde bir ölçüm.', '"Evet, uygula" kamerayı açıyor.'],
             prescription_frame(scans_left=1)),
            ('2 · Hak bitince',
             ['Aynı düğme elle puanlamaya götürüyor.', 'Akış hiçbir yerde kapanmıyor.'],
             prescription_frame(scans_left=0)),
            ('3 · Elle ölçüm',
             ['Geri gelen kaydırıcı. Ritüel sonrası da', 'aynı yöntemle ölçülüyor.'],
             manual_score_frame()),
        ],
        'Ücretsiz kademe · ölçüm yolu',
        'Yüz taraması kapandığında ritüel kapanmıyor — ölçüm elle sürüyor.',
    ).save(os.path.join(out_dir, '3-ucretsiz-olcum-yolu.png'))

    sheet(
        [
            ('Kamera izni reddedildiğinde',
             ['Modalde artık "Vazgeç"ten başka', 'bir çıkış var. Eskiden yoktu.'],
             camera_frame()),
            ('Şikayet ekranı',
             ['Hak bitince kart plan ekranına', 'götürüyor; sessizce ölmüyor.'],
             complaint_frame(locked=True)),
            ('Ayarlar',
             ['Kilitli satırlar anahtar değil,', 'plan ekranına giden bir satır.'],
             settings_frame()),
        ],
        'Kilitler nerede ve nasıl görünüyor',
        'Kilit, dokunulduğunda hiçbir şey olmayan bir anahtar değil.',
    ).save(os.path.join(out_dir, '4-kilitler.png'))

    print('Yazildi:')
    for name in sorted(os.listdir(out_dir)):
        print('  ', os.path.join(out_dir, name))


if __name__ == '__main__':
    main()
