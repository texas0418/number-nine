# Credits

Simon sourced the recorded audio (2026-07-28, all stated royalty-free);
everything else is synthesized by `scripts/gen-foley.py`,
`scripts/gen-scenes-sfx.py`, and `scripts/gen-assets.py`.

## Recorded (sourced)

- **title-theme.m4a** — "Ghost" by Tim Beek. LICENSED: Tim Beek Premium
  License purchased 2026-07-28, licensee SimonBuilds — lifetime,
  non-exclusive, commercial, worldwide; modification allowed; **no
  attribution required** (a courtesy credit in settings/about is still
  planned). Not allowed: redistributing the track itself as music/stock, or
  claiming ownership (Content ID). License document: Simon holds the PDF
  ("Ghost License.pdf") — do NOT commit it to this public repo. In-app asset
  re-encoded 2026-07-28 from the licensed 320k master (ghost.mp3).
- **static-loop.wav** — cut from "Creepy Radio Static sound effect (with
  breathing)" by Amads (60s seamless loop, mono).
- **key-unlock.wav** — from "Unlocking Door" (royalty-free download).
- **unlock.wav** — from "Success Bell Sound Effect" (royalty-free download).
- **footsteps.wav** — from "Heavy Footsteps in Hall — Horror Sound Effect
  (Free)" (royalty-free download).
- **hinge-creak.wav** — from "Door hinge creak sound effect" (royalty-free
  download, replaced the gen-foley.py synth version 2026-07-28).
- **scrape.wav** — from "Realistic Brick Sound Effect" (royalty-free
  download, replaced the gen-foley.py synth version 2026-07-28).
- **page-turn.wav** — from "Page Turn Sound FX" by Lux Aeterna Audio
  (royalty-free download, replaced the gen-foley.py synth version 2026-07-28).
- **B2 set, Simon-edited (2026-07-28):** knock.wav (Banging Pipes),
  pips.wav ("Telephones Aa — Three Pips", GPO speaking-clock type),
  clock-tick.wav, dial-return.wav (rotary phone dialing),
  morse-key.wav (morse key clicks), wire-hum.wav, marsh-wind.wav —
  all edited by Simon from stated royalty-free sources (raw files kept in
  ~/Downloads/Sounds). Replaced the gen-foley.py synth versions of
  dial-return / clock-tick / pips.
- **B4 set (2026-07-29):** spark.wav cut from "Electric spark- Sound
  effect(HD)" (the isolated snap at 0.32s). whisper.wav from "woman
  whispering ASMR voice sound effect" — REVERSED (no intelligible words may
  survive; audio is never load-bearing), banded 350–5500 Hz, strongest 10s.
  murmur.wav from "Muffled voices 10 hours…" by Carol L (YouTube
  0tKOP-FjTgk; 60s audio-only slice at 10:00 via yt-dlp), lowpassed 650 Hz,
  5s seamless crossfaded loop. Unused: "Electric Wire Spark…" (weak
  crackle), "Female Shivering…" (superseded), "Ghostly Whispers…" /
  "Horror … Voices (Whispers)" (multi-voice, wrong register for her),
  "Girl Begging Screaming…" (parked — possible B5/B6 material).
- **B3 set, cut from Simon's recordings (2026-07-28):**
  rust-break.wav ("Metal Breaking SOUND EFFECT"),
  plaster-fall.wav ("Cracking Wall,Ceiling, Building, Sound Effects Free
  Download"), hasp-open.wav ("Old Padlock Sound Effect 704", open action cut
  from 27.8–29.6s of the 35s take), hum-settle.wav ("Electricity Hum 1 —
  Electricity Sound Effects Free Download"), sheet-rustle.wav ("A high
  quality paper manual page rustle sound effect") — all stated royalty-free,
  raw files in ~/Downloads.

PRE-SHIP: confirm the exact source page + license for each of the
downloads-folder SFX above (B1 singles, B2 set, B3 set — the filenames are
the only provenance recorded). Replace any that cannot be verified.

## Art

Scene art is Gemini-generated from Simon's prompts (B1 set 2026-07-27; B2
set and B3 set — churchyard, obj-valve, obj-grave, wall-crack, wall-burst —
2026-07-28), processed per the ART.md pipeline. The B4 séance pair and the
B4 foley (whisper/murmur/spark) are script-synthesized placeholders
(`scripts/gen-b4-scenes.py`, `scripts/gen-b4-foley.py`). Placeholder-grade
by policy: real 1963-style photography is a pre-ship task. The phosphor "9"
icon/splash is synthesized by `scripts/gen-icon.py`.

## Synthesized (no license needed)

ident, phone-ring, safe-open, lamp-off, knock, tune-whistle, station-morse,
station-music, station-voice, and the four music-box bells — all generated
from scripts in `scripts/`. (gen-foley.py keeps commented-out fallbacks for
hinge-creak, scrape, and page-turn, superseded by the recordings above.)
