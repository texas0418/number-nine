// src/engine/ChapterView.tsx
// The page itself. A chapter is one continuous scroll of typographic blocks;
// gates (radio, fork) stop the reveal until solved, so the story physically
// cannot be scrolled past a locked door. Audio cues fire as their block first
// scrolls into the reader's view.

import { useRef, useState } from 'react';
import {
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
  ChapterEndBlock,
  ForkBlock,
  LogbookBlock,
  ProseBlock,
  RotatedBlock,
  VoiceBlock,
} from './blocks';
import { RadioTuner } from './RadioTuner';

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
  const [solved, setSolved] = useState<Set<number>>(() =>
    solvedGatesBefore(chapter.blocks, initialBlockIndex),
  );
  const blockTops = useRef<Map<number, number>>(new Map());
  const firedCues = useRef<Set<number>>(new Set());
  const count = visibleCount(chapter.blocks, solved);

  const solveGate = (index: number) => {
    setSolved((prev) => {
      const next = new Set(prev);
      next.add(index);
      onAdvance(visibleCount(chapter.blocks, next));
      return next;
    });
  };

  const recordTop = (index: number) => (e: LayoutChangeEvent) => {
    blockTops.current.set(index, e.nativeEvent.layout.y);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const line =
      e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height * 0.7;
    chapter.blocks.slice(0, count).forEach((block, i) => {
      if (!('cue' in block) || !block.cue || firedCues.current.has(i)) return;
      const top = blockTops.current.get(i);
      if (top !== undefined && top <= line) {
        firedCues.current.add(i);
        cue(block.cue);
      }
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      scrollEventThrottle={64}
    >
      {chapter.blocks.slice(0, count).map((block, i) => (
        <View key={i} onLayout={recordTop(i)}>
          {renderBlock(block, i, solved.has(i), solveGate, onComplete)}
        </View>
      ))}
    </ScrollView>
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
    case 'prose':
      return <ProseBlock text={block.text} faded={block.faded} />;
    case 'voice':
      return <VoiceBlock text={block.text} mirrored={block.mirrored} />;
    case 'rotated':
      return <RotatedBlock text={block.text} />;
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
    case 'chapterEnd':
      return <ChapterEndBlock title={block.title} onDone={onComplete} />;
  }
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 26, paddingTop: 30, paddingBottom: 80 },
});
