#!/usr/bin/env python3
"""Placeholder ambient room backdrops (JPEG) + diegetic SFX (WAV) for Number
Nine. Images need Pillow; audio is stdlib. These are ATMOSPHERE PLACEHOLDERS —
real 1963 grayscale interiors and real foley are a pre-ship art/audio task.

Backdrops render behind the prose at ~14% opacity, so they read as an
impression of the room, never a picture competing with the text. They are kept
dark on purpose (max luminance ~60) so contrast is unaffected.

Run (with the Pillow venv):  <venv-python> scripts/gen-scenes-sfx.py
"""
import math
import os
import random
import struct
import wave

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 720, 1560

os.makedirs(os.path.join(ROOT, "assets", "scenes"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "assets", "audio"), exist_ok=True)


def vignette(img):
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([-W * 0.3, -H * 0.15, W * 1.3, H * 1.15], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(120))
    black = Image.new("RGB", (W, H), (0, 0, 0))
    return Image.composite(img, black, mask)


def grain(img, amount=10, seed=0, ceil=60):
    rng = random.Random(seed)
    w, h = img.size
    px = img.load()
    for _ in range((w * h) // 6):
        x, y = rng.randrange(w), rng.randrange(h)
        r, g, b = px[x, y]
        n = rng.randint(-amount, amount)
        px[x, y] = (
            max(0, min(ceil, r + n)),
            max(0, min(ceil, g + n)),
            max(0, min(ceil, b + n)),
        )
    return img


def cap(img, ceil=60):
    return img.point(lambda v: int(v * ceil / 255))


def scene_hall():
    img = Image.new("RGB", (W, H), (14, 16, 15))
    d = ImageDraw.Draw(img)
    # a tall faint doorway, dead centre
    dw, dh = int(W * 0.34), int(H * 0.5)
    x0, y0 = (W - dw) // 2, int(H * 0.22)
    d.rectangle([x0, y0, x0 + dw, y0 + dh], fill=(40, 44, 42))
    d.rectangle([x0 + 12, y0 + 12, x0 + dw - 12, y0 + dh], fill=(22, 25, 23))
    # floorboards
    for i in range(6):
        y = int(H * 0.74) + i * 26
        d.line([(0, y), (W, y)], fill=(30, 33, 31), width=2)
    img = cap(img)
    return grain(vignette(img.filter(ImageFilter.GaussianBlur(3))), seed=1)


def scene_study():
    img = Image.new("RGB", (W, H), (17, 15, 12))  # warmer
    d = ImageDraw.Draw(img)
    # window with faint moonlight, upper right
    d.rectangle([int(W * 0.52), int(H * 0.12), int(W * 0.86), int(H * 0.4)], fill=(46, 44, 38))
    d.line([int(W * 0.69), int(H * 0.12), int(W * 0.69), int(H * 0.4)], fill=(20, 19, 16), width=3)
    d.line([int(W * 0.52), int(H * 0.26), int(W * 0.86), int(H * 0.26)], fill=(20, 19, 16), width=3)
    # desk silhouette, lower
    d.rectangle([0, int(H * 0.66), W, int(H * 0.78)], fill=(28, 24, 18))
    # warm lamp glow
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse(
        [int(W * 0.1), int(H * 0.5), int(W * 0.44), int(H * 0.72)], fill=90
    )
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    img.paste(Image.new("RGB", (W, H), (60, 46, 24)), (0, 0), glow)
    img = cap(img)
    return grain(vignette(img.filter(ImageFilter.GaussianBlur(3))), seed=2)


def scene_cellar():
    img = Image.new("RGB", (W, H), (11, 14, 14))  # coldest
    d = ImageDraw.Draw(img)
    # brick grid
    for row in range(int(H / 44)):
        y = row * 44
        off = 22 if row % 2 else 0
        for col in range(-1, int(W / 60) + 1):
            x = col * 60 + off
            d.rectangle([x, y, x + 56, y + 40], outline=(24, 30, 30), width=1)
    # single faint bulb, top centre
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse(
        [int(W * 0.36), int(H * 0.06), int(W * 0.64), int(H * 0.26)], fill=110
    )
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img.paste(Image.new("RGB", (W, H), (44, 52, 52)), (0, 0), glow)
    img = cap(img)
    return grain(vignette(img.filter(ImageFilter.GaussianBlur(2))), seed=3)


def save_jpg(img, name):
    p = os.path.join(ROOT, "assets", "scenes", name)
    img.save(p, "JPEG", quality=62, optimize=True)
    print(f"wrote {p} ({os.path.getsize(p)//1024} KB)")


save_jpg(scene_hall(), "hall.jpg")
save_jpg(scene_study(), "study.jpg")
save_jpg(scene_cellar(), "cellar.jpg")


# ---- object plates: framed grayscale impressions, shown INLINE in the text --
# Focal, so a touch brighter than backdrops. Real grayscale photography is a
# pre-ship task; these read as recognisable silhouettes of each object.
PW = 600


def plate_base(tint=(18, 22, 20)):
    return Image.new("RGB", (PW, PW), tint), None


def finish_plate(img, name, seed):
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    img = grain(img.point(lambda v: int(v * 150 / 255)), amount=8, seed=seed, ceil=170)
    # inner vignette
    mask = Image.new("L", (PW, PW), 0)
    ImageDraw.Draw(mask).ellipse([-60, -60, PW + 60, PW + 60], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(70))
    img = Image.composite(img, Image.new("RGB", (PW, PW), (8, 10, 9)), mask)
    p = os.path.join(ROOT, "assets", "scenes", name)
    img.save(p, "JPEG", quality=68, optimize=True)
    print(f"wrote {p} ({os.path.getsize(p)//1024} KB)")


def plate_receiver():
    img, _ = plate_base()
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([90, 170, 510, 440], radius=16, fill=(70, 74, 70), outline=(120, 124, 118), width=3)
    # tuning scale
    d.rectangle([120, 205, 480, 250], fill=(26, 30, 28))
    for i in range(13):
        x = 130 + i * 28
        d.line([(x, 210), (x, 245)], fill=(150, 150, 130), width=1)
    d.line([(300, 205), (300, 250)], fill=(230, 200, 110), width=3)  # amber needle
    # two dials + speaker grille
    d.ellipse([135, 300, 215, 380], fill=(40, 44, 42), outline=(150, 150, 140), width=3)
    d.ellipse([250, 315, 300, 365], fill=(40, 44, 42), outline=(140, 140, 130), width=2)
    for r in range(4):
        for c in range(6):
            d.ellipse([360 + c * 22, 305 + r * 22, 372 + c * 22, 317 + r * 22], fill=(30, 34, 32))
    finish_plate(img, "obj-receiver.jpg", 5)


def plate_telephone():
    img, _ = plate_base((16, 18, 20))
    d = ImageDraw.Draw(img)
    d.ellipse([150, 330, 450, 470], fill=(60, 62, 66), outline=(120, 122, 126), width=3)  # base
    d.ellipse([230, 350, 370, 450], fill=(30, 33, 36), outline=(150, 152, 156), width=3)  # dial
    for i in range(10):  # finger holes
        a = math.radians(i * 32 - 90)
        cx, cy = 300 + 48 * math.cos(a), 400 + 34 * math.sin(a)
        d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=(70, 72, 76))
    # handset across the top
    d.rounded_rectangle([150, 150, 450, 200], radius=24, fill=(70, 72, 76), outline=(130, 132, 136), width=3)
    d.ellipse([120, 140, 200, 220], fill=(70, 72, 76))
    d.ellipse([400, 140, 480, 220], fill=(70, 72, 76))
    finish_plate(img, "obj-telephone.jpg", 6)


