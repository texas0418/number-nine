// src/engine/ChapterView.tsx
// The page. A chapter is one continuous scroll of typographic blocks with two
// layered systems:
//   - GATES (radio, fork, keypad, safe, cipher) stop the reveal until solved —
//     the story physically cannot be scrolled past a locked door.
//   - SCROLL-DRIVEN REVEAL: every block's opacity is bound to scroll position,
//     so text fades IN as you scroll down to it and fades back OUT as you
//     scroll up away from it. The page is never pre-populated; the reader
//     brings each line into being by arriving at it.
// Scroll drives opacity natively (no per-frame React state), so interacting
// with a gate never re-lays-out or jumps the page. Audio cues fire via a
// lightweight scroll listener as their block first enters view.

/* eslint-disable react-hooks/refs -- the `geom` ref (scroll offset, viewport
   height, measured block tops, fired-cue set) is read ONLY inside the scroll
   listener and onLayout/onMeasure handlers, never during render. Reading it in
   render would be the bug this rule guards against; here it is by design. */
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import type { Chapter, ChapterBlock } from '../models';
import { cue } from '../audio';
import { isGate, solvedGatesBefore, visibleCount } from './reveal';
import {
  ChapterCardBlock,
  ChapterEndBlock,
  ForkBlock,
  LogbookBlock,
  ProseBlock,
  RoomBlock,
  RotatedBlock,
  StaircaseBlock,
  ThoughtBlock,
  VoiceBlock,
} from './blocks';
import { RadioTuner } from './RadioTuner';
import { Keypad } from './Keypad';

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
  const count = visibleCount(blocks, solved);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [viewH, setViewH] = useState(0);
  const geom = useRef({ y: 0, viewH: 0, tops: new Map<number, number>(), fired: new Set<number>() });

  const fireCues = () => {
    const g = geom.current;
    if (g.viewH === 0) return;
    const line = g.y + g.viewH * 0.72;
    for (let i = 0; i < count; i++) {
      const b = blocks[i];
      if (!('cue' in b) || !b.cue || g.fired.has(i)) continue;
      const top = g.tops.get(i);
      if (top !== undefined && top <= line) {
        g.fired.add(i);
        cue(b.cue);
      }
    }
  };

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          geom.current.y = e.nativeEvent.contentOffset.y;
          geom.current.viewH = e.nativeEvent.layoutMeasurement.height;
          fireCues();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count],
  );

  const solveGate = (index: number) => {
    setSolved((prev) => {
      const next = new Set(prev);
      next.add(index);
      onAdvance(visibleCount(blocks, next));
      return next;
    });
  };

  const recordTop = (index: number) => (y: number) => {
    geom.current.tops.set(index, y);
    fireCues();
  };

  return (
    <Animated.ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      onLayout={(e) => {
        geom.current.viewH = e.nativeEvent.layout.height;
        setViewH(e.nativeEvent.layout.height);
      }}
      scrollEventThrottle={16}
    >
      {blocks.slice(0, count).map((block, i) => (
        <BlockReveal
          key={i}
          scrollY={scrollY}
          viewH={viewH}
          exempt={isGate(block) || block.kind === 'chapterEnd'}
          onMeasure={recordTop(i)}
        >
          {renderBlock(block, i, solved.has(i), solveGate, onComplete)}
        </BlockReveal>
      ))}
    </Animated.ScrollView>
  );
}

/** Binds a block's opacity to scroll position: invisible below the reveal
 *  line, full once it climbs into the reading zone, fading again on the way
 *  back up. Gates and the end card are exempt (always solid — you act on them). */
function BlockReveal({
  scrollY,
  viewH,
  exempt,
  onMeasure,
  children,
}: {
  scrollY: Animated.Value;
  viewH: number;
  exempt: boolean;
  onMeasure: (y: number) => void;
  children: React.ReactNode;
}) {
  const [top, setTop] = useState<number | null>(null);
  const opacity = useMemo(() => {
    if (exempt) return 1 as unknown as Animated.AnimatedInterpolation<number>;
    if (top == null || viewH === 0)
      return 0 as unknown as Animated.AnimatedInterpolation<number>;
    // Reveal LATE (device feedback: it came in too early / as soon as you
    // scrolled). A block stays fully invisible until its top has climbed to
    // ~60% down the screen, and only reaches full opacity at ~38% down — so
    // the reader must scroll it up into the middle reading band before it
    // resolves. Fades back out symmetrically on scroll-up. (Tunable knob.)
    return scrollY.interpolate({
      inputRange: [top - viewH * 0.6, top - viewH * 0.38],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }, [scrollY, viewH, top, exempt]);

  return (
    <Animated.View
      style={{ opacity }}
      onLayout={(e: LayoutChangeEvent) => {
        const y = e.nativeEvent.layout.y;
        setTop(y);
        onMeasure(y);
      }}
    >
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
    case 'staircase':
      return <StaircaseBlock steps={block.steps} direction={block.direction} />;
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
    case 'cipher':
      return (
        <Keypad
          letters
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
  content: { paddingHorizontal: 26, paddingTop: 30, paddingBottom: 120 },
});
