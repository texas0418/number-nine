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
  'dial-return': require('../assets/audio/dial-return.wav'),
  'clock-tick': require('../assets/audio/clock-tick.wav'),
  pips: require('../assets/audio/pips.wav'),
  'wire-hum': require('../assets/audio/wire-hum.wav'),
  'marsh-wind': require('../assets/audio/marsh-wind.wav'),
  'morse-key': require('../assets/audio/morse-key.wav'),
  'knock-dry': require('../assets/audio/knock-dry.wav'),
  'knock-far': require('../assets/audio/knock-far.wav'),
  'letter-tear': require('../assets/audio/letter-tear.wav'),
  'page-flip': require('../assets/audio/page-flip.wav'),
  'pips-muffled': require('../assets/audio/pips-muffled.wav'),
  'rust-break': require('../assets/audio/rust-break.wav'),
  'plaster-fall': require('../assets/audio/plaster-fall.wav'),
  'hasp-open': require('../assets/audio/hasp-open.wav'),
  'hum-settle': require('../assets/audio/hum-settle.wav'),
  'sheet-rustle': require('../assets/audio/sheet-rustle.wav'),
  // B4 placeholders (scripts/gen-b4-foley.py) until the real set lands
  whisper: require('../assets/audio/whisper.wav'),
  murmur: require('../assets/audio/murmur.wav'),
  spark: require('../assets/audio/spark.wav'),
  parish: require('../assets/audio/parish.wav'),
  'key-click': require('../assets/audio/key-click.wav'), // ONE click cut from morse-key (full take warped when stacked)
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

function resumeBeds(): void {
  try {
    staticPlayer?.play(); // volume carries the level; play() is idempotent
    if (musicOn) musicPlayer?.play();
    if (whistleOn) whistlePlayer?.play();
    for (const name of activeLoops) loopPlayers[name]?.play();
  } catch {
    /* fail open */
  }
}

function watchAppState(): void {
  if (appStateSub) return;
  try {
    appStateSub = AppState.addEventListener('change', (state: string) => {
      if (state !== 'active') return;
      resumeBeds();
    });
  } catch {
    appStateSub = null;
  }
}

/** After the mic (B5): recording flips the iOS session and PAUSES every
 *  player — and expo-audio players never resume themselves (device QA:
 *  "no background music at all" from the first mic use onward). Restore
 *  the playback session, then wake everything that should be sounding. */
