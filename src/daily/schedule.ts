// src/daily/schedule.ts
// Pure module: which transmission airs on which night. The plaintexts are the
// prequel — Halloran Marsh's listening log, serialized one line per night in
// order, so streak-keepers are reading a second story. Before SERIAL_EPOCH
// (and after the list runs out, until more lines ship) nights wrap modulo.
//
// PRE-SHIP: this is a placeholder set (~1 month). The shipped game wants 365+
// authored lines with an actual arc. Tracked in the README checklist.

export const SERIAL_EPOCH = '2026-08-01';

export const TRANSMISSIONS: string[] = [
  "THE STATION SINGS BEFORE IT SPEAKS",
  "SIX NOTES THEN THE WOMAN COUNTS",
  "SHE COUNTED NINETY TIMES TONIGHT",
  "THE NUMBERS ARE NOT FOR US",
  "BUT SOMEONE IS MEANT TO HEAR THEM",
  "I HAVE STARTED WRITING THEM DOWN",
  "THE LOG IS FILLING FASTER THAN I WRITE",
  "TONIGHT SHE SKIPPED THE SONG",
  "THE SILENCE WAS WORSE THAN THE COUNTING",
  "I ASKED MARGARET TO LISTEN WITH ME",
  "MARGARET SAYS THE RADIO IS OFF",
  "SHE IS RIGHT ABOUT THE RADIO",
  "I CAN HEAR IT IN THE OTHER ROOM NOW",
  "THE NUMBERS MATCH THE HOUSE SOMEHOW",
  "FOUR SIX TWO FIVE IS THE CELLAR DOOR",
  "I MEASURED IT TWICE TO BE SURE",
  "EVERY DOOR HAS A NUMBER IF YOU LISTEN",
  "TONIGHT SHE SAID MY NAME BETWEEN DIGITS",
  "NOT LOUDLY JUST ONCE JUST MINE",
  "I DID NOT TELL MARGARET ABOUT MY NAME",
  "THE STATION KNOWS WHEN I STOP LISTENING",
  "IT GETS LOUDER IN MY SLEEP",
  "I DREAM IN GROUPS OF FIVE NOW",
  "THE OPERATORS HANDBOOK HAS A NEW PAGE",
  "THE PAGE IS IN MY HANDWRITING",
  "I HAVE NEVER SEEN IT BEFORE",
  "IT SAYS PROTOCOL CHANGES ON THE NINTH",
  "TODAY IS THE EIGHTH",
  "MY BROTHER SHOULD NEVER READ THIS LOG",
  "EDWIN IF YOU ARE READING TURN IT OFF",
];

export function daysSinceEpoch(dayKey: string): number {
  const toUtcNoon = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return Date.UTC(y, m - 1, d, 12);
  };
  return Math.round((toUtcNoon(dayKey) - toUtcNoon(SERIAL_EPOCH)) / 86400000);
}

/** Serial number shown in the UI ("No. 214") and index into TRANSMISSIONS. */
export function transmissionForDay(dayKey: string): {
  serial: number;
  plaintext: string;
} {
  const day = daysSinceEpoch(dayKey);
  const n = TRANSMISSIONS.length;
  const index = ((day % n) + n) % n;
  return { serial: day >= 0 ? day + 1 : index + 1, plaintext: TRANSMISSIONS[index] };
}
