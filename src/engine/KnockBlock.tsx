// src/engine/KnockBlock.tsx
// The TOUCH-ECHO puzzle: press your palm to the wall and the house knocks in
// grouped counts — haptic-first, with a low thud under each knock and a faint
// pulse in the tread ornament (the accessibility channel). Then knock the
// groups back with your finger: taps separated by a beat of stillness become
// groups. No digits are ever shown; the knowledge lives in your hand.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, playSfx, playSfxPattern, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const GROUP_GAP_MS = 900; // stillness that closes a group while echoing
const KNOCK_MS = 470; // spacing of the wall's own knocks — countable by feel
const GROUP_PAUSE_MS = 1200; // the wall's pause between groups

export function KnockBlock({
  groups,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  groups: number[];
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [echo, setEcho] = useState<number[]>([]); // completed groups
  const [current, setCurrent] = useState(0); // taps in the open group
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPattern = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (gapTimer.current) clearTimeout(gapTimer.current);
      cancelPattern.current?.();
    },
    [],
  );

  // The wall speaks: the whole pattern is scheduled on pre-created players
  // (haptic and thud land TOGETHER — a fresh player per knock lagged the
  // hand by ~100ms and made the groups uncountable).
  const listen = () => {
    if (playing || done) return;
    setPlaying(true);
    setEcho([]);
    setCurrent(0);
    const delays: number[] = [];
    let at = 350;
    groups.forEach((n) => {
      for (let k = 0; k < n; k++) {
        delays.push(at);
        at += KNOCK_MS;
      }
      at += GROUP_PAUSE_MS;
    });
    cancelPattern.current = playSfxPattern('knock-dry', delays, 0.7, () => {
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
      setPulse(true);
      timers.current.push(setTimeout(() => setPulse(false), 130));
    });
    timers.current.push(setTimeout(() => setPlaying(false), at - GROUP_PAUSE_MS + 300));
  };

  const fail = () => {
    setStaticLevel(0.24);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
    setTimeout(() => setStaticLevel(0.05), 600);
    setEcho([]);
    setCurrent(0);
  };

  const closeGroup = (taps: number, closed: number[]) => {
    const next = [...closed, taps];
    setEcho(next);
    setCurrent(0);
    if (next.length < groups.length) return;
    if (next.length === groups.length && next.every((n, i) => n === groups[i])) {
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else fail();
  };

  // The reader knocks back: a tap joins the open group; stillness closes it.
  const tapBack = () => {
    if (done || playing) return;
    playSfx('knock-dry', 0.6);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
    const taps = current + 1;
    setCurrent(taps);
    if (gapTimer.current) clearTimeout(gapTimer.current);
    // A wrong count can exceed the target; let the gap close it and judge.
    gapTimer.current = setTimeout(() => closeGroup(taps, echo), GROUP_GAP_MS);
  };

  return (
    <View style={styles.body}>
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <>
          <View style={styles.groupRow}>
            {groups.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.groupDot,
                  i < echo.length && styles.groupDone,
                  i === echo.length && current > 0 && styles.groupLive,
                ]}
              />
            ))}
          </View>
          <Pressable onPress={listen} style={styles.wall} disabled={playing}>
            <View style={[styles.wallInner, pulse && styles.wallPulse]}>
              <Text style={styles.wallText} allowFontScaling={false}>
                {playing ? 'the wall is speaking' : '◉ press your palm to the wall'}
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={tapBack} style={styles.knockPad} disabled={playing}>
            <Text style={styles.knockPadText} allowFontScaling={false}>
              knock back
            </Text>
            <View style={styles.tapRow}>
              {Array.from({ length: Math.max(current, 1) }, (_, i) => (
                <View key={i} style={[styles.tapDot, i < current && styles.tapLit]} />
              ))}
            </View>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: 260,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    marginVertical: 24,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  groupRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 14 },
  groupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  groupDone: { backgroundColor: colors.dial },
  groupLive: { borderColor: colors.dial },
  wall: { marginBottom: 12 },
  wallInner: {
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  wallPulse: { backgroundColor: colors.panelBorder },
  wallText: { fontFamily: fonts.mono, fontSize: 12, color: colors.lockGlow },
  knockPad: {
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
  },
  knockPadText: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, marginBottom: 8 },
  tapRow: { flexDirection: 'row', gap: 6, minHeight: 8 },
  tapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
  },
  tapLit: { backgroundColor: colors.dialDim },
});
