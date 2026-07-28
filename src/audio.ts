// src/audio.ts
// Fail-open sound manager. Audio is half the atmosphere but never load-bearing:
// if expo-audio is missing from the build or anything throws, every function
// silently no-ops and the game stays fully playable (house fail-open rule).
//
// Two layers for the slice: a seamless shortwave static bed whose volume the
// story and tuner modulate, and the six-note station ident. The full palette
// (voice, Morse, haptic knocks) is a pre-ship task.

import { AppState } from 'react-native';

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
  footsteps: require('../assets/audio/footsteps.wav'),
  'hinge-creak': require('../assets/audio/hinge-creak.wav'),
  scrape: require('../assets/audio/scrape.wav'),
  knock: require('../assets/audio/knock.wav'),
  'station-morse': require('../assets/audio/station-morse.wav'),
  'station-music': require('../assets/audio/station-music.wav'),
  'station-voice': require('../assets/audio/station-voice.wav'),
};
// Loops (the phone ringing) keep persistent players; one-shots get a FRESH
// player per play — expo-audio players don't reliably restart after they
// finish, which made repeat taps (the music-box tines) go silent.
const loopPlayers: Record<string, any> = {};
// Loop names currently meant to be sounding — resumed when the app returns
// to the foreground (iOS pauses every player on background; device QA:
// "close the app and reopen it, the background noise is gone").
const activeLoops = new Set<string>();
let musicPlayer: any | null = null;
let musicOn = false;
let whistlePlayer: any | null = null;
let whistleOn = false;
let appStateSub: { remove?: () => void } | null = null;

function watchAppState(): void {
  if (appStateSub) return;
  try {
    appStateSub = AppState.addEventListener('change', (state: string) => {
      if (state !== 'active') return;
      try {
        staticPlayer?.play(); // volume carries the level; play() is idempotent
        if (musicOn) musicPlayer?.play();
        if (whistleOn) whistlePlayer?.play();
        for (const name of activeLoops) loopPlayers[name]?.play();
      } catch {
        /* fail open */
      }
    });
  } catch {
    appStateSub = null;
  }
}

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
    watchAppState();
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
    }, 9000); // past the longest one-shot (footsteps ~5s) — releasing early cut its tail
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
    activeLoops.add(name);
  } catch {
    /* fail open */
  }
}

/** Stop a looping effect — the moment the line clicks open. */
export function stopSfx(name: string): void {
  activeLoops.delete(name);
  const p = loopPlayers[name];
  if (!p) return;
  try {
    p.pause();
    p.loop = false;
  } catch {
    /* fail open */
  }
}

// ------------------------------------------------------------------- music
// The theme ("Ghost", Tim Beek — see CREDITS.md) BOOKENDS the fiction: title
// screen, the chapter card + hall, then it hands off to the static bed (the
// middle keeps its silence — that's the scary part), and returns under the
// finale and the daily solved panel. In-chapter entrances/exits are the
// 'music-in' / 'music-out' block cues.

let musicFadeTimer: ReturnType<typeof setInterval> | null = null;
let musicTarget = 0;

function ensureMusicPlayer(): any | null {
  const a = audio();
  if (!a) return null;
  try {
    if (!musicPlayer) {
      musicPlayer = a.createAudioPlayer(require('../assets/audio/title-theme.m4a'));
      musicPlayer.loop = true;
      musicPlayer.volume = 0;
    }
    return musicPlayer;
  } catch {
    return null;
  }
}

function clearMusicFade(): void {
  if (musicFadeTimer) clearInterval(musicFadeTimer);
  musicFadeTimer = null;
}

export function startMusic(volume = 0.3): void {
  const p = ensureMusicPlayer();
  if (!p) return;
  try {
    clearMusicFade();
    p.volume = volume;
    p.play();
    musicOn = true;
    watchAppState();
  } catch {
    /* fail open */
  }
}

export function stopMusic(): void {
  musicOn = false;
  clearMusicFade();
  try {
    musicPlayer?.pause();
  } catch {
    /* fail open */
  }
}

/** Glide the theme toward `volume` (~1.5s full swing); 0 pauses at the end. */
export function fadeMusicTo(volume: number): void {
  const p = volume > 0 ? ensureMusicPlayer() : musicPlayer;
  if (!p) return;
  try {
    musicTarget = Math.max(0, Math.min(1, volume));
    if (musicTarget > 0) {
      p.play();
      musicOn = true;
      watchAppState();
    }
    if (musicFadeTimer) return; // existing glide will chase the new target
    musicFadeTimer = setInterval(() => {
      try {
        const v = p.volume as number;
        const next = v + Math.sign(musicTarget - v) * 0.02;
        const done = Math.abs(musicTarget - v) <= 0.02;
        p.volume = done ? musicTarget : next;
        if (done) {
          if (musicTarget === 0) {
            p.pause();
            musicOn = false;
          }
          clearMusicFade();
        }
      } catch {
        clearMusicFade();
      }
    }, 100);
  } catch {
    /* fail open */
  }
}

// ------------------------------------------------------------------- tuner
// The dial sweep should sound like scanning a car radio at night: dead-air
// static, a heterodyne squeal that rises and falls as a carrier slides by,
// and phantom neighbours (morse, a waltz, a counting voice) at fixed spots
// on the band. The RadioTuner drives these; all of it fails open.

export function startTunerScan(): void {
  const a = audio();
  if (!a) return;
  try {
    if (!whistlePlayer) {
      whistlePlayer = a.createAudioPlayer(require('../assets/audio/tune-whistle.wav'));
      whistlePlayer.loop = true;
    }
    whistlePlayer.volume = 0;
    whistlePlayer.play();
    whistleOn = true;
  } catch {
    /* fail open */
  }
}

/** Whistle mix for carrier proximity: silent in dead air, loudest just OFF
 *  the carrier, pitch climbing as the needle closes in (strength 0..1). */
export function setTunerScan(strength: number): void {
  if (!whistlePlayer) return;
  try {
    const presence = Math.max(0, Math.min(1, (strength - 0.25) / 0.75));
    const squeal = Math.sin(Math.PI * presence); // swells then dives into the lock
    whistlePlayer.volume = 0.45 * squeal * squeal;
    const rate = 0.6 + 1.2 * presence;
    if (typeof whistlePlayer.setPlaybackRate === 'function') whistlePlayer.setPlaybackRate(rate);
    else whistlePlayer.playbackRate = rate;
  } catch {
    /* fail open */
  }
}

export function stopTunerScan(): void {
  whistleOn = false;
  try {
    whistlePlayer?.pause();
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
  else if (name === 'footsteps') playSfx('footsteps', 0.8); // 0.5 vanished under the bed
  else if (name === 'page-turn') playSfx('page-turn', 0.5);
  else playSfx(name); // key-unlock, safe-open, unlock, lamp-off, hinge-creak, scrape
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
