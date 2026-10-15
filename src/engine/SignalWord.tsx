// src/engine/SignalWord.tsx
// THE DAILY CROSSOVER (B4): "what did she say tonight?" The answer is a
// word from tonight's ACTUAL Tonight's Signal line — the one every player
// on earth is decoding this evening. Candidates come from the pure module
// (src/daily/crossover.ts), deterministic per night and deal. A wrong word
// is a beat of dead air, and the returning card is WHOLLY new — a different
// true word from tonight's line among fresh length-matched decoys — so
// neither elimination nor diffing teaches anything; only having read
// tonight's line does (device QA, two rounds). Never an error message; the
// card quietly re-derives itself if midnight passes mid-gate.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MechText } from './ui';
import { nightWordChoices } from '../daily/crossover';
import { dayKeyFromMs } from '../models';
import { cue, setStaticLevel } from '../audio';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

// The hush after each wrong word — a beat of dead air, then the new card
// (Simon: 2s; the fully re-dealt cards carry the defense now, not the wait).
const OFF_AIR_MS = 2000;

export function SignalWord({
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
  const [done, setDone] = useState(solved);
  const [deal, setDeal] = useState(0);
  const [offAir, setOffAir] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dayKey = dayKeyFromMs(Date.now());
  const card = useMemo(() => nightWordChoices(dayKey, 4, deal), [dayKey, deal]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      setStaticLevel(0.05);
    },
    [],
  );

  const pick = (i: number) => {
    if (done || offAir) return;
    if (i === card.answerIndex) {
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // the station goes off the air, and comes back holding different cards
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
      setOffAir(true);
      setStaticLevel(0.16);
      timer.current = setTimeout(() => {
        setDeal((d) => d + 1);
        setOffAir(false);
        setStaticLevel(0.05);
      }, OFF_AIR_MS);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {offAir ? (
          <MechText style={styles.offAir} allowFontScaling={false}>
            {'· · ·   gone off the air   · · ·'}
          </MechText>
        ) : (
          card.words.map((w, i) => (
            <Pressable
              key={`${w}-${deal}`}
              style={styles.word}
              onPress={() => pick(i)}
              disabled={done}
            >
              <MechText
                style={[
                  styles.wordText,
                  done && i === card.answerIndex && { color: colors.dial, ...amberGlow },
                ]}
                allowFontScaling={false}
              >
                {w}
              </MechText>
            </Pressable>
          ))
        )}
      </View>
      <MechText style={styles.caption}>
        {done ? unlockedText : prompt}
      </MechText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  card: {
    width: 270,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 8,
  },
  word: { paddingVertical: 12, alignItems: 'center' },
  offAir: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.faint,
    textAlign: 'center',
    paddingVertical: 60,
  },
  wordText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 3,
    color: colors.muted,
  },
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
