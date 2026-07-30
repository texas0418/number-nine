// site/build.ts — generates the static Listeners' Society site into site/dist.
//
//   npm run site
//
// Output is plain HTML and one stylesheet: no JavaScript, no framework, no
// build tooling on the server. The three graded reveals are <details>
// elements, which means they work with the keyboard, with VoiceOver, and
// with scripting switched off entirely — the same accessibility bar the app
// is being held to.
//
// Every page is written with RELATIVE links so the output can be dropped at
// a domain root (numbernine.simonbuilds.app) or inside a subfolder
// (simonbuilds.app/numbernine) without a rebuild. See site/README.md for the
// SiteGround upload steps.

import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BROADCAST_ONE } from '../src/chapters/broadcast1';
import { BROADCAST_TWO } from '../src/chapters/broadcast2';
import { BROADCAST_THREE } from '../src/chapters/broadcast3';
import { BROADCAST_FOUR } from '../src/chapters/broadcast4';
import { BROADCAST_FIVE } from '../src/chapters/broadcast5';
import { BROADCAST_SIX } from '../src/chapters/broadcast6';
import { SECTIONS } from './clues';
import type { ArchiveSection, Intercept } from './types';
import { slugify, verifyArchive } from './verify';

const CHAPTERS = [
  BROADCAST_ONE,
  BROADCAST_TWO,
  BROADCAST_THREE,
  BROADCAST_FOUR,
  BROADCAST_FIVE,
  BROADCAST_SIX,
];

const SITE_NAME = 'The Listeners’ Society';
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'dist');

// ------------------------------------------------------------------ helpers

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const up = (depth: number): string => '../'.repeat(depth);

interface Page {
  /** Path under dist, e.g. 'archive/broadcast-one/index.html'. */
  path: string;
  title: string;
  description: string;
  depth: number;
  body: string;
  /** Index pages take the wider frame so their card grid can use it. Reading
   *  pages never do — prose stays at the book measure. */
  wide?: boolean;
}

function layout(page: Page): string {
  const base = up(page.depth);
  // The front page IS the Society; suffixing it with its own name reads as a
  // bug in a browser tab and in a search result.
  const title =
    page.title === SITE_NAME ? SITE_NAME : `${page.title} · ${SITE_NAME}`;
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="theme-color" content="#0b0e0c">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<div class="wrap${page.wide ? ' wrap--wide' : ''}">
<header class="masthead">
<a href="${base}index.html">
<p class="masthead__name">${esc(SITE_NAME)}</p>
<hr class="masthead__rule">
<p class="masthead__sub">Established 1963 · Correspondence only</p>
</a>
</header>
${page.body}
<footer class="colophon">
<p><a href="${base}index.html">The Society</a> · <a href="${base}archive/index.html">The archive</a> · <a href="${base}about/index.html">About these notes</a></p>
<p>Number Nine is a work of fiction. So is the Society.</p>
</footer>
</div>
</body>
</html>
`;
}

const paras = (text: string, cls = 'prose'): string =>
  text
    .split('\n\n')
    .map((p) => `<p class="${cls}">${esc(p.trim())}</p>`)
    .join('\n');

// -------------------------------------------------------------- the pages

function interceptPage(
  section: ArchiveSection,
  intercept: Intercept,
  index: number,
  siblings: Intercept[],
): Page {
  const sectionSlug = slugify(section.title);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];

  const pager = `<nav class="pager">
<span>${prev ? `<a href="../${slugify(prev.heading)}/index.html">← ${esc(prev.heading)}</a>` : ''}</span>
<span>${next ? `<a href="../${slugify(next.heading)}/index.html">${esc(next.heading)} →</a>` : ''}</span>
</nav>`;

  return {
    path: `archive/${sectionSlug}/${slugify(intercept.heading)}/index.html`,
    title: intercept.heading,
    description: intercept.standfirst,
    depth: 3,
    body: `<main>
<p class="label">${esc(section.title)} · Intercept ${index + 1} of ${siblings.length}</p>
<h1 class="title">${esc(intercept.heading)}</h1>
<p class="subtitle">${esc(section.subtitle)}</p>
<p class="standfirst prose">${esc(intercept.standfirst)}</p>

<hr class="section-rule">

<details class="step">
<summary>One · Where to listen</summary>
<div class="step__body">${paras(intercept.where)}</div>
</details>

<details class="step">
<summary>Two · What the older members say</summary>
<div class="step__body">${paras(intercept.members, 'prose voice')}</div>
</details>

<details class="step step--transcript">
<summary>Three · The transcript</summary>
<div class="step__body">
<p class="warning">This prints the answer itself, and it cannot be unread. Members who have come this far are usually one reading away from the thing they wanted — step two is often enough on a second look.</p>
<details class="confirm">
<summary>Print the transcript</summary>
<div>${paras(intercept.transcript, 'answer')}</div>
</details>
</div>
</details>

${pager}
<a class="backlink" href="../index.html">← All of ${esc(section.title.toLowerCase())}</a>
</main>`,
  };
}

function sectionPage(section: ArchiveSection): Page {
  const cards = section.intercepts
    .map(
      (i, n) => `<a class="card" href="${slugify(i.heading)}/index.html">
<span class="card__no">Intercept ${n + 1}</span>
<span class="card__name">${esc(i.heading)}</span>
<span class="card__note">${esc(i.standfirst)}</span>
</a>`,
    )
    .join('\n');

  return {
    path: `archive/${slugify(section.title)}/index.html`,
    title: `${section.title} — ${section.subtitle}`,
    description: `The Society's notes on ${section.title.toLowerCase()}, graded so that nothing is given away by accident.`,
    depth: 2,
    wide: true,
    body: `<main>
<h1 class="title">${esc(section.subtitle)}</h1>
<p class="subtitle">${esc(section.title)} · ${section.intercepts.length} intercepts</p>
${paras(section.preamble)}
<hr class="section-rule">
<div class="cards">${cards}</div>
<a class="backlink" href="../index.html">← The whole archive</a>
</main>`,
  };
}

