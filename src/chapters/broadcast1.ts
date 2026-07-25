// src/chapters/broadcast1.ts
// Broadcast One — the free chapter. PLACEHOLDER PROSE: the beats and the
// mechanics are the design; the sentences are scaffolding to be rewritten
// (pre-ship checklist). The chapter must stay a working tour of the engine:
// prose, logbook, both voice flavors, a rotated descent, a fork, and the
// radio gate, with audio cues along the way.

import type { Chapter } from '../models';

export const BROADCAST_ONE: Chapter = {
  id: 1,
  title: 'BROADCAST ONE',
  blocks: [
    {
      kind: 'prose',
      text: 'The parcel arrived on a Tuesday, six weeks after the funeral: a shortwave receiver wrapped in oilcloth, and a logbook with water-swollen pages. Edwin Marsh signed for both. The delivery man did not meet his eyes.',
      cue: 'silence',
    },
    {
      kind: 'prose',
      text: 'His brother had been a listener. Not a talker — Halloran had never once telephoned — but a listener of the patient, nocturnal kind, the kind that keeps a pencil sharpened.',
    },
    {
      kind: 'logbook',
      lines: [
        'LISTENING LOG — H. MARSH',
        '11 JUNE 63 — 2314 — ident, then counting. 90 groups.',
        '12 JUNE 63 — 2314 — ident, then counting. 90 groups.',
        '13 JUNE 63 — 2314 — she said the song was for me',
        '14 JUNE 63 —',
      ],
    },
    {
      kind: 'prose',
      text: 'The fourteenth of June was blank. Every night after the fourteenth of June was blank. Edwin put the logbook down and looked at the radio for a long time.',
    },
    {
      kind: 'prose',
      text: 'He carried it down to the cellar, where the mains socket was, and where the house kept its cold.',
      cue: 'static-swell',
    },
    {
      kind: 'rotated',
      text: 'The cellar stairs went down eleven steps, and the dark came up to meet him at the sixth, and from below — faint, patient, already switched on — something was humming in six notes.',
    },
    {
      kind: 'prose',
      text: 'The receiver sat on the workbench. Its dial lamp was lit. Edwin had not yet plugged it in.',
    },
    {
      kind: 'logbook',
      lines: [
        'MARGIN NOTE, DIFFERENT HAND:',
        'the station lives at 4625',
        'do not let her finish the count',
      ],
    },
    {
      kind: 'radio',
      id: 'b1-tune',
      bandLowKhz: 4400,
      bandHighKhz: 4800,
      targetKhz: 4625,
      lockedText: 'drag to tune · the static thins where the carrier is',
      unlockedText: 'carrier locked · she is singing',
      cue: 'static-swell',
    },
    {
      kind: 'voice',
      text: 'NINE. NINE. NINE. GOOD EVENING, LISTENER.',
      mirrored: false,
      cue: 'ident',
    },
    {
      kind: 'prose',
      text: 'The voice was a woman’s, flat as a pressed flower. She sang six notes — a music box winding down — and then she began to count. Edwin found the pencil in his hand without remembering picking it up.',
    },
    {
      kind: 'prose',
      text: 'Ninety groups of five. When it ended, the static closed over the frequency like water over a stone. And Edwin, who had a train to catch in the morning and no earthly reason to stay in a cold cellar, stayed in the cold cellar.',
      cue: 'silence',
    },
    {
      kind: 'fork',
      leftLabel: 'READ THE LOG',
      left: 'He opened Halloran’s logbook to the blank fourteenth of June, and found it was not blank anymore. Tonight’s date was written there. In pencil. In his own hand.',
      rightLabel: 'SEARCH THE BENCH',
      right: 'Under the bench, a biscuit tin: ninety index cards, each a night, each transcribed in Halloran’s neat columns. The last card was dated tomorrow.',
      join: 'Either way, the arithmetic was the same. The station had been counting toward something, and the something had a date, and the date was close.',
    },
    {
      kind: 'voice',
      text: 'FIVE. NINE. TWO. EDWIN.',
      mirrored: true,
    },
    {
      kind: 'prose',
      text: 'He had not told the radio his name.',
      faded: false,
    },
    {
      kind: 'prose',
      text: 'Upstairs, faintly, the telephone began to ring.',
      faded: true,
      cue: 'static-swell',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST ONE' },
  ],
};
