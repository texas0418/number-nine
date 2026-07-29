// src/engine/Register.tsx
/* eslint-disable react-hooks/refs -- hold state lives in refs read by the
   press timers; render reads mirrored useState values. */
// THE PARISH REGISTER (B5): the other listeners have all signed. She wants
// no ink and no voice — a THUMB, held to the page the way a seal is pressed
// into wax. THREE ruled lines look empty; two carry the brown ghosts of
// entries SCRAPED away, and the page refuses those cold (a dead knock, a
// swallowing hush). The line that never took ink warms under the thumb,
// counts the reader's pulse back at them (light haptics), and when she is
// satisfied the entry is already dry in her type: the machine's own name —
// which is usually the reader's own.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, playSfx, setStaticLevel } from '../audio';
import { machineName } from '../device';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const WELLS = 3;
const HOLD_MS = 3600;
const REFUSE_MS = 900; // a scraped line considers the thumb, then refuses
const PULSE_MS = 850; // a calm resting heart, counted back

export function Register({
  trueWell,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  /** Which ruled line (0-based) has never taken ink. */
  trueWell: number;
  prompt: string;
  /** `{NAME}` is replaced with what the machine is called. */
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [held, setHeld] = useState(0); // 0..1, true well only
  const state = useRef({
    done: solved,
    heldMs: 0,
    tick: null as ReturnType<typeof setInterval> | null,
    pulse: null as ReturnType<typeof setInterval> | null,
    refuse: null as ReturnType<typeof setTimeout> | null,
  });

  const clearTimers = () => {
    const s = state.current;
    if (s.tick) clearInterval(s.tick);
    if (s.pulse) clearInterval(s.pulse);
    if (s.refuse) clearTimeout(s.refuse);
    s.tick = null;
    s.pulse = null;
    s.refuse = null;
  };
  useEffect(() => clearTimers, []);

  const pressTrue = () => {
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

  const pressScraped = () => {
    const s = state.current;
    if (s.done) return;
    // the page considers the thumb for a moment — then refuses it cold
    s.refuse = setTimeout(() => {
      playSfx('knock', 0.7);
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
      setStaticLevel(0.18);
      setTimeout(() => setStaticLevel(0.05), 450);
    }, REFUSE_MS);
  };

  const pressOut = () => {
    const s = state.current;
    clearTimers();
    if (!s.done) {
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
        {Array.from({ length: WELLS }, (_, i) => {
          const isTrue = i === trueWell;
          if (done && !isTrue) return <View key={i} style={styles.ruleLine} />;
          if (done && isTrue)
            return (
              <Text key={i} style={[styles.entry, amberGlow]} allowFontScaling={false}>
                {entry}
              </Text>
            );
          return (
            <View key={i} style={styles.lineRow}>
              <View style={styles.ruleLine} />
              <Pressable
                onPressIn={isTrue ? pressTrue : pressScraped}
                onPressOut={pressOut}
                style={styles.sealWell}
                hitSlop={6}
              >
                <View style={[styles.sealRing, isTrue && held > 0 && styles.sealWarm]}>
                  {isTrue && (
                    <View style={[styles.sealFill, { transform: [{ scale: held }] }]} />
                  )}
                  {!isTrue && (
                    <View style={styles.scrapes} pointerEvents="none">
                      <View style={styles.scrapeMark} />
                      <View style={[styles.scrapeMark, { width: 9, opacity: 0.5 }]} />
                    </View>
                  )}
                </View>
              </Pressable>
              <View style={styles.ruleLine} />
            </View>
          );
        })}
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
    gap: 12,
  },
  ledgerHead: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.faint,
  },
  lineRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleLine: {
    flex: 1,
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.panelBorder,
    minWidth: 20,
  },
  entry: {
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.dial,
    paddingVertical: 6,
  },
  sealWell: { paddingVertical: 2 },
  sealRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sealWarm: { borderColor: colors.dialDim },
  sealFill: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.hairline,
  },
  // the brown ghosts of an entry scraped away — visible to a careful eye
  scrapes: { alignItems: 'flex-start', gap: 3 },
  scrapeMark: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#4a3a28',
    opacity: 0.75,
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
