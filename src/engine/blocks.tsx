// src/engine/blocks.tsx
// The typographic vocabulary: how each ChapterBlock kind is set on the page.
// The app is portrait-locked; "rotated" and "voice" blocks rotate the TEXT,
// so the reader physically turns the phone in their hands (DEVICE 6's trick).

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, type } from '../theme';

export function ProseBlock({ text, faded }: { text: string; faded?: boolean }) {
  return (
    <Text style={[styles.prose, faded && { color: colors.proseFaded }]}>
      {text}
    </Text>
  );
}

/** The station speaking: always upside down; mirrored flips it again into a
 *  true mirror image. Either way the reader must turn the device to face it. */
export function VoiceBlock({ text, mirrored }: { text: string; mirrored: boolean }) {
  return (
    <View style={styles.voiceWrap}>
      <Text
        style={[
          styles.voice,
          { transform: mirrored ? [{ scaleY: -1 }] : [{ rotate: '180deg' }] },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

/** A descent: the line turns 90° and runs down the page. Reader rotates the
 *  phone to keep reading, then rotates back when the prose levels out. */
export function RotatedBlock({ text }: { text: string }) {
  const SPAN = 320;
  return (
    <View style={[styles.rotatedWrap, { height: SPAN }]}>
      <Text style={[styles.rotated, { width: SPAN }]}>{text}</Text>
    </View>
  );
}

export function LogbookBlock({ lines }: { lines: string[] }) {
  return (
    <View style={styles.logbook}>
      {lines.map((line, i) => (
        <Text key={i} style={styles.logbookLine}>
          {line}
        </Text>
      ))}
    </View>
  );
}

/** The column splits; the reader scrolls into the branch they choose. The
 *  road not taken stays on the page, faded — you can always re-read it. */
export function ForkBlock({
  leftLabel,
  left,
  rightLabel,
  right,
  join,
  onChosen,
}: {
  leftLabel: string;
  left: string;
  rightLabel: string;
  right: string;
  join: string;
  onChosen: () => void;
}) {
  const [chosen, setChosen] = useState<'left' | 'right' | null>(null);
  const choose = (side: 'left' | 'right') => {
    if (chosen) return;
    setChosen(side);
    onChosen();
  };
  return (
    <View>
      <View style={styles.forkRow}>
        {(['left', 'right'] as const).map((side) => {
          const label = side === 'left' ? leftLabel : rightLabel;
          const body = side === 'left' ? left : right;
          const dimmed = chosen !== null && chosen !== side;
          return (
            <Pressable
              key={side}
              style={styles.forkCol}
              onPress={() => choose(side)}
            >
              <Text style={[styles.forkLabel, dimmed && { color: colors.faint }]}>
                {label}
              </Text>
              <Text
                style={[
                  styles.forkBody,
                  dimmed && { color: colors.faint },
                  !chosen && { color: colors.voice },
                ]}
              >
                {body}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!chosen && <Text style={styles.forkHint}>the page is waiting — choose a column</Text>}
      {chosen && <Text style={styles.prose}>{join}</Text>}
    </View>
  );
}

export function ChapterEndBlock({
  title,
  onDone,
}: {
  title: string;
  onDone: () => void;
}) {
  return (
    <View style={styles.endWrap}>
      <Text style={styles.endRule}>· · · — — — · · ·</Text>
      <Text style={styles.endTitle}>{title}</Text>
      <Pressable onPress={onDone} style={styles.endButton}>
        <Text style={styles.endButtonText}>switch off the set</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  prose: { ...type.prose, marginBottom: 28 },
  voiceWrap: { alignItems: 'center', marginVertical: 30 },
  voice: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 34,
    color: colors.voice,
    textAlign: 'center',
  },
  rotatedWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  rotated: {
    ...type.prose,
    transform: [{ rotate: '90deg' }],
    textAlign: 'left',
  },
  logbook: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 16,
    marginBottom: 28,
  },
  logbookLine: {
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 24,
    color: colors.muted,
  },
  forkRow: { flexDirection: 'row', gap: 18, marginBottom: 20 },
  forkCol: { flex: 1 },
  forkLabel: { ...type.chrome, marginBottom: 10, color: colors.dialDim },
  forkBody: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    color: colors.prose,
  },
  forkHint: { ...type.chrome, textAlign: 'center', color: colors.faint, marginBottom: 24 },
  endWrap: { alignItems: 'center', paddingVertical: 60 },
  endRule: { fontFamily: fonts.mono, fontSize: 13, color: colors.faint, marginBottom: 18 },
  endTitle: {
    fontFamily: fonts.mono,
    fontSize: 15,
    letterSpacing: 4,
    color: colors.voice,
    marginBottom: 40,
  },
  endButton: {
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  endButtonText: { fontFamily: fonts.mono, fontSize: 13, color: colors.lockGlow },
});
