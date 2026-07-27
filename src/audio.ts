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

// One-shot diegetic SFX, preloaded so playback has no first-hit latency.
const SFX_FILES: Record<string, number> = {
  'key-unlock': require('../assets/audio/key-unlock.wav'),
  'safe-open': require('../assets/audio/safe-open.wav'),
  unlock: require('../assets/audio/unlock.wav'),
  'phone-ring': require('../assets/audio/phone-ring.wav'),
  'lamp-off': require('../assets/audio/lamp-off.wav'),
  'page-turn': require('../assets/audio/page-turn.wav'),
  'bell-1': require('../assets/audio/bell-e5.wav'),
  'bell-2': require('../assets/audio/bell-d5.wav'),
  'bell-3': require('../assets/audio/bell-b4.wav'),
  'bell-4': require('../assets/audio/bell-e4.wav'),
};
// Loops (the phone ringing) keep persistent players; one-shots get a FRESH
// player per play — expo-audio players don't reliably restart after they
// finish, which made repeat taps (the music-box tines) go silent.
const loopPlayers: Record<string, any> = {};

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

/** Fire a one-shot by name on a fresh player (reliable repeats), then release. */
export function playSfx(name: string, volume = 0.9): void {
  const a = audio();
  const mod = SFX_FILES[name];
  if (!a || mod === undefined) return;
  try {
    const p = a.createAudioPlayer(mod);
    p.volume = volume;
    p.play();
    setTimeout(() => {
      try {
        p.remove?.();
        p.release?.();
      } catch {
        /* fail open */
      }
    }, 5000);
  } catch {
    /* fail open */
  }
}

/** Start a looping effect (e.g. the hall telephone ringing on and on). */
export function startSfxLoop(name: string, volume = 0.5): void {
  const a = audio();
  const mod = SFX_FILES[name];
  if (!a || mod === undefined) return;
  try {
    if (!loopPlayers[name]) loopPlayers[name] = a.createAudioPlayer(mod);
    const p = loopPlayers[name];
    p.loop = true;
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch {
    /* fail open */
  }
}

/** Stop a looping effect — the moment the line clicks open. */
export function stopSfx(name: string): void {
  const p = loopPlayers[name];
  if (!p) return;
  try {
    p.pause();
    p.loop = false;
  } catch {
    /* fail open */
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

export function cue(name: string): void {
  // The static bed is ATMOSPHERE — it must never drown the diegetic one-shots
  // (device feedback: "all I hear is static"). Levels kept low.
  if (name === 'static-swell') setStaticLevel(0.28);
  else if (name === 'silence') setStaticLevel(0.03);
  else if (name === 'ident') playIdent();
  else if (name === 'phone-ring') startSfxLoop('phone-ring', 0.5); // rings until answered
  else playSfx(name); // key-unlock, safe-open, unlock, lamp-off, page-turn
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
