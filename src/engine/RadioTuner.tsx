// src/engine/RadioTuner.tsx
// The diegetic tuner: a drag-to-tune dial embedded in the prose. Dragging
// sweeps the band; the static bed in your headphones follows the needle
// (loud in the dead air, thinning as you approach the carrier). Inside
// RADIO_LOCK_TOLERANCE_KHZ the signal locks: haptic thunk, station ident,
// and the story continues below.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { isRadioLocked, signalStrength } from '../models';
import { watchTwist } from '../device';
import {
  playSfx,
  setStaticLevelNow,
  setTunerScan,
  startTunerScan,
  stopTunerScan,
} from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const DIAL_WIDTH = 260;
const NEEDLE_W = 22; // fat, grabbable thumb (was a 2px hairline)

export function RadioTuner({
  bandLowKhz,
  bandHighKhz,
  targetKhz,
  lockedText,
  unlockedText,
  solved,
  onSolved,
}: {
  bandLowKhz: number;
  bandHighKhz: number;
  targetKhz: number;
  lockedText: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
}) {
  const [khz, setKhz] = useState(solved ? targetKhz : bandLowKhz);
  const [locked, setLocked] = useState(solved);
  // Handler-only mirrors of the state above (PanResponder callbacks are
  // created once and must not close over stale state).
  const khzRef = useRef(khz);
  const lockedRef = useRef(solved);

  // kHz at the moment the finger lands — drags are RELATIVE to it. (Absolute
  // locationX positioning had a bug: re-grabbing landed the touch on the
  // needle child view, whose locationX ≈ 0 snapped the dial back to band-low.)
  const grantKhz = useRef(0);
  const thumbDown = useRef(false);

  // TILT ASSIST (B2 mechanics palette): physically turning the phone sweeps
  // the band — the set turns its face to the signal. Purely additive: the
  // drag always works, so no-gyro and motor-accessibility paths are intact.
  useEffect(() => {
    if (locked) return;
    const stop = watchTwist((rateZ) => {
      if (lockedRef.current || thumbDown.current) return;
      if (Math.abs(rateZ) < 0.08) return; // deadband: reading isn't tuning
      const next = Math.round(
        Math.max(bandLowKhz, Math.min(bandHighKhz, khzRef.current - rateZ * 6)),
      );
      if (next === khzRef.current) return;
      khzRef.current = next;
      setKhz(next);
      const s = signalStrength(next, targetKhz, bandLowKhz, bandHighKhz);
      setStaticLevelNow(0.06 + 0.24 * (1 - s));
      setTunerScan(s);
      if (isRadioLocked(next, targetKhz)) {
        // the carrier catches even when found by hand-turning alone; the
        // lock itself is QUIET — the ident belongs to HER voice, one block
        // below (QA: chimes at the moment of solve read as clutter)
        lockedRef.current = true;
        setLocked(true);
        setKhz(targetKhz);
        stopTunerScan();
        setStaticLevelNow(0.04);
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
        onSolved();
      }
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, bandLowKhz, bandHighKhz, targetKhz]);
  // Phantom-station bookkeeping: last needle position and per-station
  // cooldowns, so sweeping past a neighbour plays its blip once, not a burst.
  const lastBlip = useRef(new Map<number, number>());

  const pan = useMemo(() => {
    // Other stations on the band (fractions of the span, clear of the
    // target): sweeping past them sounds like scanning a car radio at night.
    const span = bandHighKhz - bandLowKhz;
    const phantoms: { khz: number; sfx: string }[] = [
      { khz: Math.round(bandLowKhz + span * 0.18), sfx: 'station-morse' },
      { khz: Math.round(bandLowKhz + span * 0.42), sfx: 'station-voice' },
      { khz: Math.round(bandLowKhz + span * 0.8), sfx: 'station-music' },
    ];
    const applyDelta = (dx: number) => {
      if (lockedRef.current) return;
      const prev = khzRef.current;
      const deltaKhz = (dx / DIAL_WIDTH) * span;
      const next = Math.round(
        Math.max(bandLowKhz, Math.min(bandHighKhz, grantKhz.current + deltaKhz)),
      );
      khzRef.current = next;
      setKhz(next);
      const strength = signalStrength(next, targetKhz, bandLowKhz, bandHighKhz);
      setStaticLevelNow(0.06 + 0.24 * (1 - strength)); // quieter band (device QA)
      setTunerScan(strength);
      // eslint-disable-next-line react-hooks/purity -- gesture handler, never runs during render
      const now = Date.now();
      for (const p of phantoms) {
        const crossed = prev < p.khz !== next < p.khz || next === p.khz;
        const cooledAt = lastBlip.current.get(p.khz) ?? 0;
        if (crossed && now - cooledAt > 2500) {
          lastBlip.current.set(p.khz, now);
          playSfx(p.sfx, 0.3);
        }
      }
    };
    const settle = () => {
      stopTunerScan();
      if (lockedRef.current || !isRadioLocked(khzRef.current, targetKhz)) return;
      lockedRef.current = true;
      setLocked(true);
      setKhz(targetKhz);
      setStaticLevelNow(0.04);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    };
    // eslint-disable-next-line react-hooks/refs -- callbacks are gesture handlers; refs are never read during render
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        grantKhz.current = khzRef.current;
        thumbDown.current = true;
        startTunerScan();
      },
      onPanResponderMove: (_evt, gs) => applyDelta(gs.dx),
      onPanResponderRelease: () => {
        thumbDown.current = false;
        settle();
      },
      onPanResponderTerminate: () => {
        thumbDown.current = false;
        settle();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bandLowKhz, bandHighKhz, targetKhz]);
  const strength = signalStrength(khz, targetKhz, bandLowKhz, bandHighKhz);
  const needleLeft =
    ((khz - bandLowKhz) / (bandHighKhz - bandLowKhz)) * DIAL_WIDTH;

  return (
    <View style={styles.body}>
      <Text style={[styles.freq, locked && { color: colors.lockGlow }]}>
        {khz} kHz
      </Text>
      <View style={styles.dialTrack} {...(locked ? {} : pan.panHandlers)}>
        <View style={styles.dialCenterline} />
        <View
          style={[
            styles.needle,
            { left: Math.max(0, Math.min(DIAL_WIDTH - NEEDLE_W, needleLeft - NEEDLE_W / 2)) },
          ]}
        >
          <View style={styles.needleGrip} />
        </View>
      </View>
      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>signal</Text>
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.round(strength * 100)}%` }]} />
        </View>
      </View>
      <Text style={[styles.caption, locked && { color: colors.lockGlow }]}>
        {locked ? unlockedText : lockedText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: DIAL_WIDTH + 32,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 16,
    marginVertical: 24,
  },
  freq: {
    fontFamily: fonts.mono,
    fontSize: 20,
    letterSpacing: 2,
    color: colors.dial,
    textAlign: 'center',
    marginBottom: 12,
  },
  dialTrack: {
    height: 56, // taller = far easier to grab on a phone
    backgroundColor: colors.bg,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  dialCenterline: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    top: '50%',
    marginTop: -1,
    backgroundColor: colors.hairline,
  },
  needle: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: NEEDLE_W,
    borderRadius: 5,
    backgroundColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.dialDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleGrip: {
    width: 3,
    height: '70%',
    borderRadius: 2,
    backgroundColor: colors.dial,
  },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  meterLabel: { fontFamily: fonts.mono, fontSize: 11, color: colors.faint },
  meterTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: { height: 4, backgroundColor: colors.lockGlow },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
  },
});
