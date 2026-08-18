# -*- coding: utf-8 -*-
"""Magaza ekran goruntulerini tanitim karti haline getirir.

Girdi : store/graphics/screenshots/raw/*.png   (cihazdan alinan ham kareler)
Cikti : store/graphics/screenshots/play/*.png  (1080x1920, Google Play)
        store/graphics/screenshots/ios/*.png   (1290x2796, App Store)

Kullanim:
    python scripts/store-screenshots.py          # ikisini de uretir
    python scripts/store-screenshots.py play     # yalnizca Play
    python scripts/store-screenshots.py ios      # yalnizca App Store

Ayni ham kareler iki magazaya da gider; yalnizca kartin olculeri degisir.
App Store 6.9 inclik iPhone icin 1290x2796 ister; bu boyut yuklendiginde
daha kucuk ekranlar icin ayrica gorsel istemez.

Duzen: ustte bir cumle, altinda telefon cercevesi icinde uygulama ekrani.
Yazi tipleri uygulamanin kendi fontlari (node_modules icindeki TTF'ler),
boylece magaza gorseli ile uygulama ayni tipografiyi kullaniyor.

Metin kurali uygulamanin geri kalaniyla ayni: hicbir kart bir fayda vaat
etmiyor, yalnizca ekranda ne oldugunu soyluyor.
"""
import os
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'store', 'graphics', 'screenshots', 'raw')
OUT = os.path.join(ROOT, 'store', 'graphics', 'screenshots')
FONTS = os.path.join(ROOT, 'node_modules', '@expo-google-fonts')

SERIF = os.path.join(FONTS, 'dm-serif-display', '400Regular', 'DMSerifDisplay_400Regular.ttf')
SANS = os.path.join(FONTS, 'space-grotesk', '400Regular', 'SpaceGrotesk_400Regular.ttf')
SANS_MED = os.path.join(FONTS, 'space-grotesk', '500Medium', 'SpaceGrotesk_500Medium.ttf')

# Magaza olculeri. Iki magazanin kartlari ayri klasorlerde durur ki
# yuklerken karismasin.
PRESETS = {
    'play': {'size': (1080, 1920), 'dir': 'play'},
    # App Store, yuklenen slota gore olcu istiyor. 6.9 inclik set zorunlu;
    # digerleri, yukleyici o sekmeyi acmakta israr ederse elde dursun diye.
    'ios': {'size': (1290, 2796), 'dir': 'ios'},
    'ios67': {'size': (1284, 2778), 'dir': os.path.join('ios', '6.7-inch')},
    'ios65': {'size': (1242, 2688), 'dir': os.path.join('ios', '6.5-inch')},
}

INK = (14, 14, 18)
WHITE = (255, 255, 255)
HAZE = (197, 194, 184)
PULSE = (123, 110, 246)

# Cihaz kareleri 1080x1920; ust durum cubugu (saat/pil) kirpiliyor.
STATUS_BAR = 46

# Asagidaki olculer 1080x1920 karta gore yazilmistir; baska bir boyut
# istendiginde yatayda genislik oraniyla, dikeyde yukseklik oraniyla
# olceklenir. Telefon cercevesi ise kalan bosluga gore buyur: sabit bir
# genislikle olceklemek, uzun App Store kartinda metinle cihaz arasinda
# kocaman bir bosluk birakiyordu.
MARGIN = 70
BEZEL = 14
CORNER = 46
DEVICE_TOP = 628
DEVICE_BOTTOM_GAP = 119

CARDS = [
    {
        'raw': '01-ana-ekran.png',
        'out': '01-ana-ekran.png',
        'title': 'Her gün yeni\nbir formül',
        'sub': 'Bir renk, bir ses, bir nefes tekniği.\nTarihten üretilir; aynı gün hep aynısı.',
        'accent': (123, 110, 246),
    },
    {
        'raw': '02-ritual-renk.png',
        'out': '02-ritual-renk.png',
        'title': 'İki dakikalık\nbir tören',
        'sub': 'Işık yayılır, sen yalnızca bakarsın.\nOrtadaki kelime ritüel boyunca kalır.',
        'accent': (255, 200, 40),
    },
    {
        'raw': '03-ritual-nefes.png',
        'out': '03-ritual-nefes.png',
        'title': 'Nefesin ritmi\nekranda',
        'sub': '4-7-8, kutu nefesi, rezonans.\nDaire desenin süresine göre açılır.',
        'accent': (168, 255, 120),
    },
    {
        'raw': '04-giris-dersi.png',
        'out': '04-giris-dersi.png',
        'title': 'Uygulama ne\nolduğunu söylüyor',
        'sub': 'Giriş dersi 1955’teki bir çalışmayla açılır.\nHiçbir şey saklanmıyor.',
        'accent': (123, 110, 246),
    },
    {
        'raw': '05-istatistik.png',
        'out': '05-istatistik.png',
        'title': 'Ölçen sensin',
        'sub': 'Ritüel öncesi ve sonrası puanlarsın.\nFark grafikte kalır — düşük puan da veri.',
        'accent': (168, 255, 120),
    },
    {
        'raw': '06-nasil-calisir.png',
        'out': '06-nasil-calisir.png',
        'title': 'Uydurma bulgular\nayrı, literatür ayrı',
        'sub': 'Uygulamanın içindeki “bulgular” uydurma.\nBu ekrandaki çalışmalar gerçek ve kaynaklı.',
        'accent': (255, 107, 107),
    },
]


