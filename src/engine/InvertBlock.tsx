// src/engine/InvertBlock.tsx
// THE OTHER SIDE OF THE TABLE: a page whose words change when the phone is
// PHYSICALLY upside down. The inverted lines render rotated 180° so they
// read correctly only in the inverted grip; tap the target word there to
// pass. Fallback: a small turn glyph rotates the page in place instead.

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  onSolved,
  solveCue = 'unlock',
}: {
  upright: string[];
  inverted: string[];
  targetWord: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
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
    setDone(true);
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

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
        {!done && (
          <Pressable
            onPress={() => setMode((m) => (m === 'glyph' ? 'up' : 'glyph'))}
            style={styles.turnGlyph}
            hitSlop={10}
          >
            <Text style={styles.turnText} allowFontScaling={false}>
              ⟲
            </Text>
          </Pressable>
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
  turnGlyph: { position: 'absolute', right: 8, bottom: 6 },
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
