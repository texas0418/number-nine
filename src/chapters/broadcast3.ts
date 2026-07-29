// src/chapters/broadcast3.ts
// Broadcast Three — the station stops asking and starts INSTRUCTING. Every
// gate is one of her numbered orders made physical; the reader is trained,
// as Edwin is trained, into an operator. The chapter also introduces the
// margin-note pressure valve (chapter.hints — Halloran's second log).
//
// EIGHT puzzles + a fork, ONE code-entry (the poor-box keypad, its digits
// delivered only through the hand). Ramp over B2: her orders are terse,
// nothing is explained, and the finale's number is never seen or heard —
// only felt, and only once per pressing.
//
//   1. stillness  — INSTRUCTION THE FIRST: BE STILL (she measures the hand)
//   2. shake      — the receiver's seized vent valve, shaken loose
//   3. hotspot    — the hairline crack B2's knocking opened in the hall
//   4. invert     — her typed sheet reads differently upside down
//   5. mains      — IT HUNGERS. FEED IT. (plug the phone in)
//   6. chord      — both hands on the cabinet; let it learn them
//   7. paces      — nine paces east from the lych-gate
//   8. keypad     — the poor-box: four wheels, four felt knock-groups [7,3,9,2]
//
// Doctrine holds: answers never within three blocks; >=2 scattered clues,
// >=1 cross-modal; wrong answers get atmosphere; nudges never instructions.

import type { Chapter } from '../models';

