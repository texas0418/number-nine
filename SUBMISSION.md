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

1. **Support email + publisher name** — `SUPPORT_EMAIL` and `PUBLISHER` in
   `site/build.ts`, currently `support@simonbuilds.app` and `Simon Shih`. Now
   merged to `dev`, so whatever builds the site next publishes them.
2. **Primary language: English (U.K.)** — the prose is British throughout and
   the site is `lang="en-GB"`. U.S. English would be the larger market's default
   but would sit oddly against "aeroplane" and "kilocycle".
3. **Category: Games › Adventure, secondary Games › Puzzle** — see the note in
   the app-record section on why Puzzle is acceptable as a category while banned
   as a phrase.
4. **Price tier: $5.99 base US**, per the README. Confirm the tier in ASC; the
   product itself is already created and localised.
5. **Age rating tier** — ASC computes it from the answers above. Confirm what it
   produces rather than choosing it.

## Everything else, in order

1. RevenueCat: the real key, and [PR #31](https://github.com/texas0418/number-nine/pull/31) merged.
2. `PUBLISHER` / `SUPPORT_EMAIL` confirmed in `site/build.ts`; privacy and
   support pages live at the URLs above.
3. Screenshots and preview video.
4. **Featuring Nomination — at least three weeks before launch.** The only
   hard deadline in the project.
