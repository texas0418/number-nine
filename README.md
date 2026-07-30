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
- [x] **Her voice, and the digits.** One recording per line she speaks,
      `v-b1-1` through `v-b6-5`, all tracked. The digits `num-0`…`num-9` plus
      `num-9-name` are Simon's recordings, sequenced by `speakNumbers` and
      wired into Tonight's Signal ([DailySignalScreen.tsx:116](src/screens/DailySignalScreen.tsx:116)).
- [x] **Haptic knock passages.** The `knock` gate is haptic-first, with an
      `onBeat` that fires even when audio has failed; the B3 poor-box delivers
      its digits ONLY as felt knock-groups (`feltGroups`); B6's séance is the
      longest felt message in the book.
- [ ] Degraded ident variants per chapter — `playIdent` plays one fixed ident
      for all six broadcasts. Two variants are cut but neither committed nor
      wired (`nn-ident-broadcast-one.wav`, `nn-ident-broadcast-six.wav`, sitting
      untracked in `assets/audio/`).
- [ ] Morse night — no Morse mode exists in `src/daily/`; it belongs with the
      cipher-variant-nights item above rather than as a separate audio task.

### Build — craft

- [x] **Share card as a rendered IMAGE.** Descoped on 2026-07-30 and REINSTATED
      the same day once the schedule allowed it (Simon: "we have three weeks
      before launch, let's give people something great"). Black bars over
      unsolved letters, amber-on-black identity, serial and streak, the site
      address in the footer. Image first, the text share kept as the floor so a
      missing native module costs a picture and never a share. Content rules
      (never print an unsolved or WRONG letter) are tested in `test-cipher.ts`.
- DESCOPED and staying so (Simon, 2026-07-30): the **VoiceOver pass**. Dynamic
  Type stays audited to the largest accessibility size and every hardware puzzle
  keeps a touch alternative, but no accessibility props are going into the
  engine. Do not re-add it as outstanding work.
- [x] **Icon and splash: the generated phosphor "9" is the icon** (Simon,
      2026-07-30). Not a placeholder, not awaiting a polish pass. It is
      regenerable from `scripts/gen-icon.py` if a size is ever needed.

### Launch — store + marketing (see [MARKETING.md](MARKETING.md))

- [ ] **RevenueCat real key** — the one remaining blocker. The ASC record, the
      IAP, the metadata, the screenshots and the App Privacy answers are all
      done (Simon, 2026-07-30); the store page cannot ship a build until
      `IOS_KEY` is real and PR #31 is merged.
- [ ] **Featuring Nomination** in App Store Connect **≥3 weeks** before launch
- [ ] Mood trailers (15s teaser + 40s launch), vertical-first — sound-led, NOT gameplay
- [ ] Store page: preview video, haunted-hardcover screenshots, voice-consistent copy
- [x] **ASO long-tail** — carried by the subtitle and keyword field, which are
      deliberately split so no term is paid for twice. See SUBMISSION.md.
- [ ] Pre-launch ARG teaser account (numbers-station intercepts; the campaign is the ad)
- [x] **Privacy + support pages LIVE** on the Society site at `/privacy/` and
      `/support/`, generated by `site/build.ts` (which absorbed the old
      `number-nine-privacy` / `number-nine-support` repo pattern). Both
      published constants are confirmed: `support@simonbuilds.app` and
      `Simon Shih`.
