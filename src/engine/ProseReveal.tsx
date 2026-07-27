// src/engine/ProseReveal.tsx
// Line-by-line scroll-driven reveal for narration. A prose block is measured
// into its actual laid-out lines, then each line is rendered as its own
// Animated.Text whose opacity is bound to that line's position in the scroll —
// so a paragraph materialises line by line as the reader draws it up into the
// reading zone, and fades back out on the way up. (Left-aligned, not
// justified: single-line Texts can't justify anyway, and dropping justify also
// fixes the max-Dynamic-Type clipping the justified block had.)

import { useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextLayoutLine,
} from 'react-native';
import { colors, fonts } from '../theme';

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

  const measured =
    lines && top != null && viewH > 0 ? { lines, top } : null;

  return (
    <Animated.View
      style={styles.block}
      onLayout={(e: LayoutChangeEvent) => {
        const y = e.nativeEvent.layout.y;
        setTop(y);
        onMeasure(y);
      }}
    >
      {/* Always-mounted hidden measurer: reports the laid-out lines at the
          current width/text-size and re-fires when either changes. */}
      <Text
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
      </Text>

      {measured ? (
        measured.lines.map((ln, i) => {
          const absTop = measured.top + ln.y;
          // Fade begins as the line enters from the bottom edge and is fully
          // lit by the middle of the screen.
          const opacity = scrollY.interpolate({
            inputRange: [absTop - viewH, absTop - viewH * 0.5],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.Text
              key={i}
              style={[styles.line, faded && { color: colors.proseFaded }, { opacity }]}
            >
              {ln.text.replace(/\n$/, '') || ' '}
            </Animated.Text>
          );
        })
      ) : (
        // Before measurement: reserve the block's height, invisibly.
        <Text style={[styles.line, styles.hidden]}>{text}</Text>
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
