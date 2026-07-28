// src/engine/reveal.ts
// Pure module (no expo/react imports): the reveal math for a chapter scroll.
// Gates (radio, fork) stop the reveal until solved; the persisted furthest
// block index reconstructs which gates were passed on resume.

import type { ChapterBlock } from '../models';

export const GATE_KINDS = [
  'radio',
  'fork',
  'keypad',
  'safe',
  'cipher',
  'melody',
  'hotspot',
  'knock',
  'flip',
  'lamp',
  'rotary',
  'clock',
  'compass',
] as const;

export const isGate = (b: ChapterBlock): boolean =>
  (GATE_KINDS as readonly string[]).includes(b.kind);

/** Blocks visible given the set of solved gate indices: everything up to and
 *  including the first unsolved gate. */
export function visibleCount(blocks: ChapterBlock[], solved: Set<number>): number {
  for (let i = 0; i < blocks.length; i++)
    if (isGate(blocks[i]) && !solved.has(i)) return i + 1;
  return blocks.length;
}

/** PERSISTENCE index: the first UNSOLVED gate's index (or blocks.length when
 *  none remain). Persist THIS, not visibleCount — visibleCount includes the
 *  pending gate, so restoring from it marked that gate as already solved
 *  (the resume-skips-a-puzzle bug). */
export function progressIndex(blocks: ChapterBlock[], solved: Set<number>): number {
  for (let i = 0; i < blocks.length; i++)
    if (isGate(blocks[i]) && !solved.has(i)) return i;
  return blocks.length;
}

/** Gate indices below a resume point — reconstructs solved gates from the
 *  persisted furthest-block index. */
export function solvedGatesBefore(
  blocks: ChapterBlock[],
  blockIndex: number,
): Set<number> {
  const out = new Set<number>();
  blocks.forEach((b, i) => {
    if (i < blockIndex && isGate(b)) out.add(i);
  });
  return out;
}