def plate_logbook():
    img, _ = plate_base((20, 20, 17))
    d = ImageDraw.Draw(img)
    d.polygon([(90, 180), (300, 150), (300, 470), (90, 460)], fill=(58, 56, 48))
    d.polygon([(510, 180), (300, 150), (300, 470), (510, 460)], fill=(66, 64, 54))
    d.line([(300, 150), (300, 470)], fill=(24, 24, 20), width=4)  # spine
    for i in range(9):  # lines of writing
        y = 200 + i * 26
        d.line([(120, y), (280, y)], fill=(150, 150, 135), width=2)
        d.line([(320, y), (480, y)], fill=(150, 150, 135), width=2)
    finish_plate(img, "obj-logbook.jpg", 7)


def plate_safe():
    img, _ = plate_base((15, 18, 16))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([120, 120, 480, 480], radius=12, fill=(56, 60, 56), outline=(120, 124, 118), width=4)
    d.rounded_rectangle([150, 150, 450, 450], radius=8, outline=(90, 94, 90), width=2)
    d.ellipse([255, 255, 345, 345], fill=(30, 33, 31), outline=(180, 180, 160), width=4)  # dial
    for i in range(12):
        a = math.radians(i * 30)
        cx, cy = 300 + 60 * math.cos(a), 300 + 60 * math.sin(a)
        d.line([(300 + 52 * math.cos(a), 300 + 52 * math.sin(a)), (cx, cy)], fill=(160, 160, 145), width=2)
    d.line([(300, 300), (300, 260)], fill=(230, 200, 110), width=3)  # amber pointer
    finish_plate(img, "obj-safe.jpg", 8)


