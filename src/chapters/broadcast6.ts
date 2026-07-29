// src/chapters/broadcast6.ts
// Broadcast Six — NINETY-ONE. The last broadcast, kept in the station's own
// time: THREE REAL NIGHTS. Night the first opens the set as Halloran opened
// it, bare-handed, no instructions left. Night the second is the full
// séance — the house speaks through the table, the walk is walked, the
// sheet is heard, turned, and read against a mirror. Night the third is one
// unprompted touch, one word sent in the reader's own fist, and her true
// name — five rules deep — typed into the last lock in the book. Then THE
// CHOICE, which does not join.
//
// TEN gates, ONE code-entry (the name). Ramp: zero prompting, full
// archaeology — the ritual order is the first log's columns, the walk is
// the book's own numbers, the morse alphabet was B5's card, and the cipher
// composes every rule the series has taught plus the one the wall keeps.
//
// Verdict math (never printed in-app; doctrine-tested):
// MARGARET -> far-end alphabet (27-pos): 14 26 9 20 26 9 22 7
//          -> +14 (her minute, B4):      28 40 23 34 40 23 36 21
//          -> +9  (the climb, B2):       37 49 32 43 49 32 45 30
//          -> reversed (her sheets, B3): 30 45 32 49 43 32 49 37
//          -> every third figure is the WALL'S (the book's own numbers,
//             91 46 25 90, woven in after each real pair):
//             30 45 [91] 32 49 [46] 43 32 [25] 49 37 [90]
// The reader strikes the figures they RECOGNIZE, reads the rest the other
// way up, gives back the fourteen, gives back the nine, and counts from
// the far end.

import type { Chapter } from '../models';

