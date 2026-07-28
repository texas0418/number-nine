// src/screens/DailySignalScreen.tsx
// Tonight's Signal: the free nightly cryptogram. Cryptoquip interaction —
// tap any cell to select its NUMBER (highlighting it everywhere), then tap a
// letter to assign it to that number across the whole transmission.
//
// - Empty cells flicker faintly through random letters (a decode machine
//   hunting); assigning a letter scrambles the affected cells briefly before
//   they settle. On solve the whole grid settles into the plaintext.
// - In-progress guesses persist (kv) so leaving the screen never loses work.
// - A complete-but-wrong transcription gets diegetic feedback: static, an
//   error thud, and the station "repeats the group".
// - Solving pays off: the decoded line is presented as an entry from
//   Halloran's listening log, with streak and share.

import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  deleteKv,
  getKv,
  isDaySolved,
  listSolvedDays,
  recordSolve,
  setKv,
} from '../db';
import { playIdent, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const LETTER_ROWS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ'];
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Dynamic Type-aware box sizing (see boxSizes rationale in git history). */
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

function initialGuesses(puzzle: DailyPuzzle, saved: string | null): Map<number, string> {
  const m = new Map<number, string>();
  for (const [num, letter] of puzzle.answerByNum)
    if (puzzle.revealedLetters.includes(letter)) m.set(num, letter);
  if (saved) {
    try {
      for (const [k, v] of Object.entries(JSON.parse(saved) as Record<string, string>))
        m.set(Number(k), v);
    } catch {
      /* corrupt save: start from reveals */
    }
  }
  return m;
}

export default function DailySignalScreen({ onBack }: { onBack: () => void }) {
  const todayKey = useMemo(() => dayKeyFromMs(Date.now()), []);
  const { serial, plaintext } = useMemo(
    () => transmissionForDay(todayKey),
    [todayKey],
  );
  const puzzle = useMemo(() => buildPuzzle(todayKey, plaintext), [todayKey, plaintext]);
  const kvKey = `daily-guesses:${todayKey}`;

  const [solvedAlready] = useState(() => isDaySolved(todayKey));
  const [guesses, setGuesses] = useState<Map<number, string>>(() =>
    solvedAlready
      ? new Map(puzzle.answerByNum)
      : initialGuesses(puzzle, getKv(kvKey)),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(solvedAlready);
  const [refused, setRefused] = useState(false);
  const [streak, setStreak] = useState(() =>
    currentStreak(listSolvedDays(), todayKey),
  );

  const assign = (letter: string) => {
    if (solved || selected === null) return;
    const next = new Map(guesses);
    next.set(selected, letter);
    setGuesses(next);
    setKv(kvKey, JSON.stringify(Object.fromEntries(next)));
    if (isSolved(puzzle, next)) {
      setSolved(true);
      setSelected(null);
      setRefused(false);
      recordSolve(todayKey, Date.now());
      deleteKv(kvKey);
      setStreak(currentStreak(listSolvedDays(), todayKey));
      playIdent();
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    } else if (next.size >= puzzle.answerByNum.size) {
      // every number has a letter but the transcription is wrong somewhere
      setRefused(true);
      setStaticLevel(0.26);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
      setTimeout(() => setStaticLevel(0.08), 600);
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
          <Text style={styles.back} maxFontSizeMultiplier={1.3}>‹ set</Text>
        </Pressable>
        <Text style={styles.title} maxFontSizeMultiplier={1.15} numberOfLines={1}>
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
          <Text style={styles.solvedText}>SIGNAL RECEIVED</Text>
          <Text style={styles.decoded} maxFontSizeMultiplier={1.4}>
            “{plaintext.toLowerCase()}”
          </Text>
          <Text style={styles.attribution} maxFontSizeMultiplier={1.3}>
            — the listening log of H. MARSH · entry no. {serial}
          </Text>
          <Text style={styles.streak}>
            {streak} night{streak === 1 ? '' : 's'} listening · a new signal at midnight
          </Text>
          <Pressable style={styles.shareBtn} onPress={share}>
            <Text style={styles.shareBtnText}>share the intercept</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.keys}>
          {refused && (
            <Text style={styles.refused} maxFontSizeMultiplier={1.3}>
              she repeats the group, unhurried — something is mistranscribed
            </Text>
          )}
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

/** One cipher cell. Only the pre-revealed HINT cells animate: on load each
 *  spins through the alphabet a couple of times, slot-machine style, and
 *  lands on its letter (staggered per cell). Everything else holds still. */
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
  const [spin, setSpin] = useState<string | null>(null);
  const spun = useRef(false);

  useEffect(() => {
    if (!revealed || !guess || spun.current) return;
    spun.current = true;
    const total = 52 + AZ.indexOf(guess); // two full turns, then land
    let i = 0;
    let id: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      id = setInterval(() => {
        setSpin(AZ[i % 26]);
        if (++i > total) {
          if (id) clearInterval(id);
          setSpin(null); // settle on the real letter
        }
      }, 34);
    }, (num % 7) * 120); // staggered starts across the grid
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [revealed, guess, num]);

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
          spin != null && styles.spinning,
        ]}
        allowFontScaling={false}
      >
        {spin ?? guess ?? ' '}
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.prose,
  },
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
  spinning: { color: colors.dialDim },
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
  refused: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 17,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  solvedWrap: { marginTop: 'auto', marginBottom: 48, alignItems: 'center', paddingHorizontal: 10 },
  solvedRule: { fontFamily: fonts.mono, fontSize: 12, color: colors.dialDim, marginBottom: 10 },
  solvedText: { fontFamily: fonts.mono, fontSize: 14, letterSpacing: 4, color: colors.lockGlow },
  decoded: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 30,
    fontStyle: 'italic',
    color: colors.prose,
    textAlign: 'center',
    marginTop: 16,
  },
  attribution: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 10,
  },
  streak: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, marginTop: 14 },
  shareBtn: {
    marginTop: 18,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shareBtnText: { fontFamily: fonts.mono, fontSize: 12, color: colors.lockGlow },
});
