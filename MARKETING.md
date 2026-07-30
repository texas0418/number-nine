# Number Nine — launch plan

The problem Simogo had with DEVICE 6: a text game looks dull in a gameplay
video, so they never showed gameplay — they built mood trailers from custom
UI-motion animations + music, ran a cryptic teaser → reveal campaign, and let
their boutique-craft reputation earn Apple featuring and press. (Sources:
Simogo wiki/blog, Wikipedia, TouchArcade, 2013.)

We inherit that problem AND an advantage they never had: **the nightly
cryptogram is a self-propagating, shareable ad that works while we sleep.**
Everything below is built around that asymmetry. Don't market the story by
showing it — market the *dread and the beauty*, and let the free daily puzzle
be the funnel.

## Positioning

- **One line:** "A story you receive, not read." A shortwave horror novella
  where the phone is the haunted object.
- **The hook that travels:** a real numbers station reads out cryptograms at
  midnight — and one night it reads your name. (Numbers stations are an
  evergreen creepy-content genre on TikTok/YouTube; we ride that current
  instead of buying UA.)
- **What we are, in Apple's language:** premium, tasteful, audio-rich, zero
  ads, zero tracking, no dark patterns, fully offline, respects the system text
  size. This IS the featuring pitch — see below. Note what is deliberately
  absent: we do not call the app *accessible*. VoiceOver was descoped
  (Simon, 2026-07-30) and Dynamic Type alone does not earn the word.
- **What we never say:** "puzzle game," "AI," "hyper-casual." We say novella,
  transmission, listener.

## Channel 1 — the daily signal IS the trailer (evergreen, free, always-on)

The single most important channel and the one Simogo lacked. The nightly
cryptogram ships free forever and produces a **redacted-transcript share**
("I decoded tonight's transmission · 12 nights listening"). That share is the ad.

What actually ships: **text**, via the system share sheet
(`DailySignalScreen`), spoiler-safe because `redactedTranscript` never leaks an
unsolved letter. The rendered-image version — black bars, amber-on-black
identity, serial, streak, an App Store footer — was DESCOPED (Simon,
2026-07-30). Plan the channel around a text share and do not re-open this.

- [x] Spoiler-safe result, so sharing is inviting rather than a spoiler.
- [ ] The serialized prequel means streak-keepers are reading a second story —
      lean into "what did night 200 say?" intrigue in captions.
- [ ] Captions carry the funnel that the card was going to carry visually: the
      text share cannot brand itself, so the words have to.

## Channel 2 — sound-first mood trailers (NOT gameplay)

Follow DEVICE 6: convey feeling, never record the screen. Assets:

- **Vertical teaser (15s):** black screen, shortwave static tuning, the
  six-note music-box ident, the amber needle drifting to 4625, one glowing 9.
  No text until the last frame: a single mirrored line resolving.
