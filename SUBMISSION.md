# App Store submission data

Everything App Store Connect asks for, in one place, with the basis for each
answer. Fields with a character limit are marked and counted.

Sources of truth: `app.json` (version, bundle, permissions), `src/` (what the
app actually does), [CREDITS.md](CREDITS.md) (content rights),
[MARKETING.md](MARKETING.md) (positioning, ASO, the trademark line).

**Read the two blockers at the bottom before attesting to anything.**

---

## App record

| Field | Value | Basis |
|---|---|---|
| App name | Number Nine | `app.json` |
| Bundle ID | `com.numbernine.app` | `app.json` |
| Apple ID | 6796237101 | existing app record |
| Team | 75ULC33H2C | existing app record |
| Version | 1.0.0 | `app.json` |
| Build | 1 | `app.json` — bump per upload |
| Primary language | English (U.K.) | the prose is British, `lang="en-GB"` on the site |
| Devices | iPhone only | `supportsTablet: false` |
| Orientation | Portrait only | deliberate: text rotates, the OS never does |
| Appearance | Dark only | `userInterfaceStyle: "dark"` |

**Category.** Primary **Games › Adventure**, secondary **Games › Puzzle**.
Note the deliberate split: MARKETING.md forbids the phrase "puzzle game" in
customer-facing copy, but the *category* is a discovery mechanism rather than
a positioning statement, and Puzzle is where people looking for this actually
browse. Books is wrong — this is not a reading app.

---

## Store copy

Never in any of these fields: DEVICE 6, Simogo, "puzzle game", "AI",
"hyper-casual" (MARKETING.md trademark guardrails and voice rules). Also not
in these fields: any claim about accessibility beyond text size. VoiceOver was
descoped (Simon, 2026-07-30), so "accessible" is not ours to say — that is a
standing decision, not a pending task. See MARKETING.md's Channel 4 for the
honest answer if it is ever asked directly.

**Subtitle** (30 max, 26 used)

```
A shortwave horror novella
```

**Promotional text** (170 max, 159 used — editable without a new build)

```
Broadcast One is free. Tonight's signal is free forever: a new cryptogram every night, the same one for every listener on earth, and it is telling you a story.
```

**Keywords** (100 max, 97 used — comma-separated, no spaces, never repeat the app name)

```
numbers station,shortwave,cryptogram,interactive fiction,novella,decode,typography,offline,no ads
```

**Description** (4000 max, 1832 used)

```
A story you receive, not read.

Your estranged brother is dead. He has left you a house where the land gives up and becomes marsh, a war-surplus shortwave receiver, and nineteen years of listening logs. On the fourteenth of June his entries stop mid-sentence, and every night after it is blank.

Tune the set. There is a station where none should be: six notes like a music box running down, and then a woman counting in groups of five. She has been counting for nineteen years. Tonight she says your name.

NUMBER NINE is a typographic horror novella in six broadcasts. The text is the architecture — it turns, mirrors, goes down staircases and climbs back up them, and you turn the phone in your hands to follow it. The house asks things of you and it asks fairly: a wall that knocks and waits to be answered, an aerial that must be brought round in the dark until the wire will sing, ink too shy to surface under a bright lamp. Nothing here is a quiz. It is the story insisting that you take part in it.

BROADCAST ONE IS FREE — the whole first chapter, start to end.
The remaining five unlock with one purchase. Paid once. Never a subscription.

TONIGHT'S SIGNAL — free forever
Every night the station transmits a new cryptogram, the same one for every listener in the world, and every night it is one more page of a dead man's log: the year before Broadcast One, told a night at a time. A few minutes to solve. Keep a streak and you are reading a second story, in order, as it airs. You never have to buy anything to receive it.

WHAT IT DOES NOT DO
No advertising. No tracking. No account. No timers, no energy, no nagging. It works with the aeroplane switch on — dark room, headphones, one broadcast a night, which is how it was built to be read.

Sound is atmosphere and never information. Everything is solvable in silence.
```

**What's New** (1.0)

```
First transmission.
```

**Copyright**

```
© 2026 Simon Shih
```
Confirm the name — this and `PUBLISHER` in `site/build.ts` should match.

**URLs** — all three on the Society site (upload in progress via the
SimonBuilds session):

- Marketing: `https://numbernine.simonbuilds.app`
- Support: `https://numbernine.simonbuilds.app/support/`
- Privacy policy: `https://numbernine.simonbuilds.app/privacy/`

---

## App Privacy

One data type, and this is the whole label:

| Question | Answer |
|---|---|
| Data collected | **Purchases → Purchase History**, and nothing else |
| Purposes | App Functionality *and* Analytics |
| Linked to identity | **No** |
| Used for tracking | **No** |