function archiveIndexPage(sections: ArchiveSection[]): Page {
  const cards = sections
    .map(
      (s) => `<a class="card" href="${slugify(s.title)}/index.html">
<span class="card__no">${esc(s.title)} · ${s.intercepts.length} intercepts</span>
<span class="card__name">${esc(s.subtitle)}</span>
<span class="card__note">${esc(s.preamble.split('.')[0])}.</span>
</a>`,
    )
    .join('\n');

  return {
    path: 'archive/index.html',
    title: 'The archive',
    description:
      'Graded notes on every intercept in the ninety-one, kept by the Society for members in difficulty.',
    depth: 1,
    wide: true,
    body: `<main>
<h1 class="title">The archive</h1>
<p class="subtitle">Six broadcasts · ${sections.reduce((n, s) => n + s.intercepts.length, 0)} intercepts</p>
<p class="prose">Each intercept opens in three stages, and no stage opens itself. The first re-aims your attention. The second is a member of longer standing saying the thing plainly. The third is a transcript, and the Society would rather you did not need it.</p>
<p class="aside">Take the first. Put the book down. Come back to the second only if the first was not enough.</p>
<hr class="section-rule">
<div class="cards">${cards}</div>
<a class="backlink" href="../index.html">← The Society</a>
</main>`,
  };
}

function frontPage(sections: ArchiveSection[]): Page {
  return {
    path: 'index.html',
    title: SITE_NAME,
    description:
      'A shortwave listeners’ circle, keeping graded notes on the ninety-one broadcasts. Clues, never solutions.',
    depth: 0,
    wide: true,
    body: `<main>
<h1 class="title">Clues, never solutions</h1>
<p class="subtitle">A circle of listeners, keeping notes since 1963</p>
<p class="prose">We are a correspondence society of people who sit up with receivers. When a member writes to us stuck on one of the ninety-one — and they do write, at unsociable hours, in handwriting that has plainly been at it a while — we send back the least we can get away with.</p>
<p class="prose">That is the whole of our method, and it is a courtesy rather than a cruelty. A puzzle handed to you is a puzzle spent. So the notes in our archive open in three stages, each behind its own door, and you choose how far in to go. Most members find they only ever needed the first.</p>
<p class="aside">Nothing here opens by itself. Nothing here is printed where a search engine can find it.</p>
<hr class="section-rule">
<div class="cards">
<a class="card" href="archive/index.html">
<span class="card__no">The archive</span>
<span class="card__name">All ${sections.reduce((n, s) => n + s.intercepts.length, 0)} intercepts</span>
<span class="card__note">Graded notes on every gate in the six broadcasts, in the order a listener meets them.</span>
</a>
<a class="card" href="about/index.html">
<span class="card__no">About these notes</span>
<span class="card__name">How the Society works</span>
<span class="card__note">Why we grade our help, what we will not publish, and who is actually writing this.</span>
</a>
</div>
</main>`,
  };
}

function aboutPage(): Page {
  return {
    path: 'about/index.html',
    title: 'About these notes',
    description:
      'Why the Society grades its help, what it will not publish, and the plain colophon behind the fiction.',
    depth: 1,
    body: `<main>
<h1 class="title">About these notes</h1>
<p class="subtitle">The method, and the plain facts behind it</p>

<p class="prose">Every note in the archive is written in three stages. The first names where to put your attention and carefully names nothing else. The second is a member of longer standing telling you the thing more or less plainly — enough to solve from, if you are holding the pieces and have not yet joined them. The third is a transcript of the answer, and it sits behind a second door with a warning on it, because a member who opens it by accident has lost something they cannot be given back.</p>

<p class="prose">We do not publish a solutions page. Others will, and we bear them no ill will; it is simply not what this Society is for. Nor do we print an answer anywhere a search engine can reach it — not in a page title, not in a web address, not in the summary a search result shows you. If you arrive here from a search, you will arrive at a closed door.</p>

<hr class="section-rule">

<p class="label">The colophon</p>
<p class="prose">The Society is a fiction, and so is every member quoted in the archive. Number Nine is a typographic horror novella for iPhone: six broadcasts, a free first chapter, and a nightly cryptogram that goes out to everyone at once. It has no advertising and no tracking, and it works with the aeroplane switch on — which is, as it turns out, how it is best played.</p>
<p class="prose">The notes are maintained alongside the book itself, so a puzzle cannot quietly change out from under its own annotation.</p>

<a class="backlink" href="../index.html">← The Society</a>
</main>`,
  };
}

// -------------------------------------------------------------------- build

function main(): void {
  const { problems, intercepts } = verifyArchive(CHAPTERS, SECTIONS);
  if (problems.length) {
    console.error('The archive does not match the book:\n');
    for (const p of problems) console.error(`  ${p}`);
    console.error(`\n${problems.length} problem(s). Nothing written.`);
    process.exit(1);
  }

  const pages: Page[] = [frontPage(SECTIONS), archiveIndexPage(SECTIONS), aboutPage()];
  for (const section of SECTIONS) {
    pages.push(sectionPage(section));
    section.intercepts.forEach((intercept, n) =>
      pages.push(interceptPage(section, intercept, n, section.intercepts)),
    );
  }

  for (const page of pages) {
    const full = join(OUT, page.path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, layout(page), 'utf8');
  }
  copyFileSync(join(HERE, 'style.css'), join(OUT, 'style.css'));

  console.log(`${pages.length} pages · ${intercepts} intercepts · ${OUT}`);
}

main();