plate_receiver()
plate_telephone()
plate_logbook()
plate_safe()


# ----------------------------------------------------------------- audio SFX
RATE = 22050


def write_wav(name, samples):
    p = os.path.join(ROOT, "assets", "audio", name)
    with wave.open(p, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(
            b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples)
        )
    print(f"wrote {p} ({os.path.getsize(p)//1024} KB)")


def click(dur=0.05, seed=0, lp=0.5, gain=0.6):
    rng = random.Random(seed)
    n = int(dur * RATE)
    out, prev = [], 0.0
    for i in range(n):
        prev = (1 - lp) * prev + lp * (rng.random() * 2 - 1)
        env = math.exp(-i / (n * 0.28))
        out.append(prev * env * gain)
    return out


def thunk(freq=90, dur=0.28, gain=0.7):
    n = int(dur * RATE)
    return [math.sin(2 * math.pi * freq * i / RATE) * math.exp(-i / (n * 0.3)) * gain for i in range(n)]


def sil(dur):
    return [0.0] * int(dur * RATE)


def mix(*layers):
    m = max(len(l) for l in layers)
    out = [0.0] * m
    for l in layers:
        for i, s in enumerate(l):
            out[i] += s
    return [max(-1, min(1, s)) for s in out]


# key turning in a lock: two scrapes then a thunk
key_unlock = click(0.06, seed=11, gain=0.5) + sil(0.09) + click(0.06, seed=12, gain=0.5) + sil(0.06) + mix(thunk(95, 0.25, 0.6), click(0.04, seed=13, gain=0.4))
write_wav("key-unlock.wav", key_unlock)

# heavy safe: scrape + deep clunk
safe_open = mix(
    [ (random.Random(21).random() * 2 - 1) * 0.18 * math.exp(-i / (0.5 * RATE)) for i in range(int(0.5 * RATE)) ],
    thunk(64, 0.6, 0.8),
) + sil(0.05) + thunk(80, 0.2, 0.4)
write_wav("safe-open.wav", safe_open)

# generic latch/unlock click for the telephone & count locks
unlock = mix(click(0.05, seed=31, gain=0.5), thunk(140, 0.14, 0.4)) + thunk(200, 0.08, 0.2)
write_wav("unlock.wav", unlock)

# old telephone ring: 440+480 warble, two bursts
def ring_burst(dur=0.4):
    n = int(dur * RATE)
    out = []
    for i in range(n):
        t = i / RATE
        s = (math.sin(2 * math.pi * 440 * t) + math.sin(2 * math.pi * 480 * t)) * 0.35
        s *= 0.5 + 0.5 * math.sin(2 * math.pi * 20 * t)  # warble
        env = min(1, i / (0.02 * RATE), (n - i) / (0.02 * RATE))
        out.append(s * env)
    return out


write_wav("phone-ring.wav", ring_burst() + sil(0.18) + ring_burst())

# lamp switch: a single soft click
write_wav("lamp-off.wav", click(0.05, seed=41, lp=0.7, gain=0.5))

# page turn: a soft band-limited swish
def swish(dur=0.45, seed=51):
    rng = random.Random(seed)
    n = int(dur * RATE)
    out, prev = [], 0.0
    for i in range(n):
        prev = 0.9 * prev + 0.1 * (rng.random() * 2 - 1)
        env = math.sin(math.pi * i / n) ** 2
        out.append(prev * env * 0.5)
    return out


write_wav("page-turn.wav", swish())

print("done")
