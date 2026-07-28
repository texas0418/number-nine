// src/review.ts
// One polite App Store review ask, at the AFTERGLOW moment — never over the
// fiction, never next to the paywall. Eligible when either:
//   - Broadcast One is completed (asked on return to the title screen), or
//   - the nightly signal streak reaches 3.
// Asks at most once ever (kv flag; Apple further rate-limits on their side).
// Fail-open: if the native module is missing or throws, nothing happens.

import { getKv, setKv } from './db';

const ASKED_KEY = 'review-asked';

function getStoreReview(): any | null {
  // Do NOT rely on try/catch around require() for fail-open here: when a
  // module's factory throws (native half missing from the binary), Metro's
  // guardedLoadModule reports it as a FATAL error itself — the exception
  // never reaches this catch, and a release build aborts. This bricked the
  // 2026-07-27 device build the first night Broadcast One was completed.
  // Check the native registry BEFORE requiring so the factory can't throw.
  const native = (globalThis as any).expo?.modules?.ExpoStoreReview;
  if (!native) return null;
  try {
    const mod = require('expo-store-review');
    return mod?.default ?? mod ?? null;
  } catch {
    return null;
  }
}

/** Request a review if eligible and never asked before. Safe to call often. */
export function maybeAskForReview(opts: {
  chapterOneDone: boolean;
  streak: number;
}): void {
  if (!opts.chapterOneDone && opts.streak < 3) return;
  try {
    if (getKv(ASKED_KEY)) return;
    const SR = getStoreReview();
    if (!SR) return;
    setKv(ASKED_KEY, String(Date.now()));
    // isAvailableAsync + requestReview both resolve quietly; the OS decides
    // whether anything is actually shown.
    SR.isAvailableAsync?.()
      .then((ok: boolean) => {
        if (ok) SR.requestReview?.();
      })
      .catch(() => {});
  } catch {
    /* fail open */
  }
}
