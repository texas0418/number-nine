// src/society.ts
// The Listeners' Society — the clue archive that lives outside the app.
//
// It is the SECOND line of help. The first is the in-app pressure valve
// (Chapter.hints, surfaced by ChapterView after a long stall), which is
// deliberately a nudge in Halloran's hand and never an answer. The Society
// grades its help in three steps and only the last one gives a gate away.
//
// The Society is diegetic — a 1963 correspondence circle of listeners, the
// same parish B5 puts on the band — so pointing at it from the margin of the
// log does not break the fiction. It is still a link out of a deliberately
// offline app, so nothing in the story may ever depend on it resolving.

import { Linking } from 'react-native';

export const SOCIETY_URL = 'https://numbernine.simonbuilds.app/archive/';

/** Where a shared signal points. Channel 1 in MARKETING.md calls the nightly
 *  share the always-on ad, and an ad with no address is a postcard: until this
 *  line existed the share carried a redacted transcript and no way at all for a
 *  reader to find the app. Points at the game page rather than the App Store so
 *  it works before launch; swap it for the store URL on release day. */
export const SITE_URL = 'https://numbernine.simonbuilds.app';

/** Open the archive. Fails silently: the app is fully playable offline, and
 *  a reader with no signal should get nothing rather than an error card. */
export async function openSociety(): Promise<boolean> {
  try {
    await Linking.openURL(SOCIETY_URL);
    return true;
  } catch {
    return false;
  }
}
