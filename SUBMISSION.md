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

Adventure is where narrative-led games sit, and it is the honest fit: the book is
a story first and its gates serve the story. It is also a less brutal browse
category than Puzzle, which is among the largest on the store.

Games rather than Books, even though this is a novella. Books is for reading
apps, and more practically the Apple editorial rubric MARKETING.md is aiming at
(Channel 4: gameplay, art, sound, replayability, value) is the games rubric. A
featuring nomination wants to be in front of that team.

Note the deliberate split with the voice rules: MARKETING.md forbids the phrase
"puzzle game" in customer-facing copy, but a category is a discovery mechanism
rather than a positioning statement, and Puzzle is where people who want this
actually browse.

**The one real alternative** is `Games › Word` for the secondary slot instead of
Puzzle. Word is far smaller, so charting in it is realistic in a way charting in
Puzzle is not, and the nightly cryptogram genuinely is a word puzzle. Against it:
the fifty gates in the book mostly are not word puzzles (a dial, a compass, a
knocking wall, a clock), so a Word browser would arrive with the wrong
expectation. Precision over chart position is the call taken here; the trade is
recorded in case reach matters more later.

None of this is baked into the binary, so it stays revisable after launch.

---

## Store copy

### Two rules that govern every word below

**1. Nothing that tips a puzzle.** Not a method, not a hint, not an answer. An
earlier draft of the description had a section naming what the gates ask for
(dim the lamp, turn the page over, knock back) and it was a hint sheet in a
permanent public listing. Sell the fact that the house asks things of you.
Never say what it asks. Her hour, every frequency and every answer stay out
too. (Simon, 2026-07-30.)

**2. No AI tells.** This copy must not read as machine-written. In practice:
no em dashes (there are zero in the fields below, deliberately); no "it is not
X, it is Y" antithesis; no "as it turns out" or similar hedged flourishes; no
symmetrical triads used as a closer. Where a line can be Simon's own, use his:
the opening, "no ads, no tracking", and the closing "Headphones on. Lights off.
One broadcast a night." are lifted from `SettingsScreen`; "the prose is the map"
is the README's; the counting-voice sentence is the book's own prose. Borrowed
voice cannot sound synthetic.

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

**Promotional text** (170 max, 133 used — editable without a new build)

```
Broadcast One is free. Tonight's signal is free forever: a new cryptogram every night, and every listener on earth gets the same one.
```

**Keywords** (100 max, 96 used — comma-separated, no spaces after commas, never repeat the app name)

```
numbers,station,cryptogram,cipher,analog,haunted,radio,decode,offline,no ads,interactive,fiction
```

Why these and not the obvious ones. Apple indexes the **title, the subtitle and
this field together**, so a word already in the subtitle is dead weight here.
The old field spent 17 of its 100 characters on `shortwave` and `novella`, both
of which the subtitle already supplies.

Apple also builds phrases by combining terms across all three, which is why
single words beat phrases. `analog` + the subtitle's `horror` gives *analog
horror*, a live genre search this book genuinely belongs to. `radio` + the
subtitle's `shortwave` gives *shortwave radio*. `numbers` + `station` gives
*numbers station*, the hook MARKETING.md says travels, without paying for the
space twice.

Deliberately absent: `puzzle` and `horror` alone, which MARKETING.md rules out
as unwinnable against the whole store; `typography`, which nobody searches for
in games; and the app's own name, which the title already indexes.

**Description** (4000 max, 2373 used)

```
A story you receive, not read.

Your estranged brother is dead. He has left you a house where the land gives up and becomes marsh, a war-surplus shortwave receiver, and nineteen years of listening logs kept in a hand that never once wavered. On the fourteenth of June his entries stop mid-sentence. Every night after it is blank.

Tune the set. There is a station where none should be: a music box running down, and then a woman counting in groups of five, unhurried, as though she had every night in the world and meant to spend them one at a time. She has been counting for nineteen years.

Tonight she says your name.

SIX BROADCASTS
One a night. The prose is the map. It turns, it mirrors, it goes down the cellar stairs and climbs back up them, and you turn the phone in your hands to follow it, because the room turned and not the typeface.

Fifty locks stand between the first page and the last. None of them is a quiz, and none is answered by choosing the right option from a list. The house asks things of you and it asks fairly. Nothing it asks for is missing from the book.

WHAT IT ASKS
Patience, and something to write with. Some of these will hold you up for an evening. By the sixth broadcast you will be going back through notes you made in the first. Nothing is timed and nothing can be lost, so an evening spent stuck is an evening spent in the house.

HER VOICE
Recorded, not synthesised. A woman reading numbers in the register of a speaking clock, coming up out of shortwave static. Sound is atmosphere here and never information, so a reader in silence loses nothing but the dread.

BROADCAST ONE IS FREE
The whole first chapter, start to finish. No account, no trial clock. The other five unlock with one purchase, paid once, never a subscription.

TONIGHT'S SIGNAL, FREE FOREVER
Every night the station sends a new cryptogram, and every listener on earth gets the same one. A few minutes to break. Behind a year of them lies a dead man's log, 365 nights of it, in order and a night at a time: the year before Broadcast One, and how a patient man came to be sitting in that cellar. Keep a streak and you are reading a second story for nothing.

No ads. No tracking. No account. No timers, no energy, no notifications. It honours the text size you have set, and it works with the aeroplane switch on.

Headphones on. Lights off. One broadcast a night.
```

