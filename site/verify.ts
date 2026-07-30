// site/verify.ts
// Pure checks shared by the site build and test-site.ts. Two jobs:
//
//   1. COVERAGE — every puzzle gate in src/chapters has exactly one
//      intercept, and no intercept describes a gate that no longer exists.
//      This is what stops the archive drifting as chapters are edited.
//   2. LEAKS — no gate's answer appears anywhere a reader could meet it
//      without asking: not in a heading, a standfirst, a URL slug, or in
//      steps one and two. Only `transcript` may carry it. Search engines
//      index headings and slugs, so a leak there spoils the gate for
//      somebody who never visited the page at all.

import type { Chapter, ChapterBlock } from '../src/models';
import { GATE_KINDS } from '../src/engine/reveal';
import { UNCLUED_GATE_KINDS, type ArchiveSection, type Intercept } from './types';

const isGate = (b: ChapterBlock): boolean =>
  (GATE_KINDS as readonly string[]).includes(b.kind);

const isClued = (b: ChapterBlock): boolean =>
  isGate(b) && !(UNCLUED_GATE_KINDS as readonly string[]).includes(b.kind);

/** Gate ids, in book order, that the archive is required to cover. */
export function cluedGateIds(chapter: Chapter): string[] {
  return chapter.blocks
    .filter(isClued)
    .map((b) => (b as { id?: string }).id)
    .filter((id): id is string => typeof id === 'string');
}

/** URL slug for an intercept. Derived from the heading, so a heading that
 *  keeps faith with the no-spoilers rule yields a slug that does too. */
export function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The strings that would spoil a gate if printed.
 *
 *  Deliberately NOT included: `hour`, `minute` and pace/bearing figures.
 *  Those are 23, 14, 9, 90 and the like — numbers the fiction says out loud
 *  constantly and legitimately (2314 kHz, card ninety-one, nine paces east),
 *  so checking them would be all false positives and no signal. */
function answerTokens(block: ChapterBlock): string[] {
  const b = block as Record<string, unknown>;
  const out: string[] = [];
  for (const key of ['answer', 'word', 'targetWord', 'targetKhz', 'mark']) {
    const v = b[key];
    if (typeof v === 'string' || typeof v === 'number') out.push(String(v));
  }
  return out;
}

/** Whole-word, case-insensitive. Word boundaries matter: the answer NINE
 *  must not trip on "nineteen years", which every other paragraph says. */
function mentions(haystack: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

export interface VerifyResult {
  problems: string[];
  intercepts: number;
}

/** Cross-check the archive against the chapters it annotates. */
export function verifyArchive(
  chapters: Chapter[],
  sections: ArchiveSection[],
): VerifyResult {
  const problems: string[] = [];
  let intercepts = 0;

  const blockById = new Map<string, ChapterBlock>();
  for (const c of chapters)
    for (const b of c.blocks) {
      const id = (b as { id?: string }).id;
      if (typeof id === 'string') blockById.set(id, b);
    }

  for (const chapter of chapters) {
    const section = sections.find((s) => s.chapter === chapter.id);
    if (!section) {
      problems.push(`no archive section for chapter ${chapter.id}`);
      continue;
    }
    const required = cluedGateIds(chapter);
    const covered = section.intercepts.map((i) => i.id);

    for (const id of required)
      if (!covered.includes(id))
        problems.push(`${section.title}: gate ${id} has no intercept`);

    for (const id of covered)
      if (!required.includes(id))
        problems.push(`${section.title}: intercept ${id} matches no puzzle gate`);

    if (covered.join('|') !== required.filter((r) => covered.includes(r)).join('|'))
      problems.push(`${section.title}: intercepts are out of book order`);
  }

  const seenSlugs = new Set<string>();
  for (const section of sections)
    for (const intercept of section.intercepts) {
      intercepts++;
      problems.push(...leaksIn(intercept, blockById.get(intercept.id)));

      const slug = `${section.chapter}/${slugify(intercept.heading)}`;
      if (seenSlugs.has(slug))
        problems.push(`duplicate slug ${slug} in ${section.title}`);
      seenSlugs.add(slug);
      if (!slugify(intercept.heading))
        problems.push(`${intercept.id}: heading yields an empty slug`);
    }

  return { problems, intercepts };
}

/** Every field a reader can meet without deliberately opening step three. */
function leaksIn(intercept: Intercept, block: ChapterBlock | undefined): string[] {
  if (!block) return [];
  const problems: string[] = [];
  const exposed: [string, string][] = [
    ['heading', intercept.heading],
    ['slug', slugify(intercept.heading)],
    ['standfirst', intercept.standfirst],
    ['where', intercept.where],
    ['members', intercept.members],
  ];
  for (const token of answerTokens(block))
    for (const [field, text] of exposed)
      if (mentions(text, token))
        problems.push(`${intercept.id}: answer "${token}" leaks in ${field}`);
  return problems;
}