- **Launch trailer (40s):** the degrading ident across the six broadcasts,
  the voice counting, one rotation moment, one mirrored-voice reveal — cut to
  music (our shortwave/music-box bed does the emotional lifting, exactly as
  Olsén's score did for DEVICE 6).
- **Format:** vertical-first (TikTok/Reels/Shorts) — the numbers-station
  audience lives there. Landscape cut-down for the App Store preview.
- **Rule:** every frame must be beautiful or unsettling. If it looks like an
  app UI demo, cut it.

## Channel 3 — the pre-launch ARG (the campaign IS the game)

Pure Simogo: cryptic teaser, explain nothing, reward the sleuths at launch.

- Stand up a teaser account (@thebuzzer / @station_nine style) 4–6 weeks out.
- Post real-feeling intercepts — audio clips of counting, a redacted card, a
  frequency — as if a station were actually broadcasting. Let people try to
  decode them in the replies. The ARG *is* the ad.
- Hide clues in "normal" posts (DEVICE 6 hid clues in ordinary blog updates).
- At launch, circle back and explain the cryptic clues + the making-of. The
  reveal is a second content beat and rewards the early community.
- Seed to numbers-station / ARG / analog-horror communities (they will do the
  spreading if it's authentic — do NOT market at them, broadcast to them).

## Channel 4 — Apple featuring (the marquee beat)

Apple 2025–26 rewards most of our profile (Balatro, Thronefall, Art of Fauna:
premium, tasteful, accessible, no dark patterns). Editorial scores UX, UI,
innovation, uniqueness, accessibility, localization, product-page quality;
games also on gameplay/art/sound/replayability/value.

**Accessibility is a criterion we are choosing to score badly on.** VoiceOver
was descoped (Simon, 2026-07-30) and there are no accessibility props anywhere
in the engine, so the honest position is that we lead on the criteria we do meet
and say nothing about the one we don't. Do not write "accessible" into a
nomination, a press pitch, or store copy. If it is ever asked directly, the true
answer is: Dynamic Type is audited to the largest accessibility size, every
hardware puzzle has a touch alternative, and screen-reader support is not there.

- [ ] Submit the nomination **≥3 weeks before launch**. It is a nomination, not
      a dependency: submit it before the app is approved rather than after.
      Nominate again for any major update.
- [ ] Polished product page: screenshots that look like a haunted book rather
      than a UI, tight copy in our voice. Both done — see `SUBMISSION.md`.

### The angle: this game could not exist anywhere but a phone

Lead with the platform, not the prose. Editorial rewards apps that could only be
built for the device, and this one has an unusually literal claim to it — the
puzzles are not *about* a phone, they are *performed on* one. Verified against
the code, the book uses:

| Capability | What the story does with it |
|---|---|
| Core Haptics | Digits delivered ONLY as felt knock-groups. A number you cannot see or hear, and must count with your hands. |
| Core Motion | Hold the device perfectly still while she measures you. Shake a seized valve loose. Turn the page over by turning the phone over. |
| Magnetometer | Bring a fallen aerial round to a true bearing and hold it there. |
| Screen brightness | Ink too shy for a bright lamp, which surfaces only when the reader takes the light down. |
| Volume buttons | A gain knob where the thumb already rests. |
| Battery state | A set that hungers, and is fed from the mains. |
| The real calendar | The station keeps real nights. Two gates wait for tomorrow to actually arrive. |
| StoreKit 2 | One non-consumable. No subscription, no consumables, no second charge. |

Every one of those also has a touch path, so none of it is a gimmick that locks
a reader out.

### The one-paragraph pitch

> Number Nine is a horror novella in six broadcasts where the typography is the
> architecture: the prose turns, mirrors and descends, and the reader turns the
> phone to follow it, because the room turned and not the typeface. Fifty
> puzzles stand between the first page and the last and none of them is a quiz —
> they are performed on the device itself, with the compass, the haptics, the
> brightness and the real calendar. Broadcast One is free in full; the rest is
> one payment that is never a subscription. A nightly cryptogram, free forever
> and identical for every listener on earth, serialises a second story a night
> at a time. No advertising, no tracking, no account, and it plays with the
> aeroplane switch on.

### The privacy card, which is worth playing

The App Privacy label is a single line: Purchases, not linked to identity, not
used for tracking. No analytics SDK, no crash reporter, no ad SDK, and not one
network call in the app's own source. Apple has spent years promoting exactly
this and very few games can say it.

### What NOT to write in the nomination

- **"Accessible", or anything near it.** See above.
- **DEVICE 6 or Simogo**, in any field. The trademark guardrail below applies to
  the nomination exactly as it applies to store metadata.
- **"Puzzle game", "AI", "hyper-casual".** House voice rules.
- **Any gate answer, frequency, or her hour.** Same rule as store copy and the
  trailer; the nomination is read by people, and one of them will play it.
- **Any claim about the ident degrading per broadcast.** Not built.

### Practical

Read the form's own field limits off the page rather than assuming them; that
assumption already cost a redo on screenshots. Supporting material that exists
today: nine screenshots at 1242 × 2688, the press kit at
`numbernine.simonbuilds.app/press/`, and the Society archive as evidence of the
craft around the product.

## Channel 5 — press ladder (timed beats, daily puzzle already live)

Mirror DEVICE 6's cadence so each beat is its own story:

1. **Teaser** (cryptic, ~4–6 wk out) — ARG account + 15s teaser.
2. **Reveal** (~3 wk out) — what it is, the Simogo lineage, the numbers-station
   premise; pitch narrative/indie outlets (TouchArcade successor sites,
   Pocket Tactics, indie horror press, analog-horror YouTubers).
3. **Date + trailer** (~1 wk out) — release date, launch trailer.
4. **Launch day** — the daily signal is ALREADY live so any curious
   downloader has something free to do tonight; publish the ARG explainer.

## Store assets checklist (pre-ship)

- [ ] App Store preview video (landscape cut of the launch trailer)
- [ ] Screenshots that read as a haunted hardcover, not an app
- [ ] ASO: own the honest low-competition long-tail — "numbers station,"
      "shortwave horror," "no ads horror story," "cryptogram story,"
      "interactive novella." (65–70% of indie installs are store search;
      these are winnable keywords, unlike "puzzle" or "horror" alone.)
- [x] Product-page copy in the app's voice (listener, transmission, received)
      — written and measured against the field limits in
      [SUBMISSION.md](SUBMISSION.md).
- [x] Privacy + support pages written, generated by `site/build.ts` onto the
      Society site at `/privacy/` and `/support/` (they absorb the abandoned
      `number-nine-privacy` / `number-nine-support` repo pattern). Confirm
      `SUPPORT_EMAIL` and `PUBLISHER` in that file before they go live.

## Trademark guardrails (DEVICE 6 / Simogo)

"DEVICE 6" is Simogo's mark. The line we hold (decided 2026-07-27):

- **OK (nominative use):** naming DEVICE 6 in press conversations, interviews,
  social posts, and the ARG explainer as lineage/inspiration — plain text
  references ("in the tradition of DEVICE 6"), always as their mark, never
  styled in their logotype.
- **NEVER:** in App Store metadata — name, subtitle, description, keywords,
  promotional text, screenshots. Store keyword use of a competitor's mark is
  both an ASC rejection risk and the classic trademark-infringement fact
  pattern.
- **NEVER:** anything implying affiliation, endorsement, or a sequel ("from
  the world of…", "the spiritual successor Simogo fans have waited for" in
  our OWN voice is out; quoting a reviewer who says it is fine, attributed).
- No Simogo logos or trade dress anywhere; our night-phosphor identity is
  deliberately not their warm-paper look.

## What NOT to do

- No gameplay-recording trailers. No paid UA (CPI is out of reach and the
  daily card is free reach). No "AI game" framing. No ads, ever — "no ads" is
  both an ASO keyword and the featuring pitch. No spoiling the story to sell
  it — sell the feeling and let the free chapter + nightly signal convert.