export const BROADCAST_THREE: Chapter = {
  id: 3,
  title: 'BROADCAST THREE',
  hints: {
    'b3-still': 'she measures the hand before she trusts it. give her nothing that moves.',
    'b3-valve': 'rust answers violence, not patience. his brother shook things until they confessed.',
    'b3-crack': 'nineteen years of knocking finds out the weak plaster, low, where the wall meets the stair.',
    'b3-sheet': 'her sheets read truer held the other way up.',
    'b3-feed': 'the set drinks from the mains as you do — from the wall, through a cord.',
    'b3-chord': 'one hand is a visitor. two hands are family.',
    'b3-paces': 'stand at the gate. find where the light used to come from. walk, and count aloud if it helps.',
    'b3-box': 'the iron says the number once each pressing — four raps of it, in the order given. count with your bones, not your ears.',
  },
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST THREE', title: 'The Instructions' },

    // --- Morning three: the tin refills itself --------------------------
    { kind: 'room', text: 'The Cellar', scene: 'cellar' },
    {
      kind: 'prose',
      text: 'By dawn the marsh had put its lights out, every one, the way a theatre goes dark behind the last patron, and Edwin Marsh woke in the bench chair with the pencil still in his fist. He had answered. Whatever else the night had been, that fact sat in the room with him like a third person. The set idled at a low, contented hum he had not taught it.',
      cue: 'silence',
    },
    {
      kind: 'prose',
      text: 'The tin of index cards stood open on the bench. He had left it closed. Ninety-one cards, and now — he counted twice, with the flat calm of a man who has stopped expecting arithmetic to behave — ninety-two. The new card was crisp as frost, and the type on it was hers: he knew it now the way one knows a voice through a wall.',
    },
    { kind: 'plate', image: 'obj-cards', caption: 'the index cards · refilling themselves now' },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'CARD 92 · her type, exact:',
        '  INSTRUCTION THE FIRST.',
        '  BE STILL.',
        '',
        'nothing else. no signature.',
        'instructions do not sign themselves.',
      ],
    },
    {
      kind: 'stillness',
      id: 'b3-still',
      holdMs: 4000,
      prompt: 'be still · she is listening to your hands',
      unlockedText: 'the stillness is accepted · a listener’s hands after all',
    },
    {
      kind: 'thought',
      text: 'He had not decided to obey. He noticed this the way one notices weather — after it has already happened.',
    },

    // --- Instruction the second: the seized valve ------------------------
    {
      kind: 'logbook',
      lines: [
        'CARD 93, waiting UNDER the first,',
        'though the tin had been counted:',
        '  THE AIR IS THIN IN HERE.',
        '  OPEN MY THROAT.',
      ],
    },
    {
      kind: 'prose',
      text: 'The receiver’s vent valve sat at the back of the chassis, a knurled brass thing his brother would have oiled monthly, and it had seized in the six weeks the house stood empty — rust welding it shut with the quiet industry rust has. His fingers made no impression on it. Gentleness, it appeared, was not what was being asked for.',
    },
    { kind: 'plate', image: 'obj-valve', caption: 'the vent valve · seized these six weeks' },
    {
      kind: 'shake',
      id: 'b3-valve',
      prompt: 'the valve · rusted fast · half measures rust over again',
      solveCue: 'rust-break',
      unlockedText: 'the rust lets go all at once · the set pulls air like a swimmer surfacing',
    },
    {
      kind: 'prose',
      text: 'With its throat open the hum changed register, and under the hum — far under, where a listener’s ear goes against its own advice — there was something with the cadence of breathing that was not his. He chose, for the moment, to file that with the arithmetic.',
    },

    // --- The crack the knocking made (continuity: B2's wall) -------------
    { kind: 'room', text: 'The Hall' },
    {
      kind: 'prose',
      text: 'In the hall, the morning light lay along the wall the way it always had — except where it didn’t. All that knocking, night on night, his and the house’s both, had found out the plaster at last: somewhere low, a hairline had opened, fine as a scruple, and the light caught its edge if one looked with a finder’s patience.',
    },
    {
      kind: 'hotspot',
      id: 'b3-crack',
      image: 'wall-crack',
      revealImage: 'wall-burst',
      target: { x: 0.45, y: 0.77, w: 0.22, h: 0.18 },
      prompt: 'the hall wall · the knocking has left its mark somewhere',
      solveCue: 'plaster-fall',
      unlockedText: 'the plaster gives all at once · straw packing, a light that has no business · and folded paper',
    },
    {
      kind: 'prose',
      text: 'Inside the wall, wrapped against the damp with a listener’s care, lay a second logbook — thinner than the first, older, the hand more urgent. His brother had kept two sets of books: one on the desk, for the house to read, and one in the wall, for the wall to keep. Edwin read standing up, with his back to the stair, which he understood later had been an animal deciding not to be cornered.',
    },
    { kind: 'plate', image: 'obj-logbook', caption: 'the second log · the one he kept from her' },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'THE SECOND LOG — H. MARSH, private',
        '· if you are reading this, the wall knows you now.',
        '· do everything she says. do nothing she does not.',
        '· her sheets read truer held the other way up.',
        '· the box takes what the wall gives. four raps of it,',
        '  in the order given. it does not repeat inside a pressing.',
        '· i never brought anyone. that is the only instruction',
        '  i ever refused. it is why i lasted nineteen years.',
      ],
    },

    // --- Her typed sheet: instruction the third ---------------------------
    {
      kind: 'prose',
      text: 'Folded into the second log was a single typed sheet — her type again, the letters pressed hard enough to emboss. It read like a notice in a railway waiting room, and it was wrong in some way the eye kept sliding off, the way a portrait is wrong when the sitter has been dead a long time and nobody told the painter.',
    },
    {
      kind: 'invert',
      id: 'b3-sheet',
      upright: [
        'INSTRUCTION THE THIRD.',
        'REMAIN AT YOUR POST.',
        'KEEP THE LAMPS BURNING.',
        'ADMIT NO ONE.',
      ],
      inverted: [
        'the third, in truth:',
        'the post remains in you.',
        'the lamps are watching.',
        'admit the wall.',
      ],
      targetWord: 'wall',
      prompt: 'her sheet · typed, exact, and wrong somehow',
      solveCue: 'sheet-rustle',
      unlockedText: 'held the other way, the sheet confesses',
    },
    {
      kind: 'thought',
      text: 'Admit the wall. He looked at the crack, and the crack, he was nearly sure, did not look back. Nearly.',
    },

    // --- It hungers -------------------------------------------------------
    {
      kind: 'prose',
      text: 'Toward noon the dial lamp guttered like a candle in a draught, though the mains had done nothing and the valves tested true. The next card was already in the tin — he had stopped checking how. Somewhere in the last day he had crossed from keeping a log to being kept by one.',
    },
    {
      kind: 'logbook',
      lines: ['CARD 94:', '  IT HUNGERS.', '  FEED IT.'],
    },
    {
      kind: 'mains',
      id: 'b3-feed',
      prompt: 'the set is hungry · give it the mains',
      solveCue: 'hum-settle',
      unlockedText: 'it drinks · the dial lamp steadies, satisfied, like an eye refocusing',
    },

    // --- Both hands -------------------------------------------------------
    {
      kind: 'logbook',
      lines: ['CARD 95:', '  BOTH HANDS ON THE CABINET.', '  LET IT LEARN THEM.'],
    },
    {
      kind: 'chord',
      id: 'b3-chord',
      holdMs: 1800,
      prompt: 'both hands flat on the cabinet · and wait',
      unlockedText: 'under both palms, a settling · like a dog deciding, at length, to trust',
    },
    { kind: 'voice', text: 'YOU DO AS SHE ASKS. HALLORAN FOUGHT IT LONGER. SHE PREFERS YOU.', mirrored: false },

    // --- The fork: what a man does with orders ----------------------------
    {
      kind: 'fork',
      leftLabel: 'WRITE IT ALL DOWN',
      left: 'He wrote the day into the first log, every instruction and every obedience, in a fair hand, because a record is a kind of resistance — proof, addressed to no one, that a man knew what was being done to him while it was being done.',
      rightLabel: 'BURN THE SHEET',
      right: 'He put her typed sheet in the kitchen grate and gave it the match, and it burned the way ordinary paper burns, which was somehow the most frightening thing the house had shown him yet — that she did not care. Paper was not where she kept anything.',
      join: 'Either way the afternoon closed with the same card in the tin — the last of the day’s instructions, and the first one that required his coat.',
    },

    // --- The churchyard ---------------------------------------------------
    {
      kind: 'logbook',
      lines: [
        'CARD 96:',
        '  FROM THE LYCH-GATE. NINE PACES EAST.',
        '  THEN LISTEN DOWN.',
      ],
    },
    {
      kind: 'prose',
      text: 'The church stood on the one rise the marsh had ever conceded, and its yard held Marshes going back past reading. He came to the lych-gate at the greying end of the afternoon with his collar up, and stood under its little roof a moment, as coffins do, which he did not think about, and then thought about entirely.',
      cue: 'footsteps',
    },
    { kind: 'room', text: 'The Churchyard', scene: 'churchyard', cue: 'marsh-wind' },
    {
      kind: 'paces',
      id: 'b3-paces',
      bearingDeg: 90,
      toleranceDeg: 14,
      paces: 9,
      prompt: 'from the lych-gate · as instructed',
      unlockedText: 'nine, east · and the grass here is shorter · tended · by whom',
    },
    {
      kind: 'prose',
      text: 'The stone was small and clean and had been kept clean, in a churchyard where no one had been paid to keep anything for years. It bore no dates. Dates, he understood now, were not something she surrendered. It bore three words only, cut deep and sure, and he read them with his hat already off.',
    },
    { kind: 'plate', image: 'obj-grave', caption: 'the small stone · no dates' },
    {
      kind: 'prose',
      text: 'BEST LISTENER. And beneath the cut words, half in the tended grass, a parish poor-box of black iron — carried out here from the vestry by hands unknown, bolted to the stone’s own plinth, and locked with four brass wheels. LISTEN DOWN, the card had said. He knelt, and laid his palm flat on the cold iron, and the iron — patiently, deliberately, in little parcels of number — knocked against his hand.',
    },
    {
      kind: 'keypad',
      id: 'b3-box',
      answer: '7392',
      feltGroups: [7, 3, 9, 2],
      prompt: 'the poor-box · four wheels · it says the number once each pressing',
      solveCue: 'hasp-open',
      unlockedText: 'the hasp falls open · paper, banded, addressed to him alone',
      stopsCue: 'marsh-wind',
    },

    // --- What the box held -------------------------------------------------
    {
      kind: 'prose',
      text: 'Inside was one envelope, unweathered, sealed, bearing tomorrow’s date in her type. He opened it there at the graveside because waiting would only have been a different kind of opening, and read the single card it held while the light went out of the yard around him like water finding a drain.',
    },
    {
      kind: 'logbook',
      lines: [
        'CARD 97:',
        '  GOOD. YOU KEEP HER HOURS.',
        '  YOU FEED HER SET. YOU ANSWER.',
        '  TOMORROW: BRING SOMEONE.',
      ],
    },
    { kind: 'thought', text: 'Bring someone. Two words, and every face he knew walked through him, one after another, like names being read from a list.' },
    { kind: 'voice', text: 'THANK YOU, EDWIN. SHE WILL LIKE WHOEVER YOU CHOOSE.', mirrored: true },
    {
      kind: 'prose',
      text: 'He walked home the long way, by the road, in the last of the light, and found that his mind — his tidy, clerkish, obedient mind — was already sorting the people he loved by how little he loved them. He stopped in the middle of the road and stood quite still for a long time. Being still, he had been taught only that morning, is a thing she trusts.',
      faded: true,
      cue: 'lamp-off',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST THREE' },
  ],
};
