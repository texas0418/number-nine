// src/engine/BearingVoice.tsx
/* eslint-disable react-hooks/refs -- sensor state feeds the tick loop and
   once-created gesture handlers; render reads mirrored useState values. */
// STEREO BEARING (B4): her voice lives at one bearing. Swing the phone (the
// aerial) and the murmur sharpens as you come onto her; static rises as you
// swing away. Dwell on the bearing and she accepts the aim. expo-audio has
// no pan, so the "stereo" is a crossfade: murmur volume against the static
// bed — which reads exactly like hunting a weak station by ear. The bearing
// must be EARNED: the reader has to have been well off it once (an ambient
// lucky aim must not pre-solve; B2 lesson). No compass → the card drifts
// and can be dragged, like PaceBlock. Headphones welcome, never required;
// with sound gone entirely the needle still glows by closeness.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { watchHeading } from '../device';
import { cue, setLoopVolume, setStaticLevel, startSfxLoop, stopSfx } from '../audio';
import { amberGlow, amberViewGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const SIZE = 150;
const DWELL_MS = 2500;

export function BearingVoice({
  bearingDeg,
  toleranceDeg,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  bearingDeg: number;
  toleranceDeg: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [heading, setHeading] = useState(0);
  const [closeness, setCloseness] = useState(0); // 0 lost .. 1 on her
  const state = useRef({
    done: solved,
    heading: null as number | null,
    drift: 219,
    touchOffset: 0,
    earned: false,
    dwellStart: 0,
  });
  const dragStart = useRef({ angle: 0, offset: 0 });

  const effective = () => {
    const s = state.current;
    return ((((s.heading ?? s.drift) + s.touchOffset) % 360) + 360) % 360;
  };
  const errorDeg = () =>
    Math.abs(((effective() - bearingDeg + 540) % 360) - 180);

  useEffect(() => {
    if (done) return;
    startSfxLoop('murmur', 0);
    const stopHeading = watchHeading((deg) => {
      state.current.heading = deg;
    });
    const tick = setInterval(() => {
      const s = state.current;
      if (s.done) return;
      if (s.heading === null) s.drift = (s.drift + 0.2) % 360;
      const err = errorDeg();
      if (err > 40) s.earned = true;
      const close = Math.max(0, 1 - err / 90);
      setHeading(effective());
      setCloseness(close);
      setLoopVolume('murmur', close * close * 0.65);
      setStaticLevel(0.04 + Math.min(err / 180, 1) * 0.14);
      const on = s.earned && err <= toleranceDeg;
      const now = Date.now();
      if (on && s.dwellStart === 0) s.dwellStart = now;
      if (!on) s.dwellStart = 0;
      if (on && now - s.dwellStart >= DWELL_MS) {
        s.done = true;
        setDone(true);
        stopSfx('murmur');
        setStaticLevel(0.05);
        cue(solveCue);
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
        onSolved();
      }
    }, 120);
    return () => {
      stopHeading();
      clearInterval(tick);
      stopSfx('murmur');
      setStaticLevel(0.05);
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

  return (
    <View style={styles.wrap}>
      <View style={styles.card} {...(done ? {} : pan.panHandlers)}>
        <View
          style={[
            styles.needle,
            { opacity: 0.25 + closeness * 0.75 },
            closeness > 0.92 && { backgroundColor: colors.dial, ...amberViewGlow },
          ]}
          pointerEvents="none"
        />
        <View
          style={[styles.rose, { transform: [{ rotate: `${-heading}deg` }] }]}
          pointerEvents="none"
        >
          <Text style={styles.roseN} allowFontScaling={false}>
            N
          </Text>
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
  card: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  needle: {
    position: 'absolute',
    top: 3,
    left: SIZE / 2 - 1.5,
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
    zIndex: 2,
  },
  rose: { position: 'absolute', width: SIZE, height: SIZE, alignItems: 'center' },
  roseN: { marginTop: 14, fontFamily: fonts.mono, fontSize: 13, color: colors.dial, ...amberGlow },
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
