#!/usr/bin/env python3
"""Generate placeholder art + audio for Number Nine. Stdlib only.

Icons: near-black square with a phosphor-green "9" drawn as a coarse pixel
glyph (real icon art is a pre-ship task). Audio: a shortwave static loop and
the 6-note music-box station ident, both 16-bit mono WAV.

Run from repo root: python3 scripts/gen-assets.py
"""
import math
import os
import random
import struct
import wave
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = (11, 14, 12)
FG = (143, 163, 148)

NINE = [
    "011110",
    "110011",
    "110011",
    "011111",
    "000011",
    "000110",
    "011100",
]


def write_png(path, size):
    px = bytearray()
    cell = size // 10
    ox = (size - cell * len(NINE[0])) // 2
    oy = (size - cell * len(NINE)) // 2
    for y in range(size):
        px.append(0)  # filter byte per scanline
        for x in range(size):
            gx, gy = (x - ox) // cell, (y - oy) // cell
            lit = (
                0 <= gy < len(NINE)
                and 0 <= gx < len(NINE[0])
                and NINE[gy][gx] == "1"
            )
            px += bytes(FG if lit else BG)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(px), 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as f:
        f.write(png)
    print(f"wrote {path}")


def write_wav(path, samples, rate=22050):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(
            b"".join(
                struct.pack("<h", max(-32767, min(32767, int(s * 32767))))
                for s in samples
            )
        )
    print(f"wrote {path}")


def static_loop(seconds=4.0, rate=22050):
    """Band-limited noise with a slow amplitude wobble — shortwave bed."""
    rng = random.Random(9)
    n = int(seconds * rate)
    out, prev = [], 0.0
    for i in range(n):
        prev = 0.82 * prev + 0.18 * (rng.random() * 2 - 1)  # crude low-pass
        wobble = 0.55 + 0.45 * math.sin(2 * math.pi * i / (rate * 2.7))
        out.append(prev * 0.30 * wobble)
    # crossfade tail into head so the loop is seamless
    fade = int(0.05 * rate)
    for i in range(fade):
        t = i / fade
        out[i] = out[i] * t + out[n - fade + i] * (1 - t)
    return out[: n - fade]


def music_box_ident(rate=22050):
    """Six-note ident, E minor-ish, celesta-style decay with a detuned ghost."""
    freqs = [659.3, 587.3, 493.9, 659.3, 493.9, 329.6]
    out = []
    for f in freqs:
        dur = 0.42
        n = int(dur * rate)
        for i in range(n):
            t = i / rate
            env = math.exp(-6.0 * t)
            s = math.sin(2 * math.pi * f * t) * 0.7
            s += math.sin(2 * math.pi * f * 2.004 * t) * 0.18  # detuned partial
            out.append(s * env * 0.5)
    out += [0.0] * int(0.6 * rate)
    return out


write_png(os.path.join(ROOT, "assets", "icon.png"), 1024)
write_png(os.path.join(ROOT, "assets", "adaptive-icon.png"), 1024)
write_png(os.path.join(ROOT, "assets", "splash-icon.png"), 512)
write_wav(os.path.join(ROOT, "assets", "audio", "static-loop.wav"), static_loop())
write_wav(os.path.join(ROOT, "assets", "audio", "ident.wav"), music_box_ident())
