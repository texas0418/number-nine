// src/audio.ts
// Fail-open sound manager. Audio is half the atmosphere but never load-bearing:
// if expo-audio is missing from the build or anything throws, every function
// silently no-ops and the game stays fully playable (house fail-open rule).
//
// Two layers underneath everything: a seamless shortwave static bed whose
// volume the story and tuner modulate, and the six-note station ident. On top
// of those, her voice — one recording per line she speaks (`v-b1-1` through
// `v-b6-5`) plus the digits `num-0`…`num-9`, which are NOT cues because
// `speakNumbers` sequences them itself.
//
// Still outstanding: a degraded ident per broadcast (`playIdent` plays one
// fixed ident for all six), and a Morse night in the daily signal.

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
  // THE STATION'S VOICE. Recorded dry and treated offline (scripts note in
  // VOICE.md): the shortwave path, the per-broadcast decay and the reversal
  // of her mirrored lines are all baked into the files, because the engine
  // has no DSP and should not grow any.
  'whisper-line': require('../assets/audio/whisper-line.wav'),
  'station-ident': require('../assets/audio/station-ident.wav'),
  'num-9-name': require('../assets/audio/num-9-name.wav'),
  'num-0': require('../assets/audio/num-0.wav'),
  'num-1': require('../assets/audio/num-1.wav'),
  'num-2': require('../assets/audio/num-2.wav'),
  'num-3': require('../assets/audio/num-3.wav'),
  'num-4': require('../assets/audio/num-4.wav'),
  'num-5': require('../assets/audio/num-5.wav'),
  'num-6': require('../assets/audio/num-6.wav'),
  'num-7': require('../assets/audio/num-7.wav'),
  'num-8': require('../assets/audio/num-8.wav'),
  'num-9': require('../assets/audio/num-9.wav'),
  'v-b1-1': require('../assets/audio/v-b1-1.wav'),
  'v-b1-2': require('../assets/audio/v-b1-2.wav'),
  'v-b1-3': require('../assets/audio/v-b1-3.wav'),
  'v-b2-1': require('../assets/audio/v-b2-1.wav'),
  'v-b2-2': require('../assets/audio/v-b2-2.wav'),
  'v-b2-3': require('../assets/audio/v-b2-3.wav'),
  'v-b3-1': require('../assets/audio/v-b3-1.wav'),
  'v-b3-2': require('../assets/audio/v-b3-2.wav'),
  'v-b4-1': require('../assets/audio/v-b4-1.wav'),
  'v-b4-2': require('../assets/audio/v-b4-2.wav'),
  'v-b5-1': require('../assets/audio/v-b5-1.wav'),
  'v-b5-2': require('../assets/audio/v-b5-2.wav'),
  'v-b5-3': require('../assets/audio/v-b5-3.wav'),
  'v-b6-1': require('../assets/audio/v-b6-1.wav'),
  'v-b6-2': require('../assets/audio/v-b6-2.wav'),
  'v-b6-3': require('../assets/audio/v-b6-3.wav'),
  'v-b6-4': require('../assets/audio/v-b6-4.wav'),
  'v-b6-5': require('../assets/audio/v-b6-5.wav'),
  murmur: require('../assets/audio/murmur.wav'),
  spark: require('../assets/audio/spark.wav'),
  parish: require('../assets/audio/parish.wav'),
  'key-click': require('../assets/audio/key-click.wav'), // ONE click cut from morse-key (full take warped when stacked)
  'break-set': require('../assets/audio/break-set.wav'), // the strike + the dying sigh (B6, one ending only)
  sidetone: require('../assets/audio/sidetone.wav'), // 620Hz keyed tone, seamless (B5 send key)
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
/** SPEAK NUMBERS, digit by digit, the way a numbers station reads them:
 *  the group 14 09 becomes "one four, zero nine". Sequenced from ten recorded
 *  digits rather than pre-baked groups, because Tonight's Signal is a
 *  different transmission every night and could never be voiced otherwise.
 *
 *  Returns a stop() — the reader may leave the page mid-count, and she must
 *  not follow them. Fail-open: no audio module, no sound, no harm. */
