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

Tracked as `pre-ship` GitHub issues once the repo is on GitHub; seeded here:

- [ ] **Write the real Broadcast One** (current prose is placeholder scaffolding) and Broadcasts Two–Six
- [ ] **Author 365+ transmissions** for the nightly serial (30 placeholders now)
- [ ] Real audio: voice reading digits, degraded ident variants per chapter, Morse night, haptic knock passages
- [ ] Share card as an image (currently text share)
- [ ] Cipher variant nights (header-key days, Morse days, transposition days)
- [ ] VoiceOver pass — a text game should be the most accessible game on the store
- [ ] Real icon/splash art (current: generated pixel "9")
- [ ] App Store Connect record, RevenueCat project + real keys, $5.99 `nn_story_unlock`
- [ ] Featuring Nomination in App Store Connect ≥3 weeks before launch
- [ ] Privacy + support pages (house pattern: `number-nine-privacy`, `number-nine-support` repos)
