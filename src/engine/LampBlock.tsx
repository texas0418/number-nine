// src/engine/LampBlock.tsx
/* eslint-disable react-hooks/refs -- wickStart is read only inside gesture
   handlers, never during render. */
// SHY INK: a line that resolves only when the lamp is turned down. Two ways
// to lower the lamp: the reader's own SCREEN BRIGHTNESS dropping below the
// threshold (expo-brightness, read-only, fail-open), or dragging the little
// wick glyph down, which dims the page itself. Both paths always work; the
// sensor is atmosphere, the wick is the guarantee.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { watchLamp } from '../device';
import { cue } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const DARK_ENOUGH = 0.35;
const WICK_TRAVEL = 90;

export function LampBlock({
  aboveText,
  hiddenLine,
  targetWord,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  aboveText: string[];
  hiddenLine: string;
  targetWord: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [screenDark, setScreenDark] = useState(false);
  const [wick, setWick] = useState(0); // 0 bright .. 1 turned right down
  const wickStart = useRef(0);
  const dimAnim = useRef(new Animated.Value(0)).current;
  // The dark must be EARNED: a screen still dim from a previous read (or a
  // reader who always plays dim) must not pre-solve the page — the lamp has
  // to be seen lit once before turning it down means anything (QA).
  const sawBright = useRef(false);

  useEffect(() => {
    if (done) return;
    const stop = watchLamp((level) => {
      if (level >= 0.45) sawBright.current = true;
      setScreenDark(sawBright.current && level < DARK_ENOUGH);
    });
    return stop;
  }, [done]);

  const dark = done || screenDark || wick > 0.6;

  useEffect(() => {
    Animated.timing(dimAnim, {
      toValue: dark ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [dark, dimAnim]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // hold the gesture against ScrollView theft (see RotaryDial) — the
        // wick drag is vertical, the easiest of all to steal
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
    if (done || !dark) return;
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
          <View style={styles.wickRail} {...pan.panHandlers}>
            <View
              pointerEvents="none"
              style={[styles.wickFlame, { transform: [{ translateY: wick * WICK_TRAVEL * 0.5 }] }]}
            >
              <Text style={styles.wickGlyph} allowFontScaling={false}>
                {dark ? '·' : '❋'}
              </Text>
            </View>
            <Text style={styles.wickLabel} allowFontScaling={false} pointerEvents="none">
              the lamp
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
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
  },
  wickRail: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
    height: 74,
  },
  wickFlame: { marginBottom: 2 },
  wickGlyph: { fontSize: 18, color: colors.dial },
  wickLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.faint },
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
