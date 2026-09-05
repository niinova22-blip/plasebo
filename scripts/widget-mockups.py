# -*- coding: utf-8 -*-
"""Widget tasarim onerilerini gercek widget olculerinde PNG olarak uretir.

    python scripts/widget-mockups.py [cikti_klasoru]

Cikti verilmezse masaustune yazar.

Neden mockup: widget'i denemek icin her seferinde bir EAS derlemesi
harcamak gerekiyor (derleme hakki kisitli). Tasarim once burada
kararlastiriliyor, Swift tarafina yalnizca onaylanan duzen yaziliyor.

Olculer iPhone 15/16 (430pt genislik) icin Apple'in widget boyutlari,
3x olcekle: small 170x170pt, medium 364x170pt, lockscreen rectangular
172x76pt, circular 76x76pt.
"""
import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'node_modules', '@expo-google-fonts')
SERIF = os.path.join(FONTS, 'dm-serif-display', '400Regular', 'DMSerifDisplay_400Regular.ttf')
SANS = os.path.join(FONTS, 'space-grotesk', '400Regular', 'SpaceGrotesk_400Regular.ttf')
SANS_MED = os.path.join(FONTS, 'space-grotesk', '500Medium', 'SpaceGrotesk_500Medium.ttf')
SANS_BOLD = os.path.join(FONTS, 'space-grotesk', '700Bold', 'SpaceGrotesk_700Bold.ttf')

S = 3  # olcek (3x retina)

INK = (14, 14, 18)
PULSE = (123, 110, 246)
GLOW = (168, 255, 120)
HAZE = (197, 194, 184)
WHITE = (255, 255, 255)
GHOST = (247, 246, 242)


def font(path, size):
    return ImageFont.truetype(path, round(size * S))


def rounded(size, radius, fill):
    img = Image.new('RGBA', (size[0] * S, size[1] * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size[0] * S - 1, size[1] * S - 1], radius=radius * S, fill=fill)
    return img


