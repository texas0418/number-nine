# The Listeners' Society — the clue site

A static site: the Society's graded notes on all 50 puzzle gates across the
six broadcasts. Decided in issue #8; built after the book went
content-complete so the notes match shipped reality.

**Clues, not a walkthrough.** Every intercept opens in three stages, each
behind its own disclosure, and the third sits behind a second confirm:

1. *Where to listen* — re-aims attention, names no answer.
2. *What the older members say* — the real nudge, in a member's voice.
3. *The transcript* — the answer, plainly.

The site is the SECOND line of help. The first is the in-app pressure valve
(`Chapter.hints`), which surfaces a margin note after a reader has been stuck
at a gate for a long while.

## Build

```bash
npm run site
```

Writes `site/dist/` — plain HTML plus one stylesheet. No JavaScript at all:
the three reveals are `<details>` elements, so they work with the keyboard,
with VoiceOver, and with scripting off. `dist/` is gitignored; it is a build
artefact, not source.

The build refuses to write anything if the archive has drifted from the book.
`npm test` runs the same checks (`test-site.ts`).

## Deploying to SiteGround

`simonbuilds.app` is on SiteGround (nginx), not GitHub Pages — the pattern
used by the other app sites does not apply here.

1. In Site Tools, create the subdomain `numbernine.simonbuilds.app`. It gets
   its own document root, typically `public_html/numbernine`.
2. `npm run site`.
3. Upload the **contents** of `site/dist/` (not the folder itself) into that
   document root — File Manager, or SFTP/rsync if you prefer.
4. Issue a Let's Encrypt certificate for the subdomain and turn on HTTPS
   enforcement.

Links are all relative, so the same build also works unchanged in a
subfolder (`simonbuilds.app/numbernine/`) if you would rather not add a
subdomain.

## Layout

Two frames, and the distinction is deliberate:

- **Reading pages** (intercepts, About) sit at `--measure`, 36rem — about 75
  characters a line. Prose set to the window loses the reader on every
  carriage return, and DESIGN.md is explicit that whitespace is doing work
  here rather than going to waste.
- **Index pages** (front, archive, each broadcast) take `--measure-wide`,
  52rem, and lay their cards out two-up above 46rem. Cards are short and
  scannable, so they can use width that paragraphs cannot. Any real prose on
  those pages is pulled back to the reading measure and centred.

Prose is justified but **not** hyphenated: React Native does not hyphenate,
so the book never breaks a word, and turning hyphens on made the site read as
a different typesetter's work.

## Keeping it honest

`site/verify.ts` is the guard, and it runs in both the build and the tests:

- **Coverage** — every puzzle gate in `src/chapters` has exactly one
  intercept, in book order, and no intercept describes a gate that no longer
  exists. Gates that are ACTS rather than puzzles (`fork`, `endingfork`,
  `seal`) are deliberately excluded; they cannot be failed, so they cannot
  strand anybody.
- **Leaks** — a gate's answer may appear only in its `transcript`. Never in a
  heading, a standfirst, a URL slug, or steps one or two. Headings and slugs
  matter most: a search result must never spoil a gate for somebody who never
  opened the page.

Answers are matched whole-word, so the answer NINE does not trip on
"nineteen years". Deliberately unchecked: `hour`, `minute` and pace/bearing
figures, which the fiction says out loud constantly and legitimately.

If a playtest round changes an answer, the build breaks until the note is
rewritten. That is the point of it.

## Not yet built

- Game page, privacy, support and press kit (issue #8 also parks these here).
  Privacy in particular wants care: the app is offline and ad-free, but
  RevenueCat handles the IAP, so "zero tracking" needs verifying against what
  that SDK actually collects before anything is published.
- Real photography. The scene art in `assets/scenes/` is Gemini placeholder
  work (see ART.md) and none of it appears here — a public site is where art
  gets judged, and for the hotspot gates the image *is* the puzzle.
