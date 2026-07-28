#!/usr/bin/env python3
"""Synthesized foley for Number Nine — the sounds we could not source as
recordings (device QA 2026-07-28: "more variation, not just radio noise").
Stdlib only (no numpy/Pillow) so it runs anywhere: python3 scripts/gen-foley.py

Generates into assets/audio/:
  hinge-creak.wav   the watercolour swinging on its hinge (find-safe hotspot)
  scrape.wav        the loose cellar brick coming away (brick hotspot)
  knock.wav         dull knuckle on the wrong spot in a photograph
  page-turn.wav     softer paper swish (the old one read as a static swell)
  tune-whistle.wav  heterodyne whistle, seamless 2s loop (radio tuning)
  station-morse.wav faint keyed morse — a phantom station on the band
  station-music.wav distant waltz through the ether — another phantom
  station-voice.wav garbled counting voice — the third phantom

The recorded SFX (door key, success bell, footsteps, the static bed with
breathing, the title theme) come from Simon's sourced files — see CREDITS.md.
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


def sil(dur):
    return [0.0] * int(dur * RATE)


def mix(*layers):
    m = max(len(l) for l in layers)
    out = [0.0] * m
    for l in layers:
        for i, s in enumerate(l):
            out[i] += s
    return [max(-1, min(1, s)) for s in out]


def thunk(freq=90, dur=0.28, gain=0.7):
    n = int(dur * RATE)
    return [math.sin(2 * math.pi * freq * i / RATE) * math.exp(-i / (n * 0.3)) * gain for i in range(n)]


# ------------------------------------------------------------- hinge creak
# Stick-slip squeak: a harmonic tone gliding down with jittered tremolo —
# two creaks, as the painting swings and then settles.
def creak(dur, f0, f1, seed, gain=0.42):
    rng = random.Random(seed)
    n = int(dur * RATE)
    out, phase, jitter = [], 0.0, 0.0
    trem_rate = 9 + rng.random() * 4
    for i in range(n):
        t = i / n
        jitter = 0.96 * jitter + 0.04 * (rng.random() * 2 - 1) * 60
        freq = f0 + (f1 - f0) * t + jitter
        phase += 2 * math.pi * freq / RATE
        s = math.sin(phase) + 0.45 * math.sin(2 * phase) + 0.18 * math.sin(3 * phase)
        trem = 0.62 + 0.38 * math.sin(2 * math.pi * trem_rate * t * dur)
        env = math.sin(math.pi * min(1, t * 1.25)) ** 1.5
        out.append(s * trem * env * gain * 0.35)
    return out


# NOTE: hinge-creak.wav is now a SOURCED RECORDING (see CREDITS.md) — this
# script no longer writes it, so a rerun can't clobber the real thing.
# Fallback if the recording is ever lost:
#   write_wav("hinge-creak.wav", mix(creak(0.7, 430, 300, seed=71), sil(0.0))
#             + sil(0.12) + mix(creak(0.45, 340, 250, seed=72, gain=0.3), thunk(85, 0.3, 0.25)))


# ------------------------------------------------------------ brick scrape
# Gritty band of noise dragged over mortar, low rumble underneath, and the
# brick's final tip out of its course.
def grit(dur=0.85, seed=81):
    rng = random.Random(seed)
    n = int(dur * RATE)
    out, lp, burst = [], 0.0, 0.0
    for i in range(n):
        t = i / n
        x = rng.random() * 2 - 1
        lp = 0.55 * lp + 0.45 * x            # mid-heavy noise
        hp = x - lp                          # gritty top
        if rng.random() < 0.004:
            burst = 1.0                      # stick-slip catches
        burst *= 0.994
        env = math.sin(math.pi * min(1, t * 1.15)) ** 1.2
        out.append((lp * 0.5 + hp * 0.35) * (0.4 + burst) * env * 0.5)
    return out


# NOTE: scrape.wav is now a SOURCED RECORDING (see CREDITS.md) — not written
# here anymore. Fallback if the recording is ever lost:
#   write_wav("scrape.wav", mix(grit(), thunk(58, 0.7, 0.28))
#             + mix(thunk(74, 0.22, 0.5), grit(0.12, seed=82)))


# ------------------------------------------------------------------- knock
# A dull knuckle on plaster: the room absorbs it.
def knock_hit(seed, gain):
    rng = random.Random(seed)
    n = int(0.05 * RATE)
    tap = []
    prev = 0.0
    for i in range(n):
        prev = 0.4 * prev + 0.6 * (rng.random() * 2 - 1)
        tap.append(prev * math.exp(-i / (n * 0.2)) * gain * 0.4)
    return mix(thunk(72, 0.22, gain), tap)


write_wav("knock.wav", knock_hit(91, 0.55))


# --------------------------------------------------------------- page turn
# Leafing through the log: three quick paper flicks, each a short bright
# swish with a soft edge-crackle at its peak. (QA history: the first swish
# read as the static bed swelling; a single soft flick was "not good" —
# multiple flicks read as PAGES. Placeholder until a good recording lands.)
def flick(dur, seed, gain):
    rng = random.Random(seed)
    n = int(dur * RATE)
    out, lp = [], 0.0
    for i in range(n):
        t = i / n
        x = rng.random() * 2 - 1
        lp = 0.6 * lp + 0.4 * x
        hp = x - lp                          # papery top end only
        env = math.sin(math.pi * t) ** 3
        crackle = 1.6 if 0.42 < t < 0.5 and rng.random() < 0.3 else 1.0
        out.append(hp * env * gain * crackle)
    return out


# NOTE: page-turn.wav is now a SOURCED RECORDING (see CREDITS.md) — not
# written here anymore. Fallback if the recording is ever lost:
#   write_wav("page-turn.wav",
#             flick(0.22, 52, 0.3) + sil(0.1) + flick(0.2, 53, 0.34)
#             + sil(0.12) + flick(0.3, 54, 0.26))


# ------------------------------------------------------------ tune whistle
# The heterodyne squeal of a carrier sliding by. SEAMLESS 2s loop: whole
# vibrato periods and an integer carrier-cycle count keep phase continuous
# at the seam; the player varies volume/rate with dial proximity.
def whistle(dur=2.0, f=760.0, vib_rate=2.0, vib_depth=12.0, gain=0.4):
    n = int(dur * RATE)
    out, phase = [], 0.0
    for i in range(n):
        t = i / RATE
        freq = f + vib_depth * math.sin(2 * math.pi * vib_rate * t)
        phase += 2 * math.pi * freq / RATE
        s = math.sin(phase) + 0.2 * math.sin(2 * phase)
        out.append(s * gain * 0.55)
    return out


write_wav("tune-whistle.wav", whistle())


# ---------------------------------------------------------- phantom stations
# Faint neighbours on the band, heard for a moment as the needle sweeps past.
def keyed_tone(pattern, f=620, unit=0.07, gain=0.34):
    out = []
    ramp = int(0.005 * RATE)
    for mark, units in pattern:
        n = int(units * unit * RATE)
        for i in range(n):
            env = 1.0
            if i < ramp:
                env = i / ramp
            elif i > n - ramp:
                env = (n - i) / ramp
            out.append(math.sin(2 * math.pi * f * i / RATE) * gain * env * (1 if mark else 0))
    return out


# dah-dit dit-dit dah-dit dit — N I N E, of course.
MORSE = [(1, 3), (0, 1), (1, 1), (0, 3),
         (1, 1), (0, 1), (1, 1), (0, 3),
         (1, 3), (0, 1), (1, 1), (0, 3),
         (1, 1), (0, 1)]
write_wav("station-morse.wav", keyed_tone(MORSE))


def far_note(f, dur, gain=0.3, seed=61):
    rng = random.Random(seed)
    n = int(dur * RATE)
    out = []
    for i in range(n):
        t = i / RATE
        s = math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * f * 2 * t)
        s += (rng.random() * 2 - 1) * 0.05          # ether hiss
        flutter = 0.7 + 0.3 * math.sin(2 * math.pi * 0.9 * t + f)
        out.append(s * math.exp(-i / (n * 0.6)) * flutter * gain * 0.5)
    return out


waltz = (far_note(440, 0.5, seed=62) + far_note(659, 0.45, seed=63)
         + far_note(554, 0.45, seed=64) + far_note(440, 0.7, gain=0.24, seed=65))
write_wav("station-music.wav", waltz)


def garbled_voice(dur=1.7, seed=66):
    """A counting voice through the ether: buzzy bursts through a wandering
    resonator — the words never resolve."""
    rng = random.Random(seed)
    out = []
    t_total = 0.0
    while t_total < dur:
        burst = 0.16 + rng.random() * 0.16
        gap = 0.05 + rng.random() * 0.12
        n = int(burst * RATE)
        f0 = 170 + rng.random() * 60                     # the voice
        fc = 350 + rng.random() * 900                    # the formant
        r = 0.985
        w = 2 * math.pi * fc / RATE
        y1 = y2 = 0.0
        for i in range(n):
            t = i / RATE
            x = 1.0 if (t * f0) % 1 < 0.4 else -1.0      # pulse buzz
            x *= 0.25
            y = 2 * r * math.cos(w) * y1 - r * r * y2 + x * (1 - r)
            y2, y1 = y1, y
            env = math.sin(math.pi * i / n) ** 1.3
            out.append(max(-1, min(1, y * 9)) * env * 0.4)
        out += sil(gap)
        t_total += burst + gap
    return out


write_wav("station-voice.wav", garbled_voice())


# ------------------------------------------------- B2 instrument sounds
# The rotary dial springing home: a decelerating ratchet clatter.
def dial_return(dur=0.65, seed=95):
    rng = random.Random(seed)
    out = []
    t = 0.0
    gap = 0.018
    while t < dur:
        n = int(0.012 * RATE)
        prev = 0.0
        for i in range(n):
            prev = 0.5 * prev + 0.5 * (rng.random() * 2 - 1)
            out.append(prev * math.exp(-i / (n * 0.4)) * 0.38)
        out += sil(gap)
        t += 0.012 + gap
        gap *= 1.13  # the spring runs down
    return out


write_wav("dial-return.wav", dial_return())

# A clock hand clicking over one graduation.
write_wav("clock-tick.wav", knock_hit(96, 0.18))

# The speaking clock's three pips ("at the third stroke...").
def pips(f=950, n_pips=3, on=0.12, off=0.55, gain=0.3):
    out = []
    ramp = int(0.004 * RATE)
    for p in range(n_pips):
        n = int(on * RATE)
        for i in range(n):
            env = min(1, i / ramp, (n - i) / ramp)
            out.append(math.sin(2 * math.pi * f * i / RATE) * gain * env)
        if p < n_pips - 1:
            out += sil(off)
    return out


write_wav("pips.wav", pips())