def vgradient(size, top, bottom, radius):
    """Dikey gecisli zemin — widget'a derinlik veren tek sey bu."""
    w, h = size[0] * S, size[1] * S
    grad = Image.new('RGB', (1, h))
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        k = y / max(1, h - 1)
        gd.point((0, y), fill=tuple(round(top[i] + (bottom[i] - top[i]) * k) for i in range(3)))
    grad = grad.resize((w, h))
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius * S, fill=255)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def ring(draw, cx, cy, r, width, progress, track, color):
    """Ilerleme halkasi — seri/tamamlanma gostergesi."""
    box = [(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S]
    draw.arc(box, 0, 360, fill=track, width=round(width * S))
    if progress > 0:
        draw.arc(box, -90, -90 + 360 * min(1.0, progress), fill=color, width=round(width * S))


def center_text(draw, cx, y, text, f, fill):
    w = draw.textlength(text, font=f)
    draw.text((cx * S - w / 2, y * S), text, font=f, fill=fill)


def dots(draw, x, y, days, size=7, gap=5):
    """Son 7 gun — dolu nokta o gun ritüel yapildi demek."""
    for i, done in enumerate(days):
        px = (x + i * (size + gap)) * S
        py = y * S
        box = [px, py, px + size * S, py + size * S]
        if done:
            draw.ellipse(box, fill=PULSE)
        else:
            draw.ellipse(box, outline=(255, 255, 255, 90), width=max(1, round(1.5 * S)))


# ----------------------------------------------------------------------
# A) Kucuk widget — halka + seri sayisi (Streaks/Gentler Streak dili)
# ----------------------------------------------------------------------
def small_ring(done_today=True, streak=12, formula='Berrak Sabah'):
    img = vgradient((170, 170), (26, 24, 48), INK, 22)
    d = ImageDraw.Draw(img)

    ring(d, 85, 62, 38, 9, 1.0 if done_today else 0.0, (255, 255, 255, 38), GLOW if done_today else PULSE)
    center_text(d, 85, 42, str(streak), font(SANS_BOLD, 32), WHITE)
    center_text(d, 85, 76, 'GÜN', font(SANS_MED, 9), HAZE)

    center_text(d, 85, 116, formula, font(SERIF, 15), WHITE)
    center_text(
        d, 85, 138,
        'bugün tamamlandı' if done_today else 'formülün hazır',
        font(SANS, 10), GLOW if done_today else HAZE,
    )
    return img


# ----------------------------------------------------------------------
# B) Kucuk widget — bugunun formulu one cikan (icerik odakli)
# ----------------------------------------------------------------------
def small_formula(done_today=False, streak=12, formula='Berrak Sabah', steps='renk · ses · nefes'):
    img = vgradient((170, 170), (18, 17, 26), INK, 22)
    d = ImageDraw.Draw(img)

    d.rounded_rectangle([14 * S, 14 * S, 44 * S, 30 * S], radius=8 * S, fill=(123, 110, 246, 46))
    d.text((21 * S, 17 * S), 'BUGÜN', font=font(SANS_MED, 8), fill=PULSE)

    d.text((14 * S, 40 * S), formula, font=font(SERIF, 17), fill=WHITE)
    d.text((14 * S, 66 * S), steps, font=font(SANS, 10), fill=HAZE)

    dots(d, 14, 92, [True, True, False, True, True, True, done_today])

    d.line([14 * S, 116 * S, 156 * S, 116 * S], fill=(255, 255, 255, 30), width=max(1, S))
    d.text((14 * S, 126 * S), f'{streak} günlük seri', font=font(SANS_MED, 11), fill=WHITE)
    d.text((14 * S, 143 * S),
           'tamamlandı' if done_today else 'başlamak için dokun',
           font=font(SANS, 9), fill=GLOW if done_today else HAZE)
    return img


# ----------------------------------------------------------------------
# C) Orta widget — halka + formul + son 7 gun + puan farki
# ----------------------------------------------------------------------
def medium_full(done_today=True, streak=12, formula='Berrak Sabah',
                steps='renk · ses · nefes', delta=-3):
    img = vgradient((364, 170), (26, 24, 48), INK, 22)
    d = ImageDraw.Draw(img)

    # Sol: halka
    ring(d, 68, 78, 42, 10, 1.0 if done_today else 0.0, (255, 255, 255, 38),
         GLOW if done_today else PULSE)
    center_text(d, 68, 60, str(streak), font(SANS_BOLD, 34), WHITE)
    center_text(d, 68, 92, 'GÜN', font(SANS_MED, 9), HAZE)
    center_text(d, 68, 132, 'GÜNLÜK SERİ', font(SANS_MED, 8), HAZE)

    # Ayirici
    d.line([134 * S, 30 * S, 134 * S, 140 * S], fill=(255, 255, 255, 28), width=max(1, S))

    # Sag: icerik
    x = 154
    d.text((x * S, 28 * S), 'BUGÜNÜN FORMÜLÜ', font=font(SANS_MED, 9), fill=PULSE)
    d.text((x * S, 44 * S), formula, font=font(SERIF, 22), fill=WHITE)
    d.text((x * S, 76 * S), steps, font=font(SANS, 11), fill=HAZE)

    d.text((x * S, 98 * S), 'SON 7 GÜN', font=font(SANS_MED, 8), fill=HAZE)
    dots(d, x, 112, [True, True, False, True, True, True, done_today], size=9, gap=7)

    if delta < 0:
        d.text((x * S, 134 * S), f'son seansta {abs(delta)} puan azaldı',
               font=font(SANS, 10), fill=GLOW)
    else:
        d.text((x * S, 134 * S), 'bugün formülün hazır', font=font(SANS, 10), fill=HAZE)
    return img


# ----------------------------------------------------------------------
# D) Kilit ekrani — dikdortgen ve dairesel
# ----------------------------------------------------------------------
def lock_rect(done_today=True, streak=12, formula='Berrak Sabah'):
    img = Image.new('RGBA', (172 * S, 76 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ring(d, 20, 38, 15, 4, 1.0 if done_today else 0.0, (255, 255, 255, 60), WHITE)
    center_text(d, 20, 30, str(streak), font(SANS_BOLD, 14), WHITE)
    d.text((44 * S, 20 * S), formula, font=font(SANS_MED, 13), fill=WHITE)
    d.text((44 * S, 40 * S),
           'bugün tamamlandı' if done_today else 'formülün hazır',
           font=font(SANS, 11), fill=(255, 255, 255, 175))
    return img


def lock_circular(done_today=True, streak=12):
    img = Image.new('RGBA', (76 * S, 76 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ring(d, 38, 38, 32, 6, 1.0 if done_today else 0.0, (255, 255, 255, 60), WHITE)
    center_text(d, 38, 22, str(streak), font(SANS_BOLD, 22), WHITE)
    center_text(d, 38, 47, 'GÜN', font(SANS_MED, 8), (255, 255, 255, 190))
    return img


# ----------------------------------------------------------------------
# Sunum sayfasi: her tasarimi telefon zemininde, basligiyla birlikte
# ----------------------------------------------------------------------
def sheet(items, title, subtitle, width=1200):
    pad = 40
    head_h = 150
    rows = []
    y = head_h
    for label, note, img in items:
        rows.append((label, note, img, y))
        y += round(img.height / S) + 92
    canvas = Image.new('RGB', (width, y + pad), (22, 21, 30))
    d = ImageDraw.Draw(canvas)

    d.text((pad, 40), title, font=ImageFont.truetype(SERIF, 40), fill=WHITE)
    d.text((pad, 92), subtitle, font=ImageFont.truetype(SANS, 20), fill=HAZE)

    for label, note, img, top in rows:
        w = round(img.width / S)
        h = round(img.height / S)
        shown = img.resize((w, h), Image.LANCZOS)
        canvas.paste(shown, (pad, top), shown)
        tx = pad + w + 36
        d.text((tx, top + 6), label, font=ImageFont.truetype(SANS_BOLD, 24), fill=WHITE)
        for i, line in enumerate(note):
            d.text((tx, top + 44 + i * 30), line, font=ImageFont.truetype(SANS, 18), fill=HAZE)
    return canvas


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.expanduser('~'), 'Desktop', 'plasebo-widget'
    )
    os.makedirs(out_dir, exist_ok=True)

    home = sheet(
        [
            ('A · Küçük — Seri halkası',
             ['Ortada büyük seri sayısı, çevresinde tamamlanma halkası.',
              'Streaks/Gentler Streak dili: tek bakışta "bugün yaptım mı".',
              'Yeşil halka = bugün tamamlandı, mor = bekliyor.'],
             small_ring(done_today=True)),
            ('B · Küçük — Formül önde',
             ['Günün formülü başlık olarak; altında adımlar.',
              'Son 7 günün noktaları ve seri en altta.',
              'İçeriği merak ettiren, "aç beni" diyen sürüm.'],
             small_formula(done_today=False)),
            ('C · Orta — Tam pano',
             ['Solda seri halkası, sağda formül + adımlar.',
              'Son 7 gün noktaları ve son seansın puan farkı.',
              'Ana ekranda en çok bilgi veren sürüm.'],
             medium_full(done_today=True)),
        ],
        'Plasebo · Ana ekran widget önerileri',
        'Gerçek widget ölçülerinde (iPhone 15/16). Hepsi aynı veriden beslenir.',
    )
    home.save(os.path.join(out_dir, '1-ana-ekran-widget.png'))

    lock = sheet(
        [
            ('D · Kilit ekranı — dikdörtgen',
             ['Küçük halka + formül adı + durum.',
              'Kilit ekranında renk yok; sistem tek renk uyguluyor.'],
             lock_rect(done_today=True)),
            ('E · Kilit ekranı — dairesel',
             ['Yalnızca seri sayısı ve tamamlanma halkası.',
              'Saatin altındaki dar alan için; tek bakışlık.'],
             lock_circular(done_today=True)),
        ],
        'Plasebo · Kilit ekranı widget önerileri',
        'Kilit ekranı widget’ları tek renktir; ayrım halka ve tipografiyle kurulur.',
    )
    lock.save(os.path.join(out_dir, '2-kilit-ekrani-widget.png'))

    states = sheet(
        [
            ('Bugün tamamlandı', ['Halka dolu ve yeşil; durum satırı onaylıyor.'],
             small_ring(done_today=True, streak=12)),
            ('Bugün bekliyor', ['Halka boş ve mor; kullanıcıyı içeri çağırıyor.'],
             small_ring(done_today=False, streak=12)),
            ('Seri yok (ilk gün)', ['Sayı 0; widget yine de bir şey söylüyor.'],
             small_ring(done_today=False, streak=0, formula='İlk Formülün')),
        ],
        'Plasebo · Durumlar',
        'Aynı tasarımın üç hâli — widget hiçbir durumda boş görünmüyor.',
    )
    states.save(os.path.join(out_dir, '3-durumlar.png'))

    print('Yazildi:')
    for name in sorted(os.listdir(out_dir)):
        print('  ', os.path.join(out_dir, name))


if __name__ == '__main__':
    main()
