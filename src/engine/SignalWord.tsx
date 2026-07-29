// src/engine/SignalWord.tsx
// THE DAILY CROSSOVER (B4): "what did she say tonight?" The answer is the
// long word in tonight's ACTUAL Tonight's Signal line — the one every
// player on earth is decoding this evening. Candidates and their order come
// from the pure module (src/daily/crossover.ts), deterministic per night.
// A wrong word sends the station OFF THE AIR — a swallowing hush that grows
// with each miss — and when she returns, the card has been re-dealt: fresh
// decoys, same answer, so elimination teaches nothing (device QA: four
// fixed words fell to brute force). Knowing tonight's word stays instant.
// Never an error message; the card quietly re-derives itself if midnight
// passes mid-gate.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { nightWordChoices } from '../daily/crossover';
import { dayKeyFromMs } from '../models';
import { cue, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

// The hush after each wrong word: long enough to tax a guesser's patience,
// growing fast enough that the fourth guess costs a pot of tea.
const OFF_AIR_MS = [8000, 20000, 45000, 90000];

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
      const wait = OFF_AIR_MS[Math.min(deal, OFF_AIR_MS.length - 1)];
      timer.current = setTimeout(() => {
        setDeal((d) => d + 1);
        setOffAir(false);
        setStaticLevel(0.05);
      }, wait);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {offAir ? (
          <Text style={styles.offAir} allowFontScaling={false}>
            {'· · ·   gone off the air   · · ·'}
          </Text>
        ) : (
          card.words.map((w, i) => (
            <Pressable
              key={`${w}-${deal}`}
              style={styles.word}
              onPress={() => pick(i)}
              disabled={done}
            >
              <Text
                style={[
                  styles.wordText,
                  done && i === card.answerIndex && { color: colors.dial },
                ]}
                allowFontScaling={false}
              >
                {w}
              </Text>
            </Pressable>
          ))
        )}
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
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
