# Number Nine — trailer sheet

Prompt recipes and assembly notes for the teaser and launch trailer, kept the
way [ART.md](ART.md) keeps the art prompts: recorded, auditable, and
regenerable by a future session.

Read [ART.md](ART.md) first. Everything here inherits its house style, and two
of its rules matter more in video than they do in stills: **no people** and **no
text or signage in frame**. Those happen to be the two things generative video
does worst, so the style guide already steers around the artefacts that make AI
footage look like AI footage.

## Why there is a trailer at all

The DEVICE 6 lesson recorded in [MARKETING.md](MARKETING.md) is often
mis-remembered as "no video". It is **no gameplay video**: a screen recording of
a text game is dull, so Simogo built mood pieces from custom motion and score
instead. Channel 2's rule stands and is the one to hold — *if it looks like an
app UI demo, cut it.*

The case for making one anyway is narrow and worth being honest about. The
screenshots already carry the store listing; the staircase and the mirrored line
stop a browser without needing motion. What a trailer buys is presence on the
vertical platforms where the numbers-station and analog-horror audience actually
lives, and the genre-native form there is not a polished trailer. It is a still
image with degraded audio over it, which costs an afternoon from assets already
owned.

**Cut it if it is not beautiful.** No trailer is better for this product than a
mediocre one.

## Approach: animate the stills, do not generate new worlds

Use **image-to-video**, seeded from the twenty-six frames in `assets/scenes/`.
Text-to-video invents a slightly different house every shot and the result feels
like a mood board. Image-to-video keeps the exact grain, plaster and amber dial
that shipped in the app, so the trailer matches the book.

1. **Shots of 1.5–3 seconds, motion almost imperceptible.** A slow push, a dust
   mote, a filament pulse. Generative video degrades as motion increases, and
   this story wants stillness — a constraint that flatters the medium.
2. **Never let the model make audio.** Mute every output. See below.
3. **No faces, no hands, no lettering.** Any typography in the cut is rendered
   from the app or laid in during the edit, never hallucinated.
4. **Match grain in post, not in the prompt.** Strip each clip to near-clean,
   then apply ONE 35mm grain and halftone pass across the whole timeline so the
   generated shots and the Gemini stills sit in the same film stock. This is
   what makes mixed sources cohere.
5. **Check the tool's commercial-use terms** the way the Gemini terms were
   checked for the art, and keep the prompts in this file. That audit trail is
   what let the art be declared shipping rather than placeholder.

## Tooling

Recorded 2026-07-30, prices re-checked 2026-08-18. This field moves monthly, so
treat the ranking as reasoning rather than fact and re-check commercial-use
terms before committing.

### Prices, and the size of the actual job

Checked 2026-08-18. Read these against the real workload rather than the plans'
marketing, because the job is far smaller than any of these tiers assume:
**seven shots at three or four takes each is about thirty clips of three
seconds.** No audio is needed (every output gets muted, see below) and no 4K is
needed (clips are downscaled and grained once at the end). One month of an entry
tier covers the whole trailer. Then cancel.

| Tool | Price | What your money buys | Ease |
|---|---|---|---|
| **Google Flow / Veo** | **$19.99/mo** AI Pro, 1,000 credits | Veo 3.1 Lite 10 credits/clip, Fast 20. Thirty clips at Fast is ~600 credits, inside one month. Ultra at $200/mo is 250 Quality videos and is money set on fire for this. | Easiest |
| **Kling** | **$10/mo** Standard, 660 credits | Cheapest real option. Tight for thirty clips, ample for the teaser's twelve. Historically strong at photoreal restrained motion, which is this register exactly. | Simple |
| **Runway** | **$12/mo** annual Standard, ~$15 monthly | The only genuine technical edge for our specific problem: Motion Brush paints motion onto the dial lamp alone with everything else masked static, and Camera Controls make "3 percent dolly push" a setting rather than a hope. | Steeper |
| **Luma** | **free tier**, 1 clip/day | Do not subscribe. Use it for ONE shot: the marsh light switch-on needs start-and-end keyframes and that is Luma's clean trick. Confirm the free tier does not watermark before relying on it. | Simple |

