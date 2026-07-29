// src/engine/Register.tsx
// THE PARISH REGISTER (B5): the other listeners have all signed. She wants
// no ink and no voice — a THUMB, held to the page the way a seal is pressed
// into wax. While it rests there the page pulses faintly under it (haptics:
// she counts the reader's pulse back at them), and when she is satisfied
// the entry is already dry in her type: the machine's own name — which is
// usually the reader's own. Pure act, nothing to fail: the gate the mic
// gate could not manage to be.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue } from '../audio';
import { machineName } from '../device';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const HOLD_MS = 3600;
const PULSE_MS = 850; // a calm resting heart, counted back

export function Register({
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  prompt: string;
  /** `{NAME}` is replaced with what the machine is called. */
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [held, setHeld] = useState(0); // 0..1
  const state = useRef({
    done: solved,
    heldMs: 0,
    tick: null as ReturnType<typeof setInterval> | null,
    pulse: null as ReturnType<typeof setInterval> | null,
  });

  const clearTimers = () => {
    const s = state.current;
    if (s.tick) clearInterval(s.tick);
    if (s.pulse) clearInterval(s.pulse);
    s.tick = null;
    s.pulse = null;
  };
  useEffect(() => clearTimers, []);

  const pressIn = () => {
    const s = state.current;
    if (s.done) return;
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
    s.pulse = setInterval(
      () => Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light),
      PULSE_MS,
    );
    s.tick = setInterval(() => {
      s.heldMs += 100;
      setHeld(Math.min(1, s.heldMs / HOLD_MS));
      if (s.heldMs >= HOLD_MS && !s.done) {
        s.done = true;
        clearTimers();
        setDone(true);
        cue(solveCue);
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
        onSolved();
      }
    }, 100);
  };

  const pressOut = () => {
    const s = state.current;
    clearTimers();
    if (!s.done) {
      // a lifted thumb is a thumb withdrawn; the page forgets the warmth
      s.heldMs = 0;
      setHeld(0);
    }
  };

  const entry = (machineName() ?? 'THE KEEPER OF THE SET').toUpperCase();
  return (
    <View style={styles.wrap}>
      <View style={styles.page}>
        <Text style={styles.ledgerHead} allowFontScaling={false}>
          THE LISTENERS’ REGISTER
        </Text>
        <View style={styles.ruleLine} />
        <View style={styles.ruleLine} />
        {done ? (
          <Text style={[styles.entry, amberGlow]} allowFontScaling={false}>
            {entry}
          </Text>
        ) : (
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            style={styles.sealWell}
            hitSlop={8}
          >
            <View style={[styles.sealRing, held > 0 && styles.sealWarm]}>
              <View
                style={[
                  styles.sealFill,
                  { transform: [{ scale: held }] },
                ]}
              />
            </View>
          </Pressable>
        )}
        <View style={styles.ruleLine} />
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText.replace('{NAME}', entry) : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  page: {
    width: 270,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    padding: 20,
    gap: 14,
  },
  ledgerHead: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.faint,
  },
  ruleLine: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.panelBorder,
  },
  entry: {
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.dial,
    paddingVertical: 8,
  },
  sealWell: { paddingVertical: 4 },
  sealRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sealWarm: { borderColor: colors.dialDim },
  sealFill: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.hairline,
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