Basis: the only third party that receives anything is RevenueCat, validating
the App Store receipt. [proAccess.ts:54](src/proAccess.ts:54) calls
`configure({ apiKey })` with no `appUserID` and never calls `logIn`, so the
purchase is filed against a randomly generated anonymous ID — there is no
email or name in the app to link it to. Both purposes are required by
[RevenueCat's Apple disclosure guide](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy):
Analytics covers their dashboard, App Functionality covers receipt validation
and entitlements.

Everything else is **Data Not Collected**. There is no analytics SDK, no crash
reporter and no ad SDK in `package.json`, and not a single `fetch` or
`XMLHttpRequest` anywhere in `src/` — the app has no server of its own.

Identifiers are *not* declared: no custom user ID, no IDFA, no attribution
integration.

---

## Age rating

No profanity anywhere in the book or the 365 nightly transmissions (scanned).
No violence is depicted, no sexual content, no alcohol/tobacco/drugs, no
gambling, no contests, no user-generated content, no messaging, no ads.

The one substantive answer is **Horror/Fear Themes — Frequent/Intense**. Dread
is the entire product: a dead wife counting on the radio, a séance, a grave, an
ending in which the reader breaks the set. Answering "infrequent/mild" to sell
a lower tier would be false, and horror readers are not deterred by the badge.

**Unrestricted web access: No.** The app opens exactly one external URL — the
Society archive, behind a confirmation dialogue
([SettingsScreen.tsx:28](src/screens/SettingsScreen.tsx:28)). That is a link,
not a browser.

Simon should confirm the resulting tier in ASC; it is computed from the
answers, not chosen.

---

## In-app purchase

| Field | Value |
|---|---|
| Product ID | `nn_story_unlock` |
| Apple ID | 6796237695 |
| Type | Non-consumable |
| Display name | The Licence |
| Description | The rest of the story: Broadcasts Two to Six |
| Price | $5.99 base US (README) — confirm the tier in ASC |
| Territories | All 175 |

**It cannot be submitted alone.** ASC's own note on the product page: the first
non-consumable must be submitted *with* a new app version. Do not press "Add
for Review" independently. The review screenshot is already accepted.

---

## Export compliance

`ITSAppUsesNonExemptEncryption: false` in `app.json`. Answer **no** to the
encryption question; no documentation is required.

---

## Notes for App Review

Paste this into the review notes field. It exists because a reviewer who
cannot open the first gate will file the app as broken.

```
No account or login is required. Nothing is time-limited.

Broadcast One is free in full. It contains ten gates, and a reviewer is not
expected to solve them — here are the answers, in order, so you can reach the
purchase point quickly:

1. Study wall: tap the framed watercolour on the LEFT of the wall, about a
   third of the way down. It swings open on a hinge.
2. Desk safe: 1963
3. Radio dial: tune to 4625 kHz
4. Decode slate: NINE
5. Music box: strike the tines 1 - 2 - 3 - 1 - 3 - 4
6. Cellar wall: tap LOW on the left, beneath the small barred window
7. Tin box: 5264
8. Telephone: 295
9. Fill the card: 91
10. Last transmission: MARGARET

The in-app purchase ("The Licence", nn_story_unlock, non-consumable) unlocks
Broadcasts Two to Six. It is offered at the end of Broadcast One and from the
title screen. Restore is under "the set" on the title screen.

Two things that look like faults and are not:
- The app is portrait-locked and dark-only by design. Text inside the story
  rotates and mirrors — the reader is meant to turn the device, while the
  interface itself does not.
- Sound is atmosphere, never information. The story is fully completable in
  silence, and audio failing is not an error state.

Some puzzles read the compass or the motion sensors. Every one of them also
has a touch alternative, so no gate requires physically moving the device.
The app requests no permissions.
```

---

## Screenshots

1242 × 2688 or 1290 × 2796, **no alpha channel, 72 dpi**. macOS screenshots are
RGBA at 144 dpi, and ASC reports both problems as *"The dimensions of one or
more screenshots are wrong"*, which sends you hunting pixel sizes instead.
Convert to JPEG (which cannot carry alpha) and set 72 dpi. This cost a session
already.

Content per MARKETING.md: read as a haunted hardcover, not an app. No
gameplay-video framing.

---

## ⛔ Two blockers before submission

**1. Content rights — unresolved, and this is an attestation.** ASC makes you
declare that you hold the rights to everything in the build. Right now only
one audio asset has a real paper trail: `title-theme.m4a`, under a purchased
Tim Beek Premium License. [CREDITS.md](CREDITS.md) carries its own pre-ship
warning that the remaining SFX have *filenames as their only provenance* — and
four of them (`murmur.wav`, `parish.wav`, `break-set.wav`, and the `spark.wav`
source) were pulled from **YouTube via yt-dlp**. An uploader captioning a video
"free sound effect" does not grant a commercial licence, and ripping audio from
YouTube is against its terms regardless. These need a verifiable source page
and licence each, or replacing with something from a library that issues a
licence document. Attesting to content rights before that is a false
declaration.

**2. RevenueCat is not live.** The build still carries
`REVENUECAT_IOS_KEY_PLACEHOLDER`, which means `proAccess.ts` fails open and the
paid broadcasts are FREE. Shipping this build sells nothing. The purchase flow
itself is also still unmerged ([PR #31](https://github.com/texas0418/number-nine/pull/31)).

---

## Everything else, in order

1. Resolve the two blockers above.
2. `PUBLISHER` / `SUPPORT_EMAIL` confirmed in `site/build.ts`; privacy and
   support pages live at the URLs above.
3. Screenshots and preview video.
4. **Featuring Nomination — at least three weeks before launch.** The only
   hard deadline in the project.
