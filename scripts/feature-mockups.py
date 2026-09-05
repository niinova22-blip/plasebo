# -*- coding: utf-8 -*-
"""Yeni ozelliklerin tasarim maketlerini PNG olarak uretir.

    python scripts/feature-mockups.py [cikti_klasoru]

Cikti verilmezse masaustune yazar.

Bunlar gercek ekran goruntusu degil: iOS uygulamasi Windows'ta
calistirilamadigi icin duzen, tipografi ve renkler uygulamanin kendi
sabitlerinden alinarak yeniden ciziliyor. Amac derleme harcamadan
"ekranda ne gorunecek" sorusunu yanitlamak.
"""
import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'node_modules', '@expo-google-fonts')
SERIF = os.path.join(FONTS, 'dm-serif-display', '400Regular', 'DMSerifDisplay_400Regular.ttf')
SANS = os.path.join(FONTS, 'space-grotesk', '400Regular', 'SpaceGrotesk_400Regular.ttf')
SANS_MED = os.path.join(FONTS, 'space-grotesk', '500Medium', 'SpaceGrotesk_500Medium.ttf')
SANS_BOLD = os.path.join(FONTS, 'space-grotesk', '700Bold', 'SpaceGrotesk_700Bold.ttf')

W, H = 390, 844  # iPhone 15 nokta olculeri
S = 2            # 2x

INK = (14, 14, 18)
GHOST_BG = (247, 246, 242)
PULSE = (123, 110, 246)
GLOW = (168, 255, 120)
HAZE = (197, 194, 184)
WHITE = (255, 255, 255)
TEXT = (44, 44, 53)
SUB = (107, 107, 122)


def f(path, size):
    return ImageFont.truetype(path, round(size * S))


def phone(bg):
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


def ritual_frame(sentence, ghost=None, phase='NEFES VER · 2. tur', count='6',
                 progress=0.55, step='2/3'):
    """Ritüel ekrani: baloncuklar + daire + akan cumle."""
    img = phone(INK)
    d = ImageDraw.Draw(img, 'RGBA')

    # Baloncuklar
    import random
    random.seed(7)
    for _ in range(16):
        size = random.randint(6, 22)
        x = random.randint(0, W - size)
        y = random.randint(90, H - 40)
        alpha = int(255 * (0.05 + size / 22 * 0.12))
        d.ellipse([x * S, y * S, (x + size) * S, (y + size) * S],
                  fill=(255, 255, 255, alpha))

    # Ust bar
    d.text((20 * S, 58 * S), '←', font=f(SANS, 20), fill=WHITE)
    d.rounded_rectangle([56 * S, 66 * S, 330 * S, 70 * S], radius=2 * S,
                        fill=(255, 255, 255, 45))
    d.rounded_rectangle([56 * S, 66 * S, (56 + (330 - 56) * progress) * S, 70 * S],
                        radius=2 * S, fill=PULSE)
    d.text((344 * S, 60 * S), step, font=f(SANS, 12), fill=HAZE)

    # Daire yigini
    cx, cy, r = W / 2, 300, 108
    for rad, alpha in ((r * 1.9, 26), (r * 1.35, 40)):
        d.ellipse([(cx - rad) * S, (cy - rad) * S, (cx + rad) * S, (cy + rad) * S],
                  fill=(123, 110, 246, alpha))
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
              outline=(255, 255, 255, 60), width=max(1, S))
    core = r * 0.65
    d.ellipse([(cx - core) * S, (cy - core) * S, (cx + core) * S, (cy + core) * S],
              fill=(139, 128, 255, 235), outline=(255, 255, 255, 90), width=max(1, S))

    # Akan cumle (hayalet katman + guncel cumle)
    font_line = f(SERIF, 15)
    if ghost:
        # Giden cumle yukari suzulmus ve solmus halde: gercekte de bu iki
        # katman kisa bir sure birlikte gorunuyor.
        lines = wrap(d, ghost, font_line, core * 1.7)
        y = cy - len(lines) * 10 - 46
        for line in lines:
            w = d.textlength(line, font=font_line)
            d.text((cx * S - w / 2, y * S), line, font=font_line, fill=(255, 255, 255, 90))
            y += 20
    lines = wrap(d, sentence, font_line, core * 1.7)
    y = cy - len(lines) * 10
    for line in lines:
        w = d.textlength(line, font=font_line)
        d.text((cx * S - w / 2, y * S), line, font=font_line, fill=WHITE)
        y += 20

    # Faz + sayac
    center(d, W / 2, 452, phase, f(SANS_MED, 13), WHITE)
    center(d, W / 2, 474, 'Verişi alıştan uzun tut.', f(SANS, 11), HAZE)
    center(d, W / 2, 508, count, f(SERIF, 58), WHITE)

    # Alt
    pill = 'Nefes verirken kalp atışı yavaşlar — ölçülmüş tek etken bu.'
    d.rounded_rectangle([24 * S, 690 * S, 366 * S, 730 * S], radius=12 * S,
                        fill=(255, 255, 255, 18))
    for i, line in enumerate(wrap(d, pill, f(SANS, 10), 320)[:2]):
        center(d, W / 2, 698 + i * 15, line, f(SANS, 10), HAZE)

    d.rounded_rectangle([24 * S, 748 * S, 366 * S, 796 * S], radius=14 * S, fill=PULSE)
    center(d, W / 2, 764, 'Ritüeli Bitir →', f(SANS_BOLD, 14), WHITE)
    return img