**What's New** (1.0)

```
First transmission.
```

**Copyright**

```
© 2026 Simon Shih
```
Confirmed 2026-07-30, and it matches `PUBLISHER` in `site/build.ts`.

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

**The click path**, because this section of ASC is easy to over-answer:

1. App Privacy → *Get Started*.
2. "Do you or your third-party partners collect data from this app?" → **Yes**.
   (Yes, despite collecting nothing about the person — the receipt is data.)
3. Data types → **Purchases** only. Within it, **Purchase History**.
4. Purposes for Purchase History → tick **App Functionality** *and*
   **Analytics**. Both, not one.
5. "Is this data linked to the user's identity?" → **No**.
6. "Do you use this data for tracking purposes?" → **No**.
7. Leave every other category untouched — do not tick Identifiers, Usage Data,
   or Diagnostics. None of them apply.
8. Privacy policy URL → the `/privacy/` page.

If a future build adds analytics, a crash reporter, or `Purchases.logIn`, this
answer stops being true. Nothing else in the app can change it.

### The data-type list: tick Purchases, and nothing else

The governing definition, which settles most of that long page: **"collected"
means transmitted off the device** to you or a third party. Data that only ever
sits in the app's own storage is not collected. Progress, solved gates, streaks
and the signal log are all on-device SQLite, so none of them are disclosable.

The types that look plausible and are still **No**:

| Type | Why not |
|---|---|
| Payment Info | Apple's own note on the page: payment happens outside the app through a payment service and the developer never has access, so it is not Collected |
| User ID | No custom app user identifier is ever set and `logIn` is never called; RevenueCat's guide ties this to custom identifiers |
| Device ID | No IDFA and no advertising integration; their guide ties this to ad ID systems |
| Product Interaction | The trap on this page. "Saved place in a game" is exactly what the app stores, but locally, and never transmits |
| Crash / Performance Data | No crash reporter and no analytics SDK. Apple's own OS-level crash collection is not the developer's to declare |
| Fitness | The other arguable one: `expo-sensors` reads the accelerometer and gyroscope, but in the moment, to open a gate. Never stored, never sent, and not exercise data |
| Coarse Location | No location request at all, and the compass is a magnetometer heading rather than a position. RevenueCat states it does not store IP |
| Audio Data | No microphone; `expo-audio` ships `microphonePermission: false` |
| Gameplay / Other User Content | The nightly share hands text to whichever app the user picks. It never reaches us |

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

Paste this into the App Review Information notes field. Apple is the only reader,
so unlike the store copy this one gives puzzles away freely: a reviewer who
cannot open the first gate files the app as broken, and the free chapter runs ten
puzzles deep before the purchase is even offered.

The four "can look broken" items exist because each is a real rejection risk.
The night gates matter most: Broadcast Six waits for the calendar day to turn,
and a reviewer who meets "come back tomorrow" with no visible way through has
been handed an incomplete app. The wind-the-clock override is verified in
[FinaleGates.tsx:105](src/engine/FinaleGates.tsx:105) — 24 wound hours opens it
immediately.

