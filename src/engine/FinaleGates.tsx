// src/engine/FinaleGates.tsx
/* eslint-disable react-hooks/refs -- night/ending state feeds timers and
   once-created gesture handlers; render reads mirrored useState values. */
// Broadcast Six's frame: the NIGHT GATE (the station keeps REAL nights —
// the chapter continues tomorrow, not later tonight; a reader who cannot
// wait can wind the receiver's clock through a whole day, and she counts
// the hurry) and THE CHOICE (two endings; the fork that does not join).

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { cue } from '../audio';
import { setScrollLock } from './scrollLock';
import { getKv, setKv } from '../db';
import { dayKeyFromMs } from '../models';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export const HURRIED_KV = 'b6-hurried';
export const ENDING_KV = 'b6-ending';

// ---------------------------------------------------------------- nightgate
// The gate remembers the day it was first REACHED (kv); it opens on any
// LATER calendar day. The hidden bypass: drag the dark clock through
// twenty-four hours — one haptic tick per hour — and the night "passes";
// the kv remembers the lie for the endings.
export function NightGate({
  night,
  prompt,
  unlockedText,
  noticedText,
  solved,
  onSolved,
  solveCue = 'silence',
}: {
  night: number;
  prompt: string;
  unlockedText: string;
  noticedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [hurried, setHurried] = useState(false);
  const [woundHours, setWoundHours] = useState(0);
  const state = useRef({ done: solved, hours: 0, dragStart: 0 });

  const solve = (lied: boolean) => {
    const s = state.current;
    if (s.done) return;
    s.done = true;
    if (lied) {
      setHurried(true);
      try {
        setKv(HURRIED_KV, '1');
      } catch {
        /* fail open */
      }
    }
    setDone(true);
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

  useEffect(() => {
    if (done) return;
    const key = `b6-n${night}-seen`;
    let seen: string | null = null;
    try {
      seen = getKv(key);
      if (!seen) {
        seen = dayKeyFromMs(Date.now());
        setKv(key, seen);
      }
    } catch {
      /* fail open: without kv the wind is the only door */
    }
    const check = () => {
      if (state.current.done) return;
      if (seen && dayKeyFromMs(Date.now()) > seen) solve(false);
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, night]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.done,
        onMoveShouldSetPanResponder: (_e, g) =>
          !state.current.done && Math.abs(g.dx) > 6,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          setScrollLock(true); // the page must not move under the winding hand
          state.current.dragStart = state.current.hours;
        },
        onPanResponderMove: (_e, g) => {
          const s = state.current;
          if (s.done) return;
          const h = Math.max(0, Math.min(24, s.dragStart + Math.floor(g.dx / 10)));
          if (h !== s.hours) {
            s.hours = h;
            setWoundHours(h);
            Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
            if (h >= 24) {
              setScrollLock(false);
              solve(true);
            }
          }
        },
        onPanResponderRelease: () => setScrollLock(false),
        onPanResponderTerminate: () => setScrollLock(false),
      }),
    [],
  );

  useEffect(() => () => setScrollLock(false), []);

  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? (hurried ? noticedText : unlockedText) : prompt}
      </Text>
      {!done && (
        <View style={styles.clockWell} {...pan.panHandlers}>
          <Text style={styles.clockText} allowFontScaling={false}>
            {woundHours === 0 ? '— · —' : `+${woundHours} h`}
          </Text>
        </View>
      )}
    </View>
  );
}

// --------------------------------------------------------------- endingfork
// THE CHOICE. Two endings that do not join. The choice is remembered (kv)
// — the post-completion hauntings will want to know which house this is.
export function EndingFork({
  leftLabel,
  left,
  rightLabel,
  right,
  coda,
  solved,
  onSolved,
}: {
  leftLabel: string;
  left: string[];
  rightLabel: string;
  right: string[];
  coda: string;
  solved: boolean;
  onSolved: () => void;
}) {
  const [chosen, setChosen] = useState<'seat' | 'break' | null>(
    solved ? ((getKvSafe(ENDING_KV) as 'seat' | 'break') ?? 'seat') : null,
  );

  const choose = (side: 'seat' | 'break') => {
    if (chosen) return;
    setChosen(side);
    try {
      setKv(ENDING_KV, side);
    } catch {
      /* fail open */
    }
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    // He WALKS DOWN in the seat ending — "the stairs took his weight the way
    // a handshake takes a hand" — so the descent is heard (Simon, playtest
    // 2026-07-30). The silence still arrives, just after the footsteps
    // rather than instead of them.
    cue(side === 'seat' ? 'footsteps' : 'break-set');
    onSolved();
  };

  if (!chosen) {
    return (
      <View style={styles.forkRow}>
        <Pressable style={styles.forkChoice} onPress={() => choose('seat')}>
          <Text style={styles.forkLabel} maxFontSizeMultiplier={1.25}>
            {leftLabel}
          </Text>
        </Pressable>
        <View style={styles.forkRule} />
        <Pressable style={styles.forkChoice} onPress={() => choose('break')}>
          <Text style={styles.forkLabel} maxFontSizeMultiplier={1.25}>
            {rightLabel}
          </Text>
        </Pressable>
      </View>
    );
  }

  const paragraphs = chosen === 'seat' ? left : right;
  return (
    <View style={styles.endingWrap}>
      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.endingText} maxFontSizeMultiplier={1.5}>
          {p}
        </Text>
      ))}
      <Text style={[styles.endingText, styles.coda]} maxFontSizeMultiplier={1.5}>
        {coda}
      </Text>
    </View>
  );
}

function getKvSafe(key: string): string | null {
  try {
    return getKv(key);
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: 270,
    minHeight: 140,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    marginVertical: 24,
    justifyContent: 'space-between',
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
  },
  clockWell: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  clockText: {
    fontFamily: fonts.mono,
    fontSize: 20,
    letterSpacing: 3,
    color: colors.muted,
  },
  forkRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 26,
    paddingHorizontal: 10,
  },
  forkChoice: {
    flex: 1,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 22,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  forkRule: { width: StyleSheet.hairlineWidth, backgroundColor: colors.panelBorder },
  forkLabel: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.dial,
    textAlign: 'center',
    ...amberGlow,
  },
  endingWrap: { marginVertical: 10, gap: 18 },
  endingText: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 34,
    color: colors.prose,
  },
  coda: { color: colors.proseFaded, fontStyle: 'italic' },
});