def home_frame(new_order=True):
    img = phone(GHOST_BG)
    d = ImageDraw.Draw(img, 'RGBA')

    d.text((24 * S, 62 * S), 'Merhaba,', font=f(SANS, 12), fill=SUB)
    d.text((24 * S, 80 * S), 'Deniz', font=f(SERIF, 24), fill=TEXT)
    d.ellipse([322 * S, 66 * S, 366 * S, 110 * S], fill=PULSE)

    # Seri cubugu
    d.rounded_rectangle([24 * S, 128 * S, 366 * S, 176 * S], radius=14 * S, fill=(255, 255, 255, 255))
    d.text((40 * S, 142 * S), '🔥 12 günlük seri', font=f(SANS_MED, 13), fill=TEXT)

    def targeted(y):
        d.rounded_rectangle([24 * S, y * S, 366 * S, (y + 86) * S], radius=16 * S,
                            fill=(234, 232, 255, 255), outline=PULSE, width=max(1, S))
        d.text((40 * S, (y + 18) * S), '🩺 Nokta atışı reçete al',
               font=f(SANS_BOLD, 14), fill=PULSE)
        for i, line in enumerate(
            wrap(d, 'Şikayetini anlat, sana özel bir reçete hazırlansın. Günde bir kez.',
                 f(SANS, 11), 300)[:2]
        ):
            d.text((40 * S, (y + 42 + i * 16) * S), line, font=f(SANS, 11), fill=SUB)

    def goals(y):
        d.text((24 * S, y * S), 'FORMÜLÜ BELİRLEYEN HEDEF', font=f(SANS_MED, 9), fill=SUB)
        labels = ['Odak', 'Sükunet', 'Enerji', 'Uyku']
        x = 24
        for i, label in enumerate(labels):
            w = d.textlength(label, font=f(SANS, 11)) / S + 26
            fill = PULSE if i == 0 else (255, 255, 255, 255)
            color = WHITE if i == 0 else SUB
            d.rounded_rectangle([x * S, (y + 18) * S, (x + w) * S, (y + 46) * S],
                                radius=12 * S, fill=fill)
            d.text((x * S + 13 * S, (y + 26) * S), label, font=f(SANS, 11), fill=color)
            x += w + 8

    def card(y):
        d.rounded_rectangle([24 * S, y * S, 366 * S, (y + 190) * S], radius=18 * S,
                            fill=(255, 255, 255, 255))
        d.text((44 * S, (y + 22) * S), 'Berrak Sabah', font=f(SERIF, 21), fill=TEXT)
        d.text((44 * S, (y + 54) * S), 'renk · ses · nefes  ·  2 dk',
               font=f(SANS, 11), fill=SUB)
        for i, (name, val) in enumerate(
            [('Renk', 'Gökyüzü Mavisi'), ('Ses', 'Handpan'), ('Nefes', '4-7-8')]
        ):
            yy = y + 84 + i * 26
            d.ellipse([44 * S, yy * S, 56 * S, (yy + 12) * S], fill=PULSE)
            d.text((66 * S, (yy - 2) * S), name, font=f(SANS_MED, 11), fill=TEXT)
            d.text((150 * S, (yy - 2) * S), val, font=f(SANS, 11), fill=SUB)

    if new_order:
        targeted(192)
        goals(296)
        card(360)
    else:
        goals(192)
        card(256)
        targeted(462)
    return img



