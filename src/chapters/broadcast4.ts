// src/chapters/broadcast4.ts
// Broadcast Four — THE EXAMINATION. She stops instructing and starts
// testing. Card 97 demanded someone be brought; the house, it turns out,
// has already sent for him — the GPO licence-detector man, come about an
// unlicensed receiver. The reader sits her paper alongside Edwin.
//
// EIGHT puzzles + a fork, ONE code-entry (the verdict cipher, FOUR composed
// rules — the ramp over B3's three). Ramp over B3: two-condition gates
// (dark AND the hour), a gate that reaches OUTSIDE the book (tonight's
// actual daily signal), and a finale that demands cross-chapter archaeology
// (B1's tin, B2's climbing count, B3's inverted sheets).
//
//   1. whisper    — the terms, spoken only to the ear
//   2. ink        — Question the First: dark AND the usual hour (wind = lie)
//   3. signalword — Question the Second: WHAT DID I SAY TONIGHT (the daily)
//   4. bearing    — Question the Third: FIND ME (the aerial swung west)
//   5. exposure   — the séance plate: the shutter develops it
//   6. trace      — she cuts the set; remake the path (Halloran's rhyme)
//   7. fork       — the knock at the door
//   8. radio      — the result found at 2314 kHz: her hour was always a
//                   PLACE ON THE BAND too (Prentice names it unknowing)
//   9. cipher     — the verdict: 22 27 35 23 31 18 -> REMAIN
//
// Verdict math (kept here for future sessions; never printed in-app):
// REMAIN -> far-end alphabet (27-n): 9 22 14 26 18 13 -> +9 as she climbs:
// 18 31 23 35 27 22 -> groups reversed, as her sheets are read:
// 22 27 35 23 31 18. The reader undoes it right to left.

import type { Chapter } from '../models';

