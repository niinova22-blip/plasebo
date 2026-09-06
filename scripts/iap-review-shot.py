# -*- coding: utf-8 -*-
"""App Store Connect'in abonelik urunleri icin istedigi inceleme
goruntusunu (Review Information -> Screenshot) uretir.

    python scripts/iap-review-shot.py [cikti_klasoru]

Cikti verilmezse masaustundeki `plasebo-iap` klasorune yazar. Iki dosya
cikar: `plan-ekrani-en.png` (Apple'a yuklenecek olan) ve
`plan-ekrani-tr.png`.

NEDEN AYRI BIR BETIK

`scripts/plus-mockups.py` bir tasarim maketi uretiyor: sayfalarin
uzerinde aciklama basliklari var, paleti Eylul 2026'da yumusatilan
renklerden onceki mor/neon ikilisi ve ekrani koyu temada ciziyor —
oysa varsayilan tema artik Safak (aydinlik). Daha onemlisi plan
ekraninin ZORUNLU parcalarini hic cizmiyor: abonelik kosullari
paragrafi ile gizlilik/kullanim kosullari baglantilari. Guideline
3.1.2 tam olarak o parcalari ariyor, yani o maket inceleme goruntusu
yerine gecemez.

Buradaki cizim `src/screens/PlansScreen.tsx` icindeki StyleSheet'ten
punto punto kopyalandi ve renkler `src/theme/theme.ts` icindeki Safak
temasindan aliniyor. Ekran bir ScrollView; tek bir telefon ekranina
sigmadigi icin tuval icerik boyu kadar uzun uretiliyor, yani goruntu
kaydirmanin tamamini gosteriyor.

DIL: Apple incelemeyi Ingilizce yapiyor, o yuzden yuklenecek dosya
`-en` olani. Metinler `src/i18n/en.ts` icindeki gercek karsiliklardan
alindi, elde cevrilmedi.
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

# iPhone 390x844 pt, 3x. Genislik 1170 px — Apple'in 640x920 alt siniri
# rahatlikla asiliyor.
W = 390
S = 3

# Safak temasi (src/theme/theme.ts -> dawnTheme). Varsayilan tema bu:
# yeni kullanici ve inceleyen, plan ekranini bu renklerde goruyor.
BG = (251, 244, 238)
SURFACE = (255, 255, 255)
TEXT = (55, 50, 63)
SUB = (110, 102, 120)
FAINT = (145, 135, 153)
BORDER = (238, 226, 217)
PULSE = (110, 136, 168)

PAD = 20          # styles.content padding
X0, X1 = PAD, W - PAD
INNER = X1 - X0
TOP_INSET = 62    # centikli iPhone'un guvenli alani


def f(path, size):
    return ImageFont.truetype(path, size * S)


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


def tracked(d, x, y, s, font, fill, spacing):
    """letterSpacing'li metin — PIL'de karsiligi yok, harf harf ciziliyor."""
    cx = px(x)
    for ch in s:
        d.text((cx, px(y)), ch, font=font, fill=fill)
        cx += d.textlength(ch, font=font) + px(spacing)


def underline(d, x, y, s, font, fill):
    w = d.textlength(s, font=font)
    _, desc = font.getmetrics()
    yy = px(y) + font.size + round(desc * 0.25)
    d.line([px(x), yy, px(x) + w, yy], fill=fill, width=max(1, S // 2))


def rrect(d, x0, y0, x1, y1, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle([px(x0), px(y0), px(x1), px(y1)], radius=px(radius),
                        fill=fill, outline=outline, width=px(width))


def glyph(d, kind, cx, cy, size, color):
    """Icon bilesenindeki cizgi ikonlarin karsiligi."""
    r = size / 2
    lw = max(1, round(1.5 * S))
    if kind == 'camera':
        d.rounded_rectangle([px(cx - r), px(cy - r * 0.7), px(cx + r), px(cy + r * 0.75)],
                            radius=px(3), outline=color, width=lw)
        d.ellipse([px(cx - r * 0.36), px(cy - r * 0.36), px(cx + r * 0.36), px(cy + r * 0.36)],
                  outline=color, width=lw)
    elif kind == 'wind':
        for yy, ln in ((-0.42, 0.85), (0.0, 1.0), (0.42, 0.7)):
            y = cy + yy * r
            end = cx - r + 2 * r * ln * 0.8
            d.line([px(cx - r), px(y), px(end), px(y)], fill=color, width=lw)
            d.arc([px(end - r * 0.34), px(y - r * 0.34), px(end + r * 0.34), px(y + r * 0.34)],
                  start=270, end=140, fill=color, width=lw)
    elif kind == 'chart':
        d.line([px(cx - r), px(cy + r), px(cx - r), px(cy - r)], fill=color, width=lw)
        d.line([px(cx - r), px(cy + r), px(cx + r), px(cy + r)], fill=color, width=lw)
        pts = [(-0.55, 0.35), (-0.1, -0.2), (0.3, 0.05), (0.75, -0.6)]
        for i in range(len(pts) - 1):
            d.line([px(cx + pts[i][0] * r), px(cy + pts[i][1] * r),
                    px(cx + pts[i + 1][0] * r), px(cy + pts[i + 1][1] * r)],
                   fill=color, width=lw)


# ----------------------------------------------------------------------
# Ekrandaki metinler
#
# Fiyatlar App Store Connect'te secilen gercek kademeler: aylik TRY
# 149,99, yillik TRY 1.159,99, ikisinde de bir haftalik ucretsiz deneme.
# Indirim rozetindeki %36 uygulamanin kendi hesabi (1 - 1159,99/1799,88).
# ----------------------------------------------------------------------

MONTHLY = '₺149,99'
YEARLY = '₺1.159,99'

STRINGS = {
    'en': {
        'back': '‹ Back',
        'title': 'Plasebo Plus',
        'sub': 'The ritual is free and will stay free. Plus tells you whether it is '
               'working for you — by measuring.',
        'highlights': [
            ('camera', 'Measurement by face scan',
             'Stop guessing your before and after scores — let the camera measure '
             'them. The on-device emotion model reads your expression, and the photo '
             'never leaves your phone.'),
            ('wind', 'Breath analysis',
             'Measures how regular and how deep your breathing is during the ritual, and '
             'how many breaths you take per minute. Feeling calmer and measuring it are '
             'two different things.'),
            ('chart', 'Daytime check-ins and a morning report',
             'Three short breathing check-ins during the day, then one report the next '
             'morning that folds in your sleep and heart rate. It shows which hour of the '
             'day you are calmest.'),
        ],
        'monthly': 'Monthly',
        'yearly': 'Yearly',
        'per_month': '/mo',
        'per_year': '/yr',
        'badge': '36% off · ₺96,67 per month',
        'intro_monthly': '1 week free, then ' + MONTHLY,
        'intro_yearly': '1 week free, then ' + YEARLY,
        'cta': 'Start free trial',
        'restore': 'Restore purchases',
        'terms': 'Yearly — ' + YEARLY + '/yr. 1 week free, then ' + YEARLY +
                 ' will be charged. This is a subscription and renews automatically at '
                 'the end of each period. Payment is charged to your account when you '
                 'confirm the purchase. To stop renewal, go to the subscription settings '
                 'in your account at least 24 hours before the period ends; deleting the '
                 'app does not cancel the subscription.',
        'legal': ['Privacy policy', 'Terms of use', 'Subscriptions'],
    },
    'tr': {
        'back': '‹ Geri',
        'title': 'Plasebo Plus',
        'sub': 'Ritüel ücretsiz ve öyle kalacak. Plus, ritüelin '
               'sende işe yarayıp yaramadığını sana '
               'ölçerek söyler.',
        'highlights': [
            ('camera', 'Yüz taramasıyla ölçüm',
             'Önce ve sonra puanını sen tahmin etme — kamera '
             'ölçsün. Cihaz üstündeki duygu modeli yüz '
             'ifadeni okur, fotoğraf telefonundan çıkmaz.'),
            ('wind', 'Nefes analizi',
             'Ritüel sırasında nefesinin düzenliliğini, '
             'derinliğini ve dakikadaki sayısını ölçer. '
             'Sakinleştiğini hissetmekle ölçmek ayrı '
             'şeyler.'),
            ('chart', 'Gün içi ölçüm ve sabah raporu',
             'Gün içinde üç kısa nefes ölçümü, '
             'ertesi sabah uyku ve nabızla birleşen tek bir rapor. Günün '
             'hangi saatinde en sakin olduğunu gösterir.'),
        ],
        'monthly': 'Aylık',
        'yearly': 'Yıllık',
        'per_month': '/ay',
        'per_year': '/yıl',
        'badge': '%36 indirim · ayda ₺96,67',
        'intro_monthly': '1 hafta ücretsiz, sonra ' + MONTHLY,
        'intro_yearly': '1 hafta ücretsiz, sonra ' + YEARLY,
        'cta': 'Ücretsiz denemeyi başlat',
        'restore': 'Satın alımları geri yükle',
        'terms': 'Yıllık — ' + YEARLY + '/yıl. 1 hafta '
                 'ücretsiz, sonra ' + YEARLY + ' ücretlendirilir. Bu bir '
                 'aboneliktir ve dönem sonunda kendiliğinden yenilenir. '
                 'Ödeme, satın almayı onayladığında '
                 'hesabından tahsil edilir. Yenilemeyi durdurmak için dönem '
                 'bitmeden en az 24 saat önce hesabının abonelik '
                 'ayarlarına gitmen gerekir; uygulamayı silmek aboneliği '
                 'iptal etmez.',
        'legal': ['Gizlilik politikası', 'Kullanım koşulları',
                  'Abonelikler'],
    },
}


def plan_card(d, y, name, price, period, tagline, badge, selected):
    """styles.card — radius 18, padding 18, secili kartin kenari 2px pulse."""
    pad = 18
    name_f = f(SANS_BOLD, 16)
    price_f = f(SERIF, 24)
    period_f = f(SANS, 12)
    badge_f = f(SANS_MED, 10)
    tag_f = f(SANS, 12)

    h = pad + 24 + (6 + 12 if badge else 0) + 4 + 16 + pad
    rrect(d, X0, y, X1, y + h, 18, fill=SURFACE,
          outline=(PULSE if selected else BORDER), width=2 if selected else 1)

    # cardHead: alignItems 'baseline' — isim ve fiyat ayni taban cizgisinde.
    base = y + pad + price_f.getmetrics()[0] / S
    text(d, X0 + pad, base, name, name_f, TEXT, anchor='ls')
    pw = d.textlength(period, font=period_f)
    d.text((px(X1 - pad) - pw, px(base)), period, font=period_f, fill=SUB, anchor='ls')

    # Para birimi isareti serif kesimde yok. iOS'ta da oyle: sistem o tek
    # glifi baska bir yuze dusuruyor, rakamlar serif kaliyor. Burada da
    # ayni bolme yapiliyor, yoksa ₺ yerine bos kutu ciziliyor.
    sym_f = f(SANS, 21)
    sym = ''.join(c for c in price if not (c.isdigit() or c in '.,'))
    digits = price[len(sym):]
    dw = d.textlength(digits, font=price_f)
    sw = d.textlength(sym, font=sym_f)
    right = px(X1 - pad) - pw
    d.text((right - dw, px(base)), digits, font=price_f, fill=TEXT, anchor='ls')
    d.text((right - dw - sw, px(base)), sym, font=sym_f, fill=TEXT, anchor='ls')

    yy = y + pad + 24
    if badge:
        yy += 6
        tracked(d, X0 + pad, yy, badge, badge_f, PULSE, 1)
        yy += 12
    yy += 4
    text(d, X0 + pad, yy, tagline, tag_f, SUB)
    return y + h


def render(lang):
    s = STRINGS[lang]

    # Iki gecis: once yukseklik olculuyor, sonra o boydaki tuvale ciziliyor.
    probe = ImageDraw.Draw(Image.new('RGB', (1, 1)))

    sub_lines = wrap(probe, s['sub'], f(SANS, 12), INNER)
    # highlightText'in genisligi: kart ici (350 - 2x16) eksi ikon (36) ve
    # yanindaki bosluk (12). Baslik da bu sutunda, yani o da sariyor.
    hl_w = INNER - 32 - 36 - 12
    hl_titles = [wrap(probe, title, f(SANS_BOLD, 15), hl_w)
                 for _, title, _ in s['highlights']]
    hl_lines = [wrap(probe, desc, f(SANS, 12), hl_w)
                for _, _, desc in s['highlights']]
    terms_lines = wrap(probe, s['terms'], f(SANS, 10), INNER)

    h = TOP_INSET
    h += 6 + 16 + 6                      # back
    h += 6 + 39                          # title (serif 30)
    h += 4 + len(sub_lines) * 18         # sub
    for titles, lines in zip(hl_titles, hl_lines):   # highlight kartlari
        h += max(36, len(titles) * 19 + 4 + len(lines) * 18) + 32 + 10
    h += 12 + 96                         # aylik kart
    h += 12 + 114                        # yillik kart (rozet satiri var)
    h += 20 + 50                         # CTA
    h += 14 + 8 + 16 + 8                 # restore
    h += 16 + len(terms_lines) * 15      # kosullar
    h += 12 + 18                         # legal satiri
    h += 40                              # alt bosluk

    img = Image.new('RGB', (W * S, round(h * S)), BG)
    d = ImageDraw.Draw(img)

    y = TOP_INSET
    y += 6
    text(d, X0, y, s['back'], f(SANS_MED, 13), SUB)
    y += 16 + 6

    y += 6
    text(d, X0, y, s['title'], f(SERIF, 30), TEXT)
    y += 39

    y += 4
    for line in sub_lines:
        text(d, X0, y, line, f(SANS, 12), SUB)
        y += 18

    # styles.highlight — padding 16, marginBottom 10
    for (icon, _, _), titles, lines in zip(s['highlights'], hl_titles, hl_lines):
        body = max(36, len(titles) * 19 + 4 + len(lines) * 18)
        card_h = body + 32
        rrect(d, X0, y, X1, y + card_h, 16, fill=SURFACE, outline=BORDER, width=1)
        rrect(d, X0 + 16, y + 16, X0 + 52, y + 52, 10, outline=BORDER, width=1)
        glyph(d, icon, X0 + 34, y + 34, 18, PULSE)
        ty = y + 16
        for line in titles:
            text(d, X0 + 64, ty, line, f(SANS_BOLD, 15), TEXT)
            ty += 19
        ty += 4
        for line in lines:
            text(d, X0 + 64, ty, line, f(SANS, 12), SUB)
            ty += 18
        y += card_h + 10

    y += 12
    y = plan_card(d, y, s['monthly'], MONTHLY, s['per_month'],
                  s['intro_monthly'], None, False)
    y += 12
    y = plan_card(d, y, s['yearly'], YEARLY, s['per_year'],
                  s['intro_yearly'], s['badge'], True)

    # CTA — styles.cta. Secili kartta deneme oldugu icin yazi "free trial".
    y += 20
    rrect(d, X0, y, X1, y + 50, 14, fill=PULSE)
    text(d, W / 2, y + 15, s['cta'], f(SANS_BOLD, 14), BG, anchor='ma')
    y += 50

    # Geri yukleme — abonelik satan her uygulamada zorunlu.
    y += 14 + 8
    rf = f(SANS, 12)
    rw = d.textlength(s['restore'], font=rf) / S
    text(d, W / 2 - rw / 2, y, s['restore'], rf, SUB)
    underline(d, W / 2 - rw / 2, y, s['restore'], rf, SUB)
    y += 16 + 8

    # Zorunlu abonelik metni (Guideline 3.1.2).
    y += 16
    for line in terms_lines:
        text(d, X0, y, line, f(SANS, 10), FAINT)
        y += 15

    # Gizlilik / kullanim kosullari / abonelikler baglantilari.
    y += 12
    lf = f(SANS, 11)
    lx = X0
    for i, label in enumerate(s['legal']):
        if i:
            text(d, lx + 8, y, '·', lf, FAINT)
            lx += 8 + d.textlength('·', font=lf) / S + 8
        text(d, lx, y, label, lf, SUB)
        underline(d, lx, y, label, lf, SUB)
        lx += d.textlength(label, font=lf) / S

    return img


# App Store Connect'in inceleme goruntusu icin kabul ettigi olcu: bir
# iOS cihaz ekran goruntusu boyutu olmak zorunda. Serbest boy yuklenince
# "The dimensions of one or more screenshots are wrong." diyor. Burada
# mağaza listesindeki 6.9 inclik kartlarla ayni olcu kullaniliyor.
DEVICE = (1290, 2796)


def fit_to_device(img):
    """Uzun cizimi cihaz olcusundeki tuvale ortalayarak sigdirir.

    Plan ekrani bir kaydirma listesi: icerigi ~1130 pt, telefon ekrani
    844 pt. Gercek bir ekran goruntusu alinsaydi zorunlu abonelik metni
    ile hukuki baglantilar kadrajin disinda kalirdi — oysa inceleyenin
    gormesi gereken tam olarak onlar. Bu yuzden kadraji kirpmak yerine
    kaydirmanin tamami olceklenip ortalaniyor; kenarlarda kalan bosluk
    ekranin kendi zemin rengiyle dolduruluyor.
    """
    w, h = DEVICE
    scale = min(w / img.width, h / img.height)
    small = img.resize((round(img.width * scale), round(img.height * scale)),
                       Image.LANCZOS)
    canvas = Image.new('RGB', (w, h), BG)
    canvas.paste(small, ((w - small.width) // 2, (h - small.height) // 2))
    return canvas


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.expanduser('~'), 'Desktop', 'plasebo-iap'
    )
    os.makedirs(out_dir, exist_ok=True)
    print('Yazildi:')
    for lang in ('en', 'tr'):
        img = fit_to_device(render(lang))
        path = os.path.join(out_dir, 'plan-ekrani-' + lang + '.png')
        img.save(path)
        print('  ' + path + '  (' + str(img.width) + 'x' + str(img.height) + ')')


if __name__ == '__main__':
    main()