def checkin_frame(phase='intro'):
    """Gun ici 45 saniyelik olcum ekrani."""
    img = phone(INK)
    d = ImageDraw.Draw(img, 'RGBA')
    import random
    random.seed(3)
    for _ in range(14):
        size = random.randint(6, 20)
        x = random.randint(0, W - size)
        y = random.randint(120, H - 60)
        d.ellipse([x * S, y * S, (x + size) * S, (y + size) * S],
                  fill=(255, 255, 255, int(255 * (0.05 + size / 22 * 0.1))))

    cx, cy, r = W / 2, 300, 100
    for rad, alpha in ((r * 1.8, 24), (r * 1.3, 38)):
        d.ellipse([(cx - rad) * S, (cy - rad) * S, (cx + rad) * S, (cy + rad) * S],
                  fill=(123, 110, 246, alpha))
    core = r * 0.65
    d.ellipse([(cx - core) * S, (cy - core) * S, (cx + core) * S, (cy + core) * S],
              fill=(139, 128, 255, 235))
    if phase == 'measuring':
        center(d, cx, cy - 8, 'Sadece nefes al.', f(SERIF, 15), WHITE)
        center(d, W / 2, 430, '32', f(SERIF, 54), WHITE)
        center(d, W / 2, 500, 'Nefesin dinleniyor', f(SERIF, 19), WHITE)
        center(d, W / 2, 528, 'Doğal nefes al. Sayıları tutturmak zorunda değilsin.',
               f(SANS, 11), HAZE)
        label = 'Vazgeç'
    else:
        center(d, W / 2, 470, '45 saniyelik ölçüm', f(SERIF, 19), WHITE)
        for i, line in enumerate(wrap(
            d, 'Mikrofon yalnızca bu ekran açıkken çalışır. Ses kaydedilmez, cihazdan çıkmaz.',
            f(SANS, 11), 300)[:2]):
            center(d, W / 2, 498 + i * 17, line, f(SANS, 11), HAZE)
        label = 'Ölçümü başlat'

    d.rounded_rectangle([24 * S, 690 * S, 366 * S, 726 * S], radius=12 * S,
                        fill=(255, 255, 255, 18))
    center(d, W / 2, 700, 'Ölçümler yalnızca cihazında saklanır.', f(SANS, 10), HAZE)
    d.rounded_rectangle([24 * S, 748 * S, 366 * S, 796 * S], radius=14 * S, fill=PULSE)
    center(d, W / 2, 764, label, f(SANS_BOLD, 14), WHITE)
    return img


def report_frame():
    """Ertesi sabahki gunluk rapor."""
    img = phone(INK)
    d = ImageDraw.Draw(img, 'RGBA')
    d.text((24 * S, 70 * S), 'SON 24 SAAT', font=f(SANS_MED, 11), fill=PULSE)
    for i, line in enumerate(wrap(d, 'Gün ilerledikçe nefesin düzene girdi.', f(SERIF, 23), 320)):
        d.text((24 * S, (98 + i * 30) * S), line, font=f(SERIF, 23), fill=WHITE)
    d.text((24 * S, 168 * S), '3 ölçümün ortalaması: %63 düzen.', font=f(SANS, 13), fill=HAZE)

    rows = [('En düzenli an', '14:00 · %90'), ('En gergin an', '10:00 · %40'),
            ('Dün gece uyku', '6 sa 42 dk'), ('Dinlenme nabzı', '58 atım/dk')]
    y = 216
    for label, value in rows:
        d.text((24 * S, y * S), label, font=f(SANS, 13), fill=HAZE)
        w = d.textlength(value, font=f(SANS_MED, 13))
        d.text((366 * S - w, y * S), value, font=f(SANS_MED, 13), fill=WHITE)
        d.line([24 * S, (y + 26) * S, 366 * S, (y + 26) * S], fill=(255, 255, 255, 30), width=1)
        y += 44

    for i, line in enumerate(wrap(
        d, 'Kısa bir geceydi; bugünkü reçetene fazladan bir sakinleştirme turu eklendi.',
        f(SANS, 12), 330)[:2]):
        d.text((24 * S, (400 + i * 18) * S), line, font=f(SANS, 12), fill=HAZE)

    d.rounded_rectangle([24 * S, 470 * S, 366 * S, 528 * S], radius=12 * S,
                        fill=(255, 255, 255, 18))
    for i, line in enumerate(wrap(
        d, 'Bu rapor bir teşhis değil: yalnızca ölçümlerin ve Sağlık verinin yan yana konmuş hâli.',
        f(SANS, 10), 310)[:3]):
        center(d, W / 2, 480 + i * 15, line, f(SANS, 10), HAZE)

    d.rounded_rectangle([24 * S, 748 * S, 366 * S, 796 * S], radius=14 * S, fill=PULSE)
    center(d, W / 2, 764, 'Kapat', f(SANS_BOLD, 14), WHITE)
    return img


