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

/** Frontispiece plate: how a broadcast introduces itself (DEVICE 6's orange
 *  chapter cards, in our night-radio ink). */
export function ChapterCardBlock({ number, title }: { number: string; title: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardNumber} maxFontSizeMultiplier={1.4}>
        {number}
      </Text>
      <Text style={styles.cardRule}>· · · — — — · · ·</Text>
      <Text style={styles.cardTitle} maxFontSizeMultiplier={1.4}>
        {title}
      </Text>
    </View>
  );
}

/** A place label, like a room on a survey map. */
export function RoomBlock({ text }: { text: string }) {
  return (
    <Text style={styles.room} maxFontSizeMultiplier={1.4}>
      {text.toUpperCase()}
    </Text>
  );
}

/** An inner thought: centered italics floating apart from the narration. */
export function ThoughtBlock({ text }: { text: string }) {
  return (
    <Text style={styles.thought} maxFontSizeMultiplier={1.5}>
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
 *  phone to keep reading, then rotates back when the prose levels out.
 *  Two-pass: an invisible copy measures the wrapped height first, then the
 *  visible copy renders inside an exactly-sized rotated frame — a rotated
 *  box's visual extent must match its measured layout or lines clip. */
export function RotatedBlock({
  text,
  direction = 'down',
}: {
  text: string;
  direction?: 'down' | 'up';
}) {
  const SPAN = 300; // vertical run of the passage, in pt
  // Capped scaling: this is physical typography — at full accessibility
  // sizes the rotated run would grow wider than the screen. 1.35 keeps the
  // gesture intact while still honoring larger text settings.
  const MAX_SCALE = 1.35;
  const [textHeight, setTextHeight] = useState<number | null>(null);
  const measure = (lines: { y: number; height: number }[]) => {
    if (!lines.length) return;
    const last = lines[lines.length - 1];
    setTextHeight(Math.ceil(last.y + last.height) + 2);
  };
  return (
    <View style={styles.rotatedWrap}>
      <Text
        style={[styles.rotated, styles.rotatedMeasure, { width: SPAN }]}
        maxFontSizeMultiplier={MAX_SCALE}
        onTextLayout={(e) => measure(e.nativeEvent.lines)}
      >
        {text}
      </Text>
      {textHeight != null && (
        <View style={{ width: textHeight, height: SPAN, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: SPAN,
              height: textHeight,
              transform: [{ rotate: direction === 'down' ? '90deg' : '-90deg' }],
              justifyContent: 'center',
            }}
          >
            <Text style={styles.rotated} maxFontSizeMultiplier={MAX_SCALE}>
              {text}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export function LogbookBlock({ lines }: { lines: string[] }) {
  return (
    <View style={styles.logbook}>
      {lines.map((line, i) => (
        // Cap scaling on the monospace log: at full accessibility size an
        // uncapped mono line overran the panel and clipped ("entries
        // incomplete" -> "incompet…"). 1.3 keeps it legible and contained.
        <Text key={i} style={styles.logbookLine} maxFontSizeMultiplier={1.3}>
          {line}
        </Text>
      ))}
    </View>
  );
}

/** The cellar stairs, typeset AS stairs: each step drops down and to the
 *  right, so the paragraph physically descends the page. Reads top-left to
 *  bottom-right like a flight of steps (direction 'up' climbs, right-to-left). */
export function StaircaseBlock({
  steps,
  direction = 'down',
}: {
  steps: string[];
  direction?: 'down' | 'up';
}) {
  const STEP = 26; // horizontal inset per stair
  const order = direction === 'up' ? [...steps].reverse() : steps;
  const n = order.length;
  return (
    <View style={styles.staircase}>
      {order.map((line, i) => {
        const depth = direction === 'up' ? n - 1 - i : i;
        return (
          <View key={i} style={[styles.stairRow, { paddingLeft: 8 + depth * STEP }]}>
            <View style={styles.stairTread} />
            <Text style={styles.stairText} maxFontSizeMultiplier={1.3}>
              {line}
            </Text>
          </View>
        );
      })}
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
  prose: { ...type.prose, textAlign: 'justify', marginBottom: 30 },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 44,
  },
  cardNumber: {
    fontFamily: fonts.serif,
    fontSize: 13,
    letterSpacing: 5,
    color: colors.muted,
    marginBottom: 22,
  },
  cardRule: { fontFamily: fonts.mono, fontSize: 12, color: colors.dialDim, marginBottom: 22 },
  cardTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontStyle: 'italic',
    color: colors.prose,
  },
  room: {
    fontFamily: fonts.serif,
    fontSize: 14,
    letterSpacing: 3,
    color: colors.voice,
    textDecorationLine: 'underline',
    marginTop: 18,
    marginBottom: 20,
  },
  thought: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.proseFaded,
    textAlign: 'center',
    marginVertical: 34,
    paddingHorizontal: 30,
  },
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
    textAlign: 'left',
  },
  rotatedMeasure: {
    position: 'absolute',
    opacity: 0,
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
    flexShrink: 1,
  },
  staircase: { marginVertical: 24 },
  stairRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  stairTread: {
    width: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.panelBorder,
    marginRight: 10,
    marginBottom: 10,
  },
  stairText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 28,
    color: colors.prose,
    flexShrink: 1,
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
