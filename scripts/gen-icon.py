#!/usr/bin/env python3
"""Number Nine app icon: a phosphor '9' with the amber tuner needle through it.

Needs Pillow (not stdlib): python3 -m venv .venv && .venv/bin/pip install pillow
Run: <python-with-pillow> scripts/gen-icon.py
Regenerates assets/icon.png, adaptive-icon.png, splash-icon.png.
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = (11, 14, 12)
GLOW = (22, 30, 25)
BONE = (207, 216, 208)
PHOSPHOR = (143, 163, 148)
AMBER = (217, 185, 106)
TICK = (61, 74, 65)
FONT = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"

S = 2  # supersample factor


def base(size):
    img = Image.new("RGB", (size * S, size * S), BG)
    # soft radial glow behind the glyph — the lit dial lamp in a dark room
    glow = Image.new("L", (size * S, size * S), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy, r = size * S // 2, int(size * S * 0.46), int(size * S * 0.42)
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=110)
    glow = glow.filter(ImageFilter.GaussianBlur(size * S // 8))
    img.paste(Image.new("RGB", img.size, GLOW), (0, 0), glow)
    return img


def draw_nine(img, size, color, y_frac=0.44):
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, int(size * S * 0.78))
    box = d.textbbox((0, 0), "9", font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    x = (size * S - w) // 2 - box[0]
    y = int(size * S * y_frac) - box[1] - h // 2
    d.text((x, y), "9", font=font, fill=color)
    return d


def needle(img, d, size, x_frac=0.635):
    x = int(size * S * x_frac)
    top, bottom = int(size * S * 0.06), int(size * S * 0.94)
    # halo pass, then core
    halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.line([(x, top), (x, bottom)], fill=AMBER + (90,), width=int(size * S * 0.028))
    halo = halo.filter(ImageFilter.GaussianBlur(size * S // 90))
    img.paste(halo, (0, 0), halo)
    d.line([(x, top), (x, bottom)], fill=AMBER, width=max(2, int(size * S * 0.008)))


def ticks(d, size):
    y0 = int(size * S * 0.855)
    for i in range(21):
        x = int(size * S * (0.10 + 0.80 * i / 20))
        tall = i % 5 == 0
        y1 = y0 + int(size * S * (0.045 if tall else 0.025))
        d.line([(x, y0), (x, y1)], fill=TICK, width=max(2, int(size * S * 0.004)))


def icon(path, size):
    img = base(size)
    d = draw_nine(img, size, BONE)
    ticks(d, size)
    needle(img, d, size)
    img.resize((size, size), Image.LANCZOS).save(path)
    print(f"wrote {path}")


def splash(path, size):
    # splash mark: the 9 alone, phosphor-dim, no chrome
    img = Image.new("RGB", (size * S, size * S), BG)
    draw_nine(img, size, PHOSPHOR, y_frac=0.5)
    img.resize((size, size), Image.LANCZOS).save(path)
    print(f"wrote {path}")


icon(os.path.join(ROOT, "assets", "icon.png"), 1024)
icon(os.path.join(ROOT, "assets", "adaptive-icon.png"), 1024)
splash(os.path.join(ROOT, "assets", "splash-icon.png"), 512)
