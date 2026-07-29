// src/engine/Keypad.tsx
// A diegetic entry lock embedded in the prose: a telephone dial / safe wheel
// (digits) or a decoding slate (letters, for the cipher gate). No hints, no
// error message — a wrong entry just rings once into static and clears
// (DEVICE 6 rules, the knowledge IS the key). Solving gives the haptic thunk
// and the ident.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

const LETTER_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', '⌫'],
];

export function Keypad({
  answer,
  prompt,
  unlockedText,
  solved,
  onSolved,
  letters = false,
  feltGroups,
  solveCue = 'unlock',
}: {
  answer: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  letters?: boolean;
  /** Digits spoken ONLY through the hand: a palm control plays these as
   *  haptic knock-groups (B3's code slot — the wall says the number). */
  feltGroups?: number[];
  solveCue?: string;
}) {
  const [entry, setEntry] = useState(solved ? answer : '');
  const [done, setDone] = useState(solved);
  const [speaking, setSpeaking] = useState(false);
  const feltTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rows = letters ? LETTER_ROWS : DIGIT_ROWS;

  useEffect(() => () => feltTimers.current.forEach(clearTimeout), []);

  // The wall says the number — into the palm, never aloud, never on screen.
  const feel = () => {
    if (!feltGroups || speaking || done) return;
    setSpeaking(true);
    let at = 400;
    feltGroups.forEach((n) => {
      for (let k = 0; k < n; k++) {
        feltTimers.current.push(
          setTimeout(
            () => Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy),
            at,
          ),
        );
        at += 470;
      }
      at += 1200;
    });
    feltTimers.current.push(setTimeout(() => setSpeaking(false), at - 1200 + 300));
  };

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
      cue(solveCue); // the latch/safe/telephone unlock sound for this lock
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // one ring into static, then the line goes dead and the slate clears
      setStaticLevel(0.38);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
      setTimeout(() => {
        setStaticLevel(0.08);
        setEntry('');
      }, 700);
    }
  };

  const display = done ? answer : entry.padEnd(answer.length, '·');

  return (
    <View style={[styles.body, letters && styles.bodyWide]}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      <Text
        style={[styles.display, letters && styles.displayLetters, done && { color: colors.lockGlow }]}
        allowFontScaling={false}
      >
        {[...display].join(' ')}
      </Text>
      {!done && feltGroups && (
        <Pressable onPress={feel} style={styles.palm} disabled={speaking}>
          <Text style={styles.palmText} allowFontScaling={false}>
            {speaking ? 'the wall is counting' : '◉ palm to the wall'}
          </Text>
        </Pressable>
      )}
      {!done && (
        <View>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((key, ki) => (
                <Pressable
                  key={ki}
                  style={[
                    letters ? styles.keySmall : styles.key,
                    key === '' && { opacity: 0 },
                    key === '⌫' && letters && styles.keyWide,
                  ]}
                  onPress={() => press(key)}
                  hitSlop={4}
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
  bodyWide: { width: 320 },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 19,
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
  displayLetters: { fontSize: 20, letterSpacing: 2 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  key: {
    width: 56,
    height: 46,
    backgroundColor: colors.bg,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySmall: {
    width: 38,
    height: 44,
    backgroundColor: colors.bg,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: { width: 84 },
  keyText: { fontFamily: fonts.mono, fontSize: 18, color: colors.prose },
  palm: {
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.bg,
  },
  palmText: { fontFamily: fonts.mono, fontSize: 11, color: colors.lockGlow },
});
