// src/theme.ts — Number Nine is dark-only BY DESIGN: it is a night-time radio
// game meant to be played in bed with headphones. There is no light palette
// and no theme switch; the app.json userInterfaceStyle is pinned to "dark".
// Palette is phosphor-on-black: bone-green reading text, amber for the tuner
// dial (the one warm thing in the room), deep green-grays for chrome.

import { Platform } from 'react-native';

// Palette raised for readability (device feedback: olive-on-dark too dim).
// Reading text is now a bright near-white bone; the greens are lightened and
// de-saturated so nothing important reads as murky olive. Body/logbook/thought
// tiers all clear a comfortable contrast on the near-black room.
export const colors = {
  bg: '#0b0e0c', // the room
  panel: '#161d18', // logbook pages, tuner body, tiles
  panelBorder: '#2b382f',
  hairline: '#1e2721',
  prose: '#edf1ec', // reading text — bright bone, near-white
  proseFaded: '#9aa79d', // whispered asides (was near-invisible)
  voice: '#c4d2c8', // the station speaking
  muted: '#aebab1', // logbook + chrome labels (was too dim to read)
  faint: '#6d7a71', // hints, footers
  dial: '#e6c774', // amber: tuner frequency, cipher digits
  dialDim: '#a7924f',
  danger: '#d67c6a',
  lockGlow: '#c2d4c8', // signal-lock accent
} as const;

// The amber GLOWS (Simon, 2026-07-29): phosphor should bloom a little.
// Spread on any dial-amber TEXT; viewGlow on lit dots/needles/fills (iOS
// shadow — the only platform we ship). Kept subtle: bloom, not neon.
export const amberGlow = {
  textShadowColor: 'rgba(230, 199, 116, 0.55)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
} as const;

export const amberViewGlow = {
  shadowColor: colors.dial,
  shadowOpacity: 0.7,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 0 },
} as const;

export const fonts = {
  /** Story prose — a book, not an app. */
  serif: Platform.select({ ios: 'Georgia', default: 'serif' })!,
  /** Logbook, ciphers, chrome — the operator's world. */
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' })!,
} as const;

export const type = {
  prose: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 34, color: colors.prose },
  chrome: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, letterSpacing: 1 },
  cipher: { fontFamily: fonts.mono, fontSize: 18, color: colors.dial, letterSpacing: 2, ...amberGlow },
} as const;