export function resumeAfterRecording(): void {
  const a = audio();
  try {
    a?.setAudioModeAsync?.({ allowsRecording: false, playsInSilentMode: true });
  } catch {
    /* fail open */
  }
  setTimeout(resumeBeds, 350); // let the session settle before waking players
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

// Live one-shot players by cue name, so a place-bound sound can be CUT the
// moment its block scrolls off the page (device QA: footsteps kept walking
// after the stairs were gone).
const activeOneShots = new Map<string, Set<any>>();

/** Fire a one-shot by name on a fresh player (reliable repeats), then release. */
export function playSfx(name: string, volume = 0.9): void {
  const a = audio();
  const mod = SFX_FILES[name];
  if (!a || mod === undefined) return;
  try {
    const p = a.createAudioPlayer(mod);
    p.volume = volume;
    p.play();
    let live = activeOneShots.get(name);
    if (!live) activeOneShots.set(name, (live = new Set()));
    live.add(p);
    setTimeout(() => {
      live.delete(p);
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

/** Schedule a rhythm of one-shots with PRE-CREATED players so each beat
 *  starts with no spin-up latency (device QA: fresh-player creation lagged
 *  the haptics by ~100ms and made knock groups uncountable). `onBeat` fires
 *  with each beat for haptics/visuals — and still fires when audio is
 *  unavailable, so the felt channel never depends on the heard one.
 *  Returns a cancel function. */
export function playSfxPattern(
  name: string,
  delaysMs: number[],
  volume = 0.7,
  onBeat?: (i: number) => void,
): () => void {
  const a = audio();
  const mod = SFX_FILES[name];
  const timers: ReturnType<typeof setTimeout>[] = [];
  if (!a || mod === undefined) {
    for (let i = 0; i < delaysMs.length; i++)
      timers.push(setTimeout(() => onBeat?.(i), delaysMs[i]));
    return () => timers.forEach(clearTimeout);
  }
  try {
    const players = delaysMs.map(() => {
      const p = a.createAudioPlayer(mod);
      p.volume = volume;
      return p;
    });
    const releaseAll = () => {
      for (const p of players) {
        try {
          p.remove?.();
          p.release?.();
        } catch {
          /* fail open */
        }
      }
    };
    for (let i = 0; i < delaysMs.length; i++)
      timers.push(
        setTimeout(() => {
          try {
            players[i].play();
          } catch {
            /* fail open */
          }
          onBeat?.(i);
        }, delaysMs[i]),
      );
    const releaseTimer = setTimeout(releaseAll, Math.max(...delaysMs) + 9000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(releaseTimer);
      releaseAll();
    };
  } catch {
    return () => {};
  }
}

/** Silence any still-playing one-shots of this cue (the page moved on). */
export function stopOneShot(name: string): void {
  const live = activeOneShots.get(name);
  if (!live) return;
  for (const p of live) {
    try {
      p.pause();
    } catch {
      /* fail open */
    }
  }
  live.clear(); // their release timers still clean the players up
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

/** Live volume handle on a running loop (B4's bearing voice: her murmur
 *  sharpens as the aerial swings onto her). No-op when the loop isn't up. */
export function setLoopVolume(name: string, volume: number): void {
  const p = loopPlayers[name];
  if (!p) return;
  try {
    p.volume = Math.max(0, Math.min(1, volume));
  } catch {
    /* fail open */
  }
}

/** A HELD one-shot (B4's whisper: it only speaks against the ear). Returns
 *  pause/resume + stop handles; everything fails open to no-ops so the
 *  gate's timing works with sound gone entirely. */
export function holdSfx(
  name: string,
  volume = 0.8,
): { setPlaying: (on: boolean) => void; stop: () => void } {
  const a = audio();
  const mod = SFX_FILES[name];
  if (!a || mod === undefined) return { setPlaying: () => {}, stop: () => {} };
  try {
    const p = a.createAudioPlayer(mod);
    p.volume = volume;
    return {
      setPlaying: (on: boolean) => {
        try {
          if (on) p.play();
          else p.pause();
        } catch {
          /* fail open */
        }
      },
      stop: () => {
        try {
          p.pause();
          p.remove?.();
          p.release?.();
        } catch {
          /* fail open */
        }
      },
    };
  } catch {
    return { setPlaying: () => {}, stop: () => {} };
  }
}

/** Stop every looping effect — leaving the story mid-chapter must not carry
 *  a ringing phone or the marsh wind back to the title screen. */
export function stopAllLoops(): void {
  for (const name of [...activeLoops]) stopSfx(name);
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
  if (name === 'static-swell') setStaticLevel(0.18); // was 0.28 — device QA: too loud
  else if (name === 'silence') setStaticLevel(0.03);
  else if (name === 'ident') playIdent();
  else if (name === 'phone-ring') startSfxLoop('phone-ring', 0.5); // rings until answered
  else if (name === 'marsh-wind') startSfxLoop('marsh-wind', 0.3); // until a road is chosen
  else if (name === 'wire-hum') startSfxLoop('wire-hum', 0.22); // until the carrier locks
  else if (name === 'morse-key') playSfx('morse-key', 0.45); // he answers, under the prose
  else if (name === 'knock-far') playSfx('knock-far', 0.4); // through the walls, far off
  else if (name === 'letter-tear') playSfx('letter-tear', 0.45); // paper, not violence
  else if (name === 'pips-muffled') {
    stopOneShot('pips'); // the receiver is DOWN — the clean pips end there…
    playSfx('pips-muffled', 0.35); // …and continue through the sleeve
  }
  else if (name === 'footsteps') playSfx('footsteps', 0.8); // 0.5 vanished under the bed
  else if (name === 'page-turn') playSfx('page-turn', 0.5);
  else if (name === 'rust-break') playSfx('rust-break', 0.5); // device QA: default drowned the room
  else if (name === 'parish') startSfxLoop('parish', 0.22); // the hedge-voices, until she stands
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
