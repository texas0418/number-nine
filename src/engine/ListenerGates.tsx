// src/engine/ListenerGates.tsx
/* eslint-disable react-hooks/refs -- sensor state feeds tick loops and
   once-created gesture handlers; render reads mirrored useState values. */
// Broadcast Five's simpler instruments: the SEVERANCE (cut the phone off
// from the whole world — the ask is the horror; we detect the result, not
// the switch) and the GAIN (the hardware volume rockers as the set's RF
// gain knob). Fail-open throughout (device.ts).

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { cue as playCue } from '../audio';
import { setGain, watchGain, watchSeverance } from '../device';
import { amberGlow, amberViewGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

function useSolveOnce(solved: boolean, onSolved: () => void, solveCue: string) {
  const doneRef = useRef(solved);
  const [done, setDone] = useState(solved);
  const solve = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    playCue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };
  return { done, doneRef, solve };
}

// ---------------------------------------------------------------- severance
// CUT YOURSELF OFF. Solves when the phone truly has no network of any kind
// (the reader flips airplane mode themselves — the OS switch is the act;
// the gate only witnesses the result). EARNED: the phone must have been
// seen CONNECTED once, so a reader who always plays severed still performs
// the act. Fallback: press and hold the world-lamp 5s to smother it.
export function SeverBlock({
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const [worldLit, setWorldLit] = useState(true);
  const sawConnected = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const stop = watchSeverance((severed) => {
      if (!severed) sawConnected.current = true;
      setWorldLit(!severed);
      if (severed && sawConnected.current && !doneRef.current) solve();
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pressIn = () => {
    holdTimer.current = setTimeout(solve, 5000);
  };
  const pressOut = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <Pressable
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={styles.worldWell}
        >
          <View style={[styles.worldLamp, worldLit && styles.worldOn]} />
          <Text style={styles.worldLabel} allowFontScaling={false}>
            {worldLit ? 'the world · still lit' : 'the world · going…'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// --------------------------------------------------------------------- gain
// THE GAIN. Nine etched marks; the needle answers the HARDWARE volume
// rockers (the set's knob is on the side of your machine). Which mark is
// wanted is never printed here — the clues say. Dwell on it to pass.
// Fallback: drag the needle. EARNED either way: the needle must move.
export function GainBlock({
  mark,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  /** 1..9 — the wanted mark on the scale. */
  mark: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const [level, setLevel] = useState(2 / 9); // the VIRTUAL needle, 0..1
  const [movedUi, setMovedUi] = useState(false);
  const state = useRef({
    level: 2 / 9,
    moved: false,
    orig: null as number | null,
    dwell: 0,
    dragW: 0,
  });
  const target = mark / 9;
  const HALF_BAND = 0.055; // half a mark's width
  const STEP = 1 / 16; // one rocker click, iOS's own quantum

  useEffect(() => {
    if (done) return;
    // The needle is VIRTUAL: it always starts on the second mark, and only
    // rocker CLICKS step it — the system volume is snapped back to centre
    // after every press so the buttons always have room, and nothing about
    // last night's volume can leak the answer or self-solve the gate
    // (device QA, four rounds: baselines raced, absolutes betrayed).
    const stopGain = watchGain((v) => {
      const s = state.current;
      if (s.orig === null) {
        s.orig = v; // remember the reader's real volume for afterwards
        setGain(0.5);
        return;
      }
      if (Math.abs(v - 0.5) < 0.02) return; // our own re-centre echoing back
      const dir = v > 0.5 ? 1 : -1;
      s.level = Math.max(0, Math.min(1, s.level + dir * STEP));
      s.moved = true;
      setMovedUi(true);
      setLevel(s.level);
      setGain(0.5);
    });
    const tick = setInterval(() => {
      const s = state.current;
      if (doneRef.current) return;
      const on = s.moved && Math.abs(s.level - target) <= HALF_BAND;
      s.dwell = on ? s.dwell + 200 : 0;
      if (s.dwell >= 2000) solve();
    }, 200);
    return () => {
      stopGain();
      clearInterval(tick);
      const orig = state.current.orig;
      if (orig !== null) setGain(orig); // give the reader their volume back
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !doneRef.current,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderMove: (e) => {
          const s = state.current;
          if (s.dragW <= 0) return;
          const v = Math.max(0, Math.min(1, e.nativeEvent.locationX / s.dragW));
          s.moved = true;
          setMovedUi(true);
          s.level = v;
          setLevel(v);
        },
      }),
    [],
  );

  // the mark answers only a needle that has MOVED — a knob still parked
  // where last night left it must not glow the answer (device QA)
  const onScale =
    movedUi && level >= target - HALF_BAND && level <= target + HALF_BAND;
  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <View
          style={styles.scale}
          onLayout={(e) => {
            state.current.dragW = e.nativeEvent.layout.width;
          }}
          {...pan.panHandlers}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <View key={i} style={styles.tick} pointerEvents="none" />
          ))}
          <View
            pointerEvents="none"
            style={[
              styles.needle,
              { left: `${level * 100}%` },
              onScale && { backgroundColor: colors.dial, ...amberViewGlow },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: 270,
    minHeight: 150,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    marginVertical: 24,
    justifyContent: 'space-between',
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
  },
  worldWell: { alignItems: 'center', gap: 8 },
  worldLamp: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  worldOn: { backgroundColor: colors.lockGlow },
  worldLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.faint,
  },
  scale: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  tick: {
    width: 2,
    height: 12,
    backgroundColor: colors.panelBorder,
  },
  needle: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 30,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
  },
});