**The recommendation: Google AI Pro for one month, $20, then cancel.** Not
because it wins this month's benchmark, but because the Gemini commercial terms
were already audited for this project (ART.md) and the stills were generated
there, so it has the best chance of extending the look rather than
reinterpreting it. If shots 1 to 3 keep coming back too lively after a dozen
takes, add Runway for one month and brush the motion by hand. Worst case for
the entire trailer is about $35.

**Three ways to waste money here:** paying for an audio tier when every output
is muted, paying for 4K when the clips are downscaled and grained, and paying
for a top tier sized for hundreds of videos a month.

**The one check that is not optional.** Confirm the tier grants commercial use
AND produces output without a watermark. Free tiers commonly fail both, and a
watermarked clip is worthless. This is the same audit that let the Gemini art
ship as final rather than placeholder.

Sources, 2026-08-18: [Google AI subscriptions](https://blog.google/products-and-platforms/products/google-one/google-ai-subscriptions/)
· [Veo pricing](https://diyai.io/ai-tools/video-generation/google-veo-pricing/)
· [Flow pricing](https://www.toolcolumn.com/pricing/google-flow-pricing)
· [Luma pricing](https://costbench.com/software/ai-video-generators/luma-dream-machine/)
· [Kling / Runway / Luma comparison](https://blog.segmind.com/price-comparison-kling-ai-vs-runway-vs-mochi-1-vs-luma-dream-machine/)
· [Free-tier limits](https://whichoneisreal.com/compare/best-free-ai-video/)

### The reasoning behind the ranking

**Start with Google Veo, through Flow.** The deciding factor is not this month's
benchmark: it is that the Gemini commercial-use terms have already been audited
for this project (ART.md), and the stills were generated there, so the model has
the best chance of extending the look rather than reinterpreting it. Its native
audio is the feature everyone talks about and is worthless here — output gets
muted and her recordings go on in the edit.

**Add Runway if the motion fights back.** Camera Controls and Motion Brush map
directly onto the requirement: a slow dolly-in becomes a value rather than a
wish, and motion can be brushed onto the dial lamp alone while the rest of the
frame is masked static. Steeper, still a web UI, no node graphs.

**Luma for two specific shots.** Start-and-end keyframes are the clean way to
make *one distant amber light comes on halfway through* actually happen: feed a
dark frame and a lit frame and let it interpolate. Same trick for the study
window dimming.

**Kling is the value pick** — historically strong at photoreal restrained
motion, which is exactly this register.

**Skip local pipelines** (Wan, LTX, ComfyUI). Free and excellent, and a
node-graph hobby that eight three-second clips do not justify.

Three workflow notes that matter more than the tool:

- **Budget for a high reject rate.** Three or four takes per shot, and keep the
  LEAST animated one. The goal is stillness, which is the opposite of what these
  models want to give, so most takes will be too lively.
- **Do not upscale or sharpen.** It fights the grain and breaks the match with
  the Gemini stills. Generate, downscale if anything, grain once at the end.
- **Assemble in DaVinci Resolve.** Free, and it does the three things needed:
  film grain, a halftone print look, and frame-accurate audio sync.

## Audio: ours only

Her voice, the static bed and the foley are the most distinctive assets in the
project, they are already period-treated, and generated audio is the one thing a
listener could tell was fake. Everything needed is tracked in `assets/audio/`:

`static-loop` · `station-ident` · `station-music` · `ident` · `marsh-wind` ·
`wire-hum` · `clock-tick` · `pips` · `phone-ring` · `morse-key` ·
`knock` / `knock-far` · `break-set` · `murmur` · `parish` · `whisper` ·
`v-b1-1` … `v-b6-5` (her lines) · `num-0` … `num-9`, `num-9-name` (the digits)

**One caution on `title-theme.m4a`.** "Ghost" by Tim Beek is licensed lifetime,
non-exclusive, commercial and worldwide with modification allowed, which covers
using it in our own marketing. But the licence forbids claiming ownership, and
the track is a commercial release — posting a trailer carrying it to YouTube or
TikTok may draw a Content ID claim. Either clear that in advance or score the
trailer from the station's own material, which is more distinctive anyway.

## Which of her lines are trailer-safe

Every spoken line in the book, sorted. Store copy and trailers withhold gate
inputs and answers; review notes do not (see SUBMISSION.md).

| Line | Verdict |
|---|---|
| NINE. NINE. NINE. GOOD EVENING, LISTENER. | **Safe.** The iconic one. |
| YOU COUNTED WRONG, EDWIN. WE WILL BEGIN AGAIN. | **Safe.** |
| SLEEP. YOU WILL WANT IT. | **Safe.** |
| AT THE THIRD STROKE, EDWIN, IT WILL BE TOO LATE TO LEAVE. | **Safe**, and the best line available for a teaser. |
| THANK YOU, EDWIN. WE HAVE SO MUCH TO ASK YOU. | **Safe.** The closer. |
| FIVE. NINE. TWO. EDWIN. | **NEVER.** It is a puzzle input. |
| THE COUNT IS COMPLETE. NINETY-ONE. … | **NEVER.** States an answer. |
| MARGARET SIGNED TWICE. NOBODY SIGNS TWICE. | **NEVER.** Names Broadcast One's final answer. |
| GOOD EVENING, LISTENER. YOU KEPT THE HOUR. … | First clause only. "Kept the hour" points at a gate. |
| NOW YOU KNOW WHERE YOU LIVE. | Plot beat, not an answer. Late-story; avoid before launch. |
| THE SEAT IS KEPT. SHE WILL CALL THE NINTH BY NAME. | Ending. Avoid. |
| THE COUNT … SEAT IS DRAWN OUT FOR YOU. / YOU DO AS SHE ASKS. … / THANK YOU, EDWIN. SHE WILL LIKE WHOEVER YOU CHOOSE. | Late-story beats. Avoid. |

## The 15-second vertical teaser

| t | Shot | Seed | Audio |
|---|---|---|---|
| 0.0–2.5 | Black. Static alone. | — | `static-loop` fading up |
| 2.5–5.0 | The receiver, dial lamp breathing | `obj-receiver.jpg` | static, six notes begin |
| 5.0–7.0 | The cellar stairs, dark coming up | `obj-stairs.jpg` | `station-music` |
| 7.0–9.5 | The mast, wire against a still sky | `obj-mast.jpg` | ident tail, `marsh-wind` |
| 9.5–12.0 | Black, or hold on the dial | — | *"AT THE THIRD STROKE…"* |
| 12.0–15.0 | Title, then the amber 9 | app-rendered | static cuts to silence |

## The 40-second launch trailer

Same discipline, one more movement. Add, between the mast and the voice:

| Shot | Seed | Note |
|---|---|---|
| The study, cold window | `study.jpg` | establishes the house |
| The logbook, closed | `obj-logbook.jpg` | nineteen years, without saying so |
| The marsh, one distant light | `marsh.jpg` | see the variant below; the strongest three seconds available |
| The churchyard, low mist | `churchyard.jpg` | no headstone legible — no lettering |

End on `THANK YOU, EDWIN. WE HAVE SO MUCH TO ASK YOU.` over black, then the
title. Do not show a puzzle, a frequency, a keypad or a solved gate at any point.

## The prompt

Paste-ready image-to-video. Seed `assets/scenes/obj-receiver.jpg`.

```
IMAGE-TO-VIDEO. Animate the supplied still. Preserve its composition,
grain structure and tonality exactly; do not reinterpret, recompose,
re-light or add objects.

SUBJECT: a war-surplus shortwave radio receiver from the early 1960s
standing on a scarred wooden workbench in an unlit cellar. Bakelite
case, cloth-covered speaker grille, glass tuning dial with a single
warm amber lamp behind it. Damp lime-plaster wall behind, out of focus.

MOTION, and keep it minimal: an extremely slow dolly push toward the
dial, no more than a 3 percent scale change across the whole clip.
The amber dial lamp pulses almost imperceptibly, as if the mains
supply is unsteady, at roughly one slow cycle per two seconds. Two or
three dust motes drift downward through the lamp's light. Nothing
else moves. No camera shake, no handheld drift, no rack focus, no
parallax swing.

LOOK: grainy black-and-white 35mm photography with a halftone print
sensibility, like a full-page plate in a 1963 hardcover. Near
monochrome. The dial lamp is the ONLY colour in frame, a dim tungsten
amber, and it must stay dim. Heavily underexposed with all detail
living in the midtones. Deep unlit shadow across the top third of the
frame. Soft vignette. Slight halation around the lamp only.

LENS: 50mm equivalent, shallow depth of field, focus on the dial
glass, background falling away softly.

DURATION: 3 seconds. Vertical 9:16, 1080x1920.

ABSOLUTELY NOT IN FRAME: people, faces, hands, limbs, reflections of
people, text, lettering, numerals, digits, dial markings that read as
legible numbers, signage, labels, logos, watermarks, modern equipment,
plastic, LEDs, screens, American electrical fittings, colour beyond
the single amber, saturated colour, clean digital sharpness, lens
flare, sparks, smoke, fire, rain, fog machines, rapid motion, zoom
bursts, whip pans, morphing geometry, warping walls, breathing
architecture, extra radios appearing, objects sliding, generated
audio, music, voice.
```

Two entries in that negative list are doing specific work. **Numerals and
legible dial markings**, because the book's frequencies are puzzle inputs and a
hallucinated number on that dial would be both fake-looking and spoiler-shaped.
And **warping walls / breathing architecture**, which is the characteristic
generative-video artefact that instantly reads as machine-made.

## Per-shot variants

Keep the whole prompt above and swap only the MOTION paragraph.

- **`obj-stairs.jpg`** — the darkness at the foot of the stairs deepens very
  slowly, as though something below has drawn breath. The camera holds
  absolutely still. Nothing enters frame.
- **`obj-mast.jpg`** — a single aerial wire vibrates at a barely visible
  amplitude against a still night sky. The reeds below do NOT move: the air is
  windless, and that wrongness is the shot.
- **`marsh.jpg`** — one distant pinprick of amber light comes on in the far
  darkness, halfway through the clip, and stays on. Nothing else changes. (This
  is the end of Broadcast Two without explaining anything.)
- **`study.jpg`** — the light at the cold window dims by a fraction, as though
  a cloud crossed, over the full three seconds. No curtain movement.
- **`obj-logbook.jpg`** — nothing moves at all. Hold the still and let the grain
  pass do the work; a closed book that refuses to move is more unsettling than
  one that opens.
- **`churchyard.jpg`** — ground mist drifts laterally at walking pace, low, no
  higher than a foot. No headstone lettering legible at any point.

## Guardrails

- **No gate answers, no frequencies, no her hour.** Same rule as the store copy.
- **No screen recordings.** MARKETING.md Channel 2.
- **Comparisons are the writer's to draw.** No competitor's mark in the trailer,
  its title, its description or its tags — the guardrail applies to video
  metadata exactly as it does to store metadata.
- **Claim nothing about accessibility.** VoiceOver was descoped; see
  MARKETING.md Channel 4 for the honest position.
- **App Store preview video has its own size and duration requirements**, and
  they are not the screenshot ones. Read them off the ASC upload box rather than
  deriving them — assuming the general case instead of reading the page is what
  cost a redo on the screenshots (see SUBMISSION.md).
