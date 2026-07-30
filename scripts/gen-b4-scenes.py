#!/usr/bin/env python3
"""Placeholder art for Broadcast Four — PLACEHOLDERS ONLY (see ART.md).
Run with the Pillow venv:  ~/.venvs/audiblez/bin/python scripts/gen-b4-scenes.py
Generates into assets/scenes/:
  obj-seance.jpg        plate: the study corner — receiver, empty chair
  obj-seance-after.jpg  the SAME plate once exposed — the chair is not empty
The pair backs the b4-plate exposure gate (screenshot develops the plate).
"""
import os
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "scenes")
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


def seance(with_figure):
    img = Image.new("RGB", (780, 780), (10, 11, 12))
    d = ImageDraw.Draw(img)
    # cold window light from the left, as the study backdrop has
    for x in range(0, 240):
        v = int(26 - x * 0.08)
        d.line([(x, 0), (x, 780)], fill=(v, v + 1, v + 3))
    # the bench with the receiver, low right
    d.rectangle([340, 470, 740, 520], fill=(22, 19, 15))  # bench top
    d.rectangle([380, 350, 640, 470], fill=(17, 16, 15), outline=(30, 28, 24), width=4)
    d.ellipse([560, 390, 600, 430], fill=(24, 22, 18), outline=(40, 36, 26), width=3)
    d.rectangle([412, 396, 522, 424], fill=(12, 11, 10))  # dial window
    d.rectangle([460, 402, 468, 418], fill=AMBER)  # the one lit lamp
    # the chair, left of the bench, facing the set
    d.rectangle([180, 430, 320, 448], fill=(20, 18, 15))  # seat
    d.rectangle([186, 448, 202, 600], fill=(18, 16, 13))
    d.rectangle([298, 448, 314, 600], fill=(18, 16, 13))
    d.rectangle([186, 300, 202, 430], fill=(19, 17, 14))  # back posts
    d.rectangle([298, 300, 314, 430], fill=(19, 17, 14))
    d.rectangle([186, 300, 314, 322], fill=(21, 19, 16))
    if with_figure:
        # someone SEATED now — a pale smear, not a person, wrong in the way
        # long exposures are wrong
        fig = Image.new("RGB", (780, 780), (0, 0, 0))
        fd = ImageDraw.Draw(fig)
        fd.ellipse([214, 258, 286, 344], fill=(46, 47, 50))  # head, too still
        fd.polygon([(200, 344), (300, 344), (322, 560), (178, 560)], fill=(40, 41, 45))
        fig = fig.filter(ImageFilter.GaussianBlur(7))
        img = Image.blend(img, Image.composite(fig, Image.new("RGB", (780, 780), (0, 0, 0)), fig.convert("L")), 0.0)
        # simpler: additive smear
        px = img.load()
        fx = fig.load()
        for y in range(240, 580):
            for x in range(160, 340):
                r, g, b = px[x, y]
                fr, fgc, fb = fx[x, y]
                px[x, y] = (min(255, r + fr), min(255, g + fgc), min(255, b + fb))
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    return img


save(seance(False), "obj-seance.jpg", 61)
save(seance(True), "obj-seance-after.jpg", 62)
