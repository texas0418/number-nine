#!/usr/bin/env python3
"""Placeholder art for Broadcast Three — PLACEHOLDERS ONLY (see ART.md).
Run with the Pillow venv:  ~/.venvs/audiblez/bin/python scripts/gen-b3-scenes.py
Generates into assets/scenes/:
  churchyard.jpg  backdrop: leaning stones on the marsh's one rise, dusk
  obj-valve.jpg   plate: knurled brass vent valve, rust-seized
  obj-grave.jpg   plate: the small clean stone, no dates
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "scenes")
W, H = 720, 1560
AMBER = (196, 158, 84)


def grain(img, amount=12, seed=0):
    rng = random.Random(seed)
    px = img.load()
    w, h = img.size
    for _ in range((w * h) // 6):
        x, y = rng.randrange(w), rng.randrange(h)
        r, g, b = px[x, y]
        d = rng.randint(-amount, amount)
        px[x, y] = (max(0, r + d), max(0, g + d), max(0, b + d))
    return img


def save(img, name, seed):
    grain(img, seed=seed)
    img.save(os.path.join(OUT, name), quality=88)
    print(f"wrote {name}")


def churchyard():
    img = Image.new("RGB", (W, H), (7, 8, 9))
    d = ImageDraw.Draw(img)
    horizon = int(H * 0.58)
    for y in range(horizon - 180, horizon):
        t = (y - (horizon - 180)) / 180
        v = int(9 + 22 * t)
        d.line([(0, y), (W, y)], fill=(v, v + 1, v + 2))
    rng = random.Random(17)
    # the church tower, dark against the last light
    d.rectangle([int(W * 0.72), horizon - 260, int(W * 0.86), horizon], fill=(13, 14, 15))
    d.polygon(
        [(int(W * 0.72), horizon - 260), (int(W * 0.79), horizon - 320), (int(W * 0.86), horizon - 260)],
        fill=(12, 13, 14),
    )
    # leaning stones down the slope
    for i in range(11):
        x = rng.randrange(30, W - 80)
        y = rng.randrange(horizon + 60, H - 120)
        w = rng.randrange(34, 62)
        h = rng.randrange(60, 110)
        lean = rng.randrange(-8, 9)
        d.polygon(
            [(x, y + h), (x + w, y + h), (x + w + lean, y), (x + lean, y)],
            fill=(16 + i, 17 + i, 16 + i),
        )
    # grass strokes
    for _ in range(300):
        x = rng.randrange(0, W)
        y0 = rng.randrange(horizon + 20, H)
        d.line([(x, y0), (x + rng.randrange(-5, 5), y0 - rng.randrange(12, 40))], fill=(10, 12, 10))
    # one small lit window in the tower
    d.rectangle([int(W * 0.80), horizon - 150, int(W * 0.815), horizon - 130], fill=AMBER)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    save(img, "churchyard.jpg", 41)


def plate(name, seed, draw_fn):
    img = Image.new("RGB", (780, 780), (11, 12, 12))
    d = ImageDraw.Draw(img)
    draw_fn(d)
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    save(img, name, seed)


def valve(d):
    d.ellipse([250, 250, 530, 530], fill=(30, 26, 20), outline=(52, 44, 30), width=8)
    for i in range(16):  # knurling
        a = i * math.pi / 8
        x0 = 390 + 128 * math.cos(a)
        y0 = 390 + 128 * math.sin(a)
        x1 = 390 + 148 * math.cos(a)
        y1 = 390 + 148 * math.sin(a)
        d.line([(x0, y0), (x1, y1)], fill=(48, 40, 26), width=6)
    d.ellipse([350, 350, 430, 430], fill=(24, 20, 15))
    # rust bloom
    rng = random.Random(9)
    for _ in range(240):
        x = rng.randrange(240, 540)
        y = rng.randrange(240, 540)
        if (x - 390) ** 2 + (y - 390) ** 2 < 145 ** 2:
            d.point((x, y), fill=(60 + rng.randrange(20), 30 + rng.randrange(12), 12))


def grave(d):
    d.rectangle([0, 560, 780, 780], fill=(13, 15, 12))  # tended grass line
    d.polygon([(250, 620), (530, 620), (522, 200), (258, 200)], fill=(30, 31, 30))
    d.arc([258, 150, 522, 260], 180, 360, fill=(38, 39, 38), width=40)
    # three cut words suggested as bars (no readable text in placeholders)
    d.rectangle([310, 300, 470, 314], fill=(20, 21, 20))
    d.rectangle([296, 340, 484, 354], fill=(20, 21, 20))
    # the iron poor-box at the plinth
    d.rectangle([330, 560, 460, 640], fill=(16, 16, 17), outline=(30, 30, 32), width=4)
    d.ellipse([388, 590, 404, 606], fill=AMBER)


churchyard()
plate("obj-valve.jpg", 42, valve)
plate("obj-grave.jpg", 43, grave)