```
Number Nine is a horror novella in six chapters ("broadcasts"), plus a free
daily cipher puzzle. Broadcast One is free in full; one non-consumable purchase
unlocks Broadcasts Two to Six.

NO SIGN-IN OF ANY KIND
There is no account, no login and no demo credentials to supply. The app has no
server: all progress is stored on the device, and the whole app works in
Airplane Mode. Nothing is time-limited or trial-based.

REACHING THE PURCHASE QUICKLY
Broadcast One contains ten puzzles. You are not expected to solve them, so here
are the answers in order:

 1. Study wall: tap the framed watercolour on the LEFT of the wall, about a
    third of the way down. It swings open on a hinge.
 2. Desk safe: 1963
 3. Radio dial: drag it to 4625 kHz
 4. Decode slate: NINE
 5. Music box: strike the tines 1, 2, 3, 1, 3, 4
 6. Cellar wall: tap LOW on the left, beneath the small barred window
 7. Tin box: 5264
 8. Telephone: 295
 9. Fill the card: 91
10. Last transmission: MARGARET

There is also one fork ("READ THE LOG" or "OPEN THE BENCH"). It is a narrative
choice, not a puzzle, and either option continues the story.

THE IN-APP PURCHASE
"The Licence" (nn_story_unlock), non-consumable, one payment, not a
subscription. It is offered at the end of Broadcast One and from the title
screen. Restore Purchases is on the title screen under "the set". This is the
app's first non-consumable, so it is submitted together with this version.

FOUR THINGS THAT CAN LOOK BROKEN AND ARE NOT

1. Broadcast Six has two gates that wait for a real night to pass. You do not
   have to wait. Drag the dark clock face sideways to wind it forward, and the
   gate opens once you have wound 24 hours. The story acknowledges that you
   hurried, which is intended.

2. Broadcast Five asks you to make the device unreachable, and Broadcast Two
   asks you to reduce screen brightness. Both are story beats, both are
   reversible, and both can also be satisfied by an on-screen control without
   leaving the app or changing system settings.

3. Some puzzles read the compass or the motion sensors. Every one of them also
   accepts touch instead, so no puzzle requires physically moving or shaking the
   device. The app requests no permissions at all.

4. The app is portrait-locked and dark-only by design. Text inside the story
   rotates and mirrors so that the reader turns the device; the interface itself
   deliberately does not rotate.

Audio is atmosphere and never information. Every puzzle is solvable with sound
off, and audio failing is not an error state.

IF YOU WANT TO GO FURTHER
Answers for all fifty puzzles across the six broadcasts are published at
https://numbernine.simonbuilds.app/archive/ (each one behind two taps, so the
page can be read without spoiling anything by accident).
```

Contact information (name, phone, email Apple can reach during review) is
Simon's to fill in and is never shown to customers.

---

## Screenshots

### The size is 1242 × 2688. Do not deduce it again.

This app's version page has **one iPhone slot: 6.5" Display**, accepting
`1242 × 2688` · `2688 × 1242` · `1284 × 2778` · `2778 × 1284`. **Use
1242 × 2688.**

Do *not* target 1290 × 2796. Apple's general guidance says 6.9" is the required
modern set, and that is the wrong answer for this record — an earlier draft of
this very section offered "1242 × 2688 or 1290 × 2796", which is how a session
on 2026-07-30 converted nine shots to the wrong size and had to redo them. The
ASC upload box prints its own accepted sizes; read them off the page.

