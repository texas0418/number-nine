// src/engine/ChapterView.tsx
// The page itself. A chapter is one continuous scroll of typographic blocks
// with two reveal systems layered together:
//   - gates (radio, fork) stop the reveal until solved — the story physically
//     cannot be scrolled past a locked door;
//   - pacing: blocks materialize one at a time (fade + settle) as the reader
//     reaches them, so the page is never pre-populated. Resumed progress
//     renders instantly without replaying the pacing.
// Audio cues fire as their block first scrolls into the reader's view.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { Chapter, ChapterBlock } from '../models';
import { cue } from '../audio';
import { solvedGatesBefore, visibleCount } from './reveal';
import {
  ChapterCardBlock,
  ChapterEndBlock,
  ForkBlock,
  LogbookBlock,
  ProseBlock,
  RoomBlock,
  RotatedBlock,
  ThoughtBlock,
  VoiceBlock,
} from './blocks';
import { RadioTuner } from './RadioTuner';
import { Keypad } from './Keypad';

const PACE_MS = 450; // beat between one block settling and the next appearing

export function ChapterView({
  chapter,
  initialBlockIndex,
  onAdvance,
  onComplete,
}: {
  chapter: Chapter;
  initialBlockIndex: number;
  onAdvance: (blockIndex: number) => void;
  onComplete: () => void;
}) {
  const { blocks } = chapter;
  const [solved, setSolved] = useState<Set<number>>(() =>
    solvedGatesBefore(blocks, initialBlockIndex),
  );
  const [pacedCount, setPacedCount] = useState(() =>
    Math.max(1, Math.min(initialBlockIndex, blocks.length)),
  );
  const gateLimit = visibleCount(blocks, solved);
  const count = Math.min(gateLimit, Math.max(pacedCount, 1));

  // Geometry + one-shot bookkeeping, only ever touched in handlers/effects.
  const geom = useRef({
    scrollY: 0,
    viewH: 0,
    tops: new Map<number, number>(),
    firedCues: new Set<number>(),
    pacing: false,
    count: 0,
    gateLimit: 0,
    total: blocks.length,
  });

  const evaluate = useCallback(() => {
    const g = geom.current;
    if (g.viewH === 0) return;
    const line = g.scrollY + g.viewH * 0.7;
    for (let i = 0; i < g.count; i++) {
      const block = blocks[i];
      if (!('cue' in block) || !block.cue || g.firedCues.has(i)) continue;
      const top = g.tops.get(i);
      if (top !== undefined && top <= line) {
        g.firedCues.add(i);
        cue(block.cue);
      }
    }
    if (g.pacing || g.count >= g.gateLimit || g.count >= g.total) return;
    const lastTop = g.tops.get(g.count - 1);
    if (lastTop !== undefined && lastTop <= g.scrollY + g.viewH) {
      g.pacing = true;
      setTimeout(() => {
        geom.current.pacing = false;
        setPacedCount((p) => p + 1);
      }, PACE_MS);
    }
  }, [blocks]);

  useEffect(() => {
    geom.current.count = count;
    geom.current.gateLimit = gateLimit;
    evaluate();
  }, [count, gateLimit, evaluate]);

  const solveGate = (index: number) => {
    setSolved((prev) => {
      const next = new Set(prev);
      next.add(index);
      onAdvance(visibleCount(blocks, next));
      return next;
    });
  };

  const recordTop = (index: number) => (e: LayoutChangeEvent) => {
    geom.current.tops.set(index, e.nativeEvent.layout.y);
    evaluate();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    geom.current.scrollY = e.nativeEvent.contentOffset.y;
    geom.current.viewH = e.nativeEvent.layoutMeasurement.height;
    evaluate();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      onLayout={(e) => {
        geom.current.viewH = e.nativeEvent.layout.height;
        evaluate();
      }}
      scrollEventThrottle={64}
    >
      {blocks.slice(0, count).map((block, i) => (
        <BlockFade key={i} animate={i >= initialBlockIndex}>
          <View onLayout={recordTop(i)}>
            {renderBlock(block, i, solved.has(i), solveGate, onComplete)}
          </View>
        </BlockFade>
      ))}
    </ScrollView>
  );
}

/** Fade + settle for newly materializing blocks; instant for resumed ones. */
function BlockFade({
  animate,
  children,
}: {
  animate: boolean;
  children: React.ReactNode;
}) {
  const [opacity] = useState(() => new Animated.Value(animate ? 0 : 1));
  const [shift] = useState(() => new Animated.Value(animate ? 10 : 0));
  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [animate, opacity, shift]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY: shift }] }}>
      {children}
    </Animated.View>
  );
}

function renderBlock(
  block: ChapterBlock,
  index: number,
  gateSolved: boolean,
  solveGate: (i: number) => void,
  onComplete: () => void,
) {
  switch (block.kind) {
    case 'chapterCard':
      return <ChapterCardBlock number={block.number} title={block.title} />;
    case 'room':
      return <RoomBlock text={block.text} />;
    case 'thought':
      return <ThoughtBlock text={block.text} />;
    case 'prose':
      return <ProseBlock text={block.text} faded={block.faded} />;
    case 'voice':
      return <VoiceBlock text={block.text} mirrored={block.mirrored} />;
    case 'rotated':
      return <RotatedBlock text={block.text} direction={block.direction} />;
    case 'logbook':
      return <LogbookBlock lines={block.lines} />;
    case 'fork':
      return (
        <ForkBlock
          leftLabel={block.leftLabel}
          left={block.left}
          rightLabel={block.rightLabel}
          right={block.right}
          join={block.join}
          onChosen={() => solveGate(index)}
        />
      );
    case 'radio':
      return (
        <RadioTuner
          bandLowKhz={block.bandLowKhz}
          bandHighKhz={block.bandHighKhz}
          targetKhz={block.targetKhz}
          lockedText={block.lockedText}
          unlockedText={block.unlockedText}
          solved={gateSolved}
          onSolved={() => solveGate(index)}
        />
      );
    case 'keypad':
    case 'safe':
      return (
        <Keypad
          answer={block.answer}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solved={gateSolved}
          onSolved={() => solveGate(index)}
        />
      );
    case 'chapterEnd':
      return <ChapterEndBlock title={block.title} onDone={onComplete} />;
  }
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 26, paddingTop: 30, paddingBottom: 80 },
});
