# The Listeners' Society — the clue site

A static site: the Society's graded notes on all 50 puzzle gates across the
six broadcasts. Decided in issue #8; built after the book went
content-complete so the notes match shipped reality.

**Clues, not a walkthrough.** Every intercept opens in three stages, each
behind its own disclosure, and the third sits behind a second confirm:

1. *Where to listen* — re-aims attention, names no answer.
2. *What the older members say* — the real nudge, in a member's voice.
3. *The transcript* — the answer, plainly.

The site is the ONLY line of help (Simon, 2026-07-30). The book itself never
prompts, hints, or eases up — a reader in difficulty has to choose to leave the
story and come here. Broadcasts One and Two carry no in-app notes and are not
to be given any.

It also carries the two plain-English pages App Review and readers need —
**Privacy** (`privacy/`) and **Support** (`support/`) — which deliberately drop
the 1963 voice. Two constants at the top of `build.ts` are published on those
pages: `SUPPORT_EMAIL` is confirmed (`support@simonbuilds.app`, Simon
2026-07-30, and the mailbox must exist because ASC uses it as the support
contact); `PUBLISHER` is not yet confirmed — check it before uploading.

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

## Structure

Issue #8 is explicit that this domain IS the official game page and the Society
archive is a section of it, so:

| Path | What | Masthead |
|---|---|---|
| `/` | The game page. Premise, what you get, store link, cards out to everything else | plain |
| `/society/` | The Society's own front, "Clues, never solutions" | 1963 |
| `/archive/` | All 50 intercepts, six sections deep | 1963 |
| `/about/` | How the Society grades its help, plus the colophon | 1963 |
| `/press/` | Press kit: fact sheet, descriptions, assets, spoiler policy | plain |
| `/privacy/` | Privacy notice | plain |
| `/support/` | Support | plain |

Two mastheads, and the split is deliberate. Pages App Review and journalists read
speak as the publisher; a fictional 1963 letterhead over a privacy notice is a
worse joke than it is a flourish. Pages a stuck reader visits keep the fiction.

`APP_STORE_URL` at the top of `build.ts` is EMPTY until launch. A store link that
404s on the front page is worse than no link, so `storeCta` prints a "coming
soon" line instead. Set it on release day and rebuild.

Note that moving the Society front from `/` to `/society/` added a URL rather
than breaking one: `/archive/`, `/about/`, `/privacy/` and `/support/` are all
unchanged, so nothing already published or linked goes dead.

## Not yet built

- The trailer. The game page has no video embed yet because there is no video;
  it wants a slot above the cards when there is one.
- `simonbuilds.app` itself, the plain publisher front (issue #8: games and
  contact, what App Review and a licence paper trail expect). That is the
  parent domain rather than this subdomain, and a separate upload.
- Real photography is NOT outstanding. The Gemini scene art ships (Simon,
  2026-07-30, terms checked for commercial use). None of it appears on the site
  yet, though, and for the hotspot gates the image *is* the puzzle, so putting
  scene art on a public page needs a spoiler decision first.
