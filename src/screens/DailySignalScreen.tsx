// src/screens/DailySignalScreen.tsx
// Tonight's Signal: the free nightly cryptogram. Cryptoquip interaction —
// tap any cell to select its NUMBER (highlighting it everywhere), then tap a
// letter to assign it to that number across the whole transmission. Signal
// strength pre-reveals a few letters; the weekly rhythm lives in cipher.ts.

import { useMemo, useState } from 'react';
import {
  Dimensions,
  PixelRatio,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

/** Dynamic Type-aware box sizing. Cells and keys are fixed boxes, so instead
 *  of OS text scaling (which would overflow them) the boxes themselves grow
 *  with the user's font scale, clamped so the longest cipher word and the
 *  9-key row always fit the screen width. */
function boxSizes(maxWordLen: number) {
  const scale = Math.min(PixelRatio.getFontScale(), 1.9);
  const win = Dimensions.get('window').width;
  const cellW = Math.max(22, Math.min(26 * scale, (win - 74) / maxWordLen));
  const keyW = Math.min(44, Math.max(30, (win - 44 - 8 * 6) / 9));
  return {
    cellW,
    cellH: Math.round(cellW * 1.55),
    cellFont: Math.round(cellW * 0.58),
    numFont: Math.max(9, Math.round(cellW * 0.35)),
    keyW,
    keyH: Math.round(Math.max(40, 40 * Math.min(scale, 1.4))),
    keyFont: Math.round(Math.min(22, 15 * Math.min(scale, 1.5))),
  };
}

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
  const sizes = useMemo(
    () => boxSizes(Math.max(4, ...puzzle.words.map((w) => w.length))),
    [puzzle],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back} maxFontSizeMultiplier={1.3}>‹ the set</Text>
        </Pressable>
        <Text style={styles.title} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          TONIGHT’S SIGNAL
        </Text>
        <Pressable onPress={share} hitSlop={12}>
          <Text style={styles.back} maxFontSizeMultiplier={1.3}>share</Text>
        </Pressable>
      </View>
      <Text style={styles.meta} maxFontSizeMultiplier={1.3} numberOfLines={2}>
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
                  sizes={sizes}
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
                  style={[styles.key, { width: sizes.keyW, height: sizes.keyH }]}
                  onPress={() => assign(letter)}
                >
                  <Text
                    style={[styles.keyText, { fontSize: sizes.keyFont }]}
                    allowFontScaling={false}
                  >
                    {letter}
                  </Text>
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
  sizes,
  onPress,
}: {
  num: number;
  guess: string | undefined;
  selected: boolean;
  revealed: boolean;
  sizes: ReturnType<typeof boxSizes>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cell,
        { width: sizes.cellW, height: sizes.cellH },
        selected && { borderColor: colors.dial },
        revealed && { borderColor: colors.panelBorder, backgroundColor: colors.bg },
      ]}
    >
      <Text
        style={[
          styles.cellLetter,
          { fontSize: sizes.cellFont, height: Math.round(sizes.cellFont * 1.35) },
          revealed && { color: colors.muted },
        ]}
        allowFontScaling={false}
      >
        {guess ?? ' '}
      </Text>
      <Text
        style={[styles.cellNum, { fontSize: sizes.numFont }, selected && { color: colors.dial }]}
        allowFontScaling={false}
      >
        {num}
      </Text>
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
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLetter: { fontFamily: fonts.mono, color: colors.prose },
  cellNum: { fontFamily: fonts.mono, color: colors.faint },
  keys: { marginTop: 'auto', marginBottom: 34 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 6 },
  key: {
    backgroundColor: colors.panel,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: fonts.mono, color: colors.prose },
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
