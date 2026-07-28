// src/engine/CompassBlock.tsx
/* eslint-disable react-hooks/refs -- sensor/drift/offset refs feed the tick
   timer and gesture handlers only; render reads the `heading` state. */
// The wartime compass: a rotating card under a fixed lubber line. The
// magnetometer turns the card with the phone — physically face the bearing
// and HOLD it there a breath. Without the sensor the card wanders slowly on
// its own and the ring can be steadied by touch, so the gate never needs
// hardware — the hardware just makes it honest.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { watchHeading } from '../device';
import { cue } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const SIZE = 220;
const HOLD_MS = 1500;
const POINTS = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
];

export function CompassBlock({
  targetDeg,
  toleranceDeg,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  targetDeg: number;
  toleranceDeg: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [heading, setHeading] = useState(0); // effective bearing at the lubber
  const sensor = useRef<number | null>(null);
  const drift = useRef(137); // the card's own slow wander (no-sensor path)
  const touchOffset = useRef(0);
  const dragStart = useRef({ angle: 0, offset: 0 });
  const holdSince = useRef<number | null>(null);
  const doneRef = useRef(solved);

  const effective = () =>
    (((sensor.current ?? drift.current) + touchOffset.current) % 360 + 360) % 360;

  useEffect(() => {
    if (done) return;
    const stopSensor = watchHeading((deg) => {
      sensor.current = deg;
    });
    const timer = setInterval(() => {
      if (doneRef.current) return;
      if (sensor.current === null) drift.current = (drift.current + 0.4) % 360;
      const h = effective();
      setHeading(h);
      const off = Math.abs(((h - targetDeg + 540) % 360) - 180);
      if (off <= toleranceDeg) {
        if (holdSince.current === null) holdSince.current = Date.now();
        else if (Date.now() - holdSince.current >= HOLD_MS) {
          doneRef.current = true;
          setDone(true);
          cue(solveCue);
          Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
          onSolved();
        }
      } else holdSince.current = null;
    }, 90);
    return () => {
      stopSensor();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, targetDeg, toleranceDeg]);

  const angleOf = (x: number, y: number): number => {
    const deg = (Math.atan2(x - SIZE / 2, SIZE / 2 - y) * 180) / Math.PI;
    return (deg + 360) % 360;
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !doneRef.current,
        onMoveShouldSetPanResponder: () => !doneRef.current,
        // hold the gesture against ScrollView theft (see RotaryDial)
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e) => {
          dragStart.current = {
            angle: angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY),
            offset: touchOffset.current,
          };
        },
        onPanResponderMove: (e) => {
          const a = angleOf(e.nativeEvent.locationX, e.nativeEvent.locationY);
          touchOffset.current =
            dragStart.current.offset + (dragStart.current.angle - a);
        },
      }),
    [],
  );

  const off = Math.abs(((heading - targetDeg + 540) % 360) - 180);
  const near = off <= toleranceDeg;
  return (
    <View style={styles.wrap}>
      <View style={styles.compass} {...(done ? {} : pan.panHandlers)}>
        <View style={[styles.lubber, near && { backgroundColor: colors.lockGlow }]} />
        <View style={[styles.card, { transform: [{ rotate: `${-heading}deg` }] }]}>
          {POINTS.map((p) => {
            const a = (p.deg * Math.PI) / 180;
            const r = SIZE / 2 - 30;
            return (
              <Text
                key={p.label}
                allowFontScaling={false}
                style={[
                  styles.point,
                  p.label === 'N' && styles.pointN,
                  {
                    left: SIZE / 2 + r * Math.sin(a) - 8,
                    top: SIZE / 2 - r * Math.cos(a) - 10,
                  },
                ]}
              >
                {p.label}
              </Text>
            );
          })}
          <View style={styles.needleN} />
          <View style={styles.needleS} />
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
  compass: {
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
    top: 4,
    left: SIZE / 2 - 1.5,
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
    zIndex: 2,
  },
  card: { position: 'absolute', width: SIZE, height: SIZE },
  point: {
    position: 'absolute',
    width: 16,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.muted,
  },
  pointN: { color: colors.dial },
  needleN: {
    position: 'absolute',
    left: SIZE / 2 - 1.5,
    top: SIZE / 2 - SIZE * 0.3,
    width: 3,
    height: SIZE * 0.3,
    borderRadius: 2,
    backgroundColor: colors.dial,
    transformOrigin: 'bottom',
  },
  needleS: {
    position: 'absolute',
    left: SIZE / 2 - 1.5,
    top: SIZE / 2,
    width: 3,
    height: SIZE * 0.3,
    borderRadius: 2,
    backgroundColor: colors.faint,
    transformOrigin: 'top',
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
