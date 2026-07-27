// src/engine/MelodyBox.tsx
// The EAR puzzle: a music box with four brass keys. Tap the horn to hear her
// six notes; play them back by ear. No hints, no note names — the knowledge
// is in the listening. Wrong sequence: static swallows it and the box resets.

import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, playIdent, playSfx, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const KEYS = ['1', '2', '3', '4'];

export function MelodyBox({
  answer,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  answer: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [entry, setEntry] = useState('');
  const [done, setDone] = useState(solved);
  const busy = useRef(false);

  const press = (key: string) => {
    if (done || busy.current) return;
    playSfx(`bell-${key}`);
    Haptics?.selectionAsync?.();
    const next = entry + key;
    setEntry(next);
    if (next.length < answer.length) return;
    if (next === answer) {
      setDone(true);
      setStaticLevel(0.06);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // a full wrong phrase: static swallows it, box resets after a beat
      busy.current = true;
      setStaticLevel(0.5);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
      setTimeout(() => {
        setStaticLevel(0.15);
        setEntry('');
        busy.current = false;
      }, 700);
    }
  };

  const dots = done
    ? answer.length
    : entry.length;

  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      <View style={styles.dotRow}>
        {Array.from({ length: answer.length }, (_, i) => (
          <View key={i} style={[styles.dot, i < dots && styles.dotLit]} />
        ))}
      </View>
      {!done && (
        <>
          <Pressable style={styles.horn} onPress={() => playIdent()} hitSlop={6}>
            <Text style={styles.hornText} allowFontScaling={false}>
              ◉ wind the box
            </Text>
          </Pressable>
          <View style={styles.keyRow}>
            {KEYS.map((k) => (
              <Pressable key={k} style={styles.key} onPress={() => press(k)} hitSlop={4}>
                <View style={styles.keyTine} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: 260,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    marginVertical: 24,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  dotLit: { backgroundColor: colors.dial },
  horn: {
    alignSelf: 'center',
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 14,
  },
  hornText: { fontFamily: fonts.mono, fontSize: 12, color: colors.lockGlow },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  key: {
    width: 44,
    height: 64,
    backgroundColor: colors.bg,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  keyTine: { width: 4, height: 34, borderRadius: 2, backgroundColor: colors.dialDim },
});
