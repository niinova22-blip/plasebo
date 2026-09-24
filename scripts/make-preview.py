# -*- coding: utf-8 -*-
"""App Store onizleme videosu (hikaye tarzi) — emulator kayitlarindan.

    python scripts/make-preview.py tr|en

Girdi: RECDIR/<dil>/ritual.mp4, stats.mp4, plus.mp4 (emulatorde `adb
screenrecord` ile alinan GERCEK ekran kayitlari, 1080x2400).
Cikti: store/preview/plasebo-preview-<dil>.mp4 (886x1920, 30 fps, H.264, AAC)

Kayit Android emulatorunden geldigi icin iPhone gibi gorunmesi icin:
  - Android durum cubugu kirpilir (ust 110 px), iPhone oranina (1179x2556)
    yanlardan kirpilir; uygulamanin kendi icerigine dokunulmaz.
  - Ekran yuvarlak koseli bir iPhone govdesine, dinamik adayla konur.
  - Govde canvasin alt kenarindan tasar (magaza kartlariyla ayni duzen).

Yapay zeka ozellikleri (yuz taramasi, nefes analizi) kamera/mikrofon
istedigi icin emulatorde calismiyor: onlar icin UYDURMA ARAYUZ CIZILMEZ;
Plus ekraninin gercek kaydi (o ozellikleri anlatan kartlar) gosterilir ve
hikaye metni ozelligi soyler. Boyut siniri: tarayici yuklemesi icin
dosya ~10 MB altinda tutulur.
"""
import importlib.util
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

LANG = sys.argv[1] if len(sys.argv) > 1 else 'en'
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REC = os.environ.get('RECDIR') or os.path.join(ROOT, 'store', 'preview', 'rec')
TMP = os.environ.get('PVTMP') or os.path.join(ROOT, 'store', 'preview', 'tmp', LANG)
OUT_DIR = os.path.join(ROOT, 'store', 'preview')