export function speakNumbers(
  groups: number[][],
  opts: { digitMs?: number; groupMs?: number; volume?: number } = {},
): () => void {
  const { digitMs = 420, groupMs = 900, volume = 0.85 } = opts;
  const a = audio();
  const timers: ReturnType<typeof setTimeout>[] = [];
  if (!a) return () => {};
  let at = 0;
  for (const g of groups) {
    for (const n of g) {
      for (const ch of String(n)) {
        const file = SFX_FILES[`num-${ch}`];
        if (file === undefined) continue;
        const delay = at;
        timers.push(
          setTimeout(() => {
            try {
              const p = a.createAudioPlayer(file);
              p.volume = volume;
              p.play();
              setTimeout(() => {
                try {
                  p.remove?.();
                } catch {
                  /* fail open */
                }
              }, 4000);
            } catch {
              /* fail open */
            }
          }, delay),
        );
        at += digitMs;
      }
    }
    at += groupMs - digitMs;
  }
  return () => timers.forEach(clearTimeout);
}

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

/** Pre-create a loop's player so its first start is INSTANT — expo-audio
 *  spins a fresh player up in ~100-300ms, which ate the send key's short
 *  dits entirely (device QA: "still no morse SFX"). */
export function warmLoop(name: string): void {
  const a = audio();
  const mod = SFX_FILES[name];
  if (!a || mod === undefined || loopPlayers[name]) return;
  try {
    loopPlayers[name] = a.createAudioPlayer(mod);
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

// Loop-backed cues and their levels: the ring until answered, the wind
// until a road is chosen, the hum until the carrier locks, the parish
// until she stands.
const LOOP_CUES: Record<string, number> = {
  'phone-ring': 0.5,
  'marsh-wind': 0.3,
  'wire-hum': 0.22,
  parish: 0.22,
};

/** Per-cue levels. A table rather than a branch each: the chain outgrew the
 *  complexity limit once her voice arrived, and the levels are data anyway.
 *  Anything absent takes playSfx's default. Each number is a device-QA
 *  verdict, not a guess. */
const SFX_VOLUME: Record<string, number> = {
  'morse-key': 0.45, // he answers, under the prose
  'knock-far': 0.4, // through the walls, far off
  'letter-tear': 0.45, // paper, not violence
  pips: 0.35, // the clean line: matched to the muffled tail, not louder
  footsteps: 0.8, // 0.5 vanished under the bed
  'page-turn': 0.5,
  'rust-break': 0.5, // the default drowned the room
  'break-set': 0.8, // once, ever, on one ending
};

/** She is RECEIVED, so she sits just under the room. The clips are loudness
 *  matched offline, so one level serves every line she speaks. */
const VOICE_VOLUME = 0.85;
const isVoice = (name: string): boolean =>
  name.startsWith('v-b') || name === 'station-ident';

export function cue(name: string): void {
  // The static bed is ATMOSPHERE — it must never drown the diegetic one-shots
  // (device feedback: "all I hear is static"). Levels kept low.
  if (name === 'static-swell') setStaticLevel(0.18); // was 0.28 — device QA: too loud
  else if (name === 'silence') setStaticLevel(0.03);
  else if (name === 'ident') playIdent();
  else if (name in LOOP_CUES) startSfxLoop(name, LOOP_CUES[name]);
  else if (isVoice(name)) playSfx(name, VOICE_VOLUME);
  // Broadcast One's arrival: she plays the six notes FIRST and speaks over the
  // dying music box, exactly as the prose has it.
  else if (name === 'ident-then-voice') {
    playIdent();
    setTimeout(() => playSfx('v-b1-1', VOICE_VOLUME), 2600);
  } else if (name === 'pips-muffled') {
    stopOneShot('pips'); // the receiver is DOWN — the clean pips end there…
    playSfx('pips-muffled', 0.35); // …and continue through the sleeve
  } else playSfx(name, SFX_VOLUME[name]); // undefined falls back to the default
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
