// src/chapters/broadcast1.ts
// Broadcast One — the FREE chapter, and therefore the whole top of the funnel.
// Its job is to convert: sustain the writing and atmosphere long enough that
// the reader wants Broadcasts Two–Six, and end on a held breath, not a wall.
// This is a full draft (~20-25 min), still open to a polish pass, but built
// to real length and pacing — not scaffolding.
//
// Follows the puzzle doctrine (AGENTS.md / test-models.ts): every gate's
// answer lives far from the gate, assembled from scattered clues, never
// explained. Difficulty ramps across three gates:
//   Gate A (safe combination): the year of Halloran's death, given once in
//     the opening as "nineteen sixty-three" and never again — dial 1963.
//   Gate B (radio): the aerial licence "No. 46-25" from the effects list,
//     tied to "she lives where you are licensed to listen" — tune 4625.
//   Gate C (telephone): the voice speaks MIRRORED. "FIVE. NINE. TWO." read
//     turned around, and the margin note "her words arrive turned around" —
//     dial 295.

import type { Chapter } from '../models';

export const BROADCAST_ONE: Chapter = {
  id: 1,
  title: 'BROADCAST ONE',
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST ONE', title: 'The Licence', cue: 'ident' },

    // --- The estrangement, the stakes -------------------------------------
    { kind: 'room', text: 'The Hall' },
    {
      kind: 'prose',
      text: 'They had not spoken in nineteen years when Halloran died, which was a tidy sort of symmetry, because Halloran had been dead in every way that mattered to Edwin since the winter of nineteen sixty-three. The solicitor’s letter called him "next of kin" as though the phrase were a door being held open. Edwin had not wanted to walk through it.',
      cue: 'silence',
    },
    {
      kind: 'prose',
      text: 'He came anyway. One does. The house stood at the edge of the town where the land gave up and became marsh, and it had the particular silence of a place that has been listened in for a long time.',
    },
    {
      kind: 'prose',
      text: 'The parcel was waiting on the hall table: a shortwave receiver wrapped in oilcloth, and a logbook with water-swollen pages, and a single brass key. Edwin signed the delivery man’s book. The man did not meet his eyes, and left quickly, the way people leave a room where someone has just said something they should not have.',
    },

    // --- The study: the effects, the first lock ---------------------------
    { kind: 'room', text: 'The Study' },
    {
      kind: 'prose',
      text: 'The brass key opened nothing in the hall, nor the kitchen, nor the two cold bedrooms. It opened the study, where Halloran had done his listening, and where the air was still faintly sweet with pipe smoke that no one had smoked in six weeks.',
    },
    {
      kind: 'prose',
      text: 'On the desk, under a paperweight of green glass, was an inventory in the solicitor’s careful hand — everything the estate contained, itemized for probate, waiting for a signature Edwin was not sure he wanted to give.',
    },
    {
      kind: 'logbook',
      lines: [
        'EFFECTS OF H. MARSH — ITEMIZED',
        'one receiver, war surplus, working',
        'one logbook, damp, entries incomplete',
        'one wireless aerial licence, No. 46-25,',
        '  marked RENEW BY JUNE (not renewed)',
        'one desk safe, contents unknown, LOCKED',
        'one pencil, sharpened to nothing',
      ],
    },
    {
      kind: 'prose',
      text: 'The desk safe was the size of a biscuit tin and set into the wall behind a hinged watercolour of the marsh. Three brass wheels, nought to nine. Halloran had been the sort of man who used the same number for everything, and had said so once, long ago, at a Christmas neither of them had enjoyed: a man should carry only one number in his head, and it should be the one he cannot forget.',
    },
    { kind: 'thought', text: 'The one he cannot forget. The year it all went wrong, then. For both of us.' },
    {
      kind: 'safe',
      id: 'b1-safe',
      answer: '1963',
      prompt: 'the desk safe · three wheels, and one before them',
      unlockedText: 'the wheels give · the door swings on the year that ended them both',
    },
    {
      kind: 'prose',
      text: 'Inside the safe was a single index card, and on the card, in Halloran’s hand, four words underlined twice: SHE LIVES WHERE YOU ARE LICENSED TO LISTEN. Nothing else. Edwin turned it over. The back was blank, and somehow the blankness was worse.',
    },

    // --- The logbook: the descent -----------------------------------------
    {
      kind: 'prose',
      text: 'He read the logbook then, because there was nothing else to do and because the house wanted him to. Halloran had been a listener — not a talker, never once in nineteen years a telephone call — but a listener of the patient, nocturnal kind, the kind that keeps a pencil sharpened.',
    },
    {
      kind: 'logbook',
      lines: [
        'LISTENING LOG — H. MARSH',
        '3 JUNE 63 — 2314 — a station where no station should be.',
        '  Six notes, like a music box. Then a woman counts.',
        '7 JUNE 63 — 2314 — she counted ninety groups again.',
        '11 JUNE 63 — 2314 — ident, then counting. 90 groups.',
        '13 JUNE 63 — she said the song was for me. It was.',
        '14 JUNE 63 —',
        '',
        'margin, a smaller and more careful hand:',
        'her words arrive turned around',
        'do not answer the telephone before she rings off',
      ],
    },
    {
      kind: 'prose',
      text: 'The fourteenth of June was blank. Every night after the fourteenth of June was blank. Nineteen years of nightly entries, and then a man simply stops, mid-sentence, mid-June, and the pencil is sharpened to nothing and the safe holds one card that reads like an address.',
    },
    { kind: 'thought', text: 'Renew by June. Halloran never renewed anything in his life. Not a licence. Not a brother.' },

    // --- Descent to the cellar --------------------------------------------
    {
      kind: 'prose',
      text: 'The receiver wanted a mains socket, and the only one in the house that still worked was in the cellar, where the marsh pressed closest to the walls and the house kept its cold like a held breath.',
      cue: 'static-swell',
    },
    {
      kind: 'rotated',
      direction: 'down',
      text: 'The cellar stairs went down eleven steps, and the dark came up to meet him at the sixth, and from below — faint, patient, already switched on though no plug had touched the wall — something was humming to itself in six descending notes.',
    },
    { kind: 'room', text: 'The Cellar' },
    {
      kind: 'prose',
      text: 'The receiver sat on the workbench with its dial lamp lit and its cord coiled beside it, unplugged. Edwin stood on the last step for a while. Then he crossed the floor, because a man who has come this far down does not go back up over a humming.',
    },
    {
      kind: 'prose',
      text: 'The card from the safe was in his breast pocket. He could feel the two underlines through the cloth. Where you are licensed to listen. He thought of the inventory, and the number the estate had recorded against the aerial, and he reached for the dial with a steadiness he did not feel.',
    },
    {
      kind: 'radio',
      id: 'b1-tune',
      bandLowKhz: 4400,
      bandHighKhz: 4800,
      targetKhz: 4625,
      lockedText: 'drag to tune · the static thins where the carrier is',
      unlockedText: 'carrier locked · she is already singing',
      cue: 'static-swell',
    },

    // --- The broadcast ----------------------------------------------------
    { kind: 'voice', text: 'NINE. NINE. NINE. GOOD EVENING, LISTENER.', mirrored: false, cue: 'ident' },
    {
      kind: 'prose',
      text: 'The voice was a woman’s, flat and clean as a pressed flower, with no room in it at all. She played the six notes first — a music box running down — and then she began to count, in groups of five, without hurry, as though she had all the nights in the world and intended to use them one at a time.',
    },
    {
      kind: 'prose',
      text: 'Ninety groups. Edwin found the sharpened pencil in his hand without any memory of picking it up, and found that he had written the first thirty groups down the margin of his brother’s log in a hand that was becoming, group by group, less his own.',
    },
    {
      kind: 'prose',
      text: 'When it ended the static closed over the frequency like water over a stone, and the cellar was only a cold room again, and Edwin — who had a train to catch in the morning and a life two hundred miles away and no earthly reason to remain — did not move.',
      cue: 'silence',
    },

    // --- The fork: two ways to learn the same terrible thing ---------------
    {
      kind: 'fork',
      leftLabel: 'READ THE LOG',
      left: 'He turned back to the blank fourteenth of June, and found it was not blank anymore. Tonight’s date was written at the top of the page. In pencil. In his own hand. He did not remember writing it, and the graphite was still bright.',
      rightLabel: 'OPEN THE BENCH',
      right: 'He opened the drawer beneath the bench. Ninety index cards, banded in string, each a night, each transcribed in Halloran’s neat columns. He thumbed to the last. It was dated tomorrow, and the columns were already full.',
      join: 'Either way the arithmetic was the same, and the arithmetic was the thing he could not put down. The station had been counting toward something for nineteen years. The something had a date. And the date, by every reckoning in that cold room, was almost here.',
    },
    { kind: 'voice', text: 'FIVE. NINE. TWO. EDWIN.', mirrored: true },
    { kind: 'thought', text: 'He had not told the radio his name. He had not told anyone his name in this house.' },

    // --- Ascent, and the telephone ----------------------------------------
    {
      kind: 'prose',
      text: 'Upstairs, faintly, the telephone began to ring. It rang the way a thing rings when it has been ringing a long time and fully intends to continue — patient, nocturnal, the ring of something that keeps a pencil sharpened.',
      faded: true,
      cue: 'static-swell',
    },
    {
      kind: 'rotated',
      direction: 'up',
      text: 'He took the eleven steps two at a time with the cold peeling off him like a wet coat, up out of the cellar and into the hall, where the telephone stood shivering on its little table and the card in his pocket said her words arrive turned around.',
    },
    { kind: 'room', text: 'The Hall' },
    {
      kind: 'prose',
      text: 'The margin had warned him. Do not answer before she rings off. But she had said three numbers to him by name, and a man who has been given three numbers in the dark will always, always dial them. He lifted the receiver. He turned her words around in his head, and dialled what she had said.',
    },
    {
      kind: 'keypad',
      id: 'b1-phone',
      answer: '295',
      prompt: 'the telephone · dial what she said, the way she said it',
      unlockedText: 'the line clicks open · and somebody, close, is breathing',
    },

    // --- The cliffhanger --------------------------------------------------
    { kind: 'voice', text: 'YOU COUNTED WRONG, EDWIN. WE WILL START AGAIN.', mirrored: false },
    {
      kind: 'prose',
      text: 'Sixty feet away and behind a closed door, in a cellar he had left dark, the receiver turned its dial lamp off. Politely. The way a house guest puts out the lamp when the conversation is finished and the night, properly, is only beginning.',
      faded: true,
    },
    { kind: 'thought', text: 'Ninety groups. She had counted ninety, every night, for nineteen years. Tonight she had counted ninety-one.' },
    {
      kind: 'prose',
      text: 'Edwin Marsh did not catch his train in the morning. There would be no more mornings of the ordinary kind — only broadcasts now, one a night, counting down the last of them. He sat in the cold hall with the receiver warm against his ear, and he listened, because that is the one thing the Marsh brothers had ever truly known how to do.',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST ONE' },
  ],
};
