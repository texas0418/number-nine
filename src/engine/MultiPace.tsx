// src/engine/MultiPace.tsx
/* eslint-disable react-hooks/refs -- sensor/pace refs feed the tick loop and
   handlers only; render reads mirrored useState values. */
// THE LONG WALK (B6, night two): several legs, each a bearing and a count,
// walked in order. Face the leg's bearing (compass; the rose drags when the
// phone has no needle), and each step-bounce — or tap — is a pace while the
// bearing holds. A finished leg locks amber and the rose asks for the next.
// The legs are never printed here; the numbers are the ones the whole book
// has been drilling.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { watchHeading, watchStepBounce } from '../device';
import { cue } from '../audio';
import { amberGlow, amberViewGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const SIZE = 150;

export interface PaceLeg {
  bearingDeg: number;
  toleranceDeg: number;
  paces: number;
}

export function MultiPace({
  legs,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  legs: PaceLeg[];
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [leg, setLeg] = useState(solved ? legs.length : 0);
  const [walked, setWalked] = useState(0);
  const [heading, setHeading] = useState(0);
  const state = useRef({
    done: solved,
    leg: solved ? legs.length : 0,
    walked: 0,
    heading: null as number | null,
    drift: 133,
    touchOffset: 0,
  });
  const dragStart = useRef({ angle: 0, offset: 0 });

  const effective = () => {
    const s = state.current;
    return ((((s.heading ?? s.drift) + s.touchOffset) % 360) + 360) % 360;
  };
  const currentLeg = () => legs[Math.min(state.current.leg, legs.length - 1)];
  const onBearing = () => {
    const L = currentLeg();
    return Math.abs(((effective() - L.bearingDeg + 540) % 360) - 180) <= L.toleranceDeg;
  };

  const pace = () => {
    const s = state.current;
    if (s.done || s.leg >= legs.length || !onBearing()) return;
    s.walked += 1;
    setWalked(s.walked);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
    if (s.walked >= currentLeg().paces) {
      s.leg += 1;
      s.walked = 0;
      setLeg(s.leg);
      setWalked(0);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      if (s.leg >= legs.length) {
        s.done = true;
        setDone(true);
        cue(solveCue);
        onSolved();
      }
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
      }),
    [],
  );

  const aligned = !done && leg < legs.length && onBearing();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.card} {...(done ? {} : pan.panHandlers)}>
          <View
            style={[styles.lubber, aligned && styles.lubberLit]}
            pointerEvents="none"
          />
          <Text style={[styles.degrees, aligned && styles.degreesLit]} allowFontScaling={false} pointerEvents="none">
            {`${Math.round(heading)}°`}
          </Text>
          <View
            style={[styles.rose, { transform: [{ rotate: `${-heading}deg` }] }]}
            pointerEvents="none"
          >
            <Text style={styles.roseN} allowFontScaling={false}>
              N
            </Text>
          </View>
        </View>
        <Pressable style={styles.ground} onPress={done ? undefined : pace} disabled={done}>
          <View style={styles.legCol} pointerEvents="none">
            {legs.map((L, i) => (
              <View key={i} style={styles.legRow}>
                <View
                  style={[
                    styles.legLamp,
                    i < leg && { backgroundColor: colors.dial, ...amberViewGlow },
                    i === leg && !done && styles.legLive,
                  ]}
                />
                <View style={styles.paceRow}>
                  {Array.from({ length: L.paces }, (_, k) => (
                    <View
                      key={k}
                      style={[
                        styles.paceDot,
                        (i < leg || (i === leg && k < walked)) && styles.paceGone,
                      ]}
                    />
                  ))}
                </View>
              </View>
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
    left: SIZE / 2 - 2.5,
    width: 5,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
    zIndex: 2,
  },
  lubberLit: { backgroundColor: colors.dial, ...amberViewGlow },
  degrees: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontFamily: fonts.mono,
    fontSize: 15,
    letterSpacing: 1,
    color: colors.muted,
    zIndex: 2,
  },
  degreesLit: { color: colors.dial, ...amberGlow },
  rose: { position: 'absolute', width: SIZE, height: SIZE, alignItems: 'center' },
  roseN: { marginTop: 14, fontFamily: fonts.mono, fontSize: 13, color: colors.dial, ...amberGlow },
  ground: {
    width: 116,
    minHeight: SIZE,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    justifyContent: 'center',
    padding: 10,
  },
  legCol: { gap: 10 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legLamp: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  legLive: { borderColor: colors.dialDim },
  paceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, flex: 1 },
  paceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
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
