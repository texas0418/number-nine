// src/audio.ts
// Fail-open sound manager. Audio is half the atmosphere but never load-bearing:
// if expo-audio is missing from the build or anything throws, every function
// silently no-ops and the game stays fully playable (house fail-open rule).
//
// Two layers for the slice: a seamless shortwave static bed whose volume the
// story and tuner modulate, and the six-note station ident. The full palette
// (voice, Morse, haptic knocks) is a pre-ship task.

let mod: any | null | undefined;

function audio(): any | null {
  if (mod !== undefined) return mod;
  try {
    mod = require('expo-audio');
  } catch {
    mod = null;
  }
  return mod;
}

let staticPlayer: any | null = null;
let identPlayer: any | null = null;
let staticTarget = 0;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

export function initAudio(): void {
  const a = audio();
  if (!a || staticPlayer) return;
  try {
    a.setAudioModeAsync?.({ playsInSilentMode: true });
    staticPlayer = a.createAudioPlayer(require('../assets/audio/static-loop.wav'));
    staticPlayer.loop = true;
    staticPlayer.volume = 0;
    staticPlayer.play();
    identPlayer = a.createAudioPlayer(require('../assets/audio/ident.wav'));
  } catch {
    staticPlayer = null;
    identPlayer = null;
  }
}

/** Glide the static bed toward `volume` (0..1) over ~600ms. */
export function setStaticLevel(volume: number): void {
  if (!staticPlayer) return;
  staticTarget = Math.max(0, Math.min(1, volume));
  if (fadeTimer) return; // existing glide will chase the new target
  fadeTimer = setInterval(() => {
    try {
      const v = staticPlayer.volume as number;
      const next = v + Math.sign(staticTarget - v) * 0.08;
      const done = Math.abs(staticTarget - v) <= 0.08;
      staticPlayer.volume = done ? staticTarget : next;
      if (done && fadeTimer) {
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    } catch {
      if (fadeTimer) clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }, 50);
}

/** Immediate static level — used by the tuner while the thumb is down. */
export function setStaticLevelNow(volume: number): void {
  if (!staticPlayer) return;
  try {
    staticPlayer.volume = Math.max(0, Math.min(1, volume));
  } catch {
    /* fail open */
  }
}

export function playIdent(): void {
  if (!identPlayer) return;
  try {
    identPlayer.seekTo(0);
    identPlayer.play();
  } catch {
    /* fail open */
  }
}

export function cue(name: 'static-swell' | 'ident' | 'silence'): void {
  if (name === 'static-swell') setStaticLevel(0.55);
  else if (name === 'silence') setStaticLevel(0.04);
  else playIdent();
}

export function stopAll(): void {
  try {
    if (fadeTimer) clearInterval(fadeTimer);
    fadeTimer = null;
    staticPlayer?.pause();
  } catch {
    /* fail open */
  }
}
