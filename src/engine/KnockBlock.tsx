// src/engine/KnockBlock.tsx
// The TOUCH-ECHO puzzle: press your palm to the wall and the house knocks in
// grouped counts — HAPTICS AND A FAINT PULSE ONLY (device QA: audio start-up
// lag made thuds trail the hand; "codes you FEEL" is the doctrine anyway;
// the pulse is the accessibility channel for haptics-off readers). Then
// knock the groups back — anywhere on the wall itself, no labeled control
// (QA round 2: a "knock back" button made it too easy). Taps separated by a
// beat of stillness become groups. Only YOUR knocks make a sound.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, setStaticLevel } from '../audio';
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

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (gapTimer.current) clearTimeout(gapTimer.current);
    },
    [],
  );

  // The wall speaks — into the reader's HAND. No audio: haptic + pulse only.
  const listen = () => {
    if (playing || done) return;
    setPlaying(true);
    setEcho([]);
    setCurrent(0);
    let at = 350;
    groups.forEach((n) => {
      for (let k = 0; k < n; k++) {
        timers.current.push(
          setTimeout(() => {
            Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
            setPulse(true);
            timers.current.push(setTimeout(() => setPulse(false), 130));
          }, at),
        );
        at += KNOCK_MS;
      }
      at += GROUP_PAUSE_MS;
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
    // fully silent gate (QA r3): the exchange is felt, never heard
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
    const taps = current + 1;
    setCurrent(taps);
    if (gapTimer.current) clearTimeout(gapTimer.current);
    // A wrong count can exceed the target; let the gap close it and judge.
    gapTimer.current = setTimeout(() => closeGroup(taps, echo), GROUP_GAP_MS);
  };

  // The whole panel IS the wall: any tap on it (outside the palm control)
  // is a knock. No labeled pad, no tap counter — the reader must realize
  // the wall wants answering.
  return (
    <Pressable style={styles.body} onPress={tapBack} disabled={done || playing}>
      <View style={[styles.plaster, pulse && styles.plasterPulse]} pointerEvents="none" />
      <Text style={styles.prompt} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
      {!done && (
        <>
          <View style={styles.groupRow} pointerEvents="none">
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
            <View style={styles.wallInner}>
              <Text style={styles.wallText} allowFontScaling={false}>
                {playing ? 'the wall is speaking' : '◉ press your palm to the wall'}
              </Text>
            </View>
          </Pressable>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: 270,
    minHeight: 210, // room to knock: the panel itself is the wall
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    marginVertical: 24,
  },
  plaster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  plasterPulse: { backgroundColor: colors.panelBorder },
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
  wall: { marginTop: 'auto' },
  wallInner: {
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  wallText: { fontFamily: fonts.mono, fontSize: 12, color: colors.lockGlow },
});
