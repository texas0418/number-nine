// site/clues/b2.ts — The Listeners' Society on Broadcast Two, "The Aerial".
//
// The first paid chapter, and the first in which the machine in the reader's
// hand starts behaving like part of the set. Three of B2's gates are ACTS
// rather than puzzles (the sealed letter, the sending key, the fork) and are
// not catalogued: they cannot be failed, so they cannot strand anybody.

import type { ArchiveSection } from '../types';

export const B2: ArchiveSection = {
  chapter: 2,
  title: 'BROADCAST TWO',
  subtitle: 'The Aerial',
  preamble:
    'From here the book stops asking you to find things and starts asking you to DO them, generally with the machine itself — turned, dimmed, faced at a bearing, held still. Members who have got this far by hunting the page for numbers tend to stall on the second or third intercept below, and the cure is nearly always to put the page down and pick the machine up. Note also that from this broadcast onward the book sets exactly one lock that wants typing. If you are trying to type at something, and it is not the last intercept in the chapter, you have mistaken the puzzle.',
  intercepts: [
    {
      id: 'b2-knocks',
      heading: 'The Knocking in the Wall',
      standfirst: 'Not the pipes. The pipes complain; this counts.',
      where:
        'Nothing is hidden here and nothing wants decoding. The wall is doing something very simple and rather patient, and it will go on doing it until you do the same thing back. Attend to the SHAPE of it: it knocks, and waits, and knocks again, in little parcels. Count the parcels and count what is in them.',
      members:
        '“Knock back. That is all it wants — nineteen years of listening in that house and nobody ever thought to answer in kind. Put the figures in your notebook while you are about it, mind. The wall is not only asking a question this evening; it is also telling you something you will want two chapters from now, and it will not repeat itself.” — the Chair, in correspondence',
      transcript:
        'Echo the four groups back: 4 · 7 · 1 · 5. They are also, and not by accident, a frequency you will want later in the chapter.',
    },
    {
      id: 'b2-overleaf',
      heading: 'The Letter, Both Faces',
      standfirst: 'Paper this thin carries writing on both faces.',
      where:
        'You have read one side of the letter. The prose is careful to tell you how thin the paper is, which is not a remark about stationery. A page has a back, and this one was written on — in pencil, faintly, the strokes turned the wrong way. The machine in your hand turns over exactly as a sheet of paper does.',
      members:
        '“Lay the thing face down, or take the corner and drag it over — either serves. On the reverse you will find three lines his brother wrote where the light could not find them, and in the middle line one word is pressed harder into the paper than everything around it. Put your finger on that one. He meant it to be the word you noticed; he simply could not bear to say it to your face.” — a member of thirty years',
      transcript:
        'Turn the letter over (lay the phone face down, or drag the dog-ear), then touch the word “unanswered” in the pencilled line on the back.',
    },
    {
      id: 'b2-shyink',
      heading: 'The Shy Ink',
      standfirst: 'Below the signature, a blankness that does not feel blank.',
      where:
        'The prose does the diagnosis for you and most members read straight past it: he carried the page to the desk lamp, and some instinct older than reason told him the lamp was the problem. Not the paper. The LAMP. There is a lamp in your hand as well, and it is at present turned up much too high for this kind of ink.',
      members:
        '“Take the light down — in the machine’s own settings, or by dragging the little wick on the page itself, whichever comes to hand. A line surfaces under the signature that was not there in the glare. It gives a bearing, in his carefullest hand, and the page then wants you to touch the bearing it names.” — our member at the coast',
      transcript:
        'Dim the screen. The hidden line reads: “true means: the wire drinks nothing unless it looks to the pole star.” Touch the words “pole star” in that line.',
    },
    {
      id: 'b2-exchange',
      heading: 'The Girl at the Exchange',
      standfirst: 'Every clock in the house has stopped, each at a different hour.',
      where:
        'This one leaves the book, and the Society thinks rather well of it for that. The log margin tells you the method exactly: for the exact hour do it the city way — ask the exchange for the girl by name, three letters, and every Londoner knew her. She was a real service and she had a real name, and the name was dialled rather than spoken.',
      members:
        '“In 1963 you got the time by ringing the speaking clock, and you rang it by spelling her name on the dial — the letters live on the finger-holes, three of them to a number, and everyone in London could do it without looking. If your own dial has no letters printed on it, find a photograph of a proper one. The name is short and it is a man’s name, which always amused us.” — the Chair, in correspondence',
      transcript:
        'The speaking clock was TIM. On a GPO dial that is 846.',
    },
    {
      id: 'b2-schedule',
      heading: 'The Receiver’s Clock',
      standfirst: 'Set it for her, not for the sun.',
      where:
        'Two pieces, and you have owned the first since the last broadcast: the first listening log records the hour she keeps, and records it more than once. The second is on the index cards in the tin, in the margin, and it is a rule about what her hour does when she is ignored. The letter’s reverse tells you how many times she has been ignored.',
      members:
        '“Her hour in the old log is a quarter past eleven at night, near enough. The margin says an hour earlier for every night unanswered, and the pencil on the back of that letter counts three such nights. So take three hours off her, and set the hands there. She is not being mysterious. She is being early, which is worse.” — a member of thirty years',
      transcript:
        '23:14, less one hour for each of the three unanswered nights: 20:14.',
    },
    {
      id: 'b2-aerial',
      heading: 'The Mount at the Mast’s Foot',
      standfirst: 'A ring of greased brass, built to be turned in the dark.',
      where:
        'The shy ink already told you where the wire must look, in as many words. What remains is doing it — and the mount turns with your whole machine, which has a needle in it whether or not you have ever asked it for one. If the needle will not answer where you are standing, the ring will take a finger instead.',
      members:
        '“The pole star is north, and has been obliging about it for some time. Bring her nose round to north and then HOLD her there — the ring wants a steady hand for a beat or two, not a lucky sweep past the mark. If your machine’s needle is asleep, drag the ring round by hand; the wire cannot tell the difference and neither can she.” — our member at the coast',
      transcript:
        'North: 0°, held within about eight degrees until the ring seats.',
    },
    {
      id: 'b2-tune',
      heading: 'Higher Than She Was',
      standfirst: 'She is not at the old place on the dial, and this does not surprise him.',
      where:
        'Card ninety in the tin is the whole of it, and it is written as plainly as this station ever writes anything: when her count is done she carries it up the band, all of it, every kilocycle, and she does not round down. You know where she was last. You have known her nightly count since the tally marks inside the music box lid.',
      members:
        '“Ninety groups, ninety kilocycles, straight up from where you found her in the cellar. That is the sum and there is no trick in it beyond having kept both halves. The knocking in the wall gave you the same figure this morning, if you wrote it down — she does like to say a thing twice in different voices.” — the Chair, in correspondence',
      transcript:
        '4625 kHz carried up by her count of ninety: 4715 kHz.',
    },
    {
      id: 'b2-message',
      heading: 'Eight Groups, and a Silence',
      standfirst: 'She counts eight, and then the open channel waits — a first, in all the years.',
      where:
        'Three rules at once, and you own every one of them already. Two came out of the first broadcast: the numbers are letters, and her words arrive turned around. The third is new this evening and the book states it twice — once in pencil on the back of the letter, once in the margin of the tin cards, in the phrase about being above herself. That third rule is a quantity. Find the quantity.',
      members:
        '“She has climbed, and she has climbed by the number of nights she was left waiting. So give it back to her: add that much to every figure before you do anything else, and let it run past the end of the alphabet and round to the beginning again if it must. Then you have letters, and the letters are nonsense, and you know perfectly well what to do with her nonsense by now.” — a member of thirty years',
      transcript:
        'Add 3 to each figure, wrapping past 26: 17·06·10·16·11·24·15·17 becomes 20·09·13·19·14·01·18·20 — TIMSNART. Reversed: TRANSMIT.',
    },
  ],
};