export const BROADCAST_FOUR: Chapter = {
  id: 4,
  title: 'BROADCAST FOUR',
  hints: {
    'b4-hush': 'she will not say it to the room. the receiver goes where a voice goes — to the ear, till she is done.',
    'b4-ink': 'sat in a dark room, at the hour the first log kept. the little clock winds, if you cannot wait — but wound is not the same as true.',
    'b4-night': 'tonight’s count is tonight’s everywhere. the pocket set keeps her evenings; go and hear one before you answer.',
    'b4-aim': 'margaret lies east of the lych-gate. whatever speaks keeps the opposite quarter of the sky.',
    'b4-plate': 'the shutter is not on the camera. your machine catches pictures of its own face — both buttons, the way you keep anything.',
    'b4-fault': 'halloran’s rhyme knows the road: air to coil, coil to grid, grid to anode, anode to the telephones. the earth wants none of her.',
    'b4-station': 'the van kept finding her and could never file her. her hour was never only an hour — the band keeps a two-three-one-four as well.',
    'b4-verdict': 'read her marks as her sheets are read. give back the nine she lends. then count from the far end, as the tin taught.',
  },
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST FOUR', title: 'The Examination' },

    // --- The morning after card 97 ---------------------------------------
    { kind: 'room', text: 'The Cellar', scene: 'cellar' },
    {
      kind: 'prose',
      text: 'He had not slept, or he had slept the whole night through and been elsewhere for it — the distinction had stopped mattering somewhere around the third broadcast. BRING SOMEONE. He had gone down the list of everyone he loved and found himself doing sums with them, and the sums had made him sick, and at some point between the sums and the dawn the tin had clicked, softly, like a tongue, and produced its next card.',
      cue: 'silence',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'CARD 98 · her type:',
        '  DO NOT CHOOSE. IT IS NOT YOURS TO DO.',
        '  ONE COMES TODAY OF HIS OWN ACCORD.',
        '  ADMIT HIM. TODAY: THE EXAMINATION.',
      ],
    },
    {
      kind: 'thought',
      text: 'Relief, arriving before understanding, the way it does. He did not have to choose. Something had been choosing all along.',
    },
    {
      kind: 'prose',
      text: 'The set idled. Then, without the dial moving, it lowered itself — the hum dropping to something below hearing, a pressure more than a sound, the shape a voice makes when it does not want the room to know. The receiver wanted his ear. There was no other way to say it, so he stopped trying to say it otherwise.',
    },
    {
      kind: 'whisper',
      id: 'b4-hush',
      durationMs: 9000,
      prompt: 'the receiver, to your ear · she will not say it to the room',
      unlockedText: 'the whisper spends itself · the set sits up straight again',
    },
    {
      kind: 'prose',
      text: 'Afterwards he stood with the receiver still warm against his cheek and did the one thing she had just forbidden. He wrote it down. His hand shook, and he wrote it down anyway, because Halloran had kept two sets of books, and Edwin was beginning to understand what the second set had been FOR.',
    },
    {
      kind: 'logbook',
      lines: [
        'what she whispered, set down against orders:',
        '· "you will sit the paper with him watching.',
        '   nothing of mine goes onto paper. my marks',
        '   read as my sheets are read. you know the way."',
      ],
    },

    // --- The examination paper -------------------------------------------
    { kind: 'room', text: 'The Study' },
    {
      kind: 'prose',
      text: 'It was waiting on the desk in the study: foolscap, typed, punched and tied at the corner with waxed string like a proper board paper. EXAMINATION THE NINTH, said the head, though he had sat none before it — and there was a rubric, because there is always a rubric, and rubrics, unlike examiners, cannot lie.',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'EXAMINATION THE NINTH · rubric:',
        '· TO BE SAT IN A DARK ROOM,',
        '  AT THE USUAL HOUR.',
        '· CANDIDATES COUNT FROM THE FAR',
        '  END OF THE ALPHABET, AS IS',
        '  TRADITIONAL IN THIS HOUSE.',
        '· NO SECOND SITTINGS.',
      ],
    },
    {
      kind: 'ink',
      id: 'b4-ink',
      aboveText: [
        'QUESTION THE FIRST.',
        'What does the house lend',
        'that must be given back?',
      ],
      hiddenLine: 'the nine is lent, not given. return it before you read her.',
      targetWord: 'nine',
      hour: 23,
      minute: 14,
      prompt: 'question the first · the paper is not all here by lamplight',
      unlockedText: 'the answer was under the light all along · nine, lent, owed back',
      noticedText: 'the ink resolves · and the paper knows the clock was helped · it says so, in the margin, in small type',
    },
    {
      kind: 'thought',
      text: 'Return the nine. He filed it where he was filing everything now: in the second set of books, the one behind his eyes.',
    },

    // --- Question the second: tonight -------------------------------------
    {
      kind: 'prose',
      text: 'The second question was not typed. The paper simply said LISTEN, and the set upstairs obliged — but what it gave was not for him alone, and he knew it: the same thin evening wave that finds every pocket receiver at dusk, the count that goes out to whoever keeps her evenings. Tonight’s count is tonight’s everywhere. She was asking whether he had been LISTENING — not to the house. To her.',
    },
    {
      kind: 'signalword',
      id: 'b4-night',
      prompt: 'question the second · WHAT DID I SAY TONIGHT',
      unlockedText: 'the word sits in the room like a struck bell · she nods, somewhere',
    },

    // --- Question the third: find her --------------------------------------
    {
      kind: 'prose',
      text: 'QUESTION THE THIRD, said the paper. WHERE AM I. Beneath the words, in his brother’s hand, pencilled faint and long ago, as though Halloran had sat this same paper once: "not the churchyard. I walked it with the loop aerial, every row. Margaret lies east of the gate, and the voice was never once east. It keeps the other quarter — I never had the nerve to walk TOWARD it."',
    },
    {
      kind: 'bearing',
      id: 'b4-aim',
      bearingDeg: 270,
      toleranceDeg: 12,
      prompt: 'the loop aerial · swing it · her voice will centre when it looks at her',
      unlockedText: 'due west · the marsh, the open marsh, where nothing stands · her voice sits in the middle of the ear like a held breath',
    },
    {
      kind: 'thought',
      text: 'West. Nothing stood west of the house but ten miles of reed and water and the memory of a light. He wrote the bearing down and did not like his handwriting when he had.',
    },

    // --- The plate ---------------------------------------------------------
    {
      kind: 'prose',
      text: 'The last leaf of the paper was not paper. It was a photographic plate, old dry-plate stock in its sleeve, and typed on the sleeve: EVIDENCE. The study corner sat in it faint and reversed — the bench, the set, the empty chair — a picture his brother must have made years ago. It wanted exposing. The house had no camera, and he understood, with the particular tiredness of the long-obedient, that the house did not think it needed one.',
    },
    {
      kind: 'exposure',
      id: 'b4-plate',
      image: 'obj-seance',
      revealImage: 'obj-seance-after',
      prompt: 'the plate · EVIDENCE · it wants a shutter, and the camera is in your hands',
      solveCue: 'lamp-off',
      unlockedText: 'the plate develops · the chair was never empty · whatever keeps it leans into the set, listening',
    },
    {
      kind: 'thought',
      text: 'He put the plate face down on the desk. Then he turned it face up again, because face down had felt like turning his back.',
    },

    // --- She cuts the set ---------------------------------------------------
    {
      kind: 'prose',
      text: 'The set died at four o’clock. Not faded — died, all at once, the dial lamp out and the hum gone and the room suddenly enormous with ordinary silence. On the bench where the tin stood, the next card was already waiting, and for the first time her type looked hurried.',
    },
    {
      kind: 'logbook',
      lines: [
        'CARD 99:',
        '  HE IS NEARLY HERE. I HAVE GONE QUIET',
        '  SO HIS MACHINES FIND NOTHING.',
        '  REMAKE MY ROAD WHEN I SAY.',
        '  YOU KNOW THE RHYME.',
      ],
    },
    {
      kind: 'prose',
      text: 'The rhyme. It was pasted inside the lid of Halloran’s toolbox, where a workman keeps the things he must not get wrong, in his brother’s neat capitals gone brown: AIR TO COIL, COIL TO GRID, GRID TO ANODE, ANODE TO THE TELEPHONES — and beneath it, underlined twice, THE EARTH WANTS NONE OF HER.',
    },
    {
      kind: 'trace',
      id: 'b4-fault',
      nodes: ['AE', 'E', 'C', 'G', 'A', 'T'],
      order: [0, 2, 3, 4, 5],
      prompt: 'the tag-strip · one unbroken road · the wrong post bites',
      solveCue: 'hum-settle',
      unlockedText: 'the road remade · the set breathes · the dial lamp opens its eye',
    },

    // --- The knock ----------------------------------------------------------
    {
      kind: 'prose',
      text: 'And then, at the front of the house, entirely as she had said, a knock: brisk, official, three-and-two, the knock of a man with a clipboard and a warrant card and a van outside with a loop aerial on the roof. The Post Office had come about the licence. The house had sent for its someone, and its someone had driven himself.',
      cue: 'knock-far',
    },
    {
      kind: 'fork',
      leftLabel: 'LET HIM KNOCK AGAIN',
      left: 'He stood in the hall and let the knock come a second time, and a third, telling himself a man who waits is a man deciding — knowing, all the while, that the door had already decided. On the fourth knock the latch turned itself, gently, the way a thing is done when it has been done for you as a kindness.',
      rightLabel: 'OPEN THE DOOR',
      right: 'He opened the door on the second knock, because his brother had refused this one instruction for nineteen years and Edwin had watched what nineteen years of refusing had bought. The inspector’s smile was the smile of a man sure of his paperwork. Edwin stepped aside and the house took the rest of the introductions.',
      join: 'Mr. Prentice, of the detection branch, wiped his shoes twice, remarked that the marsh light did strange things to a signal, and asked — pleasantly, the way they are trained to — why a dead man’s licence was still drawing current. He mentioned also, in the tone of a professional grievance, the carrier his van kept finding parked at two-three-one-four kilocycles — no allocation in any table he owned, and gone, always, by the time he stopped to log it. The set upstairs chose that moment to come back on.',
    },

    // --- The result, on her wave -------------------------------------------
    {
      kind: 'prose',
      text: 'What followed filled the evening and emptied it. Prentice with his meters up and down the stairs, finding nothing, finding it again the moment he packed the meter away; Prentice on the cellar steps going quiet mid-sentence; Prentice in the chair by the bench — the chair — with his hat on his knees, no longer asking about the licence. The examination had two candidates now, and at some point Edwin understood that the marks would not simply arrive. They would have to be FOUND. The dial sat dark at the low end of the band, and the little clock ticked at his elbow like an invigilator, keeping her hour the way it always had — and something about the way Prentice had said his numbers, two-three-one-four, kept circling Edwin’s tired head looking for a place to land.',
    },
    {
      kind: 'radio',
      id: 'b4-station',
      bandLowKhz: 2100,
      bandHighKhz: 2500,
      targetKhz: 2314,
      lockedText: 'drag the dial · the marks wait on the wave the van could never file',
      unlockedText: 'the carrier stands where her hour stands · of course it does · it was never only a time of night',
    },
    {
      kind: 'voice',
      text: 'CANDIDATES TWO. PAPERS ONE. MARKS FOLLOW.',
      mirrored: false, cue: 'v-b4-1' },
    {
      kind: 'prose',
      text: 'The counting voice read the marks the way she read everything: numbers, in her flat clear evening voice, while Prentice sat in the chair with his eyes closed — not asleep; listening, the way a man listens when he has just learned how — and Edwin took them down in the second book, in the order given, exactly as given.',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'HER MARKS, in the order sent:',
        '',
        '  22 · 27 · 35 · 23 · 31 · 18',
        '',
        'one word. the verdict.',
      ],
    },
    {
      kind: 'cipher',
      id: 'b4-verdict',
      answer: 'REMAIN',
      prompt: 'the verdict · hers to send, yours to read',
      unlockedText: 'one word, and the room is told · he is to REMAIN · the word his brother’s sheet used · the word that means kept',
    },

    // --- What remained ------------------------------------------------------
    {
      kind: 'prose',
      text: 'Prentice left a little after midnight, on his own feet, at his own pace, having signed nothing and measured nothing and said, at the door, in a voice Edwin did not recognise from earlier in the evening, that the licence question could rest — that some sets, in his professional opinion, were best left drawing what they drew. He did not take the van. The van stood outside for three days, loop aerial turned — Edwin checked, he could not help checking — due west.',
      faded: true,
    },
    {
      kind: 'voice',
      text: 'HE PASSED. YOU BOTH PASSED. SHE IS PLEASED WITH WHAT YOU BROUGHT.',
      mirrored: true, cue: 'v-b4-2' },
    {
      kind: 'thought',
      text: 'I brought no one, he told the dark, and the dark let it stand, the way an examiner lets a wrong answer stand — marked, not corrected.',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST FOUR' },
  ],
};
