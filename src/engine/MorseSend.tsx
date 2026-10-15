// src/engine/MorseSend.tsx
/* eslint-disable react-hooks/refs -- keying state lives in refs read by the
   press handlers and the gap timer; render reads mirrored useState. */
// SENDING (B5): the reader has only ever received. Now the key is under
// their own finger — press short for a dit, long for a dah, pause to end a
// letter. The word is never printed here (the clues say it); the morse
// alphabet is an artifact in the chapter, as it was an artifact in every
// operator's shack. A wrong letter is swallowed by static and the letter
// starts over; sent letters stand. The act is touch-first by nature.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MechText } from './ui';
import { cue, setLoopVolume, setStaticLevel, startSfxLoop, stopSfx, warmLoop } from '../audio';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

const DIT_MAX_MS = 260; // shorter is a dit, longer a dah
const LETTER_GAP_MS = 900; // silence that ends a letter

export function MorseSend({
  word,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  word: string;
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [sent, setSent] = useState(0); // letters accepted
  const [symbols, setSymbols] = useState(''); // current letter so far
  const [keyDown, setKeyDown] = useState(false);
  const state = useRef({
    done: solved,
    sent: solved ? word.length : 0,
    symbols: '',
    downAt: 0,
    gapTimer: null as ReturnType<typeof setTimeout> | null,
  });

  useEffect(
    () => () => {
      if (state.current.gapTimer) clearTimeout(state.current.gapTimer);
      stopSfx('sidetone'); // never let a keyed tone outlive the widget
    },
    [],
  );

  // the parish stands back while the reader's own fist is on the key
  // (device QA: the clicks drowned under the crowd). The sidetone runs
  // CONTINUOUSLY at volume zero and the key only opens and closes its
  // volume — start/stop per press raced seek/play/pause and ate dits
  // (device QA: "only playing sometimes"). Real keying circuits work the
  // same way: carrier always up, keyed.
  useEffect(() => {
    if (done) return;
    warmLoop('sidetone');
    startSfxLoop('sidetone', 0);
    setLoopVolume('parish', 0.07);
    return () => {
      stopSfx('sidetone');
      setLoopVolume('parish', 0.22);
    };
  }, [done]);

  const targetLetter = () => word[state.current.sent]?.toUpperCase() ?? '';

  const letterEnds = () => {
    const s = state.current;
    s.gapTimer = null;
    if (s.done || s.symbols.length === 0) return;
    const want = MORSE[targetLetter()] ?? '';
    if (s.symbols === want) {
      s.sent += 1;
      s.symbols = '';
      setSent(s.sent);
      setSymbols('');
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      if (s.sent >= word.length) {
        s.done = true;
        setDone(true);
        cue(solveCue);
        onSolved();
      }
    } else {
      // A badly-made letter loses the WHOLE word (Simon, playtest
      // 2026-07-30): the parish hears the transmission entire, so a garble
      // means sending it again from the first letter. The lamps go out with
      // it — static and a heavy knock carry the failure, never error copy.
      s.symbols = '';
      s.sent = 0;
      setSymbols('');
      setSent(0);
      setStaticLevel(0.18);
      setTimeout(() => setStaticLevel(0.05), 400);
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
    }
  };

  const pressIn = () => {
    const s = state.current;
    if (s.done) return;
    if (s.gapTimer) clearTimeout(s.gapTimer);
    s.gapTimer = null;
    s.downAt = Date.now();
    setKeyDown(true);
    // the SIDETONE: the operator hears his own keying for exactly as long
    // as the key is down — dits are short beeps, dahs long ones
    setLoopVolume('sidetone', 0.5);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Rigid);
  };

  const pressOut = () => {
    const s = state.current;
    if (s.done || s.downAt === 0) return;
    const held = Date.now() - s.downAt;
    s.downAt = 0;
    setKeyDown(false);
    setLoopVolume('sidetone', 0);
    // a wildly long press is a rested finger, not a dah
    if (held > 1600) return;
    s.symbols += held <= DIT_MAX_MS ? '.' : '-';
    setSymbols(s.symbols);
    s.gapTimer = setTimeout(letterEnds, LETTER_GAP_MS);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        <View style={styles.letterRow} pointerEvents="none">
          {Array.from({ length: word.length }, (_, i) => (
            <View key={i} style={[styles.letterDot, i < sent && styles.letterSent]} />
          ))}
        </View>
        <MechText style={styles.fist} allowFontScaling={false} pointerEvents="none">
          {symbols.length > 0 ? symbols.split('').join(' ') : ' '}
        </MechText>
        <Pressable
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={[styles.key, keyDown && styles.keyDown]}
          disabled={done}
        >
          <View style={[styles.keyCap, keyDown && styles.keyCapDown]} />
        </Pressable>
      </View>
      <MechText style={styles.caption}>
        {done ? unlockedText : prompt}
      </MechText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  panel: {
    width: 270,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    gap: 12,
  },
  letterRow: { flexDirection: 'row', gap: 9 },
  letterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  letterSent: { backgroundColor: colors.dialDim },
  fist: {
    fontFamily: fonts.mono,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.dial,
    minHeight: 24,
    ...amberGlow,
  },
  key: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDown: { borderColor: colors.dialDim },
  keyCap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  keyCapDown: { backgroundColor: colors.hairline },
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
