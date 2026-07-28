// src/engine/RotaryDial.tsx
/* eslint-disable react-hooks/refs -- grab/dialed/done refs feed gesture
   handlers only; render reads the mirrored useState values. */
// A GPO rotary telephone dial, drawn in the page's own ink. Put a finger in
// a hole and PULL it clockwise to the stop — the travel is the dialing, just
// as it was in 1963. The letter ring uses the British layout of the era
// (2 ABC · 3 DEF · 4 GHI · 5 JKL · 6 MN · 7 PRS · 8 TUV · 9 WXY · 0 OQ), so
// a name can be dialed as its letters. Wrong numbers reach a dead line.

import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { cue, playSfx, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const SIZE = 250;
const HOLE_R = 96; // radius of the hole ring
const STOP_DEG = 40; // the finger stop, clockwise from 12
const LETTERS: Record<string, string> = {
  '1': '',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MN',
  '7': 'PRS',
  '8': 'TUV',
  '9': 'WXY',
  '0': 'OQ',
};
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const holeAngle = (d: string): number => {
  const i = DIGITS.indexOf(d);
  return (320 - i * 27 + 360) % 360; // 1 sits high-right; 0 takes the long pull
};

/** Touch angle in degrees clockwise from 12 o'clock, from view-local x/y. */
const angleOf = (x: number, y: number): number => {
  const deg = (Math.atan2(x - SIZE / 2, SIZE / 2 - y) * 180) / Math.PI;
  return (deg + 360) % 360;
};

export function RotaryDial({
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
  const [done, setDone] = useState(solved);
  const [dialed, setDialed] = useState('');
  const [ringTurn, setRingTurn] = useState(0); // live rotation while pulling
  const grab = useRef<{ digit: string; startAngle: number; travelNeeded: number } | null>(null);
  const doneRef = useRef(solved);
  const dialedRef = useRef('');

  const judge = (next: string) => {
    dialedRef.current = next;
    setDialed(next);
    if (next.length < answer.length) return;
    if (next === answer) {
      doneRef.current = true;
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // a dead line: the exchange swallows the number
      setStaticLevel(0.24);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
      setTimeout(() => {
        setStaticLevel(0.05);
        dialedRef.current = '';
        setDialed('');
      }, 900);
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !doneRef.current,
        onMoveShouldSetPanResponder: () => !doneRef.current,
        onPanResponderGrant: (e) => {
          const a = angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY);
          // the hole under the finger, if any is close enough to grab
          let best: string | null = null;
          let bestDist = 20;
          for (const d of DIGITS) {
            const diff = Math.abs(((holeAngle(d) - a + 540) % 360) - 180);
            if (diff < bestDist) {
              bestDist = diff;
              best = d;
            }
          }
          grab.current = best
            ? {
                digit: best,
                startAngle: a,
                travelNeeded: (STOP_DEG - holeAngle(best) + 360) % 360,
              }
            : null;
        },
        onPanResponderMove: (e) => {
          const g = grab.current;
          if (!g) return;
          const a = angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY);
          const travel = (a - g.startAngle + 360) % 360;
          setRingTurn(Math.min(travel, g.travelNeeded));
        },
        onPanResponderRelease: () => {
          const g = grab.current;
          grab.current = null;
          setRingTurn(0);
          if (!g) return;
          playSfx('dial-return', 0.55);
          // reached the stop (with a forgiving last few degrees)?
          if (ringTurn >= g.travelNeeded - 16) {
            Haptics?.selectionAsync?.();
            judge(dialedRef.current + g.digit);
          }
        },
        onPanResponderTerminate: () => {
          grab.current = null;
          setRingTurn(0);
        },
      }),
    // ringTurn is read in release via state closure refresh each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ringTurn, answer],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.dial} {...(done ? {} : pan.panHandlers)}>
        <View style={[styles.ring, { transform: [{ rotate: `${ringTurn}deg` }] }]}>
          {DIGITS.map((d) => {
            const a = (holeAngle(d) * Math.PI) / 180;
            const x = SIZE / 2 + HOLE_R * Math.sin(a) - 21;
            const y = SIZE / 2 - HOLE_R * Math.cos(a) - 21;
            return (
              <View key={d} style={[styles.hole, { left: x, top: y }]}>
                <Text style={styles.holeDigit} allowFontScaling={false}>
                  {d}
                </Text>
                {LETTERS[d] ? (
                  <Text style={styles.holeLetters} allowFontScaling={false}>
                    {LETTERS[d]}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
        <View style={styles.stop} />
        <View style={styles.hub}>
          <View style={styles.dialedRow}>
            {Array.from({ length: answer.length }, (_, i) => (
              <View key={i} style={[styles.dialedDot, i < dialed.length && styles.dialedLit]} />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  dial: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ring: { position: 'absolute', width: SIZE, height: SIZE },
  hole: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeDigit: { fontFamily: fonts.mono, fontSize: 15, color: colors.prose },
  holeLetters: { fontFamily: fonts.mono, fontSize: 7, letterSpacing: 1, color: colors.faint },
  stop: {
    position: 'absolute',
    // sits just outside the hole ring at the stop angle
    left: SIZE / 2 + (HOLE_R + 26) * Math.sin((STOP_DEG * Math.PI) / 180) - 4,
    top: SIZE / 2 - (HOLE_R + 26) * Math.cos((STOP_DEG * Math.PI) / 180) - 12,
    width: 8,
    height: 24,
    borderRadius: 3,
    backgroundColor: colors.dialDim,
  },
  hub: {
    position: 'absolute',
    left: SIZE / 2 - 46,
    top: SIZE / 2 - 46,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.bg,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialedRow: { flexDirection: 'row', gap: 7 },
  dialedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  dialedLit: { backgroundColor: colors.dial },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