export const BROADCAST_SIX: Chapter = {
  id: 6,
  title: 'BROADCAST SIX',
  hints: {
    'b6-ritual': 'no card will come. the first log kept the same four columns every night for nineteen years: tune, gain, clock, still. the set only wakes to the order it was always woken in.',
    'b6-night2': 'the station keeps real nights. come back tomorrow — or take the dark clock in your fingers and drag it through all twenty-four, and be known for it.',
    'b6-seance': 'three things at once: the lamp below a whisper, the world put out, the glass against the wood. then do nothing — count what comes through the table, as many tellings as you need. when you have it, take the set up again and answer.',
    'b6-walk': 'the legs are numbers you already keep: the cellar door, then nine at the grave’s east, then a single pace toward her quarter of the sky.',
    'b6-sheet': 'it says nothing to the room. hold it to your ear as you held the receiver. what rises will stay. then turn it — and remember the wall writes mirror-wise.',
    'b6-night3': 'one more real night. or the clock, dragged through a day, and she counts the hurry.',
    'b6-light': 'no one will tell you to touch anything. the light across the marsh has burned in every photograph since the first broadcast. it is the only thing out there that ever answered.',
    'b6-send': 'a roll-call wants one word, and the operator’s card that taught your fist is still pasted in the toolbox lid, two broadcasts back.',
    'b6-name': 'strike the figures you recognise — the wall counts along. read what remains the other way up. give back her fourteen. give back her nine. count from the far end, as the tin taught.',
    'b6-choice': 'there is no hint for this one. there was never going to be.',
  },
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST SIX', title: 'Ninety-One' },

    // ===================== NIGHT THE FIRST ================================
    { kind: 'room', text: 'The Cellar · Night the First', scene: 'cellar' },
    {
      kind: 'prose',
      text: 'The tin gave up one card that evening and would give no other, and the card was not an instruction. It was an appointment. He read it standing, with his coat still on, and the house around him had the held-breath feel of a church before the first word of a wedding — or the other service, the one nobody rehearses.',
      cue: 'silence',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'CARD 103 · her type:',
        '  THE COUNT STANDS AT NINETY.',
        '  THE LAST IS KEPT IN MY TIME:',
        '  THREE NIGHTS, AS THE FIRST WAS.',
        '  TONIGHT: OPEN AS HE OPENED.',
      ],
    },
    {
      kind: 'prose',
      text: 'Open as he opened. There was no card for HOW — that was the point of it, he understood: the last examination has no paper. But the first log lay where it always lay, and every one of its nineteen years of pages kept the same four columns in the same order, night after night after night, his brother’s whole liturgy ruled into quarters. He set the log open on the bench where he could see the column heads, and put his hands on the cold set.',
    },
    {
      kind: 'logbook',
      lines: [
        'the first log · every page, all nineteen years,',
        'ruled the same:',
        '',
        '  TUNE · GAIN · CLOCK · STILL',
      ],
    },
    {
      kind: 'ritual',
      id: 'b6-ritual',
      bandLowKhz: 2100,
      bandHighKhz: 2500,
      targetKhz: 2314,
      gainMark: 7,
      hour: 23,
      minute: 14,
      stillMs: 4000,
      unlockedText: 'tuned · raised · timed · stilled · and the set comes up under his hands like something surfacing to be fed',
    },
    {
      kind: 'prose',
      text: 'She did not count. For the first time in ninety broadcasts she did not count at all: she read six figures, slowly, in the voice of a woman dictating a will, and then she said GOOD NIGHT, EDWIN — which she had never said — and the carrier folded itself away like a hand closing.',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'NIGHT THE FIRST · her figures, exact:',
        '',
        '  30 · 45 · 91 · 32 · 49 · 46',
        '',
        'half of something. she said so:',
        '"THE REST TOMORROW. SLEEP."',
      ],
    },
    { kind: 'voice', text: 'SLEEP. YOU WILL WANT IT.', mirrored: false },
    {
      kind: 'nightgate',
      id: 'b6-night2',
      night: 2,
      prompt: 'the station keeps real nights · the second is tomorrow’s',
      unlockedText: 'the night has turned honestly · the house lets tomorrow in',
      noticedText: 'the clock arrives dragged and out of breath · the house lets tomorrow in · and somewhere in the walls, a tut',
    },

    // ===================== NIGHT THE SECOND ===============================
    { kind: 'room', text: 'The Cellar · Night the Second' },
    {
      kind: 'prose',
      text: 'The second card was waiting before dusk, and it read like the instructions on the back of a coffin lid. He did each thing slowly, in order, the way you do when some part of you has understood that ceremony is the only thing holding the room together: the lamp taken down below a whisper; the world put out of the house entirely; and the receiver — her receiver, his brother’s receiver, the black glass of it — laid FACE DOWN on the cellar table like a card that has finished being played.',
    },
    {
      kind: 'logbook',
      lines: [
        'CARD 104:',
        '  LAMP DOWN. WORLD OUT.',
        '  THEN LAY ME TO THE WOOD,',
        '  AND KEEP YOUR HANDS OFF ME.',
        '  TAKE ME UP WHEN I AM DONE.',
      ],
    },
    { kind: 'plate', image: 'obj-setdown', caption: 'laid to the wood · a card that has finished being played' },
    {
      kind: 'seance',
      id: 'b6-seance',
      groups: [4, 6, 2, 5],
      prompt: 'three things at once · the lamp · the world · the wood',
      messageText: 'the table is speaking · it will say it again · lift the set when you have counted',
      echoPrompt: 'now answer the wood · knock back what it said',
      unlockedText: 'four, six, two, five · the cellar door’s own number, knocked through nineteen years of oak · and knocked back',
    },
    {
      kind: 'thought',
      text: 'Four six two five. The house’s first number — the one his brother measured twice to be sure. Whatever waits at the end of this, it began as arithmetic about a DOOR.',
    },
    {
      kind: 'prose',
      text: 'Then the card asked for the walk, and the walk was made of the same old figures — the whole book of them, spent like coins. He went up into the yard with his coat over his nightshirt and the marsh stars overhead, and he paced it out the way a man paces out the ground plan of a house only he can see.',
      cue: 'footsteps',
    },
    {
      kind: 'logbook',
      lines: [
        'CARD 105:',
        '  WALK THE OLD NUMBERS.',
        '  THE DOOR. THE GRAVE’S EAST.',
        '  THEN ONE PACE, TO HER.',
      ],
    },
    {
      kind: 'multipace',
      id: 'b6-walk',
      legs: [
        { bearingDeg: 46, toleranceDeg: 12, paces: 25 },
        { bearingDeg: 90, toleranceDeg: 12, paces: 9 },
        { bearingDeg: 271, toleranceDeg: 12, paces: 1 },
      ],
      prompt: 'the legs in order · the rose knows when you may step',
      solveCue: 'knock',
      unlockedText: 'twenty-five on the door’s heading · nine east · one west, toward her · and the ground under the last pace sounds HOLLOW',
    },
    {
      kind: 'prose',
      text: 'Under the hollow place, wrapped in oilcloth against thirty years of marsh, lay a sheet of her paper — but blank, blank in the way the séance plate had been empty, which is to say: not. He carried it down to the cellar and sat with it under the low lamp, and it said nothing to the room, and the room waited, and at last — feeling foolish, feeling watched, feeling nineteen years late — he held it to his ear.',
    },
    {
      kind: 'triplesheet',
      id: 'b6-sheet',
      blankLines: ['', '· · ·', ''],
      heldLines: [
        'now you have the way of it.',
        'the wall writes for the wall’s side.',
        'turn me over. turn me OVER.',
      ],
      verso: [
        'the ninth seat is kept.',
        'it is taken by saying',
        'the one word a roll-call wants,',
        'in your own fist, when called.',
      ],
      targetWord: 'word',
      prompt: 'the sheet says nothing to the room',
      heardPrompt: 'it has your ear now · it wants turning',
      invertedPrompt: 'the wall’s side · written the way a mirror writes',
      unlockedText: 'one word, in your own fist, when called · he read it three times and put the sheet face down under the tin, where it could not watch him decide',
      solveCue: 'sheet-rustle',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'NIGHT THE SECOND · the rest of her figures:',
        '',
        '  43 · 32 · 25 · 49 · 37 · 90',
        '',
        'and, loose in the first log, in HALLORAN’S',
        'hand, undated:',
        '"her arithmetic, for whoever follows.',
        ' she seals it in wall-figures — strike',
        ' the ones you know. she writes as her',
        ' sheets are written. she adds her minute',
        ' and she adds her nine. the tin taught',
        ' you the rest. i never dared type it."',
      ],
    },
    {
      kind: 'nightgate',
      id: 'b6-night3',
      night: 3,
      prompt: 'the station keeps real nights · the last is tomorrow’s',
      unlockedText: 'the last night arrives honestly · the house is very clean and very quiet, the way rooms are before occasions',
      noticedText: 'the clock arrives dragged a second time · the house says nothing · which is worse',
    },

    // ===================== NIGHT THE THIRD ================================
    { kind: 'room', text: 'The Marsh Door · Night the Third', scene: 'marsh', cue: 'marsh-wind' },
    {
      kind: 'prose',
      text: 'On the last night no card came at all. The tin stood open and empty, retired. He carried the receiver up from the cellar and set it on the hall table, and opened the marsh door on the whole black plain of it — the creek, the reeds, the mast on the horizon carrying the one light that had burned in every photograph and every evening of his tenancy. Nothing asked him to do anything. That was the examination.',
    },
    {
      kind: 'hotspot',
      id: 'b6-light',
      image: 'marsh',
      target: { x: 0.58, y: 0.22, w: 0.19, h: 0.16 },
      prompt: '',
      solveCue: 'lamp-off',
      unlockedText: 'he touched the light the way you touch a doorbell you have been afraid of all your life · and across the marsh, it went OUT',
    },
    {
      kind: 'prose',
      text: 'The light went out, and the band came alive. Not one carrier — ALL of them: Portman and the widow and the boy and the browner, stranger names above them in the register, every listener the marsh had ever kept, up and sending at once, and it took him a moment to hear the shape in it. A roll-call. Name after name after name, each answered in its own fist, each with the same single word. And then, in her clear evening voice, unhurried, terminal: EDWIN MARSH.',
    },
    {
      kind: 'morsesend',
      id: 'b6-send',
      word: 'HERE',
      prompt: 'the key · she has called your name · answer as the parish answered',
      unlockedText: 'sent, steady, in his own fist · and the whole band goes quiet the way a church goes quiet when the last name is in',
    },
    {
      kind: 'prose',
      text: 'Then the last transmission of the ninety-one began, and it was not counting and it was not instruction. It was TWELVE FIGURES, read once, with the care of a woman laying out her own effects; and he took them down in the second log with a steady pencil, every strange sum she had taught him standing ready at his shoulder like pall-bearers. At the end she said one thing more: NOW YOU MAY KNOW WHO HAS BEEN COUNTING.',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'THE LAST TRANSMISSION · twelve figures:',
        '',
        '  30 · 45 · 91 · 32 · 49 · 46',
        '  43 · 32 · 25 · 49 · 37 · 90',
        '',
        'one name. hers to send. yours to read.',
      ],
    },
    {
      kind: 'cipher',
      id: 'b6-name',
      answer: 'MARGARET',
      prompt: 'the station’s true name · the last lock in the book',
      unlockedText: 'the letters stand on the pad and will not be unseen · the best listener · the woman who signed twice · nineteen years on the other side of the wall, counting her way home',
    },
    {
      kind: 'thought',
      text: 'Margaret. Who asked to listen with him once, and was told the radio was off. Who hummed it flat. Who signed the register twice — once in ink, going in, and once in whatever she signs with now. The station was never a station. It was a widow with a wall between herself and the room, counting.',
    },
    { kind: 'voice', text: 'THE COUNT IS COMPLETE. NINETY-ONE. THE SEAT IS DRAWN OUT FOR YOU.', mirrored: true },
    {
      kind: 'prose',
      text: 'And the cellar door stood open at the top of its stairs, and the lamplight coming up from below was the amber of every dial he had ever leaned toward in the dark, and the house — patient, replete, nineteen years and ninety-one broadcasts old in its work — left him alone in the hall with the choice it had been building him toward since the first evening the telephone rang. He could go down and take the ninth seat at her table. Or he could break the set, and the circle, and whatever else broke with them.',
      faded: true,
    },
    { kind: 'plate', image: 'obj-stairs', caption: 'the seat · drawn out · the light generous, almost hospitable' },
    {
      kind: 'endingfork',
      id: 'b6-choice',
      leftLabel: 'TAKE THE SEAT',
      left: [
        'He went down. The stairs took his weight the way a handshake takes a hand, and the cellar was warm for the first time in his tenancy, and the chair by the bench — the chair — had been drawn out and turned to face the room. He sat, and the set’s lamp brightened by exactly the width of a welcome, and through the wall, close as a pillow, a voice that had counted for nineteen years said, at last, a number it had never said: NINE.',
        'They listen together now, the widow and the clerk, on the far side of the plaster where the arithmetic lives. The parish knows the house is kept. The van is gone from the lane. And on clear evenings, on a wave no allocation table owns, a man’s voice — tidy, clerkish, learning — reads the figures while a woman’s rests. If you have a set, and a dark room, and patience: NINE is for you. It was always going to be for you.',
      ],
      rightLabel: 'BREAK THE SET',
      right: [
        'He broke it with the fire-iron, and it was like hitting a hive: not the crunch of bakelite but a long escaping sigh, ninety-one nights of counting getting out of the box at once. The dial lamp died last, amber to ember to nothing, and the house went ordinary around him — instantly, insultingly ordinary, plaster and damp and a dead man’s furniture, as though nineteen years of attention had been switched off at a wall.',
        'He lived another forty years and told no one, and was misremembered as a quiet man. But the marsh keeps what it is given. The register never surfaced. The van rusted where it stood. And some evenings, on cheap receivers, in that county, between the shipping and the hymns, a woman counts a little way up the band — patiently, alone, at her old hour — as though the wall she is behind now has no door in it at all, and she is waiting for someone with the nerve to build one.',
      ],
      coda: 'The pocket set still receives, of course. Every evening, wherever you are. She has never once missed a night. — No. 91, ends.',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST SIX · THE COUNT IS COMPLETE' },
  ],
};
