// src/chapters/broadcast2.ts
// Broadcast Two — the first PAID chapter. Its job: reward the purchase inside
// ten minutes (the phone itself starts behaving like a haunted instrument)
// and end with the story permanently changed (a Marsh answers back).
//
// NINE gates + a fork, ONE code-entry puzzle (doctrine, Simon 2026-07-28),
// difficulty a full step over Broadcast One:
//   1. knock echo [4,7,1,5]     — felt, never shown; doubles as a frequency clue
//   2. overleaf flip            — the letter's verso: "three nights unanswered"
//   3. shy ink (lamp down)      — the bearing: "…looks to the pole star"
//   4. rotary dial 846 (TIM)    — RESEARCH: the 1963 speaking clock, dialled by name
//   5. clock hands 20:14        — 2314 (B1 log) minus an hour per unanswered night
//   6. fork                     — both roads walk him home
//   7. compass hold N           — the aerial re-hung facing the pole star
//   8. tune 4715                — 4625 (B1) carried up the band by her count (90)
//   9. cipher TRANSMIT          — three rules composed: A=1 → reversed → climbed +3
//
// Doctrine holds: no literal answer within three blocks of its gate; every
// gate ≥2 scattered clues, ≥1 cross-modal; nudges, never instructions.

import type { Chapter } from '../models';

