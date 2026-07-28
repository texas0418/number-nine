# Audio credits

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

PRE-SHIP: confirm the exact source page + license for each of the four SFX
above (they came from Simon's downloads folder; the filenames are the only
provenance recorded). Replace any that cannot be verified.

## Synthesized (no license needed)

ident, phone-ring, safe-open, lamp-off, knock, tune-whistle, station-morse,
station-music, station-voice, and the four music-box bells — all generated
from scripts in `scripts/`. (gen-foley.py keeps commented-out fallbacks for
hinge-creak, scrape, and page-turn, superseded by the recordings above.)
