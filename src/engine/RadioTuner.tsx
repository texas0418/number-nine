// src/engine/RadioTuner.tsx
// The diegetic tuner: a drag-to-tune dial embedded in the prose. Dragging
// sweeps the band; the static bed in your headphones follows the needle
// (loud in the dead air, thinning as you approach the carrier). Inside
// RADIO_LOCK_TOLERANCE_KHZ the signal locks: haptic thunk, station ident,
// and the story continues below.

import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { isRadioLocked, signalStrength } from '../models';
import { playIdent, setStaticLevelNow } from '../audio';
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

  const pan = useMemo(() => {
    const applyDrag = (fraction: number) => {
      if (lockedRef.current) return;
      const clamped = Math.max(0, Math.min(1, fraction));
      const next = Math.round(bandLowKhz + clamped * (bandHighKhz - bandLowKhz));
      khzRef.current = next;
      setKhz(next);
      const strength = signalStrength(next, targetKhz, bandLowKhz, bandHighKhz);
      setStaticLevelNow(0.15 + 0.55 * (1 - strength));
    };
    const settle = () => {
      if (lockedRef.current || !isRadioLocked(khzRef.current, targetKhz)) return;
      lockedRef.current = true;
      setLocked(true);
      setKhz(targetKhz);
      setStaticLevelNow(0.06);
      playIdent();
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    };
    // eslint-disable-next-line react-hooks/refs -- callbacks are gesture handlers; refs are never read during render
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) =>
        applyDrag(evt.nativeEvent.locationX / DIAL_WIDTH),
      onPanResponderMove: (evt) =>
        applyDrag(evt.nativeEvent.locationX / DIAL_WIDTH),
      onPanResponderRelease: settle,
      onPanResponderTerminate: settle,
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
