// src/engine/ProseReveal.tsx
// Line-by-line scroll-driven reveal for narration. A prose block is measured
// into its actual laid-out lines, then each line is rendered as its own
// Animated.Text whose opacity is bound to that line's position in the scroll —
// so a paragraph resolves line by line as the reader draws it up into the
// reading zone, gently and continuously (no typewriter, no hard edge). Left-
// aligned (single-line Texts can't justify anyway, and dropping justify also
// fixes the max-Dynamic-Type clipping the justified block had).

import { useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  TextLayoutLine,
} from 'react-native';
import { colors, fonts, TYPE_CAPS } from '../theme';
import { BodyText } from './ui';

export function ProseReveal({
  text,
  faded,
  scrollY,
  viewH,
  onMeasure,
}: {
  text: string;
  faded?: boolean;
  scrollY: Animated.Value;
  viewH: number;
  onMeasure: (y: number) => void;
}) {
  const [top, setTop] = useState<number | null>(null);
  const [lines, setLines] = useState<{ text: string; y: number }[] | null>(null);
  const measured = lines && top != null && viewH > 0 ? { lines, top } : null;

  return (
    <Animated.View
      style={styles.block}
      onLayout={(e: LayoutChangeEvent) => {
        const y = e.nativeEvent.layout.y;
        setTop(y);
        onMeasure(y);
      }}
    >
      {/* The measure pass and the visible per-line Animated.Texts must share
          ONE cap (TYPE_CAPS.body), or the measured wrap points drift from the
          rendered lines at large Dynamic Type. */}
      <BodyText
        style={[styles.line, styles.measure]}
        onTextLayout={(e) =>
          setLines(
            (e.nativeEvent.lines as TextLayoutLine[]).map((l) => ({
              text: l.text,
              y: l.y,
            })),
          )
        }
      >
        {text}
      </BodyText>

      {measured ? (
        measured.lines.map((ln, i) => {
          const absTop = measured.top + ln.y;
          // Gentle continuous fade: a line is dark at the bottom of the screen
          // and eases up to full as it climbs to just above the middle.
          const opacity = scrollY.interpolate({
            inputRange: [absTop - viewH * 0.86, absTop - viewH * 0.46],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.Text
              key={i}
              maxFontSizeMultiplier={TYPE_CAPS.body}
              style={[styles.line, faded && { color: colors.proseFaded }, { opacity }]}
            >
              {ln.text.replace(/\n$/, '') || ' '}
            </Animated.Text>
          );
        })
      ) : (
        <BodyText style={[styles.line, styles.hidden]}>{text}</BodyText>
      )}
    </Animated.View>
  );
}

const LINE = { fontFamily: fonts.serif, fontSize: 19, lineHeight: 34, color: colors.prose };

const styles = StyleSheet.create({
  block: { marginBottom: 30 },
  line: { ...LINE, textAlign: 'left' },
  measure: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
  hidden: { opacity: 0 },
});
