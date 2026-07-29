// src/chapters/broadcast5.ts
// Broadcast Five — THE OTHER LISTENERS. Edwin learns he was never alone on
// the band: a scattered parish of operators has been keeping her evenings
// for years, and every one of their aerials points at HIS house. The
// chapter's spine is the network — hearing them, answering them, being
// heard at last himself — and at its end, the place all of it has been
// circling: a nose of shingle the charts keep a name for.
//
// SEVEN puzzles + a fork, ONE code-entry (the coordinates finale — and the
// answer never appears in the book at all; the reader carries coordinates
// out into the real world and brings a place name back). Ramp over B4:
// applied composition (the triangulation is tuner x bearings x map in one
// act), a gate that leaves the app entirely, and clues that arrive in the
// reader's POCKET.
//
//   1. sever       — BE UNREACHABLE (the OS switch is the act)
//   2. gain        — the seventh mark, worn bright by his brother's thumb
//   3. triangulate — three weak listeners; three lines; one house. This one.
//   4. flip+mirror — her sheet's verso, written for the wall's side
//   5. morsesend   — the network asks WHO KEEPS THE HOUSE; he sends MARSH
//   6. register    — the listeners' register: a thumb held to the page
//                    like a seal; the entry dries in her type with the
//                    MACHINE'S OWN NAME (usually the reader's). Replaced
//                    the mic gate (three QA rounds of hum losses) and then
//                    a stillness reprise (B3's move) at Simon's call.
//   7. fork        — the slip in the pocket: look now, or carry it
//   8. cipher      — 52 05 42 N · 01 33 31 E -> the reader looks it up
//                    in the real world -> ORFORD (never printed here)

import type { Chapter } from '../models';

