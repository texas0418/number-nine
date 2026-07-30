// src/engine/ExaminationGates.tsx
/* eslint-disable react-hooks/refs -- sensor/clock refs feed tick loops and
   once-created gesture handlers only; render reads mirrored useState. */
// Broadcast Four's simpler examinations: the WHISPER (audio only against
// the ear — the act of listening is the gate, never the audio itself), the
// HOUR (the station keeps schedule; the receiver's clock can be wound to
// lie, and she notices), and the EXPOSURE (the séance plate: screenshot it,
// or hold it to the lamp). Fail-open throughout (device.ts).

import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { cue as playCue, holdSfx } from '../audio';
import { watchNearEar, watchShutter } from '../device';
import { setKv } from '../db';
import type { SceneId } from '../models';
import { SCENES } from './scenes';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export const CLOCK_LIE_KV = 'b4-clock-lie';

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

// ----------------------------------------------------------------- whisper
// She will not say it to the room. Audio plays only while the phone is
// against the ear (proximity — the screen dying there is diegetic); away,
// it pauses mid-word. The gate is the LISTENING: durationMs of accumulated
// nearness. Fallback: pressing and holding the panel counts as leaning in.
export function WhisperBlock({
  durationMs,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  durationMs: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(0); // 0..1
  const state = useRef({ near: false, held: false, heardMs: 0, player: null as null | ReturnType<typeof holdSfx> });

  useEffect(() => {
    if (done) return;
    const s = state.current;
    s.player = holdSfx('whisper-line', 0.9);
    const apply = () => {
      const on = s.near || s.held;
      s.player?.setPlaying(on && !doneRef.current);
      setListening(on);
    };
    const stopEar = watchNearEar((near) => {
      s.near = near;
      apply();
    });
    const tick = setInterval(() => {
      if (doneRef.current) return;
      if (s.near || s.held) {
        s.heardMs += 150;
        setHeard(Math.min(1, s.heardMs / durationMs));
        if (s.heardMs >= durationMs) solve();
      }
    }, 150);
    return () => {
      stopEar();
      clearInterval(tick);
      s.player?.stop();
      s.player = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, durationMs]);

  const hold = (held: boolean) => {
    const s = state.current;
    s.held = held;
    const on = s.near || s.held;
    s.player?.setPlaying(on && !doneRef.current);
    setListening(on);
  };

  return (
    <Pressable
      style={styles.body}
      onPressIn={done ? undefined : () => hold(true)}
      onPressOut={done ? undefined : () => hold(false)}
    >
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <View style={styles.earRow} pointerEvents="none">
          <View style={[styles.earDot, listening && styles.earOn]} />
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${Math.round(heard * 100)}%` }]} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

// -------------------------------------------------------------- wound clock
/** The receiver's clock: shows the true time, ticking — unless the reader
 *  drags across it and WINDS it. Shared by the hour gate and the combo ink.
 *  Returns live HH:MM, whether it stands at the target, and whether that is
 *  a lie. */
export function useWoundClock(hour: number, minute: number, active: boolean) {
  const [shown, setShown] = useState({ h: 0, m: 0 });
  const [held, setHeld] = useState(false);
  const offsetRef = useRef(0); // wound minutes
  const dragStart = useRef(0);
  // The pan is created ONCE; `active` must be read through a ref or the
  // handler keeps the mount-time value forever (device QA, B6: the ritual's
  // clock mounts dormant and could never be dragged).
  const activeRef = useRef(active);
  activeRef.current = active;
  // A clock WOUND to her hour stops there — but only after RESTING on it
  // (device QA round 1: stray touches knocked it off; round 2: an instant
  // snap-lock let a scrubbing thumb pass the gate without knowing why).
  // Landing on the hour shows amber at once; DWELL_MS of stillness later,
  // the hands stop for good. Honest real-time matches count as held from
  // the first tick.
  const lockedRef = useRef(false);
  const dwellStart = useRef<number | null>(null);
  const [wound, setWound] = useState(false);

  const DWELL_MS = 2000;
  const target = hour * 60 + minute;
  const minuteDiff = (total: number) => {
    const d = Math.abs(total - target) % 1440;
    return Math.min(d, 1440 - d);
  };

  const apply = (total: number) => {
    setShown({ h: Math.floor(total / 60), m: total % 60 });
    setWound(offsetRef.current !== 0);
  };

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      if (lockedRef.current) return; // a stopped clock keeps her hour
      const now = new Date();
      const total =
        (now.getHours() * 60 + now.getMinutes() + offsetRef.current + 1440) % 1440;
      apply(total);
      if (total !== target) {
        dwellStart.current = null;
        setHeld(false);
        return;
      }
      // honestly at her hour: held immediately; wound there: held only
      // after resting DWELL_MS — a passing scrub never settles
      if (offsetRef.current === 0) {
        setHeld(true);
        return;
      }
      if (dwellStart.current === null) dwellStart.current = Date.now();
      if (Date.now() - dwellStart.current >= DWELL_MS) {
        lockedRef.current = true;
        setHeld(true);
        Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
      }
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => activeRef.current && !lockedRef.current,
        onMoveShouldSetPanResponder: (_e, g) =>
          activeRef.current && !lockedRef.current && Math.abs(g.dx) > 6,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = offsetRef.current;
        },
        onPanResponderMove: (_e, g) => {
          if (lockedRef.current) return;
          dwellStart.current = null; // a moving hand is not a resting hand
          offsetRef.current = dragStart.current + Math.round(g.dx / 12);
          const now = new Date();
          const total =
            (now.getHours() * 60 + now.getMinutes() + offsetRef.current + 1440) % 1440;
          apply(total);
        },
        onPanResponderRelease: () => {
          if (lockedRef.current || offsetRef.current === 0) return;
          // released within a minute of her hour: the hands take the last
          // step themselves — then must still REST there to stop
          const now = new Date();
          const nowMin = now.getHours() * 60 + now.getMinutes();
          const total = (nowMin + offsetRef.current + 1440) % 1440;
          if (minuteDiff(total) <= 1 && total !== target) {
            offsetRef.current = (((target - nowMin) % 1440) + 1440) % 1440;
            apply(target);
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const matches = shown.h === hour && shown.m === minute;
  const display = `${String(shown.h).padStart(2, '0')}:${String(shown.m).padStart(2, '0')}`;
  return {
    display,
    matches,
    /** True once the clock has SETTLED at her hour (honest, or wound and
     *  rested) — gates key off this, never off a passing touch. */
    held,
    lied: held && wound,
    panHandlers: pan.panHandlers,
  };
}

// -------------------------------------------------------------------- hour
// HER HOUR PROPER. The gate opens itself when the receiver's clock stands
// at hour:minute — genuinely, or wound there. Winding works, and costs:
// noticedText replaces the unlock line and the lie is remembered (kv).
export function HourBlock({
  hour,
  minute,
  prompt,
  unlockedText,
  noticedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  hour: number;
  minute: number;
  prompt: string;
  unlockedText: string;
  noticedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const [wasLie, setWasLie] = useState(false);
  const clock = useWoundClock(hour, minute, !done);
  const dwell = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    if (clock.held && !dwell.current) {
      const lie = clock.lied;
      dwell.current = setTimeout(() => {
        if (doneRef.current) return;
        if (lie) {
          setWasLie(true);
          try {
            setKv(CLOCK_LIE_KV, '1');
          } catch {
            /* fail open */
          }
        }
        solve();
      }, 1200);
    } else if (!clock.held && dwell.current) {
      clearTimeout(dwell.current);
      dwell.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.held, clock.lied, done]);

  useEffect(
    () => () => {
      if (dwell.current) clearTimeout(dwell.current);
    },
    [],
  );

  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? (wasLie ? noticedText : unlockedText) : prompt}
      </Text>
      {!done && (
        <View style={styles.clockWell} {...clock.panHandlers}>
          <Text
            style={[styles.clockText, clock.matches && { color: colors.dial, ...amberGlow }]}
            allowFontScaling={false}
          >
            {clock.display}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------- exposure
// THE SÉANCE PLATE. Expose it: the reader takes a SCREENSHOT (the shutter
// she cannot work herself), or holds the plate to the lamp (long-press).
// The plate is different afterwards.
export function ExposureBlock({
  image,
  revealImage,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  image: SceneId;
  revealImage: SceneId;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const stop = watchShutter(() => {
      if (!doneRef.current) solve();
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pressIn = () => {
    holdTimer.current = setTimeout(solve, 4000);
  };
  const pressOut = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <View style={styles.plateWrap}>
      <Pressable
        style={styles.plateFrame}
        onPressIn={done ? undefined : pressIn}
        onPressOut={done ? undefined : pressOut}
      >
        <Image
          source={SCENES[done ? revealImage : image]}
          resizeMode="cover"
          style={styles.plateImg}
        />
      </Pressable>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
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
  earRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  earDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  earOn: { backgroundColor: colors.dialDim },
  meterTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: { height: 4, backgroundColor: colors.dialDim },
  clockWell: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  clockText: {
    fontFamily: fonts.mono,
    fontSize: 26,
    letterSpacing: 3,
    color: colors.muted,
  },
  plateWrap: { alignItems: 'center', marginVertical: 24 },
  plateFrame: {
    width: '72%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    overflow: 'hidden',
    backgroundColor: colors.panel,
  },
  plateImg: { width: '100%', height: '100%' },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
