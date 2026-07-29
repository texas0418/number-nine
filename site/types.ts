// site/types.ts
// The Listeners' Society archive — data model.
//
// The site is the SECOND line of help. The first is the in-app pressure
// valve (Chapter.hints, Halloran's margin voice, surfaced only after the
// reader has been stuck a long while). This archive is what a reader
// reaches for when the margin note was not enough and they have opened a
// browser — so it is allowed to be more explicit than the book ever is.
//
// The governing rule (issue #8, Simon 2026-07-28): CLUES, NOT A WALKTHROUGH.
// The official voice never publishes a raw solutions page. Every intercept
// therefore grades its help in three steps, each behind its own disclosure:
//
//   1. WHERE TO LISTEN          re-aims attention. Names no answer.
//   2. WHAT THE OLDER MEMBERS SAY  the real nudge, in a member's own voice.
//   3. THE TRANSCRIPT           the answer, plainly, behind a second confirm.
//
// Steps one and two must survive being read by accident. Only `transcript`
// may contain the answer, and it is the only field allowed to — enforced in
// test-site.ts, which also checks that no answer leaks into a heading,
// standfirst or URL slug (search previews must never spoil a gate).

/** One catalogued intercept: the Society's annotation of a single gate. */
export interface Intercept {
  /** Gate id from the chapter data (e.g. 'b1-safe'). The join key — every
   *  puzzle gate in src/chapters must have exactly one of these. */
  id: string;
  /** The Society's name for it. Becomes the page slug and <title>, so it
   *  must read as a description of the OBJECT, never of the solution. */
  heading: string;
  /** One line printed openly on the broadcast index, under the heading.
   *  Orientation only — it is the most spoiler-exposed field on the site. */
  standfirst: string;
  /** Step one. Where in the book to put your attention. No answer. */
  where: string;
  /** Step two. A member speaking plainly. The real nudge — enough to solve
   *  from, for a reader who has the pieces and has not joined them. */
  members: string;
  /** Step three. The answer, and how it is arrived at. The only field
   *  permitted to contain it. */
  transcript: string;
}

/** A broadcast's section of the archive. */
export interface ArchiveSection {
  /** Chapter id, 1..6 — joins to src/chapters. */
  chapter: number;
  /** 'BROADCAST ONE' — matches the book. */
  title: string;
  /** The book's own subtitle for the chapter ('The Licence'). */
  subtitle: string;
  /** The Society's standing note on this broadcast, shown on its index. */
  preamble: string;
  /** Intercepts in the order the reader meets them. */
  intercepts: Intercept[];
}

/** Gate kinds the archive deliberately does NOT catalogue: they are ACTS,
 *  not puzzles — a choice or a tearing-open, which cannot be failed and so
 *  cannot strand a reader. Kept here (not inline) because test-site.ts uses
 *  the same list to prove every remaining gate is covered. */
export const UNCLUED_GATE_KINDS = ['fork', 'endingfork', 'seal'] as const;