export const BROADCAST_FIVE: Chapter = {
  id: 5,
  title: 'BROADCAST FIVE',
  hints: {
    'b5-sever': 'unreachable means NO wire to the world — put out the wireless and the telephone yourself, in the machine’s own settings. the aeroplane switch sometimes leaves the wireless burning.',
    'b5-gain': 'the knob is on the side of your machine, where a thumb lives. his brother wore the seventh mark bright.',
    'b5-triangulate': 'find each of them on the band — the log kept their numbers. locked aerials draw their own lines. stand where the lines agree.',
    'b5-verso': 'she writes for the wall’s side of the paper. turn the page with the phone face-down — and read it the way a mirror would.',
    'b5-send': 'the card in the toolbox knows the alphabet. the question is WHO KEEPS THE HOUSE, and the house has had one name for two hundred years.',
    'b5-ear': 'two of those lines were scraped clean of someone, and the page refuses them cold. the line that never took ink takes the thumb — held, while she counts under it.',
    'b5-where': 'the numbers in your pocket are a place on the earth. any chart that takes latitude will take you there. bring back its name, not its numbers.',
  },
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST FIVE', title: 'The Other Listeners' },

    // --- After the examination --------------------------------------------
    { kind: 'room', text: 'The Cellar', scene: 'cellar' },
    {
      kind: 'prose',
      text: 'REMAIN, she had said, and he had remained: three days now, keeping her hours, feeding her set, sleeping in the chair because the bedrooms had begun to feel like rooms in someone else’s account of his life. Prentice’s van still stood in the lane with its loop aerial aimed west, gathering dew. Nobody came for it. On the fourth morning the tin produced card one hundred, and the round number felt like a door being closed somewhere behind him.',
      cue: 'silence',
    },
    { kind: 'plate', image: 'obj-van', caption: 'the van in the lane · nobody came for it' },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'CARD 100 · her type:',
        '  YOU WERE NEVER ALONE. NONE OF YOU ARE.',
        '  BEFORE YOU MEET THEM:',
        '  BE UNREACHABLE.',
      ],
    },
    {
      kind: 'thought',
      text: 'Unreachable. As though reachable were a garment a man could take off and hang by the door.',
    },
    {
      kind: 'sever',
      id: 'b5-sever',
      prompt: 'the world · still lit · she will not speak over it',
      unlockedText: 'the world goes out like a lamp · and the band, underneath, is CROWDED',
    },
    {
      kind: 'prose',
      cue: 'parish',
      text: 'He had expected the silence to feel like loss. It felt like a window opened. With the world gone the set stood taller in the room, and under its hum — where there had only ever been her — there were voices now, faint as pencil, dozens of them, threading in and out of the static like neighbours talking over a hedge in the dark.',
    },

    // --- The gain ----------------------------------------------------------
    {
      kind: 'logbook',
      lines: ['CARD 101:', '  THE OTHERS ARE FAINT.', '  GAIN TO THE WORN MARK.'],
    },
    {
      kind: 'prose',
      text: 'The gain sat on the receiver’s flank where a thumb naturally lives, a little ladder of nine etched marks beside it, and the seventh mark was worn bright — actually bright, the black paint thumbed away to brass, nineteen years of the same setting for the same hour. His brother’s thumb had made that mark. Edwin put his own where it had been.',
    },
    {
      kind: 'gain',
      id: 'b5-gain',
      mark: 7,
      prompt: 'the gain · the knob is on the side of your machine',
      unlockedText: 'the needle rests on the worn mark · and the hedge-voices come up like a tide',
    },

    // --- The other listeners ----------------------------------------------
    {
      kind: 'prose',
      text: 'They were not stations. They were PEOPLE — a scattered parish of them, each at a set like his, each keeping her hours the way he kept them. Some had been at it so long their sending hands had gone soft and conversational. He filled two pages of the second log just writing down who answered to what.',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'the near ones, from the second log:',
        '· PORTMAN, dairyman. 3155 on the band.',
        '  "she comes to me out of the south-east."',
        '· the WIDOW WELLS. 3240.',
        '  "west of me, sir, and a little south."',
        '· the BOY (won’t give a name). 3385.',
        '  "just east of north. i checked with',
        '   my dad’s compass. every night the same."',
      ],
    },
    {
      kind: 'prose',
      text: 'South-east of Portman. West of the widow. North of the boy. He spread the ordnance sheet on the bench and stood over it with a pencil and the particular stillness of a man who has seen the shape of an answer before drawing a line of it, and does not want to be right.',
    },
    {
      kind: 'triangulate',
      id: 'b5-triangulate',
      bandLowKhz: 3100,
      bandHighKhz: 3450,
      mapImage: 'map-marsh',
      stations: [
        { khz: 3155, siteX: 0.18, siteY: 0.22, bearingDeg: 141 },
        { khz: 3240, siteX: 0.85, siteY: 0.55, bearingDeg: 259 },
        { khz: 3385, siteX: 0.4, siteY: 0.88, bearingDeg: 21 },
      ],
      target: { x: 0.42, y: 0.54, w: 0.16, h: 0.16 },
      prompt: 'find each of them on the band · a locked aerial draws its own line',
      unlockedText: 'three lines · one crossing · he did not need the map to name the house standing on it',
    },
    {
      kind: 'thought',
      text: 'Every aerial in the parish, pointed here. She does not come to this house. She comes FROM it.',
    },
    { kind: 'voice', text: 'NOW YOU KNOW WHERE YOU LIVE.', mirrored: false },

    // --- The verso ---------------------------------------------------------
    {
      kind: 'prose',
      text: 'Her next sheet was waiting in the tin, typed as ever — but thin, the letters pressed so hard they stood proud of the back of the paper like weals. A sheet written for both sides of the wall. He understood, holding it to the lamp, that the far side was not merely the reverse of the near side. It was ADDRESSED differently.',
    },
    {
      kind: 'flip',
      id: 'b5-verso',
      front: [
        'TO THE KEEPER OF THE SET:',
        'the parish is assembled.',
        'the count wants nine.',
      ],
      back: [
        'to the wall’s side:',
        'keep the seat empty.',
        'the ninth listener is chosen,',
        'not volunteered.',
      ],
      targetWord: 'seat',
      mirroredBack: true,
      prompt: 'her sheet · pressed hard enough to read from the far side',
      backPrompt: 'the wall’s side · written the way a mirror writes',
      unlockedText: 'the seat · kept empty · chosen, not volunteered',
      solveCue: 'sheet-rustle',
    },
    {
      kind: 'thought',
      text: 'Nine listeners. Seven in the parish log, himself the — no. He stopped the arithmetic by hand, the way you stop a clock.',
    },

    // --- The network asks --------------------------------------------------
    {
      kind: 'prose',
      text: 'At the next evening’s hour the hedge-voices did a thing they had not done: they went quiet all together, like a room when the chairman stands, and then one of them — Portman, by the soft dairyman’s fist of him — sent the same short question over and over, patient as milking. The second log gave Edwin the old operator’s card to answer with; it had lived pasted in the toolbox lid under the wiring rhyme all along.',
    },
    {
      // no page-turn cue here: the send key's re-renders jitter this block
      // across the cue line and the page flips over and over (device QA)
      kind: 'logbook',
      lines: [
        'PORTMAN ASKS: WHO KEEPS THE HOUSE',
        '',
        'the operator’s card · the alphabet:',
        'A ·-    B -···  C -·-·  D -··   E ·',
        'F ··-·  G --·   H ····  I ··    J ·---',
        'K -·-   L ·-··  M --    N -·    O ---',
        'P ·--·  Q --·-  R ·-·   S ···   T -',
        'U ··-   V ···-  W ·--   X -··-  Y -·--',
        'Z --··',
      ],
    },
    {
      kind: 'morsesend',
      id: 'b5-send',
      word: 'MARSH',
      prompt: 'the key · short is a dit, long is a dah · a pause ends the letter',
      unlockedText: 'the name goes out steady · and the whole parish, softly, sends back the same two letters · R R R · received, received, received',
    },
    {
      kind: 'prose',
      text: 'Received. He sat back from the key with his heart going like a man who has spoken in church for the first time. Two hundred years the family name had been on this land, and it had taken a dead man’s radio to make him say it aloud.',
    },

    // --- She asks for him --------------------------------------------------
    {
      kind: 'prose',
      text: 'Then the parish faded — stood aside, rather, the way a congregation parts — and the next thing did not come over the air at all. It came out of the tin: a bound page, ruled, foxed at the corners from hands, and nearly every line of it signed. PORTMAN in a milker’s copperplate. The widow’s spidery hand. The boy, printing. Names above them going back and back, older inks going brown, older hands going strange. Three ruled lines near the foot looked empty. LOOKED. Held slant to the lamp, two of them carried brown ghosts — the shadows of entries scraped away, worked at with a blade until the paper itself had forgotten as much as paper can. One line had never taken ink at all. Her card lay under it: NO INK. SIGN WHERE NO ONE HAS BEEN UNSIGNED.',
    },
    {
      kind: 'register',
      id: 'b5-ear',
      stopsCue: 'parish',
      trueWell: 1,
      prompt: 'three lines with room · one has never taken ink · your thumb, held, where it belongs',
      unlockedText: 'the page warms · something in it counts your pulse back at you, politely · and then the line is no longer empty — the entry already dry, in her type: {NAME}',
    },
    {
      kind: 'thought',
      text: 'It had not asked his name. It had known his name for two hundred years. What it had wanted was his hand. And further up the page, in the older browns, he found her twice — MARGARET, and again MARGARET — and no line struck through either.',
    },
    { kind: 'voice', text: 'MARGARET SIGNED TWICE. NOBODY SIGNS TWICE.', mirrored: false },

    // --- The slip -----------------------------------------------------------
    {
      kind: 'prose',
      text: 'What came next did not come over the air. The set went to a hush that was almost tender; the tin clicked; and the new card said only CARRY THIS, DO NOT WRITE IT — and though the card bore nothing else, his hand, when he took it, closed on the certain feeling of having been HANDED something. Something with numbers in it. Something that would keep in a pocket the way borrowed words keep.',
    },
    { kind: 'slip', text: '52 05 02 N · 01 34 19 E' },
    {
      kind: 'fork',
      leftLabel: 'LOOK AT IT NOW',
      left: 'He turned out his pocket there at the bench: numbers, in her type, on no paper he could find a second time. Latitude and longitude, he judged — a place on the honest earth, which was somehow worse than any address inside the house. Some things gain weight by being carried. He had chosen to know at once, and knowing sat down beside him and stayed.',
      rightLabel: 'CARRY IT UNOPENED',
      right: 'He carried it three days the way you carry a tooth that has begun to speak to you: aware of it at every meal, at every stair, in church. When at last he turned out his pocket by lamplight the numbers were warm, which paper is not, and he read them with the sensation of finally answering a door that had been knocking politely the whole time.',
      join: 'Latitude and longitude. The marsh has no secrets from a man with his brother’s charts — but the charts were not needed, in the end, so much as the nerve to lay the numbers on one and follow them off the edge of the parish, east and a little south, to where the land runs out into shingle and the shingle keeps its strange roofs.',
    },

    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'her numbers — on the card, and, he',
        'discovered, already in his pocket,',
        'wherever this machine keeps what it',
        'carries:',
        '',
        '  52 05 02 N · 01 34 19 E',
        '',
        'a place on the honest earth.',
      ],
    },

    // --- The place ----------------------------------------------------------
    {
      kind: 'prose',
      text: 'He found it. A nose of shingle between river and sea, half a day’s ride south and east, that the charts keep a name for and the marsh-country keeps stories about: the bar of land where the ministry men built their pagoda-roofed laboratories in the last war and abandoned their giant listening mirrors in this one — and where a lighthouse stands dark at the point, decommissioned, its lamp taken out the way a tooth is taken out. A place made entirely of aerials and silence. Her return address. The pencil hovered over the last line of the page, which wanted only the name.',
    },
    {
      kind: 'cipher',
      id: 'b5-where',
      answer: 'ORFORD',
      prompt: 'the place the numbers keep · its name, not its numbers',
      unlockedText: 'he writes the name in the second log and the ink dries ordinary · the most frightening thing paper had done all week',
    },

    { kind: 'plate', image: 'obj-ness', caption: 'the place the numbers keep · aerials and silence' },

    // --- The count wants nine ----------------------------------------------
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'CARD 102:',
        '  GOOD. THE PARISH STANDS AT SEVEN.',
        '  THE EIGHTH HAS BOUGHT HIMSELF A SET.',
        '  THE NINTH IS CHOSEN, NOT VOLUNTEERED.',
        '  TOMORROW THE COUNT COMPLETES.',
      ],
    },
    {
      kind: 'prose',
      text: 'The eighth has bought himself a set. Edwin thought of Prentice’s van in the lane, of the new aerial he had watched go up over a council roof in the village that very week, guyed with washing-line, and of the particular lightness in the detection man’s step as he had walked away from this house. Seven, and Prentice the eighth. He did the arithmetic he had refused at the sheet, slowly, in the second log, where the wall could watch him do it.',
      faded: true,
    },
    { kind: 'voice', text: 'THE SEAT IS KEPT. SHE WILL CALL THE NINTH BY NAME.', mirrored: true },
    {
      kind: 'thought',
      text: 'And the house went quiet the way a church goes quiet — not empty. Attending.',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST FIVE' },
  ],
};