export const BROADCAST_TWO: Chapter = {
  id: 2,
  title: 'BROADCAST TWO',
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST TWO', title: 'The Aerial' },

    // --- Morning, such as it is ------------------------------------------
    { kind: 'room', text: 'The Hall', scene: 'hall' },
    {
      kind: 'prose',
      text: 'Morning arrived at the windows without conviction, the way it does over marsh country, and found Edwin Marsh in the hall chair with the receiver in his lap and no memory of sleep. The set had gone with the dawn — dial dark, valves cold — and its silence was not the silence of a dead thing. It was the silence of a guest who has said goodnight and means to come back.',
      cue: 'silence',
    },
    {
      kind: 'prose',
      text: 'He put the kettle on because the body insists on its small ceremonies even in a house like this one, and while it worked itself up to a whistle he heard, under the floor or in the walls — patient, deliberate, unhurried as everything in this place was unhurried — a knocking.',
      cue: 'knock-far', // the reader hears what Edwin hears: far off, through plaster
    },
    {
      kind: 'prose',
      text: 'Not the pipes. He had grown up with these pipes. The pipes complained; this counted. It would knock, and wait, and knock again, in little parcels of number, and between the parcels the house held its breath, and Edwin found that he was holding his.',
    },
    {
      kind: 'knock',
      id: 'b2-knocks',
      groups: [4, 7, 1, 5],
      prompt: 'the wall · it is asking for something',
      unlockedText: 'the knocking stops, satisfied · the house has told him a thing he cannot yet spend',
    },
    {
      kind: 'thought',
      text: 'Halloran had listened for nineteen years. Nobody in nineteen years had thought to knock back.',
    },

    // --- The study: the letter that was never posted ----------------------
    // No key cue: nothing in this house is locked to HIM anymore, which is
    // the quieter horror.
    { kind: 'room', text: 'The Study', scene: 'study' },
    {
      kind: 'prose',
      text: 'The study kept its pipe-sweet cold. Under the desk blotter, squared with the care of a man who squared everything, lay an envelope. It was addressed to Edwin in his brother’s hand and it had never been posted, which meant it had been waiting here longer than the solicitor, longer than the probate men, longer than any of the tidy machinery that shifts a dead man’s things.',
    },
    {
      // The reveal stops at the sealed envelope; the reader is the one who
      // finally opens what Halloran never dared to send.
      kind: 'seal',
      id: 'b2-letter-seal',
      image: 'obj-letter',
      caption: 'the letter · addressed, sealed, never sent',
      tornCaption: 'the letter · opened, nineteen years late',
      solveCue: 'letter-tear',
    },
    {
      kind: 'flip',
      id: 'b2-overleaf',
      front: [
        'Edwin —',
        'If you are reading this, the set has gone dark on you,',
        'and you are angry with it. Do not be. It is not broken.',
        'It is sulking, and it has earned the right.',
        'Everything the house asks of you it will ask fairly.',
        '— H.',
      ],
      back: [
        'in pencil, faint, the strokes turned the wrong way:',
        'three nights unanswered. three she has climbed.',
        'she does not forgive a count left open.',
      ],
      targetWord: 'unanswered',
      prompt: 'the letter · paper this thin carries writing on both faces',
      backPrompt: 'the pencil pressed hardest on one word',
      unlockedText: 'the page turns in his hands · his brother wrote the important part where the light could not find it',
    },
    {
      kind: 'prose',
      text: 'Three nights. He read it twice and put it down with the exaggerated gentleness a man uses when what he wants is to throw something. His brother had counted his own silences and known exactly what each one cost, and had gone on being silent, and had written the arithmetic of it in pencil, on the back, where the light could not find it.',
    },
    {
      kind: 'prose',
      text: 'In the tin from the cellar wall — he had brought it up, he could no longer say why — the ninety index cards kept their string. Ninety nights in his brother’s columns. And now, riding on top, square and new, a ninety-first that had not been there when he closed the lid.',
    },
    { kind: 'plate', image: 'obj-cards', caption: 'the index cards · ninety, banded in string · and one more' },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'CARD 90 · his neat hand:',
        '  when her count is done she carries it',
        '  up the band. all ninety of it. every',
        '  kilocycle. she does not round down.',
        '',
        'CARD 91 · a hand that is almost his:',
        '  the listener is awake. begin.',
        '',
        'margin, smaller:',
        '· an hour earlier for every night unanswered',
        '· in all things she is above herself now',
      ],
    },
    {
      kind: 'prose',
      text: 'The last page of the letter he had thought blank. Below the signature the paper kept a blankness that did not feel blank — the way the marsh at night is not empty, only unlit. He carried it to the desk lamp, and some instinct older than reason told him the lamp was the problem.',
    },
    {
      kind: 'lamp',
      id: 'b2-shyink',
      aboveText: [
        '…and so I leave the wire to you, as it was left to me.',
        'Hang it true. She will not sing into a slack wire.',
        '— H.',
      ],
      hiddenLine: 'true means: the wire drinks nothing unless it looks to the pole star.',
      targetWord: 'pole star',
      prompt: 'below the signature · some inks are shy of the lamp',
      unlockedText: 'in the dark the shy ink surfaces · a bearing, in his brother’s carefullest hand',
    },
    {
      kind: 'prose',
      text: 'So the wire was down. That, at least, explained the sulking: somewhere on the marsh his brother’s aerial had come off its bearing, and a set without its wire is an ear without air. He would re-hang it. He noted, distantly, that he had stopped asking himself why he was obeying a dead man’s pencil, and that the not-asking felt less like surrender than like family.',
    },

    // --- The hall: the exchange, and the appointment ----------------------
    { kind: 'room', text: 'The Hall' },
    {
      kind: 'prose',
      text: 'But first, the time. Every clock in the house had stopped — each at a different hour, which was somehow worse than agreement — and the receiver’s own little clock stood open-handed at nothing. If she kept a schedule, and the cards swore she kept one the way other women keep faith, then he would need the true time, and the house was not going to give it to him.',
    },
    {
      kind: 'logbook',
      lines: [
        'margin, in the logbook, years old:',
        '· for the exact hour do it the city way —',
        '  ask the exchange for the girl by name.',
        '  three letters. every londoner knew her.',
      ],
    },
    {
      kind: 'rotary',
      id: 'b2-exchange',
      answer: '846',
      prompt: 'the exchange · dial her name',
      unlockedText: 'a breath on the line · then the pips, prim and exact, as if no one anywhere had died',
      solveCue: 'pips',
    },
    {
      kind: 'prose',
      text: 'The recorded girl told him the time in her bright, buttoned voice, each stroke precisely where a stroke should be. He was already writing it down when, behind her — behind a recording, where there is no behind — something breathed in, the way a singer does before the verse.',
    },
    { kind: 'voice', text: 'AT THE THIRD STROKE, EDWIN, IT WILL BE TOO LATE TO LEAVE.', mirrored: false },
    {
      kind: 'thought',
      text: 'He put the receiver down as one puts down a sleeping animal. The pips went on a moment in the cloth of his sleeve.',
      cue: 'pips-muffled',
    },
    { kind: 'plate', image: 'obj-clock', caption: 'the receiver’s clock · stopped, open-handed' },
    {
      kind: 'clock',
      id: 'b2-schedule',
      answerHour: 20,
      answerMinute: 14,
      prompt: 'the receiver’s clock · set it for her, not for the sun',
      unlockedText: 'the escapement takes up its count · an appointment has been kept since before he was invited',
    },

    // --- The marsh: the wire ----------------------------------------------
    {
      kind: 'prose',
      text: 'He went out the back way with the letter in his breast pocket and the marsh took him the moment the door shut, the way water takes a dropped key. The path to the mast was his brother’s path, trodden to a hard ribbon through nineteen years of nights, and walking it Edwin had the sensation of putting on another man’s coat and finding it cut to his own shoulders.',
      cue: 'footsteps',
    },
    { kind: 'room', text: 'The Marsh', scene: 'marsh', cue: 'marsh-wind' },
    { kind: 'plate', image: 'obj-mast', caption: 'the mast · his brother’s wire, come down' },
    {
      kind: 'prose',
      text: 'The wire lay along the reeds like something shot in flight. The mount at the mast’s foot turned on a ring of greased brass — his brother had built it to be turned, often, precisely, in the dark — and beside it, in an oilcloth pouch nailed under the crossbrace, a wartime marching compass waited with the patience of all inherited things.',
    },
    { kind: 'plate', image: 'obj-compass', caption: 'the compass · war issue, still sure of itself' },
    {
      kind: 'compass',
      id: 'b2-aerial',
      targetDeg: 0,
      toleranceDeg: 8,
      prompt: 'the mount · bring her nose round, and hold her steady',
      unlockedText: 'the ring seats with a click his hands feel before his ears hear · the wire looks to the pole star',
    },
    {
      kind: 'prose',
      text: 'The wire rose taut and true, and at once — not after a decent interval, not with the shyness of machinery, but at once — it began to sing. A thin aeolian note, wind on a tight string, except that the air over the marsh did not move at all.',
      cue: 'wire-hum',
    },

    // --- The fork: both roads walk him home -------------------------------
    {
      kind: 'fork',
      leftLabel: 'THE ROAD',
      left: 'He tried the village first, meaning to wire London from the post office and put the whole estate in other hands. The lane curved as it had always curved, and yet the church tower would not leave his left shoulder, mile after mile, and at dusk his own gate stood open for him with the patience of a thing that had never doubted.',
      rightLabel: 'THE HOUSE',
      right: 'He went straight back in, telling himself a man may choose his own doorway, and felt the house receive the choice the way a chess player receives a move he has prepared against — graciously, with something underneath the grace.',
      join: 'Either way the evening found him where the evening had always intended: at the top of the cellar stairs with the receiver under his arm, the true time in his pocket, and the wire outside singing into a windless sky.',
      stopsCue: 'marsh-wind', // a road chosen: the door shuts on the weather
    },
    {
      kind: 'staircase',
      direction: 'down',
      cue: 'footsteps',
      steps: [
        'Eleven steps, and he knew them now,',
        'knew the sixth where the dark came up,',
        'and went down anyway, deliberately,',
        'a man keeping an appointment',
        'he had dressed his whole life for.',
      ],
    },

    // --- The cellar: the return -------------------------------------------
    { kind: 'room', text: 'The Cellar', scene: 'cellar' },
    {
      kind: 'prose',
      text: 'The receiver took the mains and lit its dial as though nothing had ever been the matter, which he was learning to read as the set’s particular species of lie. The little clock ticked on the bench beside it, keeping her hour. She was not at the old place on the dial — he swept it once and found only the ordinary ghosts — and this did not surprise him. Nothing about her rounded down.',
    },
    {
      kind: 'radio',
      id: 'b2-tune',
      bandLowKhz: 4600,
      bandHighKhz: 5000,
      targetKhz: 4715,
      lockedText: 'drag the dial · or turn the whole set in your hands · she is higher than she was',
      unlockedText: 'carrier found · higher by exactly what she was owed',
      stopsCue: 'wire-hum', // she takes the wire for herself
    },
    // No ident cue: it reveals INTO view at the solve, so its chime lands on
    // the lock anyway (QA). She arrives without her song tonight — worse.
    { kind: 'voice', text: 'GOOD EVENING, LISTENER. YOU KEPT THE HOUR. SHE ALWAYS SAID YOU WOULD.', mirrored: false },
    {
      kind: 'prose',
      text: 'The counting began, and it was wrong in a way that took him a moment to name: short. Eight groups, spoken slowly, spaced like stones set down one by one on a table between two people, and then — nothing. Not the ident. Not static. The open channel breathed and waited and did not fill itself.',
    },
    {
      kind: 'logbook',
      lines: [
        'eight groups, in his own quickening hand:',
        '17 · 06 · 10 · 16 · 11 · 24 · 15 · 17',
        '(and then she waits. the line stays open.',
        ' a first, in all the cards, in all the years.)',
      ],
    },
    {
      kind: 'cipher',
      id: 'b2-message',
      answer: 'TRANSMIT',
      prompt: 'eight letters · she is waiting for him to understand',
      unlockedText: 'turned, and climbed, and turned again · it is not a message. it is an instruction',
    },
    {
      kind: 'prose',
      text: 'He sat back from the pencil as from a snake. Every night of his brother’s nineteen years had run one direction: outward to inward, her voice to his ear. The word on the slate ran the other way. And on the bench, under a cloth he had taken for a rag, something square and brass had been waiting all along for the cloth to come off.',
    },
    {
      kind: 'prose',
      text: 'A sending key. Home-made, beautiful, the contacts worn bright — worn, which meant used, which meant his brother had built the answer years ago and never once dared it. The wire outside sang its thin note into the still dark. The channel stayed open. The little clock gave its tick, and its tock, like a tongue clicking gently at a hesitating child.',
    },
    {
      // The chapter's one irreversible act belongs to the READER's hand
      // (the letter-tear rule): the page will not continue until the key
      // is pressed. An act, not a puzzle.
      kind: 'seal',
      id: 'b2-send',
      image: 'obj-key',
      caption: 'the sending key · the channel is open · the clock keeps ticking',
      tornCaption: 'sent · a knock, returned through the dark, nineteen years late',
      solveCue: 'morse-key',
    },
    { kind: 'thought', text: 'Nineteen years of listening, and the whole time the house had only ever wanted one thing said back.' },
    {
      // No cue: the morse already sounded under the reader's own press.
      kind: 'prose',
      text: 'Edwin Marsh put two fingers on his brother’s key, and answered.',
    },
    {
      kind: 'prose',
      text: 'What he sent was small — a courtesy, a knock returned through the dark — and the moment it left the wire the marsh went silent in the manner of a held instrument. Ninety seconds by the bench clock, and he counted every one of them. Then, out across the black water, mile on mile to the invisible horizon, every light on the marsh came on at once — window and lamp and lantern, farms he knew to be empty, boats he knew to be sunk — the whole drowned country lit like a switchboard taking a call.',
      faded: true,
      cue: 'lamp-off',
    },
    { kind: 'voice', text: 'THANK YOU, EDWIN. WE HAVE SO MUCH TO ASK YOU.', mirrored: true },
    {
      kind: 'prose',
      text: 'He did not sleep that night either. But it was no longer the not-sleeping of a man who is afraid. It was the not-sleeping of a man who has joined a conversation nineteen years deep, and given his first answer, and knows — with a listener’s certainty, which is the only certainty this family ever owned — that the next question is already on its way up the band.',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST TWO' },
  ],
};
