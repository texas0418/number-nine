# Number Nine — voice recording script

Everything spoken in the game, in the order it is worth recording. There is
no real speech in the project today: `station-voice.wav` is a synthesised
garbled-counting placeholder (one of three phantom stations you pass while
sweeping the dial) and `whisper.wav` is filtered noise. All of the below is
new.

## The one rule

**Audio is atmosphere, never load-bearing** (AGENTS.md). Every line here is
redundant with something already printed on the page. A player with sound off,
or whose audio fails open, must lose nothing but the dread. Nothing recorded
here may be the only way to learn anything.

## Casting and direction

One voice: **her**. A woman, English, 1963 — the register of a BBC continuity
announcer or the speaking clock, not an actor doing horror.

The book describes her exactly, and the description is the direction:

> *flat and clean as a pressed flower, with no room in it at all*

> *unhurried, as though she had every night in the world and meant to spend
> them one at a time*

Notes for the booth:

- **No performance.** No menace, no breathiness, no smile. The horror is that
  she sounds like a public utility. If a take sounds like acting, it is wrong.
- **No emotional variation across the six broadcasts.** She never escalates.
  Everything that changes across the series is done in post (see Degradation).
- **Unhurried and even.** Same pace at the end of a line as the start.
- **Clip the warmth.** Close, dry, slightly under-projected — a voice that has
  been reading numbers alone for nineteen years.
- The single exception is **GOOD NIGHT, EDWIN** in Broadcast Six, which the
  prose calls *the voice of a woman dictating a will*. Fractionally slower.
  Still no warmth.

## Technical

- Mono, 48 kHz, 24-bit WAV. Dry — no reverb, EQ, compression or noise.
  Every period effect is added in post so it can be tuned per broadcast.
- Close mic, minimal room. We want the room *gone*; the game supplies its own.
- Leave ~500 ms of clean silence at the head and tail of each take.
- Three usable takes of each line, please. Flat delivery drifts more than you
  would think, and consistency between lines matters more than any one read.
- Deliver as separate files named exactly as listed. Drop them in
  `assets/audio/`; I will cut, treat and wire them.

---

## Session 1 — the digits (record these first)

**This is the most valuable hour of the whole session.** Record each number
*once* and the engine can sequence any transmission from them — including
**Tonight's Signal, which is a different set of numbers every night for 365
nights.** Pre-recording whole groups would mean the nightly signal could never
be voiced at all.

Read each as a standalone, evenly, with the same terminal pitch — they will be
butted together in arbitrary order, so a falling "nine" at the end of one and a
rising one at the start of the next will not splice.

| file | line |
|---|---|
| `num-0.wav` | ZERO |
| `num-1.wav` | ONE |
| `num-2.wav` | TWO |
| `num-3.wav` | THREE |
| `num-4.wav` | FOUR |
| `num-5.wav` | FIVE |
| `num-6.wav` | SIX |
| `num-7.wav` | SEVEN |
| `num-8.wav` | EIGHT |
| `num-9.wav` | NINE |

Then **a second pass of `NINE` alone**, as `num-9-name.wav`. It is her name as
well as a digit, and B1 turns on the reader noticing she says it more than
chance allows. A hair more weight on it — not emphasis, just less hurry.

Numbers stations read digit by digit: the group `14 09 14 05` is *"one four,
zero nine, one four, zero five."* No "and", no "hundred".

## Session 2 — the ident

The station's signature, heard before every transmission.

| file | line |
|---|---|
| `ident-voice.wav` | NINE. NINE. NINE. GOOD EVENING, LISTENER. |

Three identical, unhurried nines with a full beat between them, then the
greeting at exactly the same pitch and pace. The greeting is not warmer than
the numbers.

This sits over the existing six-note music box (`ident.wav`), which stays.

---

## Session 3 — her spoken lines

Every line she says in the book, in order. These are currently text on the
page; the audio doubles them.

**Broadcast One**

| file | line |
|---|---|
| `v-b1-1.wav` | NINE. NINE. NINE. GOOD EVENING, LISTENER. |
| `v-b1-2.wav` | FIVE. NINE. TWO. EDWIN. |
| `v-b1-3.wav` | YOU COUNTED WRONG, EDWIN. WE WILL BEGIN AGAIN. |

**Broadcast Two**

