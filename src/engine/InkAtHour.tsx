// src/engine/InkAtHour.tsx
/* eslint-disable react-hooks/refs -- wickStart/sawBright feed gesture and
   sensor callbacks only; render reads mirrored useState values. */
// COMBO INK (B4): a line that resolves only with the lamp turned down AND
// the receiver's clock standing at her hour — the first two-condition ink
// in the book. The dark comes as in LampBlock (screen brightness earned
// dark, or the wick dragged low). The hour comes honestly (wait for it) or
// by WINDING the little clock — the lie; she notices, and it is remembered.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { watchLamp } from '../device';
import { cue } from '../audio';
import { setKv } from '../db';
import { CLOCK_LIE_KV, useWoundClock } from './ExaminationGates';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const DARK_ENOUGH = 0.35;
const WICK_TRAVEL = 90;

export function InkAtHour({
  aboveText,
  hiddenLine,
  targetWord,
  hour,
  minute,
  prompt,
  unlockedText,
  noticedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  aboveText: string[];
  hiddenLine: string;
  targetWord: string;
  hour: number;
  minute: number;
  prompt: string;
  unlockedText: string;
  noticedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [wasLie, setWasLie] = useState(false);
  const [screenDark, setScreenDark] = useState(false);
  const [wick, setWick] = useState(0);
  const wickStart = useRef(0);
  const dimAnim = useRef(new Animated.Value(0)).current;
  const sawBright = useRef(false);
  const clock = useWoundClock(hour, minute, !done);
  // Ink, once risen, does not sink back (device QA: the reader dimmed the
  // screen, the line appeared, and raising the lamp to READ it hid it
  // again). The reveal latches; the lie is judged at the moment it rose.
  const [latched, setLatched] = useState(solved);
  const [lieAtReveal, setLieAtReveal] = useState(false);

  useEffect(() => {
    if (done) return;
    const stop = watchLamp((level) => {
      if (level >= 0.45) sawBright.current = true;
      setScreenDark(sawBright.current && level < DARK_ENOUGH);
    });
    return stop;
  }, [done]);

  const dark = done || screenDark || wick > 0.6;
  // held, not matches: the ink answers a clock that has SETTLED at her
  // hour, never one merely scrubbed past it
  const liveReveal = dark && clock.held;

  // Mirror the live conditions into a ref; a slow watcher does the latching
  // (never a sync setState inside an effect body — cascading-render rule).
  const latchWatch = useRef({ live: false, lied: false, latched: solved, done: solved });
  latchWatch.current.live = liveReveal;
  latchWatch.current.lied = clock.lied;
  latchWatch.current.done = done;

  useEffect(() => {
    const t = setInterval(() => {
      const s = latchWatch.current;
      if (!s.done && s.live && !s.latched) {
        s.latched = true;
        setLatched(true);
        setLieAtReveal(s.lied);
      }
    }, 250);
    return () => clearInterval(t);
  }, []);

  const revealed = done || latched || liveReveal;

  useEffect(() => {
    Animated.timing(dimAnim, {
      toValue: revealed ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [revealed, dimAnim]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          wickStart.current = wick;
        },
        onPanResponderMove: (_e, gs) => {
          const next = Math.max(0, Math.min(1, wickStart.current + gs.dy / WICK_TRAVEL));
          setWick(next);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const touchWord = () => {
    if (done || !revealed) return;
    if (lieAtReveal || clock.lied) {
      setWasLie(true);
      try {
        setKv(CLOCK_LIE_KV, '1');
      } catch {
        /* fail open */
      }
    }
    setDone(true);
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

  const [before, after] = hiddenLine.split(targetWord);
  return (
    <View style={styles.wrap}>
      <View style={styles.page}>
        {aboveText.map((line, i) => (
          <Text key={i} style={[styles.line, dark && styles.lineDimmed]} maxFontSizeMultiplier={1.3}>
            {line}
          </Text>
        ))}
        <Animated.View style={{ opacity: dimAnim }}>
          <Text style={styles.hidden} maxFontSizeMultiplier={1.3}>
            {before}
            <Text style={done ? styles.wordFound : styles.hidden} onPress={touchWord} suppressHighlighting>
              {targetWord}
            </Text>
            {after}
          </Text>
        </Animated.View>
        {!done && (
          <View style={styles.instrumentRow}>
            <View style={styles.clockWell} {...clock.panHandlers}>
              <Text
                style={[styles.clockText, clock.matches && { color: colors.dial, ...amberGlow }]}
                allowFontScaling={false}
              >
                {clock.display}
              </Text>
            </View>
            <View style={styles.wickRail} {...pan.panHandlers}>
              <View
                pointerEvents="none"
                style={{ transform: [{ translateY: wick * WICK_TRAVEL * 0.5 }] }}
              >
                <Text style={styles.wickGlyph} allowFontScaling={false}>
                  {dark ? '·' : '❋'}
                </Text>
              </View>
              <Text style={styles.wickLabel} allowFontScaling={false}>
                the lamp
              </Text>
            </View>
          </View>
        )}
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? (wasLie ? noticedText : unlockedText) : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  page: {
    width: '88%',
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    padding: 20,
  },
  line: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    color: colors.prose,
  },
  lineDimmed: { color: colors.proseFaded },
  hidden: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.dialDim,
    marginTop: 6,
  },
  wordFound: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.dial,
    ...amberGlow,
  },
  instrumentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  clockWell: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  clockText: {
    fontFamily: fonts.mono,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.muted,
  },
  wickRail: { alignItems: 'center', paddingLeft: 18 },
  wickGlyph: { fontSize: 16, color: colors.dialDim },
  wickLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.faint,
    marginTop: 4,
  },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
