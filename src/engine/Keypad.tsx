// src/engine/Keypad.tsx
// A diegetic telephone dial embedded in the prose. No hints, no error
// message: a wrong number just rings once into static and clears — DEVICE 6
// rules, the knowledge IS the key. Solving gives the haptic thunk + ident.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { playIdent, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export function Keypad({
  answer,
  prompt,
  unlockedText,
  solved,
  onSolved,
}: {
  answer: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
}) {
  const [entry, setEntry] = useState(solved ? answer : '');
  const [done, setDone] = useState(solved);

  const press = (key: string) => {
    if (done || key === '') return;
    if (key === '⌫') {
      setEntry((e) => e.slice(0, -1));
      return;
    }
    const next = (entry + key).slice(0, answer.length);
    setEntry(next);
    if (next.length < answer.length) return;
    if (next === answer) {
      setDone(true);
      setStaticLevel(0.06);
      playIdent();
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // one ring into static, then the line goes dead and the dial clears
      setStaticLevel(0.5);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
      setTimeout(() => {
        setStaticLevel(0.15);
        setEntry('');
      }, 700);
    }
  };

  const display = done
    ? answer
    : entry.padEnd(answer.length, '·');

  return (
    <View style={styles.body}>
      <Text style={styles.prompt}>{done ? unlockedText : prompt}</Text>
      <Text style={[styles.display, done && { color: colors.lockGlow }]} allowFontScaling={false}>
        {[...display].join(' ')}
      </Text>
      {!done && (
        <View>
          {KEY_ROWS.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((key, ki) => (
                <Pressable
                  key={ki}
                  style={[styles.key, key === '' && { opacity: 0 }]}
                  onPress={() => press(key)}
                >
                  <Text style={styles.keyText} allowFontScaling={false}>
                    {key}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: 240,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    marginVertical: 24,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  display: {
    fontFamily: fonts.mono,
    fontSize: 24,
    letterSpacing: 4,
    color: colors.dial,
    textAlign: 'center',
    marginBottom: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  key: {
    width: 56,
    height: 44,
    backgroundColor: colors.bg,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: fonts.mono, fontSize: 18, color: colors.prose },
});