def rounded_mask(size, radius):
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius, fill=255)
    return mask


def tracked_text(draw, xy, text, font, fill, tracking):
    """Harf araligi ile yazi — Pillow'da yerlesik bir karsiligi yok."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def build(card, size, out_dir):
    W, H = size
    sx = W / 1080          # yatay olcek: yazi puntolari ve kenar bosluklari
    sy = H / 1920          # dikey olcek: metin blogunun yerlesimi
    margin = round(MARGIN * sx)
    content_w = W - margin * 2 - round(20 * sx)
    bezel = round(BEZEL * sx)
    corner = round(CORNER * sx)

    src = Image.open(os.path.join(RAW, card['raw'])).convert('RGB')
    src = src.crop((0, STATUS_BAR, src.width, src.height))

    base = Image.new('RGB', (W, H), INK)

    # --- zemindeki isima: karta gore renk degisiyor -------------------
    accent = card['accent']
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse([-160 * sx, 380 * sy, W + 160 * sx, 1500 * sy],
              fill=(accent[0] // 7, accent[1] // 7, accent[2] // 7))
    g.ellipse([120 * sx, -260 * sy, W - 120 * sx, 620 * sy],
              fill=(PULSE[0] // 10, PULSE[1] // 10, PULSE[2] // 9))
    base = ImageChops.add(
        base, glow.filter(ImageFilter.GaussianBlur(round(200 * sx))))

    draw = ImageDraw.Draw(base)

    # --- ust metin ----------------------------------------------------
    f_eyebrow = ImageFont.truetype(SANS_MED, round(26 * sx))
    f_sub = ImageFont.truetype(SANS, round(32 * sx))

    # Baslik puntosu sabit degil: uzun bir baslik 82 puntoda sag kenara
    # dayaniyordu. En uzun satir icerik genisligine sigana kadar kuculuyor.
    title_lines = card['title'].split('\n')
    pt = round(82 * sx)
    floor_pt = round(54 * sx)
    while pt > floor_pt:
        f_title = ImageFont.truetype(SERIF, pt)
        if max(draw.textlength(l, font=f_title) for l in title_lines) <= content_w:
            break
        pt -= 2
    line_gap = round(pt * 1.12)

    tracked_text(draw, (margin + 2, round(138 * sy)),
                 'PLASEBO · ZİHİN PROTOKOLÜ', f_eyebrow, HAZE, 5 * sx)

    y = round(196 * sy)
    for line in title_lines:
        draw.text((margin, y), line, font=f_title, fill=WHITE)
        y += line_gap

    y += round(34 * sx)
    for line in card['sub'].split('\n'):
        draw.text((margin + 2, y), line, font=f_sub, fill=HAZE)
        y += round(44 * sx)
    text_bottom = y

    # --- telefon cercevesi --------------------------------------------
    # Cerceve, metnin altinda kalan yuksekligi doldurur; genisligi de kart
    # kenarlarina dayanmayacak sekilde sinirlanir.
    dev_top = max(round(DEVICE_TOP * sx), text_bottom + round(120 * sx))
    avail_h = H - dev_top - round(DEVICE_BOTTOM_GAP * sx)
    screen_w = min(
        round((avail_h - bezel * 2) * src.width / src.height),
        round(W * 0.78),
    )
    screen_h = round(screen_w * src.height / src.width)
    dev_w, dev_h = screen_w + bezel * 2, screen_h + bezel * 2
    dev_x = (W - dev_w) // 2
    # Cerceve yatay sinira takildiysa artan bosluk alta ve uste dagitilir.
    dev_top += (avail_h - dev_h) // 2

    # Cihazin altindaki yumusak golge: cerceve zemine yapisik durmasin.
    shadow = Image.new('RGB', (W, H), (0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [dev_x + 16 * sx, dev_top + 26 * sx,
         dev_x + dev_w - 16 * sx, dev_top + dev_h + 10 * sx],
        corner + round(10 * sx), fill=(0, 0, 0))
    base = ImageChops.subtract(
        base, shadow.filter(ImageFilter.GaussianBlur(round(40 * sx))))

    device = Image.new('RGB', (dev_w, dev_h), (32, 32, 40))
    ImageDraw.Draw(device).rounded_rectangle(
        [0, 0, dev_w - 1, dev_h - 1], corner + bezel, outline=(86, 86, 100), width=2)

    shot = src.resize((screen_w, screen_h), Image.LANCZOS)
    shot.putalpha(rounded_mask((screen_w, screen_h), corner))
    device.paste(shot, (bezel, bezel), shot)

    device.putalpha(rounded_mask((dev_w, dev_h), corner + bezel))
    base.paste(device, (dev_x, dev_top), device)

    out = os.path.join(out_dir, card['out'])
    base.save(out)
    print('OK', os.path.relpath(out, ROOT), base.size)


def main():
    wanted = sys.argv[1:] or list(PRESETS)
    for name in wanted:
        if name not in PRESETS:
            raise SystemExit('Bilinmeyen magaza: %s (play | ios)' % name)
        preset = PRESETS[name]
        out_dir = os.path.join(OUT, preset['dir']) if preset['dir'] else OUT
        os.makedirs(out_dir, exist_ok=True)
        for card in CARDS:
            build(card, preset['size'], out_dir)


if __name__ == '__main__':
    main()
