// src/engine/MicStage.tsx
/* eslint-disable react-hooks/refs -- breath analysis feeds refs read by a
   tick loop; render reads mirrored useState values. */
// THE EAR OPENS BOTH WAYS (B5, staged): she asks to LISTEN BACK. Stage one:
// blow out the lamp — a real breath across the phone (mic RMS spike kills
// the amber flame). Stage two: hum her ident back — any steady, quiet,
// VOICED note held a couple of seconds (coarse zero-crossing pitch; she
// asks for a hum, not a performance). The iOS permission dialog IS the
// scene's dread. Refuse her — or have no mic at all — and the music-box
// tines carry the gate instead (MelodyBox, the ident learned in B1).

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cue, playIdent } from '../audio';
import { askMicPermission, hasMicPermission, watchBreath } from '../device';
import { MelodyBox } from './MelodyBox';
import { amberGlow, colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

type Phase = 'ask' | 'lamp' | 'hum' | 'tines' | 'done';

export function MicStage({
  tinesAnswer,
  prompt,
  lampOutText,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  /** The ident, for the no-mic path (MelodyBox answer string). */
  tinesAnswer: string;
  prompt: string;
  /** Caption once the lamp is blown out and she waits for the hum. */
  lampOutText: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [phase, setPhase] = useState<Phase>(solved ? 'done' : 'ask');
  const [tinesOffered, setTinesOffered] = useState(false);
  const [standingYes, setStandingYes] = useState(false);
  const [heard, setHeard] = useState(0); // her ear, made visible (0..1)
  const breath = useRef({ loudMs: 0, hum: { hz: 0, sinceMs: 0 }, inHumMs: 0 });
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;

  const solve = () => {
    if (phaseRef.current === 'done') return;
    setPhase('done');
    cue(solveCue);
    Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    onSolved();
  };

  useEffect(() => {
    if (phase !== 'lamp' && phase !== 'hum') return;
    const stop = watchBreath((rms, hz, seconds) => {
      const b = breath.current;
      const ms = seconds * 1000; // REAL buffer time (device QA: hardcoded
      // 64ms steps made 2s of hum demand 6+ perfect seconds)
      if (phaseRef.current === 'lamp') {
        // a blow: loud, breathy, unpitched — 400ms of it kills the flame
        b.loudMs = rms > 0.22 ? b.loudMs + ms : 0;
        if (b.loudMs >= 400) {
          b.loudMs = 0;
          cue('lamp-off');
          Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
          setPhase('hum');
        }
        return;
      }
      // a hum: ANY sustained gentle sound. No pitch test — her standard
      // is presence, not tune; Margaret hummed it flat too (device QA:
      // real hums never survived the stability window).
      b.inHumMs += ms;
      if (b.inHumMs >= 45000) setTinesOffered(true); // no one stays stuck here
      setHeard(Math.min(1, rms * 10));
      const h = b.hum;
      if (rms > 0.005 && rms < 0.3) {
        h.sinceMs += ms;
        if (h.sinceMs >= 1500) solve();
      } else {
        h.sinceMs = 0;
      }
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Call and response: entering the hum, she hums it FIRST — and again
  // every ten seconds while she waits (device QA: the reader was expected
  // to remember the ident cold).
  useEffect(() => {
    if (phase !== 'hum') return;
    playIdent();
    const t = setInterval(playIdent, 10000);
    return () => clearInterval(t);
  }, [phase]);

  // iOS asks once per install and remembers the answer — the button should
  // not promise a dialog that will never come (device QA).
  useEffect(() => {
    if (phase !== 'ask') return;
    hasMicPermission().then(setStandingYes);
  }, [phase]);

  const askHer = async () => {
    const granted = await askMicPermission();
    setPhase(granted ? 'lamp' : 'tines');
  };

  if (phase === 'tines') {
    // she cannot hear you; the tines still remember her tune
    return (
      <MelodyBox
        answer={tinesAnswer}
        prompt="she cannot hear you · the tines remember her tune · play it back"
        unlockedText={unlockedText}
        solveCue={solveCue}
        solved={false}
        onSolved={onSolved}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        {phase !== 'done' && (
          <View style={styles.lampWell} pointerEvents="none">
            <Text
              style={[styles.flame, phase !== 'ask' && phase !== 'lamp' && styles.flameOut]}
              allowFontScaling={false}
            >
              {phase === 'hum' ? '·' : '❋'}
            </Text>
          </View>
        )}
        {phase === 'ask' && (
          <Pressable style={styles.askWell} onPress={askHer}>
            <Text style={styles.askText} allowFontScaling={false}>
              {standingYes ? 'let her listen · she remembers your yes' : 'let her listen'}
            </Text>
          </Pressable>
        )}
        <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
          {phase === 'done' ? unlockedText : phase === 'hum' ? lampOutText : prompt}
        </Text>
        {phase === 'hum' && (
          <View style={styles.earTrack} pointerEvents="none">
            <View style={[styles.earFill, { width: `${Math.round(heard * 100)}%` }]} />
          </View>
        )}
        {phase === 'hum' && tinesOffered && (
          <Pressable onPress={() => setPhase('tines')} hitSlop={8}>
            <Text style={styles.tinesOffer} allowFontScaling={false}>
              the tines remember her tune
            </Text>
          </Pressable>
        )}
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
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 18,
    gap: 14,
  },
  lampWell: { alignItems: 'center' },
  flame: { fontSize: 26, color: colors.dial, ...amberGlow },
  flameOut: { color: colors.faint },
  askWell: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
  },
  askText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.muted,
  },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  earTrack: {
    alignSelf: 'stretch',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  earFill: { height: 3, backgroundColor: colors.dialDim },
  tinesOffer: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.faint,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
});
