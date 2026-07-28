// src/engine/ClockDial.tsx
/* eslint-disable react-hooks/refs -- the `state` ref mirrors hour/minute for
   gesture handlers and timers only; render derives everything from useState. */
// The receiver's clock: a 24-hour military dial with two draggable hands.
// Grab whichever hand your finger lands nearest and swing it; the readout
// under the glass is instrument feedback, not typing. When the hands rest on
// the right time for a breath, the clock accepts it.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { cue, playSfx } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const SIZE = 230;
const HOLD_MS = 1200;

const angleOf = (x: number, y: number): number => {
  const deg = (Math.atan2(x - SIZE / 2, SIZE / 2 - y) * 180) / Math.PI;
  return (deg + 360) % 360;
};

export function ClockDial({
  answerHour,
  answerMinute,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  answerHour: number;
  answerMinute: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [hour, setHour] = useState(solved ? answerHour : 11);
  const [minute, setMinute] = useState(solved ? answerMinute : 47);
  const grabbing = useRef<'hour' | 'minute' | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const state = useRef({ hour: solved ? answerHour : 11, minute: solved ? answerMinute : 47, done: solved });

  // hour hand: 15° per hour on a 24h dial (midnight at top); minute: 6°/min
  const hourDeg = ((hour + minute / 60) * 15) % 360;
  const minuteDeg = minute * 6;

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  const checkHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    const right =
      state.current.hour === answerHour && state.current.minute === answerMinute;
    if (!right || state.current.done) return;
    holdTimer.current = setTimeout(() => {
      if (
        state.current.hour === answerHour &&
        state.current.minute === answerMinute &&
        !state.current.done
      ) {
        state.current.done = true;
        setDone(true);
        cue(solveCue);
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
        onSolved();
      }
    }, HOLD_MS);
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.done,
        onMoveShouldSetPanResponder: () => !state.current.done,
        // hold the gesture against ScrollView theft (see RotaryDial)
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e) => {
          const a = angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY);
          const hDeg = ((state.current.hour + state.current.minute / 60) * 15) % 360;
          const mDeg = state.current.minute * 6;
          const dh = Math.abs(((hDeg - a + 540) % 360) - 180);
          const dm = Math.abs(((mDeg - a + 540) % 360) - 180);
          grabbing.current = dh < dm ? 'hour' : 'minute';
        },
        onPanResponderMove: (e) => {
          const a = angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY);
          if (grabbing.current === 'minute') {
            const m = Math.round(a / 6) % 60;
            if (m !== state.current.minute) {
              state.current.minute = m;
              setMinute(m);
              playSfx('clock-tick', 0.25);
            }
          } else if (grabbing.current === 'hour') {
            const h = Math.floor(a / 15) % 24;
            if (h !== state.current.hour) {
              state.current.hour = h;
              setHour(h);
              playSfx('clock-tick', 0.35);
            }
          }
        },
        onPanResponderRelease: () => {
          grabbing.current = null;
          checkHold();
        },
        onPanResponderTerminate: () => {
          grabbing.current = null;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answerHour, answerMinute],
  );

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={styles.wrap}>
      <View style={styles.clock} {...(done ? {} : pan.panHandlers)}>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const r = SIZE / 2 - 14;
          return (
            <View
              key={i}
              style={[
                styles.tick,
                i % 6 === 0 && styles.tickMajor,
                {
                  left: SIZE / 2 + r * Math.sin(a) - 1,
                  top: SIZE / 2 - r * Math.cos(a) - (i % 6 === 0 ? 7 : 4),
                },
              ]}
            />
          );
        })}
        <View
          style={[styles.hourHand, { transform: [{ rotate: `${hourDeg}deg` }] }]}
          pointerEvents="none"
        />
        <View
          style={[styles.minuteHand, { transform: [{ rotate: `${minuteDeg}deg` }] }]}
          pointerEvents="none"
        />
        <View style={styles.hubDot} pointerEvents="none" />
        <Text style={[styles.readout, done && { color: colors.lockGlow }]} allowFontScaling={false}>
          {pad(hour)}:{pad(minute)}
        </Text>
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  clock: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { position: 'absolute', width: 2, height: 8, backgroundColor: colors.panelBorder },
  tickMajor: { height: 14, backgroundColor: colors.dialDim },
  // Hands pivot on their BASE (the clock's center): each sits with its foot
  // at the hub and swings via transformOrigin bottom.
  hourHand: {
    position: 'absolute',
    left: SIZE / 2 - 1.5,
    top: SIZE / 2 - SIZE * 0.26,
    width: 3,
    height: SIZE * 0.26,
    borderRadius: 2,
    backgroundColor: colors.prose,
    transformOrigin: 'bottom',
  },
  minuteHand: {
    position: 'absolute',
    left: SIZE / 2 - 1,
    top: SIZE / 2 - SIZE * 0.38,
    width: 2,
    height: SIZE * 0.38,
    borderRadius: 2,
    backgroundColor: colors.dial,
    transformOrigin: 'bottom',
  },
  hubDot: {
    position: 'absolute',
    left: SIZE / 2 - 4,
    top: SIZE / 2 - 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dialDim,
  },
  readout: {
    position: 'absolute',
    bottom: 34,
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
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
