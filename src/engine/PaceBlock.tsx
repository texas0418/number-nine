// src/engine/PaceBlock.tsx
/* eslint-disable react-hooks/refs -- sensor/pace refs feed the tick loop and
   handlers only; render reads mirrored useState values. */
// PACE IT OUT: face the bearing and walk. A small compass card shows the
// way; while the bearing holds, each step-bounce of the body (accelerometer)
// counts one pace — and so does a tap, for readers who cannot walk it.
// Straying off the bearing freezes the count; the churchyard does not
// forgive shortcuts. Fail-open throughout.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { watchHeading, watchStepBounce } from '../device';
import { cue } from '../audio';
import { setScrollLock } from './scrollLock';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const SIZE = 150;

export function PaceBlock({
  bearingDeg,
  toleranceDeg,
  paces,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  bearingDeg: number;
  toleranceDeg: number;
  paces: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [walked, setWalked] = useState(solved ? paces : 0);
  const [heading, setHeading] = useState(0);
  const state = useRef({
    done: solved,
    walked: solved ? paces : 0,
    heading: null as number | null,
    drift: 61,
    touchOffset: 0,
    lastStep: 0,
  });
  const dragStart = useRef({ angle: 0, offset: 0 });

  const effective = () => {
    const s = state.current;
    return ((((s.heading ?? s.drift) + s.touchOffset) % 360) + 360) % 360;
  };
  const onBearing = () =>
    Math.abs(((effective() - bearingDeg + 540) % 360) - 180) <= toleranceDeg;

  const pace = () => {
    const s = state.current;
    if (s.done || !onBearing()) return;
    s.walked += 1;
    setWalked(s.walked);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
    if (s.walked >= paces) {
      s.done = true;
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    }
  };

  useEffect(() => {
    if (done) return;
    const stopHeading = watchHeading((deg) => {
      state.current.heading = deg;
    });
    const stopSteps = watchStepBounce(pace);
    const tick = setInterval(() => {
      const s = state.current;
      if (s.heading === null) s.drift = (s.drift + 0.25) % 360;
      setHeading(effective());
    }, 120);
    return () => {
      stopHeading();
      clearInterval(tick);
      stopSteps();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const angleOf = (x: number, y: number): number => {
    const deg = (Math.atan2(x - SIZE / 2, SIZE / 2 - y) * 180) / Math.PI;
    return (deg + 360) % 360;
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.done,
        onMoveShouldSetPanResponder: () => !state.current.done,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e) => {
          setScrollLock(true); // the page must not move under the turning hand
          dragStart.current = {
            angle: angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY),
            offset: state.current.touchOffset,
          };
        },
        onPanResponderMove: (e) => {
          const a = angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY);
          state.current.touchOffset =
            dragStart.current.offset + (dragStart.current.angle - a);
        },
        onPanResponderRelease: () => setScrollLock(false),
        onPanResponderTerminate: () => setScrollLock(false),
      }),
    [],
  );

  useEffect(() => () => setScrollLock(false), []);

  const aligned = Math.abs(((heading - bearingDeg + 540) % 360) - 180) <= toleranceDeg;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.card} {...(done ? {} : pan.panHandlers)}>
          <View style={[styles.lubber, aligned && { backgroundColor: colors.lockGlow }]} pointerEvents="none" />
          <View
            style={[styles.rose, { transform: [{ rotate: `${-heading}deg` }] }]}
            pointerEvents="none"
          >
            <Text style={[styles.roseN]} allowFontScaling={false}>
              N
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.ground}
          onPress={done ? undefined : pace}
          disabled={done}
        >
          <View style={styles.paceRow} pointerEvents="none">
            {Array.from({ length: paces }, (_, i) => (
              <View key={i} style={[styles.paceDot, i < walked && styles.paceGone]} />
            ))}
          </View>
        </Pressable>
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  card: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  lubber: {
    position: 'absolute',
    top: 3,
    left: SIZE / 2 - 1.5,
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
    zIndex: 2,
  },
  rose: { position: 'absolute', width: SIZE, height: SIZE, alignItems: 'center' },
  roseN: { marginTop: 14, fontFamily: fonts.mono, fontSize: 13, color: colors.dial, ...amberGlow },
  ground: {
    width: 110,
    minHeight: SIZE,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  paceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
  },
  paceDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  paceGone: { backgroundColor: colors.dialDim },
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
