# Number Nine — art sheet

Prompt recipes + processing pipeline for the scene art. Current assets are
Gemini-generated PLACEHOLDERS; real 1963-style photography is a pre-ship task
(README checklist). Recreated from the 2026-07-27 session notes so any future
session can regenerate or extend the set.

## House style (all prompts inherit this)

- Grainy black-and-white 35mm photography, halftone print sensibility —
  looks like a plate in a 1963 hardcover, not a render.
- Desaturated to near-monochrome; at most ONE amber accent (a dial lamp, a
  bulb filament) — the app's phosphor identity supplies the color.
- English marsh-country house, 1963: damp plaster, dark timber, wartime
  leftovers. Nothing modern, nothing American.
- Underexposed and moody; detail lives in the midtones. No people. No text
  or signage in frame (text belongs to the typography, and generated
  lettering reads as fake).

## Backdrops (portrait, screen-filling)

Format: generate large portrait, then FOCAL-CROP to the screen ratio
(~2.16 h/w, e.g. 720×1560). Subject sits LOW in frame with a dark top third —
the header band and early prose float over that darkness. Backdrops render
behind text at high opacity with a scrim, so they must read as a ROOM at a
glance, not a texture.

- `assets/scenes/hall.jpg` — entrance hall: console table, telephone on it,
  coat hooks, stair newel in shadow; single cold window light from the left.
- `assets/scenes/study.jpg` — listener's study: desk under a cold window,
  bookshelves, framed marsh watercolours hung level (one slightly crooked —
  it hides the safe; keep a plausible rectangle at roughly x 13–33%,
  y 33–51% of the crop for the hotspot target).
- `assets/scenes/cellar.jpg` — cellar workbench: shortwave receiver on the
  bench, small barred window high on the wall, brick courses visible low-left
  (the loose-brick hotspot lives at roughly x 1–24%, y 53–70%).

If a hotspot target rect moves in a re-shot image, update the `target` in
`src/chapters/broadcast1.ts` AND re-verify on device — coordinates are
normalized to the cover-cropped FRAME, not the source image.

## Object plates (square close-ups)

Square, centered subject, shallow depth, dark ground — set into the text
column like printed plates (`PlateBlock`, 72% width, aspect 1):

- `assets/scenes/obj-receiver.jpg` — war-surplus shortwave receiver, dial
  lamp lit (the one amber accent).
- `assets/scenes/obj-telephone.jpg` — black GPO bakelite telephone, mid-ring
  feel (handset seated; menace, not motion blur).
- `assets/scenes/obj-logbook.jpg` — water-swollen logbook, pencil worn to
  nothing beside it.
- `assets/scenes/obj-safe.jpg` — small wall safe behind a swung-open framed
  watercolour, three brass wheels.

## Processing pipeline (what was actually done, 2026-07-27)

1. Originals: `~/Downloads/Gemini_Generated_Image_*.png` — KEEP them; they
   are the recrop source.
2. Focal crop to screen ratio (~2.16 h/w) around the subject, subject low,
   top third dark.
3. Watermarks: CROP them out. (Feathered-fill patching was tried and
   REJECTED — visible smudge.)
4. Sepia/level treatment for text legibility over the busy texture:
   cellar strong (highlight ceiling ~150 + blur 1.6), hall/study mild
   (ceiling ~215). Readability beats fidelity.
5. Export JPEG into `assets/scenes/` with the filenames above (they are the
   `SceneId` registry keys in `src/engine/scenes.ts`).

## Broadcast Two set (generated 2026-07-28, processed from ~/Downloads)

Same pipeline as above (watermark CROPPED, near-mono with 15–30% color kept
for amber/brass accents, highlight ceiling, light blur). Originals are the
`Gemini_Generated_Image_*.png` files of 2026-07-28 — keep them.

- `marsh.jpg` — marsh at dusk FRAMED IN THE HOUSE DOORWAY (the render's own
  framing, kept: better than the open view), mast + amber lamp on horizon.
- `obj-letter.jpg` — sealed envelope + pen on dark desk.
- `obj-cards.jpg` — index cards banded in string, the new top card whiter.
- `obj-clock.jpg` — brass 24-hour radio-room clock (dial carries a small
  "SHORTWAVE RADIO" legend — darkened in treatment; optional re-shoot for a
  textless dial).
- `obj-compass.jpg` — WWII marching compass, lid open.
- `obj-mast.jpg` — wooden lattice mast from below (rendered in color,
  desaturated in processing).
- `obj-key.jpg` — homemade brass Morse key, cloth flex.

## Broadcast Three set (generated 2026-07-28, processed from ~/Downloads)

Same pipeline. Originals are that evening's `Gemini_Generated_Image_*.png`
files — keep them (recrop source).

- `churchyard.jpg` — backdrop: leaning stones on the marsh's one rise, dusk,
  amber lancet window on the horizon church.
- `obj-grave.jpg` — plate: Margaret's small clean stone; the render's
  legible inscription was blurred + regrained to read as worn carving.
- `obj-valve.jpg` — plate: knurled brass vent valve; maker's nameplate
  blurred (no readable text in frame).
- `wall-crack.jpg` / `wall-burst.jpg` — the b3-crack hotspot pair, cropped
  from the SAME window (full width, y 120–1187 of the 768×1376 originals —
  which also drops the bottom-right watermark) and exported at 720×1000,
  exactly the Hotspot frame's 0.72 aspect so target coords map 1:1 with no
  cover-crop. `wall-crack` (smooth plaster, circular bulge, hairline low at
  ~x 0.49–0.62, y 0.80–0.92; target rect x 0.45 y 0.77 w 0.22 h 0.18) was
  darkened (gamma 1.55 to ~235 ceiling, unsharp first so the hairline
  survives) + grained to sit with `wall-burst` (near-mono, amber kept),
  which swaps in on solve via Hotspot's `revealImage`.

## Broadcast Four set (real renders 2026-07-29, processed from ~/Downloads)

- `obj-seance.jpg` / `obj-seance-after.jpg` — the b4-plate exposure pair,
  from Simon's matched Gemini renders (yuwl87 = empty, d1urxv = the same
  frame edited to add the figure; KEEP both originals). Identical square
  window from both (x 20–748, y 420–1148 of 768×1376 — skips the frame
  border, drops the watermark), exported 900×900. The figure ships at 62%:
  `Image.blend(before, after, 0.62)` — since the frames agree everywhere
  else, the blend fades ONLY the smear ("the eye finds it a half-second
  late"). Slight darken (0.94), grain 7. gen-b4-scenes.py remains as the
  regenerable placeholder fallback.

## Icon / splash

Glowing phosphor "9" — generated by `scripts/gen-icon.py` (needs the Pillow
venv). Good placeholder; final icon is a pre-ship polish item.
