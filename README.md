# Number Nine

*1963. A shortwave set, a dead brother's logbook, and a numbers station that
knows your name.*

A DEVICE 6-style typographic horror novella for iOS: the prose is the map,
the phone rotates in your hands, and the puzzles are woven into the text.
Plus **Tonight's Signal** — a free nightly numbers-station cryptogram with a
fresh substitution key every day, whose decoded lines serialize a prequel.

Scaffolded 2026-07-25. Working title; vertical slice = engine + Broadcast One
+ the nightly signal.

## Design pillars

- **Received, not read.** Story chapters are one continuous typographic
  scroll. Gates (the radio tuner, forks) physically stop the story until
  solved. Knowledge is the only key — no inventory, no fail states.
- **The phone is the artifact.** Portrait-locked app; rotated and mirrored
  text makes the *reader* turn the device (DEVICE 6's trick). Haptics and a
  reactive static bed do the haunting. Headphones recommended, lights off.
- **A fresh lock every night.** The daily cipher gets a new random key each
  calendar day, deterministically from the date — every player on earth sees
  the same puzzle; yesterday's key teaches you nothing.
- **Player-respecting money.** Broadcast One + the nightly signal free
  forever; one IAP unlocks Broadcasts Two–Six. No ads, no tracking, fail-open
  purchases.

## Stack

House pattern: Expo 57, no navigation library, dark-only theme, pure modules
(`src/models.ts`, `src/dbCore.ts`, `src/daily/`) tested in Node via
`npm test`, expo-sqlite for local-first progress/streaks, expo-audio +
expo-haptics both fail-open, RevenueCat fail-open with placeholder keys.

`python3 scripts/gen-assets.py` regenerates the placeholder icons and the two
generated audio beds (static loop, six-note ident).

## Pre-ship checklist

Tracked as `pre-ship` GitHub issues once the repo is on GitHub; seeded here.
This is the single canonical list — build items and the cross-cutting launch
items ([MARKETING.md](MARKETING.md)) live together so nothing falls between
"build" and "launch." Design bar for the content items: [DESIGN.md](DESIGN.md)
(typography as architecture) + the puzzle doctrine in [AGENTS.md](AGENTS.md).

### Build — content

- [x] **Write Broadcasts Two–Six.** All six broadcasts are written, playtested
      on device and merged. Broadcast One remains the top of the funnel and can
      still take a polish pass.
- [x] **Author 365+ transmissions** for the nightly serial — 365 authored, a
      full year of Halloran's log ending where Broadcast One begins. Constraints
      (charset, two eligible words, word width, cryptogram length) are enforced
      in `test-cipher.ts`, so new lines cannot quietly break the B4 crossover.
- [ ] Cipher variant nights (header-key days, Morse days, transposition days)
- [ ] Real audio: voice reading digits, degraded ident variants per chapter, Morse night, haptic knock passages

### Build — craft

- DESCOPED (Simon, 2026-07-30): **share card as a rendered image** and the
  **VoiceOver pass**. The nightly share ships as text (`Share.share`, spoiler-
  safety in `redactedTranscript`) and that is the shipping form; Dynamic Type
  stays audited to the largest accessibility size, and no accessibility props
  are going into the engine. Do not re-add either as outstanding work.
- [ ] Polish icon/splash (current: generated glowing "9" — good, not final)

### Launch — store + marketing (see [MARKETING.md](MARKETING.md))

- [ ] App Store Connect record, RevenueCat project + real keys, $5.99 `nn_story_unlock`
- [ ] **Featuring Nomination** in App Store Connect **≥3 weeks** before launch
- [ ] Mood trailers (15s teaser + 40s launch), vertical-first — sound-led, NOT gameplay
- [ ] Store page: preview video, haunted-hardcover screenshots, voice-consistent copy
- [ ] ASO long-tail: "numbers station," "shortwave horror," "no ads horror story," "interactive novella"
- [ ] Pre-launch ARG teaser account (numbers-station intercepts; the campaign is the ad)
- [ ] Privacy + support pages — written, at `site/privacy/` and `site/support/`
      on the Society site (which absorbs the old `number-nine-privacy` /
      `number-nine-support` repo pattern, per issue #8). Outstanding: confirm
      the support address and publisher name in `site/build.ts`, then deploy.
