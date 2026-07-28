// src/engine/FlipBlock.tsx
// The OVERLEAF: a page with writing on its back. Turning the phone FACE DOWN
// and back turns the page over in the reader's hands (accelerometer, fail-open);
// the dog-eared corner drags to do the same by touch. The verso's target word
// is the latch: touch it and the page gives up what it was hiding.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { watchFacing } from '../device';
import { cue, playSfx } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export function FlipBlock({
  front,
  back,
  targetWord,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  front: string[];
  back: string[];
  targetWord: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [showingBack, setShowingBack] = useState(false);
  const wasDown = useRef(false);

  const turnOver = () => {
    playSfx('page-turn', 0.5);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
    setShowingBack((s) => !s);
  };

  // Face the phone down; when it comes back up, the page has been turned.
  useEffect(() => {
    if (done) return;
    const stop = watchFacing((faceDown) => {
      if (faceDown) wasDown.current = true;
      else if (wasDown.current) {
        wasDown.current = false;
        turnOver();
      }
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const touchWord = () => {
    if (done) return;
    setDone(true);
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

  const lines = showingBack ? back : front;
  return (
    <View style={styles.wrap}>
      <View style={[styles.page, showingBack && styles.pageBack]}>
        {lines.map((line, i) => {
          if (!showingBack || !line.includes(targetWord))
            return (
              <Text key={i} style={[styles.line, showingBack && styles.lineBack]} maxFontSizeMultiplier={1.3}>
                {line}
              </Text>
            );
          const [before, after] = line.split(targetWord);
          return (
            <Text key={i} style={[styles.line, styles.lineBack]} maxFontSizeMultiplier={1.3}>
              {before}
              <Text style={done ? styles.wordFound : styles.lineBack} onPress={touchWord} suppressHighlighting>
                {targetWord}
              </Text>
              {after}
            </Text>
          );
        })}
        {!done && (
          <Pressable onPress={turnOver} style={styles.dogEar} hitSlop={10}>
            <View style={styles.dogEarFold} />
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
    minHeight: 160,
  },
  pageBack: { backgroundColor: colors.bg },
  line: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    color: colors.prose,
  },
  lineBack: {
    color: colors.proseFaded,
    fontStyle: 'italic',
  },
  wordFound: { color: colors.dial, fontStyle: 'italic' },
  dogEar: { position: 'absolute', right: 0, bottom: 0 },
  dogEarFold: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 26,
    borderTopWidth: 26,
    borderTopColor: 'transparent',
    borderRightColor: colors.panelBorder,
    borderBottomRightRadius: 6,
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
