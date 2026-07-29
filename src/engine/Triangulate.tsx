// src/engine/Triangulate.tsx
/* eslint-disable react-hooks/refs -- tuner/dwell state feeds the tick loop
   and once-created gesture handlers; render reads mirrored useState. */
// TRIANGULATION (B5): three weak stations, one map. Find each carrier on
// the band (drag the tuner needle; dwell to lock) and its bearing line
// stamps onto the marsh map from the listener site that heard it. Three
// lines cross once. Touch the crossing. The composite is the point: tuner
// x bearings x map, each learned in an earlier broadcast, now one act.
// Wrong map touches get the dull knock; the room absorbs it.

import { useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import { cue, playSfx, setStaticLevel } from '../audio';
import { setScrollLock } from './scrollLock';
import { amberGlow, amberViewGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const MAP = 260;
const LOCK_KHZ = 6; // within this of a carrier counts
const LOCK_MS = 1200;

export interface TriStation {
  khz: number;
  /** Listener site on the map, normalized 0..1. */
  siteX: number;
  siteY: number;
  /** Bearing FROM the site toward her, degrees (0 = north). */
  bearingDeg: number;
}

export function Triangulate({
  bandLowKhz,
  bandHighKhz,
  stations,
  target,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  bandLowKhz: number;
  bandHighKhz: number;
  stations: TriStation[];
  target: { x: number; y: number; w: number; h: number };
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [locked, setLocked] = useState<number[]>(solved ? stations.map((_, i) => i) : []);
  const [khz, setKhz] = useState(bandLowKhz);
  const state = useRef({
    done: solved,
    locked: solved ? stations.map((_, i) => i) : ([] as number[]),
    khz: bandLowKhz,
    dwellOn: -1,
    dwellMs: 0,
    stripW: 0,
  });

  useEffect(() => {
    if (done) return;
    const tick = setInterval(() => {
      const s = state.current;
      if (s.done) return;
      const near = stations.findIndex(
        (st, i) => !s.locked.includes(i) && Math.abs(s.khz - st.khz) <= LOCK_KHZ,
      );
      // the static thins as the needle closes on any unfound carrier
      const nearest = stations
        .filter((_, i) => !s.locked.includes(i))
        .reduce((m, st) => Math.min(m, Math.abs(s.khz - st.khz)), 999);
      setStaticLevel(0.05 + Math.min(nearest / 200, 1) * 0.1);
      if (near !== s.dwellOn) {
        s.dwellOn = near;
        s.dwellMs = 0;
        return;
      }
      if (near < 0) return;
      s.dwellMs += 150;
      if (s.dwellMs >= LOCK_MS) {
        s.locked = [...s.locked, near];
        s.dwellOn = -1;
        s.dwellMs = 0;
        setLocked(s.locked);
        playSfx('morse-key', 0.3);
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      }
    }, 150);
    return () => {
      clearInterval(tick);
      setStaticLevel(0.05);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, stations]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.done,
        onMoveShouldSetPanResponder: () => !state.current.done,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => setScrollLock(true),
        onPanResponderMove: (e) => {
          const s = state.current;
          if (s.stripW <= 0) return;
          const f = Math.max(0, Math.min(1, e.nativeEvent.locationX / s.stripW));
          s.khz = Math.round(bandLowKhz + f * (bandHighKhz - bandLowKhz));
          setKhz(s.khz);
        },
        onPanResponderRelease: () => setScrollLock(false),
        onPanResponderTerminate: () => setScrollLock(false),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => () => setScrollLock(false), []);

  const mapTap = (e: GestureResponderEvent) => {
    const s = state.current;
    if (s.done || s.locked.length < stations.length) return;
    const nx = e.nativeEvent.locationX / MAP;
    const ny = e.nativeEvent.locationY / MAP;
    const hit =
      nx >= target.x && nx <= target.x + target.w &&
      ny >= target.y && ny <= target.y + target.h;
    if (hit) {
      s.done = true;
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      playSfx('knock', 0.7);
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
    }
  };

  const allLocked = locked.length >= stations.length;
  return (
    <View style={styles.wrap}>
      <View style={styles.map} onStartShouldSetResponder={() => true} onResponderRelease={mapTap}>
        {stations.map((st, i) => {
          const lit = locked.includes(i);
          return (
            <View key={i} pointerEvents="none">
              <View
                style={[
                  styles.site,
                  { left: st.siteX * MAP - 5, top: st.siteY * MAP - 5 },
                  lit && styles.siteLit,
                ]}
              />
              {lit && (
                <View
                  style={[
                    styles.bearingLine,
                    {
                      left: st.siteX * MAP - 1,
                      top: st.siteY * MAP,
                      transform: [{ rotate: `${st.bearingDeg - 180}deg` }],
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
        {done && (
          <View
            pointerEvents="none"
            style={[
              styles.cross,
              {
                left: (target.x + target.w / 2) * MAP - 7,
                top: (target.y + target.h / 2) * MAP - 7,
              },
            ]}
          />
        )}
      </View>
      <View
        style={styles.strip}
        onLayout={(e) => {
          state.current.stripW = e.nativeEvent.layout.width;
        }}
        {...(done ? {} : pan.panHandlers)}
      >
        <Text style={styles.freq} allowFontScaling={false} pointerEvents="none">
          {khz} kc/s
        </Text>
        <View
          pointerEvents="none"
          style={[
            styles.needle,
            { left: `${((khz - bandLowKhz) / (bandHighKhz - bandLowKhz)) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done
          ? unlockedText
          : allLocked
            ? 'three lines · they agree about one place · touch it'
            : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  map: {
    width: MAP,
    height: MAP,
    borderRadius: 10,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  site: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  siteLit: { backgroundColor: colors.dialDim, ...amberViewGlow },
  bearingLine: {
    position: 'absolute',
    width: 2,
    height: MAP * 1.6,
    backgroundColor: colors.dialDim,
    opacity: 0.55,
    transformOrigin: 'top',
  },
  cross: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.dial,
    ...amberViewGlow,
  },
  strip: {
    width: MAP,
    height: 56,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  freq: {
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.dial,
    textAlign: 'center',
    ...amberGlow,
  },
  needle: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
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
