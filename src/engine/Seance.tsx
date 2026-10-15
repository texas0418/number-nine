// src/engine/Seance.tsx
/* eslint-disable react-hooks/refs -- séance state feeds watchers and timers;
   render reads mirrored useState values. */
// THE FULL SÉANCE (B6, night two). Three conditions at once: the lamp DOWN,
// the world SEVERED, the phone FACE DOWN on the table — and then the longest
// haptic message in the game arrives THROUGH THE WOOD, over and over, while
// the screen sleeps against the boards. Lift the phone and answer: knock the
// groups back. Every condition keeps a hold-fallback (long-press its lamp);
// the knocks are haptic-first and always repeatable.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MechText } from './ui';
import { KnockBlock } from './KnockBlock';
import { watchFacing, watchLamp, watchSeverance } from '../device';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const KNOCK_MS = 470;
const GAP_MS = 1200;
const REST_MS = 6000; // silence between repeats, through the wood

type Phase = 'conditions' | 'message' | 'echo' | 'done';

export function Seance({
  groups,
  prompt,
  messageText,
  echoPrompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  groups: number[];
  prompt: string;
  /** Caption while the wood is speaking (the reader may peek). */
  messageText: string;
  echoPrompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [phase, setPhase] = useState<Phase>(solved ? 'done' : 'conditions');
  const [conds, setConds] = useState({ dark: false, severed: false, down: false });
  const state = useRef({
    dark: false,
    severed: false,
    down: false,
    sawBright: false,
    playedOnce: false,
    timers: [] as ReturnType<typeof setTimeout>[],
  });
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;

  const clearTimers = () => {
    state.current.timers.forEach(clearTimeout);
    state.current.timers = [];
  };

  // ------------------------------------------------------------ conditions
  useEffect(() => {
    if (phase !== 'conditions') return;
    const s = state.current;
    const apply = () => {
      setConds({ dark: s.dark, severed: s.severed, down: s.down });
      if (s.dark && s.severed && s.down) setPhase('message');
    };
    const stopLamp = watchLamp((level) => {
      if (level >= 0.45) s.sawBright = true;
      s.dark = s.sawBright && level < 0.35;
      apply();
    });
    const stopSever = watchSeverance((severed) => {
      s.severed = severed;
      apply();
    });
    const stopFace = watchFacing((down) => {
      s.down = down;
      apply();
    });
    return () => {
      stopLamp();
      stopSever();
      stopFace();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const holdCondition = (key: 'dark' | 'severed' | 'down') => {
    const s = state.current;
    const t = setTimeout(() => {
      s[key] = true;
      setConds({ dark: s.dark, severed: s.severed, down: s.down });
      if (s.dark && s.severed && s.down) setPhase('message');
    }, 3000);
    s.timers.push(t);
  };

  // -------------------------------------------------------------- message
  // The wood speaks the groups on repeat. Lifting the phone (face up) after
  // at least one full pattern moves to the echo.
  useEffect(() => {
    if (phase !== 'message') return;
    const s = state.current;
    let cancelled = false;
    const playPattern = () => {
      if (cancelled || phaseRef.current !== 'message') return;
      let at = 600;
      groups.forEach((n) => {
        for (let k = 0; k < n; k++) {
          s.timers.push(
            setTimeout(
              () => Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy),
              at,
            ),
          );
          at += KNOCK_MS;
        }
        at += GAP_MS;
      });
      s.timers.push(
        setTimeout(() => {
          s.playedOnce = true;
          playPattern();
        }, at - GAP_MS + REST_MS),
      );
    };
    playPattern();
    const stopFace = watchFacing((down) => {
      if (!down && s.playedOnce) {
        clearTimers();
        setPhase('echo');
      }
    });
    // a reader using the hold-fallbacks never turned the phone over; give
    // them a way forward once the wood has spoken at least once
    const lift = setInterval(() => {
      if (s.playedOnce && phaseRef.current === 'message') {
        // stays in message until they lift or tap through
      }
    }, 1000);
    return () => {
      cancelled = true;
      clearTimers();
      clearInterval(lift);
      stopFace();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, groups]);

  if (phase === 'done') {
    return (
      <View style={styles.wrap}>
        <MechText style={styles.caption}>
          {unlockedText}
        </MechText>
      </View>
    );
  }

  if (phase === 'echo') {
    return (
      <KnockBlock
        groups={groups}
        prompt={echoPrompt}
        unlockedText={unlockedText}
        solveCue={solveCue}
        solved={false}
        onSolved={() => {
          setPhase('done');
          onSolved();
        }}
      />
    );
  }

  if (phase === 'message') {
    return (
      <View style={styles.wrap}>
        <View style={styles.panel}>
          <MechText style={styles.caption}>
            {messageText}
          </MechText>
          <Pressable
            onPress={() => {
              if (state.current.playedOnce) {
                clearTimers();
                setPhase('echo');
              }
            }}
            hitSlop={8}
          >
            <MechText style={styles.liftHint} allowFontScaling={false}>
              · lift ·
            </MechText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        <MechText style={styles.caption}>
          {prompt}
        </MechText>
        <View style={styles.lampRow}>
          {(
            [
              ['dark', 'the lamp'],
              ['severed', 'the world'],
              ['down', 'face down'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              onPressIn={() => holdCondition(key)}
              onPressOut={clearTimers}
              style={styles.condWell}
            >
              <View style={[styles.condLamp, conds[key] && styles.condMet]} />
              <MechText style={styles.condLabel} allowFontScaling={false}>
                {label}
              </MechText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  panel: {
    width: 270,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    gap: 14,
  },
  lampRow: { flexDirection: 'row', gap: 22 },
  condWell: { alignItems: 'center', gap: 6 },
  condLamp: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  condMet: { backgroundColor: colors.dialDim },
  condLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.faint,
  },
  liftHint: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.faint,
    fontStyle: 'italic',
  },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 1,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
