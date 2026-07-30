// src/engine/TripleSheet.tsx
/* eslint-disable react-hooks/refs -- hold/inversion state feeds watchers;
   render reads mirrored useState values. */
// THE TRIPLE COMPOSITION (B6, night two): a sheet that must be held to the
// EAR before it says anything (proximity; the words rise while she is close
// — and LATCH, as risen ink does), then turned physically UPSIDE DOWN for
// its true reading — which is also written MIRROR-WISE. Ear, inversion,
// mirror: three learned acts in one page. Tap the target word in the
// mirrored verso to pass. Fallbacks: press-and-hold stands in for the ear;
// the turn glyph materializes with the margin note, as it did in B3.

import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { cue } from '../audio';
import { watchInversion, watchNearEar } from '../device';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const EAR_MS = 2500; // how long the sheet must be held close before it speaks

function pageTransform(rotate: boolean, mirrored: boolean) {
  if (rotate && mirrored) return { transform: [{ rotate: '180deg' }, { scaleX: -1 }] };
  if (rotate) return { transform: [{ rotate: '180deg' }] };
  if (mirrored) return { transform: [{ scaleX: -1 }] };
  return null;
}

function captionFor(
  done: boolean,
  showingVerso: boolean,
  heard: boolean,
  texts: { prompt: string; heardPrompt: string; invertedPrompt: string; unlockedText: string },
): string {
  if (done) return texts.unlockedText;
  if (showingVerso) return texts.invertedPrompt;
  return heard ? texts.heardPrompt : texts.prompt;
}

function SheetLine({
  line,
  interactive,
  faded,
  targetWord,
  done,
  onWord,
}: {
  line: string;
  interactive: boolean;
  faded: boolean;
  targetWord: string;
  done: boolean;
  onWord: () => void;
}) {
  if (!interactive || !line.includes(targetWord))
    return (
      <Text style={[styles.line, faded && styles.lineFaded]} maxFontSizeMultiplier={1.3}>
        {line}
      </Text>
    );
  const [before, after] = line.split(targetWord);
  return (
    <Text style={[styles.line, styles.lineFaded]} maxFontSizeMultiplier={1.3}>
      {before}
      <Text style={done ? styles.wordFound : styles.lineFaded} onPress={onWord} suppressHighlighting>
        {targetWord}
      </Text>
      {after}
    </Text>
  );
}

export function TripleSheet({
  blankLines,
  heldLines,
  verso,
  targetWord,
  prompt,
  heardPrompt,
  invertedPrompt,
  unlockedText,
  solved,
  hintShown = false,
  onSolved,
  solveCue = 'unlock',
}: {
  /** What the sheet shows before it has been held close (near-nothing). */
  blankLines: string[];
  /** The recto that rises while (and after) the sheet is held to the ear. */
  heldLines: string[];
  /** The verso: read physically inverted, written mirror-wise. */
  verso: string[];
  targetWord: string;
  prompt: string;
  heardPrompt: string;
  invertedPrompt: string;
  unlockedText: string;
  solved: boolean;
  hintShown?: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [heard, setHeard] = useState(solved);
  const [mode, setMode] = useState<'up' | 'sensor' | 'glyph'>('up');
  const state = useRef({ nearMs: 0, near: false, held: false, heard: solved, done: solved });
  const doneRef = useRef(solved);

  // ---- the ear: nearness (or a press) accumulates until the sheet speaks
  useEffect(() => {
    if (heard || done) return;
    const stopEar = watchNearEar((near) => {
      state.current.near = near;
    });
    const tick = setInterval(() => {
      const s = state.current;
      if (s.heard || s.done) return;
      if (s.near || s.held) {
        s.nearMs += 200;
        if (s.nearMs >= EAR_MS) {
          s.heard = true;
          setHeard(true);
          Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
        }
      }
    }, 200);
    return () => {
      stopEar();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heard, done]);

  // ---- the turn: physical inversion once the sheet has spoken
  useEffect(() => {
    if (done || !heard) return;
    const stop = watchInversion((isInverted) =>
      setMode((m) => (isInverted ? 'sensor' : m === 'sensor' ? 'up' : m)),
    );
    return stop;
  }, [done, heard]);

  const turnedThisGesture = useRef(false);
  const turnPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !doneRef.current,
        onMoveShouldSetPanResponder: (_e, g) =>
          !doneRef.current && Math.hypot(g.dx, g.dy) > 8,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          turnedThisGesture.current = false;
        },
        onPanResponderMove: (_e, g) => {
          if (turnedThisGesture.current || doneRef.current) return;
          if (Math.hypot(g.dx, g.dy) > 40) {
            turnedThisGesture.current = true;
            Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
            setMode((m) => (m === 'glyph' ? 'up' : 'glyph'));
          }
        },
      }),
    [],
  );

  const touchWord = () => {
    if (done || mode === 'up') return;
    doneRef.current = true;
    state.current.done = true;
    setDone(true);
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

  const showingVerso = heard && mode !== 'up' && !done;
  const lines = done || showingVerso ? verso : heard ? heldLines : blankLines;
  // physically inverted: render rotated so it reads in that grip; the
  // mirror stays until solved — solving un-mirrors, as B5's verso did
  const rotate = mode === 'sensor' && !done;
  const mirrored = showingVerso;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPressIn={() => {
          state.current.held = true;
        }}
        onPressOut={() => {
          state.current.held = false;
        }}
        disabled={heard}
      >
        <View style={[styles.page, pageTransform(rotate, mirrored)]}>
          {lines.map((line, i) => (
            <SheetLine
              key={i}
              line={line}
              interactive={showingVerso}
              faded={showingVerso || !heard}
              targetWord={targetWord}
              done={done}
              onWord={touchWord}
            />
          ))}
          {!done && heard && hintShown && (
            <View style={styles.turnGlyph} {...turnPan.panHandlers}>
              <Text style={styles.turnText} allowFontScaling={false} pointerEvents="none">
                ⟲
              </Text>
            </View>
          )}
        </View>
      </Pressable>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {captionFor(done, showingVerso, heard, {
          prompt,
          heardPrompt,
          invertedPrompt,
          unlockedText,
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  page: {
    width: 290,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    padding: 20,
    minHeight: 150,
  },
  line: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    color: colors.prose,
  },
  lineFaded: { color: colors.proseFaded, fontStyle: 'italic' },
  wordFound: { color: colors.dial, fontStyle: 'italic', ...amberGlow },
  turnGlyph: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnText: { fontSize: 18, color: colors.faint },
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
