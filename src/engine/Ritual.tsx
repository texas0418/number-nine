// src/engine/Ritual.tsx
/* eslint-disable react-hooks/refs -- instrument state feeds tick loops and
   once-created gesture handlers; render reads mirrored useState values. */
// THE OPENING RITUAL (B6, night one): four bare instruments, ZERO captions.
// Tune. Gain. Clock. Still. The order is nowhere on this panel — it is the
// order the first log's columns have kept for nineteen years, and the
// reader has performed every act before, one broadcast at a time. Touching
// an instrument out of turn gets the room's static, nothing else. Each
// instrument dims until it is next; that is all the grammar she allows.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, setStaticLevel } from '../audio';
import { setGain, watchGain, watchStillness } from '../device';
import { useWoundClock } from './ExaminationGates';
import { amberGlow, amberViewGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

function refuse(): void {
  setStaticLevel(0.2);
  setTimeout(() => setStaticLevel(0.05), 450);
  Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
}

// ------------------------------------------------------------------- tuner
function RitualTuner({
  armed,
  lowKhz,
  highKhz,
  targetKhz,
  onDone,
}: {
  armed: boolean;
  lowKhz: number;
  highKhz: number;
  targetKhz: number;
  onDone: () => void;
}) {
  const [khz, setKhz] = useState(lowKhz);
  const state = useRef({ khz: lowKhz, dwell: 0, w: 0, done: false, armed });
  state.current.armed = armed;

  useEffect(() => {
    const t = setInterval(() => {
      const s = state.current;
      if (s.done || !s.armed) return;
      if (Math.abs(s.khz - targetKhz) <= 6) {
        s.dwell += 150;
        if (s.dwell >= 1000) {
          s.done = true;
          Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
          onDone();
        }
      } else {
        s.dwell = 0;
      }
    }, 150);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKhz]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          if (!state.current.armed && !state.current.done) refuse();
        },
        onPanResponderMove: (e) => {
          const s = state.current;
          if (!s.armed || s.done || s.w <= 0) return;
          const f = Math.max(0, Math.min(1, e.nativeEvent.locationX / s.w));
          s.khz = Math.round(lowKhz + f * (highKhz - lowKhz));
          setKhz(s.khz);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={[styles.instrument, !armed && styles.dimmed]}>
      <Text style={styles.readout} allowFontScaling={false}>
        {khz} kc/s
      </Text>
      <View
        style={styles.strip}
        onLayout={(e) => {
          state.current.w = e.nativeEvent.layout.width;
        }}
        {...pan.panHandlers}
      >
        <View
          pointerEvents="none"
          style={[
            styles.needle,
            { left: `${((khz - lowKhz) / (highKhz - lowKhz)) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

// -------------------------------------------------------------------- gain
function RitualGain({
  armed,
  mark,
  onDone,
}: {
  armed: boolean;
  mark: number;
  onDone: () => void;
}) {
  const [level, setLevel] = useState(2 / 9);
  const state = useRef({
    level: 2 / 9,
    orig: null as number | null,
    dwell: 0,
    w: 0,
    done: false,
    armed,
  });
  state.current.armed = armed;
  const target = mark / 9;

  useEffect(() => {
    if (!armed) return;
    const stopGain = watchGain((v) => {
      const s = state.current;
      if (s.orig === null) {
        s.orig = v;
        setGain(0.5);
        return;
      }
      if (Math.abs(v - 0.5) < 0.02 || s.done) return;
      const dir = v > 0.5 ? 1 : -1;
      s.level = Math.max(0, Math.min(1, s.level + dir / 16));
      setLevel(s.level);
      setGain(0.5);
    });
    const t = setInterval(() => {
      const s = state.current;
      if (s.done) return;
      if (Math.abs(s.level - target) <= 0.055) {
        s.dwell += 150;
        if (s.dwell >= 1000) {
          s.done = true;
          Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
          onDone();
        }
      } else {
        s.dwell = 0;
      }
    }, 150);
    return () => {
      stopGain();
      clearInterval(t);
      // Never hand back silence (see ListenerGates): an implausibly low
      // remembered level was a bad first reading, not the reader's choice.
      const orig = state.current.orig;
      setGain(orig !== null && orig >= 0.05 ? orig : 0.5);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          if (!state.current.armed && !state.current.done) refuse();
        },
        onPanResponderMove: (e) => {
          const s = state.current;
          if (!s.armed || s.done || s.w <= 0) return;
          s.level = Math.max(0, Math.min(1, e.nativeEvent.locationX / s.w));
          setLevel(s.level);
        },
      }),
    [],
  );

  return (
    <View style={[styles.instrument, !armed && styles.dimmed]}>
      <View
        style={styles.scale}
        onLayout={(e) => {
          state.current.w = e.nativeEvent.layout.width;
        }}
        {...pan.panHandlers}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i} style={styles.tick} pointerEvents="none" />
        ))}
        <View
          pointerEvents="none"
          style={[styles.gainNeedle, { left: `${level * 100}%` }]}
        />
      </View>
    </View>
  );
}

// -------------------------------------------------------------------- clock
function RitualClock({
  armed,
  hour,
  minute,
  onDone,
}: {
  armed: boolean;
  hour: number;
  minute: number;
  onDone: () => void;
}) {
  const clock = useWoundClock(hour, minute, armed);
  const fired = useRef(false);
  useEffect(() => {
    if (armed && clock.held && !fired.current) {
      fired.current = true;
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onDone();
    }
  }, [armed, clock.held, onDone]);
  // the WHOLE panel winds (device QA: dragging only worked started on the
  // digits, and the finger hid them); the readout stays centred and clear
  if (armed) {
    return (
      <View style={styles.instrument}>
        <View style={styles.clockDragSurface} {...clock.panHandlers}>
          <Text
            style={[styles.clockText, clock.matches && { color: colors.dial, ...amberGlow }]}
            allowFontScaling={false}
            pointerEvents="none"
          >
            {clock.display}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.instrument, styles.dimmed]}>
      <Pressable onPress={refuse}>
        <View style={styles.clockWell}>
          <Text style={styles.clockText} allowFontScaling={false}>
            {clock.display}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------- stillness
function RitualStill({
  armed,
  holdMs,
  onDone,
}: {
  armed: boolean;
  holdMs: number;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const since = useRef<{ sensor: number | null; finger: number | null; done: boolean; armed: boolean }>(
    { sensor: null, finger: null, done: false, armed },
  );
  since.current.armed = armed;

  useEffect(() => {
    if (!armed) return;
    const stop = watchStillness(250, (still) => {
      since.current.sensor = still ? Date.now() - 250 : null;
    });
    const t = setInterval(() => {
      const s = since.current;
      if (s.done) return;
      const held = [s.sensor, s.finger].filter((x): x is number => x !== null);
      if (held.length === 0) {
        setProgress(0);
        return;
      }
      const p = Math.max(0, Math.min(1, (Date.now() - Math.min(...held) - 1000) / holdMs));
      setProgress(p);
      if (p >= 1) {
        s.done = true;
        Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
        onDone();
      }
    }, 100);
    return () => {
      stop();
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, holdMs]);

  return (
    <View style={[styles.instrument, !armed && styles.dimmed]}>
      <Pressable
        onPressIn={() => {
          if (!since.current.armed) {
            refuse();
            return;
          }
          since.current.finger = Date.now();
        }}
        onPressOut={() => {
          since.current.finger = null;
        }}
        style={styles.stillWell}
      >
        <View style={styles.meterTrack} pointerEvents="none">
          <View style={[styles.meterFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </Pressable>
    </View>
  );
}

// -------------------------------------------------------------------- ritual
export function Ritual({
  bandLowKhz,
  bandHighKhz,
  targetKhz,
  gainMark,
  hour,
  minute,
  stillMs,
  unlockedText,
  solved,
  onSolved,
  // One bell for every lock (Simon, 2026-07-28). This defaulted to 'ident'
  // — the station's six-note song — so the ritual was the only gate in the
  // book that never rang on solving.
  solveCue = 'unlock',
}: {
  bandLowKhz: number;
  bandHighKhz: number;
  targetKhz: number;
  gainMark: number;
  hour: number;
  minute: number;
  stillMs: number;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [stage, setStage] = useState(solved ? 4 : 0);
  // The solve fires from an EFFECT, never from inside the state updater.
  // An updater must be pure: React may run it twice or replay it, so a cue
  // and an onSolved living in there can double up or be dropped entirely.
  const rang = useRef(solved);
  const advance = (from: number) => () =>
    setStage((s) => Math.max(s, from + 1));

  useEffect(() => {
    if (stage < 4 || rang.current) return;
    rang.current = true;
    cue(solveCue);
    onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage >= 4) {
    // the settled set: the four instruments stay on the page, inert, so the
    // solve never collapses the layout under the reader (device QA: the
    // screen jumped) — and the opened set is the better image anyway
    return (
      <View style={styles.wrap}>
        <View style={styles.instrument} pointerEvents="none">
          <Text style={styles.readout} allowFontScaling={false}>
            {targetKhz} kc/s
          </Text>
          <View style={styles.strip}>
            <View style={[styles.needle, { left: `${((targetKhz - bandLowKhz) / (bandHighKhz - bandLowKhz)) * 100}%`, backgroundColor: colors.dial }]} />
          </View>
        </View>
        <View style={styles.instrument} pointerEvents="none">
          <View style={styles.scale}>
            {Array.from({ length: 9 }, (_, i) => (
              <View key={i} style={styles.tick} />
            ))}
            <View style={[styles.gainNeedle, { left: `${(gainMark / 9) * 100}%`, backgroundColor: colors.dial }]} />
          </View>
        </View>
        <View style={styles.instrument} pointerEvents="none">
          <View style={styles.clockDragSurface}>
            <Text style={[styles.clockText, { color: colors.dial, ...amberGlow }]} allowFontScaling={false}>
              {`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}
            </Text>
          </View>
        </View>
        <View style={styles.instrument} pointerEvents="none">
          <View style={styles.stillWell}>
            <View style={styles.meterTrack}>
              <View style={[styles.meterFill, { width: '100%', backgroundColor: colors.dial }]} />
            </View>
          </View>
        </View>
        <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
          {unlockedText}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <RitualTuner
        armed={stage === 0}
        lowKhz={bandLowKhz}
        highKhz={bandHighKhz}
        targetKhz={targetKhz}
        onDone={advance(0)}
      />
      <RitualGain armed={stage === 1} mark={gainMark} onDone={advance(1)} />
      <RitualClock armed={stage === 2} hour={hour} minute={minute} onDone={advance(2)} />
      <RitualStill armed={stage === 3} holdMs={stillMs} onDone={advance(3)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24, gap: 10 },
  instrument: {
    width: 270,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
  },
  dimmed: { opacity: 0.35 },
  readout: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.dial,
    textAlign: 'center',
    marginBottom: 8,
    ...amberGlow,
  },
  strip: {
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    justifyContent: 'center',
  },
  needle: {
    position: 'absolute',
    bottom: 4,
    width: 3,
    height: 30,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
  },
  scale: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  tick: { width: 2, height: 11, backgroundColor: colors.panelBorder },
  gainNeedle: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.dialDim,
    ...amberViewGlow,
  },
  clockWell: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  clockDragSurface: {
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
    fontSize: 22,
    letterSpacing: 3,
    color: colors.muted,
  },
  stillWell: { paddingVertical: 10 },
  meterTrack: {
    height: 4,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: { height: 4, backgroundColor: colors.dialDim },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
