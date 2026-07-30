// src/shareCard.ts
// Capturing the share card to an image, FAIL-OPEN.
//
// House rule: nothing may be load-bearing. If the capture is unavailable or
// throws for any reason, the caller falls back to the text share that has
// always worked, and the reader never learns anything went wrong.
//
// On the module-loading hazard that bricked this app on 2026-07-27: it does not
// apply here, and that was checked rather than assumed.
// react-native-view-shot reaches its native half through
// `TurboModuleRegistry.get('RNViewShot') ?? NativeModules.RNViewShot` — the
// NON-throwing `get`, not `getEnforcing`. Both sides return undefined when the
// native module is missing, so importing the library cannot throw inside
// Metro's guardedLoadModule the way a missing expo module's factory does. It
// throws only when captureRef is CALLED, which the try/catch below genuinely
// catches. If that library is ever swapped, re-check this before trusting it.

import type { RefObject } from 'react';

let viewShot: any | null | undefined;

function shot(): any | null {
  if (viewShot !== undefined) return viewShot;
  try {
    const mod = require('react-native-view-shot');
    viewShot = mod?.captureRef ? mod : (mod?.default ?? null);
  } catch {
    viewShot = null;
  }
  return viewShot;
}

/** Capture a card view to a temporary PNG. Returns a file URI, or null when the
 *  capture is not available — never throws, never rejects. */
export async function captureCard(
  ref: RefObject<any>,
  width: number,
  height: number,
  scale: number,
): Promise<string | null> {
  const mod = shot();
  if (!mod?.captureRef || !ref?.current) return null;
  try {
    const uri = await mod.captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    });
    return typeof uri === 'string' && uri.length > 0 ? uri : null;
  } catch {
    return null;
  }
}
