#!/usr/bin/env python3
"""Placeholder art for Broadcast Two — PLACEHOLDERS ONLY, replaced by real
photography per ART.md. Dark, near-monochrome, subject low, top third dark.

Run with the Pillow venv:  ~/.venvs/audiblez/bin/python scripts/gen-b2-scenes.py
Generates into assets/scenes/:
  marsh.jpg      backdrop: marsh at dusk, mast on the horizon
  obj-letter.jpg obj-cards.jpg obj-clock.jpg obj-compass.jpg obj-mast.jpg
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "scenes")
os.makedirs(OUT, exist_ok=True)
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


def marsh():
    img = Image.new("RGB", (W, H), (6, 8, 9))
    d = ImageDraw.Draw(img)
    horizon = int(H * 0.62)
    # a cold band of dusk above the horizon
    for y in range(horizon - 220, horizon):
        t = (y - (horizon - 220)) / 220
        v = int(10 + 26 * t)
        d.line([(0, y), (W, y)], fill=(v, v + 2, v + 3))
    # water channels catching the last light
    rng = random.Random(7)
    for _ in range(9):
        x0 = rng.randrange(-100, W)
        d.polygon(
            [(x0, H), (x0 + rng.randrange(30, 90), horizon + 40),
             (x0 + rng.randrange(100, 220), H)],
            fill=(14, 16, 17),
        )
    # reeds
    for _ in range(240):
        x = rng.randrange(0, W)
        y0 = rng.randrange(horizon + 10, H)
        d.line([(x, y0), (x + rng.randrange(-6, 6), y0 - rng.randrange(20, 70))],
               fill=(11, 13, 12))
    # the mast, far off, one amber lamp
    mx = int(W * 0.68)
    d.line([(mx, horizon - 300), (mx, horizon)], fill=(20, 21, 22), width=3)
    d.line([(mx - 60, horizon), (mx, horizon - 260)], fill=(15, 16, 17))
    d.line([(mx + 55, horizon), (mx, horizon - 260)], fill=(15, 16, 17))
    d.ellipse([mx - 3, horizon - 306, mx + 3, horizon - 300], fill=AMBER)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    save(img, "marsh.jpg", 21)


def plate(name, seed, draw_fn):
    img = Image.new("RGB", (780, 780), (12, 13, 12))
    d = ImageDraw.Draw(img)
    draw_fn(d)
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    save(img, name, seed)


def letter(d):
    d.rectangle([150, 180, 630, 640], fill=(38, 36, 30))
    rng = random.Random(3)
    for y in range(220, 600, 26):
        d.line([(190, y), (190 + rng.randrange(280, 400), y)], fill=(22, 21, 18), width=3)
    d.polygon([(630, 640), (560, 640), (630, 570)], fill=(28, 27, 22))


def cards(d):
    for i in range(10):
        off = i * 6
        d.rectangle([180 + off, 300 - off, 560 + off, 520 - off],
                    fill=(30 + i, 29 + i, 25 + i), outline=(18, 18, 16))
    d.line([(240, 260), (500, 300)], fill=(60, 50, 30), width=5)  # the string


def clock(d):
    d.ellipse([190, 190, 590, 590], fill=(26, 26, 25), outline=(40, 40, 38), width=6)
    for i in range(24):
        a = i * math.pi / 12
        x0 = 390 + 178 * math.sin(a)
        y0 = 390 - 178 * math.cos(a)
        x1 = 390 + (166 if i % 6 else 152) * math.sin(a)
        y1 = 390 - (166 if i % 6 else 152) * math.cos(a)
        d.line([(x0, y0), (x1, y1)], fill=(52, 52, 48), width=4 if i % 6 == 0 else 2)
    d.line([(390, 390), (390, 268)], fill=(70, 68, 60), width=6)   # stopped hands
    d.line([(390, 390), (470, 430)], fill=(70, 68, 60), width=4)
    d.ellipse([382, 382, 398, 398], fill=AMBER)


def compass(d):
    d.ellipse([200, 200, 580, 580], fill=(24, 25, 24), outline=(46, 46, 44), width=8)
    d.ellipse([240, 240, 540, 540], fill=(18, 19, 18))
    d.polygon([(390, 260), (378, 390), (402, 390)], fill=AMBER)       # N needle
    d.polygon([(390, 520), (378, 390), (402, 390)], fill=(50, 52, 54))
    d.text((382, 212), "N", fill=(90, 88, 80))


def mast(d):
    d.rectangle([0, 0, 780, 780], fill=(9, 11, 12))
    d.line([(390, 120), (390, 700)], fill=(24, 25, 26), width=8)
    d.line([(160, 700), (390, 200)], fill=(18, 19, 20), width=3)
    d.line([(620, 700), (390, 200)], fill=(18, 19, 20), width=3)
    d.line([(100, 320), (700, 250)], fill=(30, 31, 30), width=2)  # the wire
    d.ellipse([384, 112, 396, 124], fill=AMBER)


marsh()
plate("obj-letter.jpg", 31, letter)
plate("obj-cards.jpg", 32, cards)
plate("obj-clock.jpg", 33, clock)
plate("obj-compass.jpg", 34, compass)
plate("obj-mast.jpg", 35, mast)
