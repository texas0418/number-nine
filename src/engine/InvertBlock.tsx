// src/engine/InvertBlock.tsx
/* eslint-disable react-hooks/refs -- doneRef/turnedThisGesture feed the
   once-created PanResponder's handlers only; render reads useState values. */
// THE OTHER SIDE OF THE TABLE: a page whose words change when the phone is
// PHYSICALLY upside down. The inverted lines render rotated 180° so they
// read correctly only in the inverted grip; tap the target word there to
// pass. Fallback: a small turn glyph rotates the page in place — but it
// only materializes alongside the 150s margin note (device QA: visible from
// the start, it leaked the trick), and it answers to a SWIPE across it (the
// sheet is turned, not pressed), so a stray thumb cannot trip it.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { watchInversion } from '../device';
import { cue } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export function InvertBlock({
  upright,
  inverted,
  targetWord,
  prompt,
  unlockedText,
  solved,
  hintShown = false,
  onSolved,
  solveCue = 'unlock',
}: {
  upright: string[];
  inverted: string[];
  targetWord: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  /** True once the margin note has surfaced — the turn glyph rides with it. */
  hintShown?: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const doneRef = useRef(solved);
  // 'up' | 'sensor' (phone truly inverted) | 'glyph' (fallback turn-in-place)
  const [mode, setMode] = useState<'up' | 'sensor' | 'glyph'>('up');

  useEffect(() => {
    if (done) return;
    const stop = watchInversion((isInverted) =>
      setMode((m) => (isInverted ? 'sensor' : m === 'sensor' ? 'up' : m)),
    );
    return stop;
  }, [done]);

  const touchWord = () => {
    if (done || mode === 'up') return;
    doneRef.current = true;
    setDone(true);
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

  // The turn gesture: a deliberate drag across the glyph turns the sheet in
  // place (and back). Created once — recreating a PanResponder mid-gesture
  // kills the drag (engine lesson, B2).
  const turnedThisGesture = useRef(false);
  const turnPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !doneRef.current,
        onMoveShouldSetPanResponder: (_e, g) =>
          !doneRef.current && Math.hypot(g.dx, g.dy) > 8,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          turnedThisGesture.current = false;
        },
        onPanResponderMove: (_e, g) => {
          if (turnedThisGesture.current || doneRef.current) return;
          if (Math.hypot(g.dx, g.dy) > 40) {
            turnedThisGesture.current = true;
            Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
            setMode((m) => (m === 'glyph' ? 'up' : 'glyph'));
          }
        },
      }),
    [],
  );

  const showingOther = mode !== 'up';
  const lines = showingOther ? inverted : upright;
  // Held physically upside down, the OTHER text must read right in that
  // grip — so it renders rotated. The glyph fallback reads upright instead.
  const rotate = mode === 'sensor';

  return (
    <View style={styles.wrap}>
      <View style={[styles.page, rotate && styles.pageFlipped]}>
        {lines.map((line, i) => {
          if (!showingOther || !line.includes(targetWord))
            return (
              <Text key={i} style={[styles.line, showingOther && styles.lineOther]} maxFontSizeMultiplier={1.3}>
                {line}
              </Text>
            );
          const [before, after] = line.split(targetWord);
          return (
            <Text key={i} style={[styles.line, styles.lineOther]} maxFontSizeMultiplier={1.3}>
              {before}
              <Text
                style={done ? styles.wordFound : styles.lineOther}
                onPress={touchWord}
                suppressHighlighting
              >
                {targetWord}
              </Text>
              {after}
            </Text>
          );
        })}
        {!done && hintShown && (
          <View style={styles.turnGlyph} {...turnPan.panHandlers}>
            <Text style={styles.turnText} allowFontScaling={false} pointerEvents="none">
              ⟲
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
    minHeight: 150,
  },
  pageFlipped: { transform: [{ rotate: '180deg' }] },
  line: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    color: colors.prose,
  },
  lineOther: { color: colors.proseFaded, fontStyle: 'italic' },
  wordFound: { color: colors.dial, fontStyle: 'italic' },
  turnGlyph: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnText: { fontSize: 18, color: colors.faint },
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