| file | line |
|---|---|
| `v-b2-1.wav` | AT THE THIRD STROKE, EDWIN, IT WILL BE TOO LATE TO LEAVE. |
| `v-b2-2.wav` | GOOD EVENING, LISTENER. YOU KEPT THE HOUR. SHE ALWAYS SAID YOU WOULD. |
| `v-b2-3.wav` | THANK YOU, EDWIN. WE HAVE SO MUCH TO ASK YOU. |

`v-b2-1` interrupts the speaking clock, so match the pips' clipped register.

**Broadcast Three**

| file | line |
|---|---|
| `v-b3-1.wav` | YOU DO AS SHE ASKS. HALLORAN FOUGHT IT LONGER. SHE PREFERS YOU. |
| `v-b3-2.wav` | THANK YOU, EDWIN. SHE WILL LIKE WHOEVER YOU CHOOSE. |

**Broadcast Four**

| file | line |
|---|---|
| `v-b4-1.wav` | CANDIDATES TWO. PAPERS ONE. MARKS FOLLOW. |
| `v-b4-2.wav` | HE PASSED. YOU BOTH PASSED. SHE IS PLEASED WITH WHAT YOU BROUGHT. |

`v-b4-1` is an invigilator reading a room to order. Drier still, if possible.

**Broadcast Five**

| file | line |
|---|---|
| `v-b5-1.wav` | NOW YOU KNOW WHERE YOU LIVE. |
| `v-b5-2.wav` | MARGARET SIGNED TWICE. NOBODY SIGNS TWICE. |
| `v-b5-3.wav` | THE SEAT IS KEPT. SHE WILL CALL THE NINTH BY NAME. |

**Broadcast Six**

| file | line |
|---|---|
| `v-b6-1.wav` | SLEEP. YOU WILL WANT IT. |
| `v-b6-2.wav` | GOOD NIGHT, EDWIN. |
| `v-b6-3.wav` | THE COUNT IS COMPLETE. NINETY-ONE. THE SEAT IS DRAWN OUT FOR YOU. |
| `v-b6-4.wav` | NOW YOU MAY KNOW WHO HAS BEEN COUNTING. |
| `v-b6-5.wav` | EDWIN MARSH. |

`v-b6-5` is the roll-call calling his name — read exactly as any other name on
a list, which is what makes it land.

### A note on the mirrored lines

Six of the above are `mirrored` in the chapter data — the book prints them
turned around, because *she speaks turned around*. Record them **forwards and
normally**; I will reverse the audio in post so the world's rule holds in sound
as well as type. Recording them backwards yourself would fight the treatment.

The mirrored ones: `v-b1-2`, `v-b2-3`, `v-b3-2`, `v-b4-2`, `v-b5-3`, `v-b6-3`.

## Session 4 — the whisper and the phantoms

**The whisper (B4).** She will not say it to the room; it plays only against
the ear. Currently filtered noise.

| file | line |
|---|---|
| `whisper-line.wav` | YOU WILL SIT THE PAPER WITH HIM WATCHING. NOTHING OF MINE GOES ONTO PAPER. MY MARKS READ AS MY SHEETS ARE READ. YOU KNOW THE WAY. |

Whispered, not stage-whispered — barely voiced, close enough to be
uncomfortable. Roughly nine seconds; the gate accumulates listening time.

**The phantom stations — cut, not needed.** These were originally on the list,
but the existing synthesised `station-voice.wav` does the job better: the
phantoms are the one thing that should sound INHUMAN, and a real read would
make them feel like characters. There are only two voices in this world — hers,
and the parish sending morse.

---

## Post-processing (mine, not yours)

Recorded dry so all of this can be tuned without re-recording:

- **Shortwave treatment** — band-limit to roughly 300 Hz – 3 kHz, add carrier
  hiss and slow fading. The voice should sound *received*, never present.
- **Degradation across the six** (the README's "degraded ident variants"):
  B1 clean and distant; by B6 the band-limiting tightens and the fade
  deepens, so she is closer and worse. The reader should not be able to name
  what changed.
- **Reversal** of the six mirrored lines.
- **Digit sequencing** — gaps of ~450 ms within a group, ~900 ms between
  groups, so the nightly signal can be voiced from the Session 1 files.

## What NOT to record

- **Edwin, or any narration.** The prose is the reader's own voice; the only
  thing that speaks aloud in this world is the station. Giving Edwin a voice
  would collapse the whole conceit.
- **Any puzzle answer.** Nothing above speaks a solution. `FIVE. NINE. TWO.`
  is the mirrored form, not the answer, and it is already printed.
- **Sound effects.** Foley is tracked separately in CREDITS.md.
