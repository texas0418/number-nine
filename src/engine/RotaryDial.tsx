// src/engine/RotaryDial.tsx
/* eslint-disable react-hooks/refs -- gesture state (grab, travel, dialed)
   lives in refs read only by handlers; render reads mirrored useState. */
// A GPO rotary telephone dial, drawn in the page's own ink. Put a finger in
// a hole and PULL it clockwise to the stop — the travel is the dialing, just
// as it was in 1963. The letter ring uses the British layout of the era
// (2 ABC · 3 DEF · 4 GHI · 5 JKL · 6 MN · 7 PRS · 8 TUV · 9 WXY · 0 OQ), so
// a name can be dialed as its letters. Wrong numbers reach a dead line.
//
// Device-QA rebuild (2026-07-28): the PanResponder is created ONCE (a
// per-render rebuild killed live gestures — the ring never turned); grabs
// require the touch to LAND ON THE HOLE RING (an angle-only match let the
// hub trigger holes); travel is tracked in a ref and read on release.

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

const SIZE = 260;
const HOLE_R = 98; // radius of the hole ring
const HOLE_W = 48;
const RING_BAND = 34; // how far off the hole ring a grab may land
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
  const grab = useRef<{ digit: string; lastAngle: number; travel: number; needed: number } | null>(
    null,
  );
  const doneRef = useRef(solved);
  const dialedRef = useRef('');
  const answerRef = useRef(answer);
  answerRef.current = answer;

  const judge = (next: string) => {
    dialedRef.current = next;
    setDialed(next);
    if (next.length < answerRef.current.length) return;
    if (next === answerRef.current) {
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

  // Angle in degrees clockwise from 12 o'clock, and radius, from view-local x/y.
  const polar = (x: number, y: number) => {
    const dx = x - SIZE / 2;
    const dy = y - SIZE / 2;
    const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    return { deg, r: Math.hypot(dx, dy) };
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !doneRef.current,
        onMoveShouldSetPanResponder: () => !doneRef.current,
        onPanResponderGrant: (e) => {
          const { deg, r } = polar(e.nativeEvent.locationX, e.nativeEvent.locationY);
          grab.current = null;
          if (Math.abs(r - HOLE_R) > RING_BAND) return; // hub and rim are inert
          let best: string | null = null;
          let bestDist = 16;
          for (const d of DIGITS) {
            const diff = Math.abs(((holeAngle(d) - deg + 540) % 360) - 180);
            if (diff < bestDist) {
              bestDist = diff;
              best = d;
            }
          }
          if (best)
            grab.current = {
              digit: best,
              lastAngle: deg,
              travel: 0,
              needed: (STOP_DEG - holeAngle(best) + 360) % 360,
            };
        },
        onPanResponderMove: (e) => {
          const g = grab.current;
          if (!g) return;
          const { deg } = polar(e.nativeEvent.locationX, e.nativeEvent.locationY);
          // accumulate signed clockwise travel, tolerant of noisy jumps
          let step = ((deg - g.lastAngle + 540) % 360) - 180;
          if (Math.abs(step) > 90) step = 0; // a wild jump, not a pull
          g.lastAngle = deg;
          g.travel = Math.max(0, Math.min(g.needed, g.travel + step));
          setRingTurn(g.travel);
        },
        onPanResponderRelease: () => {
          const g = grab.current;
          grab.current = null;
          setRingTurn(0);
          if (!g || g.travel < 12) return; // taps and nudges stay silent
          playSfx('dial-return', 0.55);
          if (g.travel >= g.needed - 16) {
            Haptics?.selectionAsync?.();
            judge(dialedRef.current + g.digit);
          }
        },
        onPanResponderTerminate: () => {
          grab.current = null;
          setRingTurn(0);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.dial} {...(done ? {} : pan.panHandlers)}>
        {/* pointerEvents none: touches must always TARGET THE DIAL VIEW so
            locationX/Y stay dial-relative — a touch landing on a hole child
            reported hole-local coords, the radius check rejected them, and
            the dial went completely dead (device QA round 2). */}
        <View style={[styles.ring, { transform: [{ rotate: `${ringTurn}deg` }] }]} pointerEvents="none">
          {DIGITS.map((d) => {
            const a = (holeAngle(d) * Math.PI) / 180;
            const x = SIZE / 2 + HOLE_R * Math.sin(a) - HOLE_W / 2;
            const y = SIZE / 2 - HOLE_R * Math.cos(a) - HOLE_W / 2;
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
        <View style={styles.stop} pointerEvents="none" />
        <View style={styles.hub} pointerEvents="none">
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
    width: HOLE_W,
    height: HOLE_W,
    borderRadius: HOLE_W / 2,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeDigit: { fontFamily: fonts.mono, fontSize: 17, color: colors.prose },
  holeLetters: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.muted },
  stop: {
    position: 'absolute',
    left: SIZE / 2 + (HOLE_R + 28) * Math.sin((STOP_DEG * Math.PI) / 180) - 4,
    top: SIZE / 2 - (HOLE_R + 28) * Math.cos((STOP_DEG * Math.PI) / 180) - 12,
    width: 8,
    height: 24,
    borderRadius: 3,
    backgroundColor: colors.dialDim,
  },
  hub: {
    position: 'absolute',
    left: SIZE / 2 - 42,
    top: SIZE / 2 - 42,
    width: 84,
    height: 84,
    borderRadius: 42,
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
