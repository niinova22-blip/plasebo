# -*- coding: utf-8 -*-
"""Magaza ekran goruntusu kartlarini uretir — 1.4.0 icin yeniden.

    python scripts/store-shots.py [cikti_klasoru]

Cikti verilmezse `store/graphics/screenshots/` altina, App Store'un
istedigi iki olcude yazar.

NEDEN YENIDEN

`scripts/store-screenshots.py` cizim yapmiyor: cihazdan alinmis ham
kareleri (`screenshots/raw/`) tanitim kartina donusturuyor. O kareler 15
Agustos 2026 tarihli ve o gunden beri uygulamada uc sey degisti:

  - Vurgu rengi mor #7B6EF6 ve neon yesil #A8FF78 idi; Eylul 2026'da tek
    bir soluk arduvaz mavisine (#6E88A8) indirildi.
  - Varsayilan tema koyuydu; artik Safak (aydinlik). Ritual ekranlari
    temadan bagimsiz koyu kaliyor, digerleri degil.
  - Formul satirlarindaki emoji ikonlar cizgi ikona cevrildi, seri
    seridindeki alev emojisi kaldirildi.

Yani eski kartlar uygulamanin bugunku halini gostermiyor. Yeni kareler
cihazdan alinamiyor: gelistirme makinesi Windows, iOS simulatoru yok ve
Android emulatorunde uygulama zorunlu Google girisini gecemiyor (hata
ayiklama anahtarinin SHA-1'i kayitli degil). Bu yuzden ekranlar
uygulamanin kendi kaynagindan yeniden ciziliyor — olculer ekranlarin
`StyleSheet`'lerinden, renkler `src/theme/theme.ts` icindeki Safak ve
`colors.ink` degerlerinden, metinler ekranlarin kendi dizelerinden.

DUZEN

Kart duzeni referans alinan magaza kartlariyla ayni: ustte iki satirlik
bir baslik, altinda ekranin cerceve icinde durdugu ve kartin alt
kenarindan tasarak kirpildigi bir telefon.

ALTI KART

  1. Ana ekran (Safak)        — gunluk formul
  2. Ritual, renk adimi       — akan metin, geri sayim
  3. Muayene, yuz analizi     — cihaz ustundeki duygu modeli
  4. Gun ici olcum            — nefes analizi
  5. Sabah raporu             — 24 saatin ozeti
  6. Plasebo Plus plan ekrani — abonelik

3, 4 ve 5 bu surumle gelen olcum katmanini tanitiyor.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'node_modules', '@expo-google-fonts')

SERIF = os.path.join(FONTS, 'dm-serif-display', '400Regular', 'DMSerifDisplay_400Regular.ttf')
SERIF_IT = os.path.join(FONTS, 'dm-serif-display', '400Regular_Italic',
                        'DMSerifDisplay_400Regular_Italic.ttf')
SANS = os.path.join(FONTS, 'space-grotesk', '400Regular', 'SpaceGrotesk_400Regular.ttf')
SANS_MED = os.path.join(FONTS, 'space-grotesk', '500Medium', 'SpaceGrotesk_500Medium.ttf')
SANS_BOLD = os.path.join(FONTS, 'space-grotesk', '700Bold', 'SpaceGrotesk_700Bold.ttf')

# Telefon ekrani: 390x844 pt, 3x.
W, H, S = 390, 844, 3

# --- Safak teması (varsayilan) — src/theme/theme.ts -> dawnTheme -------
BG = (251, 244, 238)
SURFACE = (255, 255, 255)
INK_CARD = (65, 59, 82)
ON_INK = (246, 242, 238)
ON_INK_SUB = (189, 181, 200)
TEXT = (55, 50, 63)
SUB = (110, 102, 120)
FAINT = (145, 135, 153)
BORDER = (238, 226, 217)
ACCENT_SOFT = (250, 239, 231)

# --- Ritual ve olcum ekranlari temadan bagimsiz koyu -------------------
INK = (21, 22, 26)
WHITE = (255, 255, 255)
HAZE = (197, 194, 184)
MIST = (232, 230, 223)

# --- Vurgu renkleri her temada ayni ------------------------------------
PULSE = (110, 136, 168)
GLOW = (167, 188, 212)

GOLD = (255, 212, 0)          # "Altın Eşik" — formulaPools.ts


def f(path, size):
    return ImageFont.truetype(path, max(1, round(size * S)))


def px(v):
    return round(v * S)


def wrap(d, text_, font, max_w):
    lines, cur = [], ''
    for word in text_.split(' '):
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


def text(d, x, y, s, font, fill, anchor=None):
    d.text((px(x), px(y)), s, font=font, fill=fill, anchor=anchor)


def center(d, cx, y, s, font, fill):
    d.text((px(cx), px(y)), s, font=font, fill=fill, anchor='ma')


def tracked(d, x, y, s, font, fill, spacing):
    """letterSpacing'li metin — PIL'de karsiligi yok, harf harf."""
    cx = px(x)
    for ch in s:
        d.text((cx, px(y)), ch, font=font, fill=fill)
        cx += d.textlength(ch, font=font) + px(spacing)


def tracked_w(d, s, font, spacing):
    return sum(d.textlength(ch, font=font) + px(spacing) for ch in s)


def rrect(d, x0, y0, x1, y1, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle([px(x0), px(y0), px(x1), px(y1)], radius=px(radius),
                        fill=fill, outline=outline, width=max(1, px(width)))


def glow(img, cx, cy, radius, color, intensity=0.55, steps=64, clip=None):
    """Merkezden disari sonen yumusak isima.

    `RadialGlow` bilesenin karsiligi. PIL'de gradyan yok; ic ice gecmis
    saydam daireler ayni isi goruyor ve 64 basamakta banding gorunmuyor.

    `clip` verilirse (x0, y0, x1, y1, radius) isima o yuvarlak dikdortgenin
    icine hapsedilir. Uygulamada bunu kartin `overflow: 'hidden'` ayari
    yapiyor; burada karsiligi yazilmazsa isima kartin disina tasiyor.
    """
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for i in range(steps, 0, -1):
        r = radius * i / steps
        a = int(255 * intensity * (1 - i / steps) ** 2.2)
        if a <= 0:
            continue
        ld.ellipse([px(cx - r), px(cy - r), px(cx + r), px(cy + r)],
                   fill=color + (a,))
    if clip:
        x0, y0, x1, y1, rad = clip
        mask = Image.new('L', img.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [px(x0), px(y0), px(x1), px(y1)], radius=px(rad), fill=255)
        layer.putalpha(Image.composite(layer.getchannel('A'),
                                       Image.new('L', img.size, 0), mask))
    img.alpha_composite(layer)


def play_glyph(d, cx, cy, size, color):
    """"▶" — yazi tipinde yok, ucgen olarak ciziliyor."""
    h = size
    d.polygon([(px(cx - h * 0.42), px(cy - h * 0.55)),
               (px(cx - h * 0.42), px(cy + h * 0.55)),
               (px(cx + h * 0.55), px(cy))], fill=color)


def chevron(d, cx, cy, size, color, w=2.2):
    """"›" — yazi tipindeki tirnak isareti yerine cizilen ok ucu."""
    lw = max(1, round(w * S))
    d.line([px(cx - size * 0.3), px(cy - size * 0.5),
            px(cx + size * 0.3), px(cy)], fill=color, width=lw)
    d.line([px(cx + size * 0.3), px(cy),
            px(cx - size * 0.3), px(cy + size * 0.5)], fill=color, width=lw)


def plain(s):
    """Emojileri ayikla.

    Uygulamada seffaflik cumleleri ⚗️ ile, cihaz ustundeki modelin notu
    🤖 ile basliyor. PIL renkli emoji cizemiyor ve yerine bos kutu
    koyuyor — kartta bos kutu, eksik emojiden daha kotu duruyor.
    """
    return ''.join(c for c in s if ord(c) < 0x2300).strip()


def pill(d, cx, top, body, color, max_w=280):
    """`TransparencyPill` — ortalanmis, tam yuvarlak kenarli cerceve.

    Yaricap yuksekligin yarisi olmak zorunda: PIL'de 999 vermek
    dikdortgeni elipse ceviriyor, uygulamadaki `borderRadius: 999` ise
    hap seklini veriyor.
    """
    pf = f(SANS, 10)
    lines = wrap(d, plain(body), pf, max_w)
    h = 16 + len(lines) * 14
    w = max(d.textlength(l, font=pf) for l in lines) / S + 28
    rrect(d, cx - w / 2, top, cx + w / 2, top + h, h / 2, outline=GLOW, width=1)
    for i, line in enumerate(lines):
        center(d, cx, top + 8 + i * 14, line, pf, GLOW)
    return top + h


def status_bar(d, fg):
    """Saat ve sag ustteki gostergeler. Her ekranin ustunde ayni."""
    text(d, 32, 16, '9:41', f(SANS_BOLD, 15), fg)
    # Sinyal cubuklari
    x = W - 78
    for i in range(4):
        h = 3 + i * 2.2
        d.rounded_rectangle([px(x + i * 5), px(26 - h), px(x + i * 5 + 3), px(26)],
                            radius=px(1), fill=fg)
    # Wi-Fi
    wx, wy = W - 55, 25
    for i, r in enumerate((9, 6, 3)):
        d.arc([px(wx - r), px(wy - r), px(wx + r), px(wy + r)],
              start=215, end=325, fill=fg, width=max(1, px(1.4)))
    d.ellipse([px(wx - 1.2), px(wy - 1.2), px(wx + 1.2), px(wy + 1.2)], fill=fg)
    # Pil
    d.rounded_rectangle([px(W - 40), px(19), px(W - 18), px(30)], radius=px(3),
                        outline=fg, width=max(1, px(1.2)))
    d.rounded_rectangle([px(W - 38), px(21), px(W - 25), px(28)], radius=px(1.5), fill=fg)
    d.rounded_rectangle([px(W - 17), px(23), px(W - 15.5), px(26)], radius=px(1), fill=fg)


def screen(bg, status_fg):
    img = Image.new('RGBA', (W * S, H * S), bg + (255,))
    d = ImageDraw.Draw(img, 'RGBA')
    status_bar(d, status_fg)
    return img, d


def icon(d, kind, cx, cy, size, color, w=1.5):
    """`components/Icon.tsx` icindeki cizgi ikonlarin karsiligi.

    Kaynak 24x24'luk bir kutuya cizilmis; buradaki koordinatlar o kutudan
    olceklendi.
    """
    k = size / 24.0
    lw = max(1, round(w * S))

    def P(x, y):
        return (px(cx + (x - 12) * k), px(cy + (y - 12) * k))

    if kind == 'wave':                      # ses — seviye cubuklari
        for x, y0, y1 in ((4, 10.5, 13.5), (8, 7.5, 16.5), (12, 4.5, 19.5),
                          (16, 8, 16), (20, 11, 13)):
            d.line([P(x, y0), P(x, y1)], fill=color, width=lw)
    elif kind == 'wind':                    # nefes — ruzgar
        d.line([P(3.5, 8.5), P(11, 8.5)], fill=color, width=lw)
        d.arc([P(9.7, 3), P(15.3, 8.6)], start=180, end=70, fill=color, width=lw)
        d.line([P(3.5, 13), P(13.5, 13)], fill=color, width=lw)
        d.arc([P(12.2, 13), P(17.8, 18.6)], start=250, end=140, fill=color, width=lw)
        d.line([P(3.5, 17.5), P(8.5, 17.5)], fill=color, width=lw)
    elif kind == 'quote':                   # kelime — tirnak
        for ox in (0, 9):
            d.arc([P(5.5 + ox, 6.5), P(11 + ox, 12)], start=180, end=350,
                  fill=color, width=lw)
            d.line([P(5.5 + ox, 9.5), P(5.5 + ox, 17.5)], fill=color, width=lw)
            d.line([P(5.5 + ox, 17.5), P(10.5 + ox, 17.5)], fill=color, width=lw)
            d.line([P(10.5 + ox, 17.5), P(10.5 + ox, 12.4)], fill=color, width=lw)
            d.line([P(10.5 + ox, 12.4), P(7.5 + ox, 12.4)], fill=color, width=lw)


# ======================================================================
# 1. Ana ekran — Safak temasi
# ======================================================================

def home_screen():
    img, d = screen(BG, TEXT)
    y = 62

    # --- baslik satiri (styles.header) ---
    text(d, 20, y, 'İyi geceler,', f(SANS, 12), SUB)
    text(d, 20, y + 16, 'Deniz', f(SERIF, 26), TEXT)
    # Avatar: pulse -> glow gradyani. Iki renk arasinda satir satir gecis.
    av = Image.new('RGBA', (px(44), px(44)), (0, 0, 0, 0))
    ad = ImageDraw.Draw(av)
    for i in range(px(44)):
        t_ = i / max(1, px(44) - 1)
        c = tuple(round(PULSE[j] + (GLOW[j] - PULSE[j]) * t_) for j in range(3))
        ad.line([(0, i), (px(44), i)], fill=c + (255,))
    mask = Image.new('L', av.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, av.size[0] - 1, av.size[1] - 1], fill=255)
    img.paste(av, (px(W - 20 - 44), px(y)), mask)
    dd = ImageDraw.Draw(img, 'RGBA')
    dd.text((px(W - 20 - 22), px(y + 12)), 'D', font=f(SANS_BOLD, 15),
            fill=INK, anchor='ma')
    d = dd
    y += 44 + 20

    # --- seri seridi (StreakBar) ---
    rrect(d, 20, y, W - 20, y + 41, 16, fill=ACCENT_SOFT)
    d.ellipse([px(36), px(y + 17), px(43), px(y + 24)], fill=BORDER)
    text(d, 46, y + 13, '1 gün serisi', f(SANS_BOLD, 13), PULSE)
    hint, hf = 'Bugün formülün hazır', f(SANS, 11)
    d.text((px(W - 36) - d.textlength(hint, font=hf), px(y + 15)), hint, font=hf, fill=SUB)
    y += 41 + 16

    # --- nokta atisi recete karti: ekranin tek dolgulu yuzeyi ---
    sub_lines = wrap(d, 'Şikayetini anlat, sana özel bir reçete hazırlansın. '
                        'Günde bir kez.', f(SANS, 12), 250)
    card_h = 40 + len(sub_lines) * 17
    rrect(d, 20, y, W - 20, y + card_h, 20, fill=PULSE)
    text(d, 40, y + 18, 'Nokta atışı reçete al', f(SANS_BOLD, 17), WHITE)
    ly = y + 42
    for line in sub_lines:
        text(d, 40, ly, line, f(SANS, 12), (255, 255, 255, 235))
        ly += 17
    chevron(d, W - 38, y + card_h / 2, 14, WHITE)
    y += card_h + 16

    # --- hedef secici ---
    tracked(d, 20, y, 'FORMÜLÜ BELİRLEYEN HEDEF', f(SANS_MED, 11), SUB, 2)
    y += 22
    gx = 20
    for label, active in (('Odak', True), ('Uyku', False), ('Kaygı', False),
                          ('Enerji', False)):
        gf = f(SANS_MED, 12)
        w = d.textlength(label, font=gf) / S + 32
        rrect(d, gx, y, gx + w, y + 32, 16, fill=PULSE if active else BORDER)
        d.text((px(gx + w / 2), px(y + 8)), label, font=gf,
               fill=WHITE if active else SUB, anchor='ma')
        gx += w + 8
    y += 32 + 16

    # --- formul karti ---
    rows = [
        ('color', GOLD, 'Renk', 'Altın Eşik', '15 sn'),
        ('wave', None, 'Ses', '528Hz Solfeggio', '80 sn'),
        ('wind', None, 'Nefes', '4-7-8 Tekniği · ~57 sn', '3 tur'),
        ('quote', None, 'Kelime', 'Berraklık', '12 sn'),
    ]
    card_h = 20 + 12 + 30 + 16 + len(rows) * 54 + 18 + 47 + 20
    rrect(d, 20, y, W - 20, y + card_h, 24, fill=INK_CARD)
    # Sag ust kosedeki isima — karta hapsedilmis (overflow: 'hidden').
    glow(img, W - 20, y + 10, 110, PULSE, 0.30,
         clip=(20, y, W - 20, y + card_h, 24))
    d = ImageDraw.Draw(img, 'RGBA')

    tracked(d, 40, y + 20, 'BUGÜNÜN FORMÜLÜ', f(SANS_MED, 10), HAZE, 2)
    text(d, 40, y + 34, 'Odak #51', f(SERIF, 24), WHITE)
    ry = y + 20 + 12 + 30 + 16
    for i, (kind, swatch, label, detail, dur) in enumerate(rows):
        if swatch:
            rrect(d, 40, ry + 10, 74, ry + 44, 10, fill=swatch)
        else:
            rrect(d, 40, ry + 10, 74, ry + 44, 10, outline=(255, 255, 255, 36), width=1)
            icon(d, kind, 57, ry + 27, 17, HAZE)
        text(d, 86, ry + 13, label, f(SANS_MED, 13), WHITE)
        text(d, 86, ry + 30, detail, f(SANS, 11), HAZE)
        df = f(SANS_MED, 11)
        d.text((px(W - 40) - d.textlength(dur, font=df), px(ry + 21)), dur,
               font=df, fill=GLOW)
        if i < len(rows) - 1:
            d.line([px(40), px(ry + 54), px(W - 40), px(ry + 54)],
                   fill=(255, 255, 255, 20), width=1)
        ry += 54
    ry += 18
    rrect(d, 40, ry, W - 40, ry + 47, 14, fill=PULSE)
    bf = f(SANS_BOLD, 14)
    label = 'Başlat'
    lw = d.textlength(label, font=bf) / S
    play_glyph(d, W / 2 - lw / 2 - 11, ry + 23, 9, WHITE)
    d.text((px(W / 2 - lw / 2 + 4), px(ry + 14)), label, font=bf, fill=WHITE)
    y += card_h + 20

    # --- olcum defteri (kirpilan bolge) ---
    rrect(d, 20, y, W - 20, y + 120, 24, fill=SURFACE)
    tracked(d, 40, y + 20, 'ÖLÇÜM DEFTERİ · SON 7 GÜN', f(SANS_MED, 11), SUB, 2)
    bars = [(6, 4), (7, 5), (5, 2), (8, 5), (6, 3), (7, 4), (6, 2)]
    bx = 42
    for before, after in bars:
        top = y + 52 + (10 - before) * 4.4
        d.line([px(bx), px(top), px(bx), px(y + 96)], fill=BORDER, width=px(7))
        top2 = y + 52 + (10 - after) * 4.4
        d.line([px(bx), px(top2), px(bx), px(y + 96)], fill=PULSE, width=px(7))
        bx += 46
    return img


# ======================================================================
# 2. Ritual — renk adimi
# ======================================================================

def ritual_screen():
    img, d = screen(INK, WHITE)

    # Ust cubuk: geri, ilerleme, adim sayaci
    text(d, 24, 60, '←', f(SANS, 20), HAZE)
    d.rounded_rectangle([px(58), px(70), px(W - 58), px(73)], radius=px(2),
                        fill=(255, 255, 255, 28))
    d.rounded_rectangle([px(58), px(70), px(58 + (W - 116) * 0.28), px(73)],
                        radius=px(2), fill=PULSE)
    text(d, W - 46, 62, '1/4', f(SANS_MED, 12), HAZE)

    # Nefes dairesi: formulun renginde isima, ortasinda akan metin
    cy = 330
    glow(img, W / 2, cy, 175, GOLD, 0.30)
    d = ImageDraw.Draw(img, 'RGBA')
    d.ellipse([px(W / 2 - 118), px(cy - 118), px(W / 2 + 118), px(cy + 118)],
              outline=GOLD + (110,), width=max(1, px(1.5)))
    d.ellipse([px(W / 2 - 92), px(cy - 92), px(W / 2 + 92), px(cy + 92)],
              outline=(255, 255, 255, 26), width=max(1, px(1)))
    story = ['Bulunduğun odaya bak.', 'Duvarlar sessizce duruyor.']
    for i, line in enumerate(story):
        d.text((px(W / 2), px(cy - 20 + i * 26)), line, font=f(SERIF_IT, 17),
               fill=MIST, anchor='ma')

    # Adim basligi ve notu
    center(d, W / 2, 500, 'Altın Eşik — sadece bak.', f(SERIF, 20), WHITE)
    for i, line in enumerate(wrap(d, 'Rengin kendisi bir tedavi değil. '
                                    'Bakmak ise bir karar.', f(SANS, 12), 300)):
        center(d, W / 2, 530 + i * 18, line, f(SANS, 12), HAZE)

    # Geri sayim
    center(d, W / 2, 600, '00:11', f(SANS_BOLD, 48), WHITE)

    # Alttaki bulgu hapi
    pill(d, W / 2, 720,
         '⚗️ Bu adımın bilinen bir fizyolojik etkisi yok. Yine de sayılıyor.',
         GLOW)
    return img


# ======================================================================
# 3. Muayene — yuz analizi
# ======================================================================

def examination_screen():
    img, d = screen(INK, WHITE)

    # Arkadaki parcaciklar
    for cx, cy, r, a in ((70, 190, 2.5, 60), (300, 150, 2, 45), (120, 640, 2, 40),
                         (330, 560, 3, 55), (60, 430, 1.6, 35), (350, 300, 2.2, 50),
                         (190, 120, 1.8, 40), (280, 700, 2.4, 45)):
        d.ellipse([px(cx - r), px(cy - r), px(cx + r), px(cy + r)],
                  fill=(255, 255, 255, a))

    # Iksir kabi: boyun, govde, dolan sivi
    bx, by = W / 2, 330
    glow(img, bx, by + 20, 130, PULSE, 0.28)
    d = ImageDraw.Draw(img, 'RGBA')
    body_top, body_bot, body_r = by - 18, by + 92, 62
    d.line([px(bx - 16), px(by - 96), px(bx - 16), px(by - 40)],
           fill=(255, 255, 255, 90), width=max(1, px(1.6)))
    d.line([px(bx + 16), px(by - 96), px(bx + 16), px(by - 40)],
           fill=(255, 255, 255, 90), width=max(1, px(1.6)))
    d.line([px(bx - 24), px(by - 100), px(bx + 24), px(by - 100)],
           fill=(255, 255, 255, 90), width=max(1, px(1.6)))
    d.ellipse([px(bx - body_r), px(body_top - body_r + 36), px(bx + body_r),
               px(body_bot)], outline=(255, 255, 255, 100), width=max(1, px(1.6)))
    # Doluluk: kabin alt yarisi
    fill_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(fill_layer)
    fd.ellipse([px(bx - body_r), px(body_top - body_r + 36), px(bx + body_r),
                px(body_bot)], fill=PULSE + (120,))
    cut = Image.new('L', img.size, 255)
    ImageDraw.Draw(cut).rectangle([0, 0, img.size[0], px(by + 18)], fill=0)
    fill_layer.putalpha(Image.composite(fill_layer.getchannel('A'),
                                        Image.new('L', img.size, 0), cut))
    img.alpha_composite(fill_layer)
    d = ImageDraw.Draw(img, 'RGBA')

    center(d, W / 2, 480, 'Yüz ifaden analiz ediliyor...', f(SANS, 13), HAZE)
    # Sikayet, ekranda %50 opaklikta `mist` — koyu zeminde soluk bir gri.
    center(d, W / 2, 508, '“Kafam dağınık, odaklanamıyorum”', f(SERIF_IT, 13),
           MIST + (128,))

    note = plain('🤖 Yüz analizi gerçek: cihazında çalışan bir model. Karışımın '
                 'kendisi ise plasebo — etkiyi beklenti kuruyor.')
    nf = f(SANS, 10)
    lines = wrap(d, note, nf, 300)
    for i, line in enumerate(lines):
        center(d, W / 2, 760 - (len(lines) - 1 - i) * 15, line, nf, (120, 136, 152))
    return img


# ======================================================================
# 4. Gun ici olcum — nefes analizi
# ======================================================================

def checkin_screen():
    img, d = screen(INK, WHITE)

    # Yukselen baloncuklar
    # Kenarlarda tutuluyorlar: ortadaki metinlerin uzerine denk gelen bir
    # baloncuk ekranda leke gibi okunuyor.
    for cx, cy, r in ((40, 380, 3), (355, 430, 2.4), (36, 620, 2),
                      (360, 700, 3), (48, 250, 2.2), (350, 300, 2.6)):
        d.ellipse([px(cx - r), px(cy - r), px(cx + r), px(cy + r)],
                  outline=(255, 255, 255, 45), width=max(1, px(1)))

    cy = 300
    glow(img, W / 2, cy, 165, PULSE, 0.34)
    d = ImageDraw.Draw(img, 'RGBA')
    d.ellipse([px(W / 2 - 112), px(cy - 112), px(W / 2 + 112), px(cy + 112)],
              outline=PULSE + (150,), width=max(1, px(1.5)))
    d.ellipse([px(W / 2 - 86), px(cy - 86), px(W / 2 + 86), px(cy + 86)],
              outline=(255, 255, 255, 28), width=max(1, px(1)))
    d.text((px(W / 2), px(cy - 10)), 'Sadece nefes al.', font=f(SERIF_IT, 16),
           fill=MIST, anchor='ma')

    center(d, W / 2, 470, '32', f(SANS_BOLD, 48), WHITE)

    center(d, W / 2, 560, 'Nefesin dinleniyor', f(SERIF, 20), WHITE)
    for i, line in enumerate(wrap(d, 'Doğal nefes al. Sayıları tutturmak '
                                     'zorunda değilsin.', f(SANS, 12), 290)):
        center(d, W / 2, 590 + i * 18, line, f(SANS, 12), HAZE)

    pill(d, W / 2, 660,
         'Gün içindeki ölçümler yalnızca cihazında saklanır; hiçbir yere gönderilmez.',
         GLOW)

    rrect(d, 24, 730, W - 24, 786, 16, fill=PULSE)
    d.text((px(W / 2), px(748)), 'Vazgeç', font=f(SANS_BOLD, 15), fill=WHITE, anchor='ma')
    return img


# ======================================================================
# 5. Sabah raporu
# ======================================================================

def report_screen():
    img, d = screen(INK, WHITE)
    y = 86

    tracked(d, 24, y, 'SON 24 SAAT', f(SANS_MED, 11), PULSE, 2)
    y += 26
    for line in wrap(d, 'Gün ilerledikçe nefesin düzene girdi.', f(SERIF, 24), 342):
        text(d, 24, y, line, f(SERIF, 24), WHITE)
        y += 32
    y += 6
    text(d, 24, y, '4 ölçümün ortalaması: %71 düzen.', f(SANS, 13), HAZE)
    y += 34

    for label, value in (('En düzenli an', '07:00 · %84'),
                         ('En gergin an', '15:00 · %52'),
                         ('Dün gece uyku', '6 sa 40 dk'),
                         ('Dinlenme nabzı', '58 atım/dk')):
        text(d, 24, y, label, f(SANS, 13), HAZE)
        vf = f(SANS_MED, 13)
        d.text((px(W - 24) - d.textlength(value, font=vf), px(y)), value,
               font=vf, fill=WHITE)
        d.line([px(24), px(y + 26), px(W - 24), px(y + 26)],
               fill=(255, 255, 255, 30), width=1)
        y += 36

    y += 10
    for line in wrap(d, 'Kısa bir geceydi; bugünkü reçetene fazladan bir '
                        'sakinleştirme turu eklendi.', f(SANS, 12), 342):
        text(d, 24, y, line, f(SANS, 12), HAZE)
        y += 18

    pill(d, W / 2, y + 24,
         'Bu rapor bir teşhis değil: yalnızca senin yaptığın ölçümlerin ve '
         'Sağlık verinin yan yana konmuş hâli.', GLOW)

    rrect(d, 24, 730, W - 24, 786, 16, fill=PULSE)
    d.text((px(W / 2), px(748)), 'Kapat', font=f(SANS_BOLD, 15), fill=WHITE, anchor='ma')
    return img


# ======================================================================
# 6. Plan ekrani — plasebo plus
# ======================================================================

def plans_screen():
    """`iap-review-shot.py` icindeki cizimin ilk ekran boyu kadari.

    Ayni ekran iki yerde iki kez cizilmesin diye o betikten cagriliyor;
    orada plan ekrani zaten satin alma noktasinin tamami olarak
    ciziliydi. Burada yalnizca ust kismi gorunuyor, gerisi kaydirmada.
    """
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'iap_review_shot', os.path.join(ROOT, 'scripts', 'iap-review-shot.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    tall = mod.render('tr').convert('RGBA')
    img = Image.new('RGBA', (W * S, H * S), BG + (255,))
    img.paste(tall.crop((0, 0, W * S, min(H * S, tall.height))), (0, 0))
    d = ImageDraw.Draw(img, 'RGBA')
    status_bar(d, TEXT)
    return img


# ======================================================================
# Kart bilesimi
# ======================================================================

CARDS = [
    ('01-ana-ekran', 'Her gün yeni\nbir formül', home_screen),
    ('02-ritual', 'İki dakikalık\nbir tören', ritual_screen),
    ('03-yuz-analizi', 'Yüzünden ölçüyor,\nsen tahmin etmiyorsun', examination_screen),
    ('04-nefes-analizi', 'Nefesini dinliyor,\nses kaydedilmiyor', checkin_screen),
    ('05-sabah-raporu', 'Ertesi sabah\ntek bir rapor', report_screen),
    ('06-plus', 'Ritüel ücretsiz.\nPlus ölçümü açar.', plans_screen),
]

SIZES = {
    'ios': ((1290, 2796), 'ios'),          # 6.9" — zorunlu set
    'ios65': ((1242, 2688), os.path.join('ios', '6.5-inch')),
}


def card(size, headline, screen_img):
    """Ustte baslik, altinda kartin alt kenarindan tasan telefon."""
    cw, ch = size
    k = cw / 1290.0                       # 6.9 inclik karta gore olcek
    canvas = Image.new('RGB', (cw, ch), BG)
    d = ImageDraw.Draw(canvas)

    # Baslik — iki satir, marka yazi tipi (serif).
    hf = ImageFont.truetype(SERIF, round(92 * k))
    y = round(150 * k)
    for line in headline.split('\n'):
        d.text((round(100 * k), y), line, font=hf, fill=TEXT)
        y += round(108 * k)

    # Telefon: govde kartin alt kenarindan tasiyor, orada kirpiliyor.
    bezel = round(20 * k)
    outer_w = round(cw * 0.84)
    inner_w = outer_w - 2 * bezel
    inner_h = round(inner_w * H / W)
    outer_h = inner_h + 2 * bezel
    x0 = (cw - outer_w) // 2
    y0 = round(600 * k)

    body = Image.new('RGBA', (outer_w, outer_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, outer_w - 1, outer_h - 1],
                         radius=round(118 * k), fill=(26, 28, 34, 255))
    inner = screen_img.convert('RGB').resize((inner_w, inner_h), Image.LANCZOS)
    mask = Image.new('L', (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, inner_w - 1, inner_h - 1],
                                           radius=round(100 * k), fill=255)
    body.paste(inner, (bezel, bezel), mask)

    # Dinamik ada
    bdd = ImageDraw.Draw(body)
    isl_w, isl_h = round(inner_w * 0.30), round(34 * k)
    bdd.rounded_rectangle([(outer_w - isl_w) // 2, bezel + round(14 * k),
                           (outer_w + isl_w) // 2, bezel + round(14 * k) + isl_h],
                          radius=isl_h // 2, fill=(12, 13, 16, 255))

    canvas.paste(body, (x0, y0), body)
    return canvas


def main():
    out_root = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        ROOT, 'store', 'graphics', 'screenshots')
    print('Yazildi:')
    for key, (size, sub) in SIZES.items():
        out_dir = os.path.join(out_root, sub)
        os.makedirs(out_dir, exist_ok=True)
        for name, headline, fn in CARDS:
            img = card(size, headline, fn())
            path = os.path.join(out_dir, name + '.png')
            img.save(path)
            print('  ' + path + '  (' + str(size[0]) + 'x' + str(size[1]) + ')')


if __name__ == '__main__':
    main()