spec = importlib.util.spec_from_file_location('store_shots', os.path.join(HERE, 'store-shots.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
SERIF, SANS_MED, SANS_BOLD = base.SERIF, base.SANS_MED, base.SANS_BOLD

W, H, FPS = 886, 1920, 30
SCR_W = 720
SCR_H = round(SCR_W * 2556 / 1179.0)      # iPhone oranı
BEZEL = 16
PH_W, PH_H = SCR_W + 2 * BEZEL, SCR_H + 2 * BEZEL
PH_X, PH_Y = (W - PH_W) // 2, 420
FADE = 0.35

TEXT = (55, 50, 63)
SUB = (110, 102, 120)
INK1, INK2 = (17, 18, 24), (46, 40, 66)

COPY = {
    'en': {
        'kicker': '7:42 A.M.',
        'title': 'Your mind is\nalready loud.',
        'home': ('So you open\nPlasebo.', 'One formula a day:\na color, a sound, a breath.'),
        'color': ('First, a color.\nJust look.', 'Two minutes. Nothing to do.'),
        'breath': ('Then you\nbreathe.', 'Step by step, right on screen.'),
        'ai': ('Plus adds AI\non your device.', 'A face scan reads your expression.\nBreath analysis measures your breathing.\nNothing leaves your phone.'),
        'stats': ('Then you\nsee it.', 'Measured on screen, not guessed.'),
        'end1': 'Plasebo',
        'end2': 'Mind Protocol',
        'end3': 'An honest placebo ritual.',
        'end4': 'Available on the App Store',
    },
    'tr': {
        'kicker': '07:42',
        'title': 'Kafan şimdiden\nkalabalık.',
        'home': ('Plasebo\'yu\naçarsın.', 'Günde bir formül:\nbir renk, bir ses, bir nefes.'),
        'color': ('Önce bir renk.\nSadece izle.', 'İki dakika. Yapacak bir şey yok.'),
        'breath': ('Sonra\nnefes.', 'Adım adım, ekranda.'),
        'ai': ('Plus, cihazında\nyapay zekâ ekler.', 'Yüz taraması ifadeni okur.\nNefes analizi nefesini ölçer.\nHiçbir şey telefonundan çıkmaz.'),
        'stats': ('Sonra\ngörürsün.', 'Ölçüm ekranda, tahmin değil.'),
        'end1': 'Plasebo',
        'end2': 'Zihin Protokolü',
        'end3': 'Dürüst bir plasebo ritüeli.',
        'end4': 'App Store\'da',
    },
}[LANG]

# (ad, tur, klip, baslangic sn, sure sn)
SCENES = [
    ('title', 'title', None, 0, 2.8),
    ('home', 'phone', 'ritual', 0.6, 4.6),
    ('color', 'phone', 'ritual', 7.2, 5.0),
    ('breath', 'phone', 'ritual', 20.6, 4.6),
    ('ai', 'phone', 'plus', 0.8, 5.0),
    ('stats', 'phone', 'stats', 2.3, 3.6),
    ('end', 'end', None, 0, 3.0),
]
BG = {
    'home': ((253, 247, 241), (226, 214, 222)),
    'color': ((236, 240, 247), (196, 210, 228)),
    'breath': ((238, 243, 246), (200, 214, 226)),
    'ai': ((250, 244, 240), (214, 204, 230)),
    'stats': ((253, 247, 241), (222, 218, 232)),
}


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def gradient(top, bottom):
    col = Image.new('RGB', (1, H))
    for y in range(H):
        t = y / float(H - 1)
        col.putpixel((0, y), tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return col.resize((W, H))


def glow(img, cx, cy, r, color, alpha):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(r // 2))
    img.paste(layer, (0, 0), layer)


def font(path, size):
    return ImageFont.truetype(path, size)


def text_layer(lines, fnt, fill, spacing, x=60, y=0):
    """Metni ayri bir saydam katmana cizer (solma/kayma icin)."""
    layer = Image.new('RGBA', (W, 420), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for ln in lines.split('\n'):
        d.text((x, y), ln, font=fnt, fill=fill)
        y += spacing
    return layer, y


# ---- Sabit katmanlar ------------------------------------------------------
_bg_cache = {}


def bg_for(name):
    if name in _bg_cache:
        return _bg_cache[name]
    top, bottom = BG[name]
    img = gradient(top, bottom).convert('RGBA')
    glow(img, int(W * 0.85), int(H * 0.28), 380, (167, 188, 212), 110)
    glow(img, int(W * 0.08), int(H * 0.86), 330, (255, 255, 255), 130)
    _bg_cache[name] = img
    return img


def phone_shell():
    body = Image.new('RGBA', (PH_W, PH_H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, PH_W - 1, PH_H - 1], radius=96, fill=(26, 28, 34, 255))
    bd.rounded_rectangle([1, 1, PH_W - 2, PH_H - 2], radius=95, outline=(255, 255, 255, 70), width=2)
    return body


SHELL = phone_shell()
MASK = Image.new('L', (SCR_W, SCR_H), 0)
ImageDraw.Draw(MASK).rounded_rectangle([0, 0, SCR_W - 1, SCR_H - 1], radius=80, fill=255)
SHADOW = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(SHADOW).rounded_rectangle(
    [PH_X, PH_Y + 26, PH_X + PH_W, PH_Y + PH_H], radius=96, fill=(40, 40, 70, 95))
SHADOW = SHADOW.filter(ImageFilter.GaussianBlur(30))


def phone_frame(name, screen):
    img = bg_for(name).copy()
    img = Image.alpha_composite(img, SHADOW)
    body = SHELL.copy()
    body.paste(screen, (BEZEL, BEZEL), MASK)
    isl_w, isl_h = round(SCR_W * 0.30), 30
    ImageDraw.Draw(body).rounded_rectangle(
        [(PH_W - isl_w) // 2, BEZEL + 14, (PH_W + isl_w) // 2, BEZEL + 14 + isl_h],
        radius=isl_h // 2, fill=(12, 13, 16, 255))
    img.paste(body, (PH_X, PH_Y), body)
    return img


def caption(img, name, tau):
    head, sub = COPY[name]
    a = ease(tau / 0.55)
    if a <= 0:
        return img
    hf, sf = font(SERIF, 68), font(SANS_MED, 33)
    hl, y = text_layer(head, hf, TEXT + (255,), 74, y=0)
    sl, _ = text_layer(sub, sf, SUB + (255,), 44, y=0)
    dy = round((1 - a) * 26)
    for layer, off in ((hl, 34), (sl, 34 + y + 6)):
        lyr = layer.copy()
        alpha = lyr.getchannel('A').point(lambda v: int(v * a))
        lyr.putalpha(alpha)
        img.paste(lyr, (0, off + dy), lyr)
    return img


def dark_card():
    img = gradient(INK1, INK2).convert('RGBA')
    glow(img, int(W * 0.5), int(H * 0.42), 420, (110, 136, 168), 70)
    return img


def title_card(tau):
    img = dark_card()
    a = ease(tau / 0.8)
    kf, tf = font(SANS_BOLD, 34), font(SERIF, 96)
    k = Image.new('RGBA', (W, 80), (0, 0, 0, 0))
    ImageDraw.Draw(k).text((70, 10), '  '.join(COPY['kicker']) if LANG == 'en' else COPY['kicker'],
                           font=kf, fill=(167, 188, 212, 255))
    t, _ = text_layer(COPY['title'], tf, (246, 242, 238, 255), 112, x=70, y=0)
    for layer, y in ((k, 700), (t, 780)):
        alpha = layer.getchannel('A').point(lambda v: int(v * a))
        layer.putalpha(alpha)
        img.paste(layer, (0, y + round((1 - a) * 30)), layer)
    return img


def end_card(tau):
    img = dark_card()
    a = ease(tau / 0.7)
    icon = Image.open(os.path.join(ROOT, 'assets', 'icon.png')).convert('RGBA').resize((200, 200), Image.LANCZOS)
    m = Image.new('L', (200, 200), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, 199, 199], radius=46, fill=255)
    icon.putalpha(m)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lay.paste(icon, ((W - 200) // 2, 640), icon)
    d = ImageDraw.Draw(lay)
    for txt, fnt, y, fill in (
        (COPY['end1'], font(SERIF, 104), 890, (246, 242, 238, 255)),
        (COPY['end2'], font(SANS_MED, 40), 1020, (167, 188, 212, 255)),
        (COPY['end3'], font(SANS_MED, 32), 1120, (197, 194, 184, 255)),
        (COPY['end4'], font(SANS_BOLD, 30), 1240, (246, 242, 238, 255)),
    ):
        w = d.textlength(txt, font=fnt)
        d.text(((W - w) / 2, y), txt, font=fnt, fill=fill)
    alpha = lay.getchannel('A').point(lambda v: int(v * a))
    lay.putalpha(alpha)
    img = Image.alpha_composite(img, lay)
    return img


# ---- Klip kareleri --------------------------------------------------------
def extract(clip, t0, dur, tag):
    d = os.path.join(TMP, tag)
    os.makedirs(d, exist_ok=True)
    src = os.path.join(REC, LANG, clip + '.mp4')
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-ss', '%.3f' % t0, '-t', '%.3f' % (dur + FADE + 0.1),
        '-i', src, '-vf',
        'crop=1080:2341:0:0,scale=%d:%d:flags=lanczos,fps=%d' % (SCR_W, SCR_H, FPS),
        os.path.join(d, '%04d.png')], check=True)
    return d


STATUS_FONT = None


def ios_chrome(img):
    """Android durum cubugunu iPhone durum cubuguyla degistirir.

    Cubugun altindaki temiz bir satir dikey cogaltilarak seridin zemini
    kapatilir (ritual ekranlarinda zemin isik lekesiyle degisiyor), sonra
    9:41, sinyal, Wi-Fi, pil ve ana ekran cubugu cizilir. Uygulamanin
    kendi icerigine dokunulmaz.
    """
    global STATUS_FONT
    if STATUS_FONT is None:
        STATUS_FONT = font(SANS_BOLD, 27)
    img = img.convert('RGB')
    sh = round(110 * SCR_W / 1080.0)
    row = img.crop((0, 60, SCR_W, 70)).resize((SCR_W, sh), Image.BILINEAR)
    img.paste(row, (0, 0))
    lum = sum(row.resize((1, 1)).getpixel((0, 0))) / 3.0
    fg = (250, 250, 250) if lum < 125 else (20, 20, 24)
    d = ImageDraw.Draw(img)
    d.text((58, 13), '9:41', font=STATUS_FONT, fill=fg)
    for i, hgt in enumerate((8, 12, 16, 20)):
        x = 538 + i * 9
        d.rounded_rectangle([x, 38 - hgt, x + 6, 38], radius=2, fill=fg)
    cx, cy = 626, 40
    for r in (17, 11, 5):
        d.arc([cx - r, cy - r, cx + r, cy + r], 225, 315, fill=fg, width=3)
    d.ellipse([cx - 2, cy - 4, cx + 2, cy], fill=fg)
    d.rounded_rectangle([650, 17, 692, 38], radius=6, outline=fg, width=2)
    d.rounded_rectangle([653, 20, 685, 35], radius=3, fill=fg)
    d.rectangle([694, 25, 696, 31], fill=fg)
    blum = sum(img.crop((SCR_W // 2 - 60, SCR_H - 60, SCR_W // 2 + 60, SCR_H - 40))
               .resize((1, 1)).getpixel((0, 0))) / 3.0
    bfg = (250, 250, 250) if blum < 125 else (20, 20, 24)
    d.rounded_rectangle([(SCR_W - 200) // 2, SCR_H - 22, (SCR_W + 200) // 2, SCR_H - 15],
                        radius=4, fill=bfg)
    return img.convert('RGBA')


def clip_frame(d, tau):
    n = max(1, int(tau * FPS) + 1)
    p = os.path.join(d, '%04d.png' % n)
    if not os.path.exists(p):
        names = sorted(os.listdir(d))
        p = os.path.join(d, names[-1])
    return ios_chrome(Image.open(p))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    dirs = {}
    starts, t = [], 0.0
    for name, kind, clip, t0, dur in SCENES:
        starts.append(t)
        if kind == 'phone':
            dirs[name] = extract(clip, t0, dur, name)
        t += dur
    total = t
    ends = [s + sc[4] for s, sc in zip(starts, SCENES)]

    def render(i, now):
        name, kind, clip, t0, dur = SCENES[i]
        tau = now - starts[i]
        if kind == 'title':
            return title_card(tau)
        if kind == 'end':
            return end_card(tau)
        img = phone_frame(name, clip_frame(dirs[name], tau))
        return caption(img, name, tau)

    out = os.path.join(OUT_DIR, 'plasebo-preview-%s.mp4' % LANG)
    aud = os.path.join(ROOT, 'assets', 'audio')
    cmd = [
        'ffmpeg', '-v', 'error', '-y',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H), '-r', str(FPS), '-i', '-',
        '-stream_loop', '-1', '-i', os.path.join(aud, 'warm_pad.wav'),
        '-stream_loop', '-1', '-i', os.path.join(aud, 'kalimba.wav'),
        '-filter_complex',
        '[1:a]volume=0.9[a1];[2:a]volume=0.35[a2];[a1][a2]amix=inputs=2:duration=longest,'
        'aformat=sample_rates=48000:channel_layouts=stereo,'
        'afade=t=in:st=0:d=1.2,afade=t=out:st=%.2f:d=2.0[a]' % (total - 2.0),
        '-map', '0:v', '-map', '[a]', '-t', '%.2f' % total,
        '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level', '4.0',
        '-pix_fmt', 'yuv420p', '-b:v', '2300k', '-maxrate', '3200k', '-bufsize', '6400k',
        '-r', str(FPS), '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
        '-movflags', '+faststart', out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    nframes = int(total * FPS)
    for f in range(nframes):
        now = f / float(FPS)
        idx = max(i for i, s in enumerate(starts) if s <= now + 1e-9)
        img = render(idx, now)
        if idx > 0 and now - starts[idx] < FADE:
            prev = render(idx - 1, now)
            img = Image.blend(prev.convert('RGB'), img.convert('RGB'), ease((now - starts[idx]) / FADE))
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close()
    p.wait()
    print(out, '%.1f s' % total)


if __name__ == '__main__':
    main()
