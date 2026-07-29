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
import { cue } from '../audio';
import { askMicPermission, watchBreath } from '../device';
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
  const breath = useRef({ loudMs: 0, hum: { hz: 0, sinceMs: 0 } });
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
    const stop = watchBreath((rms, hz) => {
      const b = breath.current;
      if (phaseRef.current === 'lamp') {
        // a blow: loud, breathy, unpitched — 400ms of it kills the flame
        b.loudMs = rms > 0.22 ? b.loudMs + 64 : 0;
        if (b.loudMs >= 400) {
          b.loudMs = 0;
          cue('lamp-off');
          Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
          setPhase('hum');
        }
        return;
      }
      // a hum: voiced, steady-ish (±18%), held two seconds
      const h = b.hum;
      if (hz !== null && rms > 0.02 && rms < 0.4) {
        if (h.hz > 0 && Math.abs(hz - h.hz) / h.hz < 0.18) {
          h.sinceMs += 64;
          if (h.sinceMs >= 2000) solve();
        } else {
          h.hz = hz;
          h.sinceMs = 0;
        }
      } else {
        h.hz = 0;
        h.sinceMs = 0;
      }
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              let her listen
            </Text>
          </Pressable>
        )}
        <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
          {phase === 'done' ? unlockedText : phase === 'hum' ? lampOutText : prompt}
        </Text>
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
});
