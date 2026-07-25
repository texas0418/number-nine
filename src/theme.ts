// src/theme.ts — Number Nine is dark-only BY DESIGN: it is a night-time radio
// game meant to be played in bed with headphones. There is no light palette
// and no theme switch; the app.json userInterfaceStyle is pinned to "dark".
// Palette is phosphor-on-black: bone-green reading text, amber for the tuner
// dial (the one warm thing in the room), deep green-grays for chrome.

import { Platform } from 'react-native';

export const colors = {
  bg: '#0b0e0c', // the room
  panel: '#141a16', // logbook pages, tuner body, tiles
  panelBorder: '#243029',
  hairline: '#1a211c',
  prose: '#cfd8d0', // reading text
  proseFaded: '#5a6a5e', // whispered asides
  voice: '#9fb3a4', // the station speaking
  muted: '#6b7a6f', // chrome labels
  faint: '#3d4a41', // hints, footers
  dial: '#d9b96a', // amber: tuner frequency, cipher digits
  dialDim: '#8a7847',
  danger: '#c96b5a',
  lockGlow: '#8fa394', // signal-lock accent
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
  cipher: { fontFamily: fonts.mono, fontSize: 18, color: colors.dial, letterSpacing: 2 },
} as const;
