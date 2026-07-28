// src/engine/InstructionGates.tsx
// Broadcast Three's simpler instruments — four gates where the ACT is the
// puzzle: be still, shake it loose, feed the set, both hands on the cabinet.
// Every sensor path has a touch path; everything fails open (device.ts).

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue as playCue, setStaticLevel } from '../audio';
import { watchMains, watchShake, watchStillness } from '../device';
import { colors, fonts } from '../theme';

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

// ---------------------------------------------------------------- stillness
// BE STILL. The phone at rest (gyro) or a finger held without moving both
// count — stillness is stillness, however the reader can give it.
export function StillnessBlock({
  holdMs,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  holdMs: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const [resting, setResting] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const stop = watchStillness(holdMs, (still) => {
      setResting(still);
      if (still && !doneRef.current) solve();
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, holdMs]);

  const pressIn = () => {
    setResting(true);
    pressTimer.current = setTimeout(solve, holdMs);
  };
  const pressOut = () => {
    setResting(false);
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  return (
    <Pressable
      style={styles.body}
      onPressIn={done ? undefined : pressIn}
      onPressOut={done ? undefined : pressOut}
    >
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && <View style={[styles.breath, resting && styles.breathHeld]} />}
    </Pressable>
  );
}

// -------------------------------------------------------------------- shake
// SHAKE IT LOOSE. Shakes (or hammering taps) fill a hidden loosening meter
// that seeps back down — half-hearted efforts rust over again.
export function ShakeBlock({
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'scrape',
}: {
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const loose = useRef(0);
  const [grip, setGrip] = useState(0);

  const strain = (amount: number) => {
    if (doneRef.current) return;
    loose.current = Math.min(1, loose.current + amount);
    setGrip(loose.current);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Rigid);
    if (loose.current >= 1) solve();
  };

  useEffect(() => {
    if (done) return;
    const stopShake = watchShake(() => strain(0.2));
    const decay = setInterval(() => {
      if (doneRef.current) return;
      loose.current = Math.max(0, loose.current - 0.045);
      setGrip(loose.current);
    }, 400);
    return () => {
      stopShake();
      clearInterval(decay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <Pressable style={styles.body} onPress={done ? undefined : () => strain(0.09)}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.round(grip * 100)}%` }]} />
        </View>
      )}
    </Pressable>
  );
}

// -------------------------------------------------------------------- mains
// FEED THE SET. Plugging the phone in satisfies it; holding the drawn plug
// home for a few seconds satisfies it too (the reader's thumb as the fuse).
export function MainsBlock({
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
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    if (done) return;
    const stop = watchMains((plugged) => {
      if (plugged && !doneRef.current) solve();
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pressIn = () => {
    setHolding(true);
    holdTimer.current = setTimeout(solve, 3000);
  };
  const pressOut = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.plugWell}>
          <Text style={[styles.plugGlyph, holding && { color: colors.dial }]} allowFontScaling={false}>
            ⎓
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// -------------------------------------------------------------------- chord
// BOTH HANDS. Two or more touches held together on the panel; a single
// patient finger held much longer also passes (quiet accessibility path).
export function ChordBlock({
  holdMs,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  holdMs: number;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const { done, doneRef, solve } = useSolveOnce(solved, onSolved, solveCue);
  const [hands, setHands] = useState(0);
  const chordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soloTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (chordTimer.current) clearTimeout(chordTimer.current);
    if (soloTimer.current) clearTimeout(soloTimer.current);
  };

  const onTouches = (count: number) => {
    if (doneRef.current) return;
    setHands(count);
    clearTimers();
    if (count >= 2) chordTimer.current = setTimeout(solve, holdMs);
    else if (count === 1) soloTimer.current = setTimeout(solve, holdMs * 3.5);
  };

  useEffect(() => clearTimers, []);

  return (
    <View
      style={styles.body}
      onTouchStart={(e) => onTouches(e.nativeEvent.touches.length)}
      onTouchEnd={(e) => onTouches(e.nativeEvent.touches.length)}
      onTouchCancel={() => onTouches(0)}
    >
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <View style={styles.handRow} pointerEvents="none">
          {[0, 1].map((i) => (
            <View key={i} style={[styles.handDot, hands > i && styles.handOn]} />
          ))}
        </View>
      )}
    </View>
  );
}

// A wrong-feeling moment shared by these gates: the room absorbs it.
export function roomRefuses(): void {
  setStaticLevel(0.2);
  setTimeout(() => setStaticLevel(0.05), 500);
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
  breath: {
    alignSelf: 'center',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  breathHeld: { backgroundColor: colors.dialDim },
  meterTrack: {
    height: 4,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: { height: 4, backgroundColor: colors.dialDim },
  plugWell: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plugGlyph: { fontSize: 26, color: colors.muted },
  handRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  handDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  handOn: { backgroundColor: colors.dial },
});
