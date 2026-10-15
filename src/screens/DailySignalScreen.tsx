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
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { BodyText, ChromeText, MechText } from '../engine/ui';
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
import { playIdent, setStaticLevel, speakNumbers } from '../audio';
import { cardStatusLine, cardWords } from '../daily/card';
import { CARD_H, CARD_SCALE, CARD_W, ShareCard } from '../engine/ShareCard';
import { captureCard } from '../shareCard';
import { SITE_URL } from '../society';
import { isHeaderKeyNight, keywordForDay } from '../daily/headerkey';
import { giftLine, keyedGifts } from '../daily/keyedGift';
import { isMorseNight } from '../daily/morse';
import { amberGlow, amberViewGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const LETTER_ROWS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ'];
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Dynamic Type-aware box sizing (see boxSizes rationale in git history).
 *  On a MORSE night the figure under each cell becomes one stacked group per
 *  digit instead of one or two glyphs, so the cell grows taller and the figure
 *  font shrinks. Width is untouched: the grid already only just fits the
 *  longest word at the largest text size, and widening would overflow it. */
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

/** Strips the auto-revealed pairings back out, leaving only what the reader
 *  actually entered. The inverse of the seeding in `initialGuesses`. */
function playerOnlyOf(
  puzzle: DailyPuzzle,
  guesses: Map<number, string>,
): Map<number, string> {
  const out = new Map<number, string>();
  for (const [num, letter] of guesses)
    if (!puzzle.revealedLetters.includes(puzzle.answerByNum.get(num) ?? '')) out.set(num, letter);
  return out;
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

  // SHE READS IT ALOUD. The transmission is different every night, so this is
  // sequenced from the ten recorded digits rather than any pre-baked take —
  // numbers-station fashion, digit by digit. Atmosphere only: the figures are
  // already on the page and nothing here is needed to solve.
  const speaking = useRef<(() => void) | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => () => speaking.current?.(), []);

  const listen = () => {
    if (speaking.current) {
      speaking.current();
      speaking.current = null;
      setIsSpeaking(false);
      return;
    }
    const groups = puzzle.words.map((w) =>
      w.flatMap((sym) => ('num' in sym ? [sym.num] : [])),
    ).filter((g) => g.length > 0);
    if (groups.length === 0) return;
    setIsSpeaking(true);
    playIdent();
    const stop = speakNumbers(groups, { digitMs: 430, groupMs: 950 });
    const total = 2600 + groups.reduce(
      (n, g) => n + g.reduce((m, v) => m + String(v).length, 0) * 430 + 950, 0);
    const done = setTimeout(() => {
      speaking.current = null;
      setIsSpeaking(false);
    }, total);
    speaking.current = () => {
      stop();
      clearTimeout(done);
    };
  };

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
    // Save only what the READER typed. The auto-revealed letters are derived
    // from the day's rules, so storing them freezes yesterday's rules into the
    // save: when the Morse night stopped granting a bonus letter, devices that
    // had already opened that night went on showing it (device, 2026-07-30).
    // Persisting player input alone lets every launch rebuild the reveals from
    // whatever the current rules are, and heals itself with no migration.
    setKv(kvKey, JSON.stringify(Object.fromEntries(playerOnly(next))));
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

  // Image first, text if the capture is unavailable for any reason. The text
  // share is what has always worked and stays the floor: nothing here is
  // load-bearing (house rule), so a missing native module costs a picture and
  // never a share.
  const share = async () => {
    const uri = await captureCard(cardRef, CARD_W, CARD_H, CARD_SCALE);
    if (uri) {
      const ok = await Share.share({ url: uri, message: SITE_URL })
        .then(() => true)
        .catch(() => false);
      if (ok) return;
    }
    return shareText();
  };

  const shareText = () =>
    Share.share({
      message: [
        `NUMBER NINE · signal no. ${serial}`,
        redactedTranscript(puzzle, guesses),
        solved ? `received · ${streak} nights listening` : 'still decoding',
        SITE_URL,
      ].join('\n'),
    }).catch(() => {});

  const revealedSet = new Set(
    [...puzzle.answerByNum.entries()]
      .filter(([, l]) => puzzle.revealedLetters.includes(l))
      .map(([n]) => n),
  );
  const cardRef = useRef<View>(null);
  // She keys her figures one night a week instead of counting them. Same
  // puzzle, same key, same plaintext — see src/daily/morse.ts.
  const morseNight = isMorseNight(puzzle.dayKey);
  const headerKeyNight = isHeaderKeyNight(puzzle.dayKey);
  const playerOnly = (g: Map<number, string>) => playerOnlyOf(puzzle, g);
  const gifts = useMemo(() => (morseNight ? keyedGifts(puzzle) : []), [morseNight, puzzle]);
  const sizes = useMemo(
    () => boxSizes(Math.max(4, ...puzzle.words.map((w) => w.length))),
    [puzzle],
  );

  return (
    <View style={styles.root}>
      {/* The title gets the row to itself. It used to share it with listen and
          share, which left it ~183pt for ~173pt of glyphs — so at any raised
          text size it ellipsised into its neighbours. The actions moved down
          instead of the title getting smaller. */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <ChromeText style={styles.back}>‹ set</ChromeText>
        </Pressable>
        <ChromeText style={styles.title} maxFontSizeMultiplier={1.15} numberOfLines={1}>
          TONIGHT’S SIGNAL
        </ChromeText>
        {/* Balances the back link so the title sits optically centred on the
            screen rather than centred in what is left of the row. */}
        <View style={styles.headSpacer} />
      </View>
      <ChromeText style={styles.meta} numberOfLines={2}>
        intercepted · 4625 kHz · no. {serial} · {puzzle.revealedLetters.length} letters clear
        {/* On a header-key night she prints a word in the header, unlabelled and
            unexplained, and that word IS the key. Nothing here says so: a
            listener who recognises it reads the night in seconds, and one who
            does not has an ordinary cryptogram. */}
        {headerKeyNight ? ` · ${keywordForDay(puzzle.dayKey)}` : ''}
      </ChromeText>

      <View style={styles.actions}>
        <Pressable onPress={listen} hitSlop={12}>
          <ChromeText style={[styles.action, isSpeaking && styles.backLive]}>
            {isSpeaking ? 'stop' : 'listen'}
          </ChromeText>
        </Pressable>
        <Pressable onPress={share} hitSlop={12}>
          <ChromeText style={styles.action}>share</ChromeText>
        </Pressable>
      </View>

      {/* A Morse night keys two pairings above the grid, unexplained. Read it
          and you start ahead; do not and this is an ordinary Thursday. It is
          deliberately NOT applied for you — a gift you did not have to read is
          just a reveal with extra steps. */}
      {morseNight && gifts.length > 0 && (
        <ChromeText style={styles.keyed} maxFontSizeMultiplier={1.2} numberOfLines={2}>
          {giftLine(gifts)}
        </ChromeText>
      )}

      <ScrollView style={styles.paper} contentContainerStyle={styles.paperInner}>
        {puzzle.words.map((word, wi) => (
          <View key={wi} style={styles.word}>
            {word.map((sym, si) =>
              'literal' in sym ? (
                // The grid's cells are fixed-size (allowFontScaling={false} below),
                // so the amber literal must not scale either or rows misalign.
                <MechText key={si} style={styles.literal} allowFontScaling={false}>
                  {sym.literal}
                </MechText>
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
      </ScrollView>

      {solved ? (
        <View style={styles.solvedWrap}>
          <ChromeText style={styles.solvedRule}>· · · — — — · · ·</ChromeText>
          <ChromeText style={styles.solvedText}>SIGNAL RECEIVED</ChromeText>
          <BodyText style={styles.decoded} maxFontSizeMultiplier={1.4}>
            “{plaintext.toLowerCase()}”
          </BodyText>
          <ChromeText style={styles.attribution}>
            — the listening log of H. MARSH · entry no. {serial}
          </ChromeText>
          <ChromeText style={styles.streak}>
            {streak} night{streak === 1 ? '' : 's'} listening · a new signal at midnight
          </ChromeText>
          <Pressable style={styles.shareBtn} onPress={share}>
            <ChromeText style={styles.shareBtnText}>share the intercept</ChromeText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.keys}>
          {refused && (
            <ChromeText style={styles.refused}>
              she repeats the group, unhurried — something is mistranscribed
            </ChromeText>
          )}
          {LETTER_ROWS.map((row) => (
            <View key={row} style={styles.keyRow}>
              {[...row].map((letter) => (
                <Pressable
                  key={letter}
                  style={[styles.key, { width: sizes.keyW, height: sizes.keyH }]}
                  onPress={() => assign(letter)}
                >
                  <MechText
                    style={[styles.keyText, { fontSize: sizes.keyFont }]}
                    allowFontScaling={false}
                  >
                    {letter}
                  </MechText>
                </Pressable>
              ))}
            </View>
          ))}
          <ChromeText style={styles.hint}>
            {selected === null
              ? 'tap a number in the transmission'
              : `assign a letter to every ${selected}`}
          </ChromeText>
        </View>
      )}
      {/* Rendered off-screen so it can be captured. Positioned far outside
          the viewport rather than hidden with opacity, because a view with zero
          opacity captures as a blank image. */}
      <View style={styles.cardStage} pointerEvents="none">
        <View ref={cardRef} collapsable={false}>
          <ShareCard
            words={cardWords(puzzle, guesses)}
            serial={serial}
            status={cardStatusLine(streak, solved)}
            url={SITE_URL.replace(/^https?:\/\//, '')}
          />
        </View>
      </View>
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
        selected && { borderColor: colors.dial, ...amberViewGlow },
        revealed && { borderColor: colors.panelBorder, backgroundColor: colors.bg },
      ]}
    >
      <MechText
        style={[
          styles.cellLetter,
          { fontSize: sizes.cellFont, height: Math.round(sizes.cellFont * 1.35) },
          revealed && { color: colors.muted },
          spin != null && styles.spinning,
        ]}
        allowFontScaling={false}
      >
        {spin ?? guess ?? ' '}
      </MechText>
      <MechText
        style={[styles.cellNum, { fontSize: sizes.numFont }, selected && { color: colors.dial, ...amberGlow }]}
        allowFontScaling={false}
      >
        {num}
      </MechText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Off-screen, not invisible: a zero-opacity view captures blank.
  cardStage: { position: 'absolute', left: -10000, top: 0 },
  keyed: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0,
    color: colors.dialDim,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 62, paddingHorizontal: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  backLive: { color: colors.dial, ...amberGlow },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.prose,
  },
  headSpacer: { width: 44 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
    marginTop: 12,
  },
  action: { fontFamily: fonts.mono, fontSize: 13, color: colors.muted, letterSpacing: 1 },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  // The grid SCROLLS and the keypad stays pinned. Before this the paper had no
  // height constraint while `keys` used marginTop:'auto', so a tall grid simply
  // shoved the keypad off the bottom — which a Morse night does at once, and a
  // long line at large Dynamic Type would do eventually (device, 2026-07-30:
  // only the A-I row was reachable).
  paper: {
    flexShrink: 1,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
  paperInner: {
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  word: { flexDirection: 'row', marginRight: 14, gap: 3 },
  literal: { fontFamily: fonts.mono, fontSize: 16, color: colors.dial, alignSelf: 'center', ...amberGlow },
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
