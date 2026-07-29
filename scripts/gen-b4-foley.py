#!/usr/bin/env python3
"""Synthesized placeholder foley for Broadcast Four — PLACEHOLDERS until
Simon records/sources the real set (same deal as B3: these get replaced).
Stdlib only: python3 scripts/gen-b4-foley.py

Generates into assets/audio/:
  whisper.wav   her whisper against the ear — breath-band noise with a
                speech-like envelope, ~9s, no intelligible words BY DESIGN
                (the content is duplicated cross-modally; audio is never
                load-bearing)
  murmur.wav    her distant murmur, seamless ~2.4s loop (bearing gate —
                volume rises as the aerial swings onto her)
  spark.wav     a fat electrical snap (wrong route on the circuit trace)
"""
import math
import os
import random
import struct
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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


def band_noise(dur, lo=900.0, hi=2400.0, seed=7, gain=1.0):
    """Cheap band-limited noise: white noise through a two-pole resonator."""
    rng = random.Random(seed)
    n = int(dur * RATE)
    out = [0.0] * n
    y1 = y2 = 0.0
    f = (lo + hi) / 2.0
    q = max(0.5, f / max(1.0, hi - lo))
    w = 2 * math.pi * f / RATE
    a = 2 * math.cos(w) * math.exp(-w / (2 * q))
    b = -math.exp(-w / q)
    for i in range(n):
        x = rng.uniform(-1, 1)
        y = x + a * y1 + b * y2
        y2, y1 = y1, y
        out[i] = y * 0.08 * gain
    return out


def whisper(dur=9.0, seed=19):
    """Breath noise shaped by syllable-rate envelope bursts with pauses —
    the CADENCE of urgent speech, none of the content."""
    rng = random.Random(seed)
    base = band_noise(dur, 1200, 3800, seed=seed)
    n = len(base)
    env = [0.0] * n
    t = 0.0
    while t < dur:
        # a "phrase": 3-8 syllables, then a breath's silence
        syllables = rng.randint(3, 8)
        for _ in range(syllables):
            length = rng.uniform(0.09, 0.26)
            peak = rng.uniform(0.45, 1.0)
            start = int(t * RATE)
            span = int(length * RATE)
            for i in range(span):
                j = start + i
                if j >= n:
                    break
                x = i / max(1, span)
                env[j] = max(env[j], peak * math.sin(math.pi * x) ** 1.5)
            t += length + rng.uniform(0.02, 0.08)
        t += rng.uniform(0.35, 0.8)
    out = [base[i] * env[i] * 6.0 for i in range(n)]
    # gentle fade at both ends
    edge = int(0.15 * RATE)
    for i in range(edge):
        out[i] *= i / edge
        out[n - 1 - i] *= i / edge
    return out


def murmur(dur=2.4, seed=31):
    """A low vowel-ish drone that wanders — her voice through a wall.
    Loop-seamless: pitch/amp modulators complete whole cycles."""
    n = int(dur * RATE)
    out = [0.0] * n
    two_pi = 2 * math.pi
    for i in range(n):
        t = i / RATE
        # whole numbers of mod cycles across the loop -> seamless
        f = 190 + 14 * math.sin(two_pi * 2 * t / dur)
        amp = 0.5 + 0.35 * math.sin(two_pi * 3 * t / dur + 1.1)
        s = (
            math.sin(two_pi * f * t)
            + 0.5 * math.sin(two_pi * f * 2.02 * t)
            + 0.25 * math.sin(two_pi * f * 2.98 * t)
        )
        out[i] = s * amp * 0.11
    return out


def spark(seed=47):
    """A fat snap: click transient + short bright noise burst + low thud."""
    rng = random.Random(seed)
    n = int(0.35 * RATE)
    out = [0.0] * n
    for i in range(n):
        t = i / RATE
        hiss = rng.uniform(-1, 1) * math.exp(-t * 55) * 0.8
        thud = math.sin(2 * math.pi * 70 * t) * math.exp(-t * 22) * 0.5
        out[i] = hiss + thud
    out[0] = 0.95
    out[1] = -0.9
    return out


write_wav("whisper.wav", whisper())
write_wav("murmur.wav", murmur())
write_wav("spark.wav", spark())