def sheet(items, title, subtitle, cols=None, width=None):
    cols = cols or len(items)
    thumb_w = 300
    gap = 34
    width = width or (cols * thumb_w + (cols + 1) * gap)
    head = 150
    thumb_h = round(thumb_w * H / W)
    canvas = Image.new('RGB', (width, head + thumb_h + 190), (22, 21, 30))
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


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.expanduser('~'), 'Desktop', 'plasebo-widget'
    )
    os.makedirs(out_dir, exist_ok=True)

    ritual = sheet(
        [
            ('1 · Akış başlıyor',
             ['Ortada tek kelime yerine cümle var.', 'Alttan beyaz baloncuklar yükseliyor.'],
             ritual_frame('Bu oda, o düşünceden büyük.', progress=0.25, count='7', step='1/3')),
            ('2 · Hayalet geçiş',
             ['Giden cümle yukarı süzülüp siliniyor,', 'gelen cümle aşağıdan beliriyor.'],
             ritual_frame('Gökyüzü hepsinin üstünde duruyor.',
                          ghost='Bu şehir, bu odadan büyük.', progress=0.55, count='4')),
            ('3 · Kapanış',
             ['Son cümle ritüelin son saniyesinde', 'ekranda duruyor — metin tam eşlenik bitiyor.'],
             ritual_frame('Nefesin yerinde. Sen de buradasın.',
                          phase='NEFES AL · 4. tur', count='1', progress=0.98, step='3/3')),
        ],
        'Ritüel · akan cümleler ve baloncuklar',
        'Cümleler ritüel süresine bölünür; son cümle bitişe denk gelir.',
    )
    ritual.save(os.path.join(out_dir, '4-ritual-akan-cumleler.png'))

    home = sheet(
        [
            ('Önce', ['Nokta atışı reçete aşağıdaydı:', 'hedef seçici ve kartın altında kalıyordu.'],
             home_frame(new_order=False)),
            ('Sonra', ['Artık serinin hemen altında,', 'ekranın en üstünde.'],
             home_frame(new_order=True)),
        ],
        'Ana ekran · nokta atışı reçete en üstte',
        'Uygulamanın asıl vaadi ilk görünen şey oldu.',
    )
    home.save(os.path.join(out_dir, '5-ana-ekran-sira.png'))

    cycle = sheet(
        [
            ('1 · Ölçüm daveti',
             ['Gün içinde üç kez bildirim düşer;', 'dokununca bu ekran açılır.'],
             checkin_frame('intro')),
            ('2 · 45 saniyelik ölçüm',
             ['Mikrofon yalnızca bu ekran açıkken çalışır.', 'Arka planda hiçbir şey dinlenmez.'],
             checkin_frame('measuring')),
            ('3 · Ertesi sabahki rapor',
             ['Ölçümler + Apple Sağlık verisi', 'tek bir raporda birleşir.'],
             report_frame()),
        ],
        'Plasebo · 24 saatlik döngü',
        'Sürekli dinleme yerine günde üç kısa ölçüm ve sabah tek rapor.',
    )
    cycle.save(os.path.join(out_dir, '6-24-saatlik-dongu.png'))

    print('Yazildi:')
    for name in sorted(os.listdir(out_dir)):
        print('  ', os.path.join(out_dir, name))


if __name__ == '__main__':
    main()
