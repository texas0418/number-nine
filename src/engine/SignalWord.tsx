// src/engine/SignalWord.tsx
// THE DAILY CROSSOVER (B4): "what did she say tonight?" The answer is the
// long word in tonight's ACTUAL Tonight's Signal line — the one every
// player on earth is decoding this evening. Candidates and their order come
// from the pure module (src/daily/crossover.ts), deterministic per night.
// A wrong word gets atmosphere (the room swallows it), never an error; the
// card quietly re-derives itself if midnight passes mid-gate.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { nightWordChoices } from '../daily/crossover';
import { dayKeyFromMs } from '../models';
import { cue, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export function SignalWord({
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [attempts, setAttempts] = useState(0);
  const dayKey = dayKeyFromMs(Date.now());
  const card = useMemo(() => nightWordChoices(dayKey), [dayKey]);

  const pick = (i: number) => {
    if (done) return;
    if (i === card.answerIndex) {
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // the room absorbs the wrong word
      setAttempts((a) => a + 1);
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
      setStaticLevel(0.2);
      setTimeout(() => setStaticLevel(0.05), 500);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {card.words.map((w, i) => (
          <Pressable
            key={`${w}-${attempts}`}
            style={styles.word}
            onPress={() => pick(i)}
            disabled={done}
          >
            <Text
              style={[
                styles.wordText,
                done && i === card.answerIndex && { color: colors.dial },
              ]}
              allowFontScaling={false}
            >
              {w}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  card: {
    width: 270,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 8,
  },
  word: { paddingVertical: 12, alignItems: 'center' },
  wordText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 3,
    color: colors.muted,
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
