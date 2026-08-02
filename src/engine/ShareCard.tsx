// src/engine/ShareCard.tsx
// The nightly share card, rendered as a real view so it can be captured to an
// image. Channel 1 in MARKETING.md: a text novella cannot be sold with a video,
// so the one advertising surface that works is a daily artefact worth posting.
//
// Design rules, from MARKETING.md and DESIGN.md:
//   · BLACK BARS over unsolved letters. Redaction is the image. A card of solid
//     bars with four letters showing is more intriguing than any screenshot.
//   · Amber on near-black. One accent colour, the phosphor identity, never two.
//   · It must read as a page from the book, not as an app export. Serif for the
//     letters, mono for the chrome, and whitespace doing the work.
//   · Nothing on it is a score. The station counts nights, it does not rank.
//
// Laid out at CARD_W x CARD_H points and captured at CARD_SCALE, which yields
// 1080x1350 — a 4:5 portrait, the shape feeds give the most room to.

import { StyleSheet, View } from 'react-native';
import { FixedText } from './ui';
import type { CardCell } from '../daily/card';
import { colors, fonts } from '../theme';

export const CARD_W = 300;
export const CARD_H = 375;
export const CARD_SCALE = 3.6; // 1080 x 1350

export function ShareCard({
  words,
  serial,
  status,
  url,
}: {
  words: CardCell[][];
  serial: number;
  status: string;
  url: string;
}) {
  // Cells shrink as the line lengthens so a long transmission still sits on the
  // card rather than running off it.
  const longest = Math.max(4, ...words.map((w) => w.length));
  const cell = Math.max(9, Math.min(15, 250 / longest));

  return (
    <View style={styles.card}>
      <View style={styles.rule} />
      <FixedText style={styles.wordmark}>NUMBER NINE</FixedText>
      <FixedText style={styles.serial}>INTERCEPT NO. {serial}</FixedText>

      <View style={styles.grid}>
        {words.map((word, wi) => (
          <View key={wi} style={styles.word}>
            {word.map((c, ci) =>
              c.letter === null ? (
                <View
                  key={ci}
                  style={[styles.bar, { width: cell, height: cell * 1.35 }]}
                />
              ) : (
                <FixedText
                  key={ci}
                  style={[
                    styles.letter,
                    { width: cell, fontSize: cell * 1.12, lineHeight: cell * 1.35 },
                    c.literal && { color: colors.faint },
                  ]}
                >
                  {c.letter}
                </FixedText>
              ),
            )}
          </View>
        ))}
      </View>

      <FixedText style={styles.status}>{status}</FixedText>

      <View style={styles.footer}>
        <FixedText style={styles.tagline}>a story you receive, not read</FixedText>
        <FixedText style={styles.url}>{url}</FixedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: colors.bg,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  rule: { height: 2, width: 34, backgroundColor: colors.dial, marginBottom: 16 },
  wordmark: {
    fontFamily: fonts.mono,
    fontSize: 15,
    letterSpacing: 5,
    color: colors.prose,
  },
  serial: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 2.4,
    color: colors.faint,
    marginTop: 5,
  },
  grid: { flex: 1, justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  word: { flexDirection: 'row', marginRight: 7, marginBottom: 6 },
  // The bar IS the design. Slightly lifted off the background rather than pure
  // black, so it reads as redaction laid over a page and not as a hole in one.
  bar: { backgroundColor: '#000', borderRadius: 1, opacity: 0.92 },
  letter: {
    fontFamily: fonts.serif,
    color: colors.prose,
    textAlign: 'center',
  },
  status: {
    fontFamily: fonts.mono,
    fontSize: 8.5,
    letterSpacing: 2,
    color: colors.dial,
    textAlign: 'center',
    marginBottom: 14,
  },
  footer: { alignItems: 'center' },
  tagline: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    fontSize: 11,
    color: colors.proseFaded,
  },
  url: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.faint,
    marginTop: 6,
  },
});