Simon's screenshots arrive as `~/Downloads/IMG_*.PNG` at **1125 × 2436, 144 dpi**
(iPhone X-class 5.8"), which is not a slot on its own. One command per file:

```bash
sips -s format jpeg -s formatOptions 95 -s dpiWidth 72 -s dpiHeight 72 \
  -z 2688 1242 IMG_6256.PNG --out 01-staircase.jpg
```

- **`-z` takes HEIGHT then WIDTH.** `-z 2688 1242`, not the other way round.
- **72 dpi matters.** Sources are 144. ASC reports a dpi mismatch as *"The
  dimensions of one or more screenshots are wrong"* — which sends you measuring
  pixels that were never the problem. That cost a whole session once.
- **JPEG, not PNG**: JPEG cannot carry alpha, so that failure mode is closed by
  the format rather than by remembering to check.
- **No crop or pad.** Source aspect 2.1653 against the slot's 2.1642 — a straight
  `-z` scale distorts by ~0.05%. The upscale is ~10%, so type stays acceptable.
- Verify: `sips -g pixelWidth -g pixelHeight -g dpiWidth -g hasAlpha out.jpg`.

Content per MARKETING.md: read as a haunted hardcover, not an app. No
gameplay-video framing.

**Two hard rules.** No burned-in marketing copy on the first two shots — the
typography *is* the pitch, and a caption over it says "app" where we want
"book". And **no shot may contain a gate's answer**: not a solved decode slate,
not a tuned dial reading, not a filled card. Screenshots are as public and as
permanent as the store copy, and the same reason we withhold her hour applies.

Shot order, strongest first, because most people see two:

| # | What's on screen | Why it earns the slot |
|---|---|---|
| 1 | The cellar staircase block — the eleven steps typeset as descending stairs | The whole thesis in one image: prose as architecture. Nothing else in the store looks like it. |
| 2 | The mirrored voice line, set reversed on the page | It makes the viewer tilt their head in the store listing. That instinct is the game. |
| 3 | The radio gate, mid-drag, static thinning — **untuned** | Shows the phone behaving as an instrument without giving the frequency. |
| 4 | A listening-log page with the margin notes in the second hand | Proves the artefact texture, and the two rules are legible as *rules* without being answers. |
| 5 | Tonight's Signal, part-solved, with a streak showing | The free hook, and the one thing a browser can act on tonight. |
| 6 | The title screen with the broadcast list | Last, not first. Orientation for anyone still reading. |

Take them on a device at the default text size — the largest Dynamic Type
setting is honest but reads as fewer words per screen than the book usually
gives you.

---

## Content rights

Answer **yes** — the build contains third-party audio, and the rights are held.

Simon checked every sourced clip for commercial-use permission before it went
in and used nothing banned from commercial use (2026-07-30); he is the one
making the declaration. `title-theme.m4a` additionally has a purchased licence
document (Tim Beek Premium, licensee SimonBuilds) which he holds outside this
public repo. Per-asset sourcing is in [CREDITS.md](CREDITS.md).

Not a submission blocker, just worth having: source URLs and licence wording
saved next to the raw files, so a rights query is an afternoon rather than an
excavation.

---

## ⛔ One blocker before submission

**RevenueCat is not live.** The build still carries
`REVENUECAT_IOS_KEY_PLACEHOLDER`, which means `proAccess.ts` fails open and the
paid broadcasts are FREE. Shipping this build sells nothing. The purchase flow
itself is also still unmerged ([PR #31](https://github.com/texas0418/number-nine/pull/31)).

---

## The yes/no fields, answered

| Field | Answer | Why |
|---|---|---|
| App price | **Free** | The app is free; the money is the one IAP |
| Sign-in required | **No** | There is no account anywhere in the app |
| Demo account needed | **No** | Nothing is behind a login |
| Advertising Identifier (IDFA) | **No** | No ad SDK, no attribution integration |
| Content rights: third-party content | **Yes**, rights held | Licensed audio; see Content rights above |
| Export compliance / encryption | **No** | `ITSAppUsesNonExemptEncryption: false` |
| Unrestricted web access | **No** | One confirmed link out, not a browser |
| Availability | All territories | Matches the IAP's 175 |
| Version release | **Manually release** | Launch day has to line up with the marketing beats and the Featuring nomination — do not let review approval publish it for you |
| Attachment for review | None | The review notes carry everything |

Contact information for App Review wants a real name, phone and email that
Apple can actually reach during review. That is Simon's to fill in; it is not
shown to customers.

## Decisions still yours

Recommendations given, none of them load-bearing enough for me to have guessed
in the copy itself:

Both published constants in `site/build.ts` are now settled (Simon, 2026-07-30):
`SUPPORT_EMAIL` is `support@simonbuilds.app` — the mailbox has to exist, because
ASC takes it as the app's support contact — and `PUBLISHER` is `Simon Shih`, the
name the app is signed with and the name in the copyright field. The privacy and
support pages need no further edits before they go up.

1. **Primary language: English (U.K.)** — the prose is British throughout and
   the site is `lang="en-GB"`. U.S. English would be the larger market's default
   but would sit oddly against "aeroplane" and "kilocycle".
2. **Category: Games › Adventure, secondary Games › Puzzle** — see the note in
   the app-record section on why Puzzle is acceptable as a category while banned
   as a phrase.
3. **Price tier: $5.99 base US**, per the README. Confirm the tier in ASC; the
   product itself is already created and localised.
4. **Age rating tier** — ASC computes it from the answers above. Confirm what it
   produces rather than choosing it.

## Everything else, in order

1. RevenueCat: the real key, and [PR #31](https://github.com/texas0418/number-nine/pull/31) merged.
2. `PUBLISHER` / `SUPPORT_EMAIL` confirmed in `site/build.ts`; privacy and
   support pages live at the URLs above.
3. Screenshots and preview video.
4. **Featuring Nomination — at least three weeks before launch.** The only
   hard deadline in the project.
