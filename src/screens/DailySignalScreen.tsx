// src/screens/DailySignalScreen.tsx
// Tonight's Signal: the free nightly cryptogram. Cryptoquip interaction —
// tap any cell to select its NUMBER (highlighting it everywhere), then tap a
// letter to assign it to that number across the whole transmission. Signal
// strength pre-reveals a few letters; the weekly rhythm lives in cipher.ts.

import { useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import {
  buildPuzzle,
  isSolved,
  redactedTranscript,
  type DailyPuzzle,
} from '../daily/cipher';
import { transmissionForDay } from '../daily/schedule';
import { currentStreak, dayKeyFromMs } from '../models';
import { isDaySolved, listSolvedDays, recordSolve } from '../db';
import { playIdent } from '../audio';
import { colors, fonts } from '../theme';

const LETTER_ROWS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ'];

function initialGuesses(puzzle: DailyPuzzle): Map<number, string> {
  const m = new Map<number, string>();
  for (const [num, letter] of puzzle.answerByNum)
    if (puzzle.revealedLetters.includes(letter)) m.set(num, letter);
  return m;
}

export default function DailySignalScreen({ onBack }: { onBack: () => void }) {
  const todayKey = useMemo(() => dayKeyFromMs(Date.now()), []);
  const { serial, plaintext } = useMemo(
    () => transmissionForDay(todayKey),
    [todayKey],
  );
  const puzzle = useMemo(() => buildPuzzle(todayKey, plaintext), [todayKey, plaintext]);

  const [solvedAlready] = useState(() => isDaySolved(todayKey));
  const [guesses, setGuesses] = useState<Map<number, string>>(() =>
    solvedAlready ? new Map(puzzle.answerByNum) : initialGuesses(puzzle),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(solvedAlready);
  const [streak, setStreak] = useState(() =>
    currentStreak(listSolvedDays(), todayKey),
  );

  const assign = (letter: string) => {
    if (solved || selected === null) return;
    const next = new Map(guesses);
    next.set(selected, letter);
    setGuesses(next);
    if (isSolved(puzzle, next)) {
      setSolved(true);
      setSelected(null);
      recordSolve(todayKey, Date.now());
      setStreak(currentStreak(listSolvedDays(), todayKey));
      playIdent();
    }
  };

  const share = () =>
    Share.share({
      message: [
        `NUMBER NINE · signal no. ${serial}`,
        redactedTranscript(puzzle, guesses),
        solved ? `received · ${streak} nights listening` : 'still decoding',
      ].join('\n'),
    }).catch(() => {});

  const revealedSet = new Set(
    [...puzzle.answerByNum.entries()]
      .filter(([, l]) => puzzle.revealedLetters.includes(l))
      .map(([n]) => n),
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ the set</Text>
        </Pressable>
        <Text style={styles.title}>TONIGHT’S SIGNAL</Text>
        <Pressable onPress={share} hitSlop={12}>
          <Text style={styles.back}>share</Text>
        </Pressable>
      </View>
      <Text style={styles.meta}>
        intercepted · 4625 kHz · no. {serial} · {puzzle.revealedLetters.length} letters clear
      </Text>

      <View style={styles.paper}>
        {puzzle.words.map((word, wi) => (
          <View key={wi} style={styles.word}>
            {word.map((sym, si) =>
              'literal' in sym ? (
                <Text key={si} style={styles.literal}>
                  {sym.literal}
                </Text>
              ) : (
                <Cell
                  key={si}
                  num={sym.num}
                  guess={guesses.get(sym.num)}
                  selected={selected === sym.num}
                  revealed={revealedSet.has(sym.num)}
                  onPress={() => !solved && setSelected(sym.num)}
                />
              ),
            )}
          </View>
        ))}
      </View>

      {solved ? (
        <View style={styles.solvedWrap}>
          <Text style={styles.solvedRule}>· · · — — — · · ·</Text>
          <Text style={styles.solvedText}>signal received</Text>
          <Text style={styles.streak}>
            {streak} night{streak === 1 ? '' : 's'} listening
          </Text>
        </View>
      ) : (
        <View style={styles.keys}>
          {LETTER_ROWS.map((row) => (
            <View key={row} style={styles.keyRow}>
              {[...row].map((letter) => (
                <Pressable
                  key={letter}
                  style={styles.key}
                  onPress={() => assign(letter)}
                >
                  <Text style={styles.keyText}>{letter}</Text>
                </Pressable>
              ))}
            </View>
          ))}
          <Text style={styles.hint}>
            {selected === null
              ? 'tap a number in the transmission'
              : `assign a letter to every ${selected}`}
          </Text>
        </View>
      )}
    </View>
  );
}

function Cell({
  num,
  guess,
  selected,
  revealed,
  onPress,
}: {
  num: number;
  guess: string | undefined;
  selected: boolean;
  revealed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cell,
        selected && { borderColor: colors.dial },
        revealed && { borderColor: colors.panelBorder, backgroundColor: colors.bg },
      ]}
    >
      <Text style={[styles.cellLetter, revealed && { color: colors.muted }]}>
        {guess ?? ' '}
      </Text>
      <Text style={[styles.cellNum, selected && { color: colors.dial }]}>{num}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 62, paddingHorizontal: 22 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 3, color: colors.prose },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  paper: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  word: { flexDirection: 'row', marginRight: 14, gap: 3 },
  literal: { fontFamily: fonts.mono, fontSize: 16, color: colors.dial, alignSelf: 'center' },
  cell: {
    width: 26,
    height: 40,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLetter: { fontFamily: fonts.mono, fontSize: 15, color: colors.prose, height: 20 },
  cellNum: { fontFamily: fonts.mono, fontSize: 9, color: colors.faint },
  keys: { marginTop: 'auto', marginBottom: 34 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 6 },
  key: {
    width: 32,
    height: 40,
    backgroundColor: colors.panel,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: fonts.mono, fontSize: 15, color: colors.prose },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 10,
  },
  solvedWrap: { marginTop: 'auto', marginBottom: 60, alignItems: 'center' },
  solvedRule: { fontFamily: fonts.mono, fontSize: 12, color: colors.faint, marginBottom: 12 },
  solvedText: { fontFamily: fonts.mono, fontSize: 14, letterSpacing: 3, color: colors.lockGlow },
  streak: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, marginTop: 8 },
});
