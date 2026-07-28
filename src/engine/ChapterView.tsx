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
import type { Chapter, ChapterBlock, SceneId } from '../models';
import { cue, setStaticLevel, stopOneShot, stopSfx } from '../audio';
import { isGate, progressIndex, solvedGatesBefore, visibleCount } from './reveal';
import {
  ChapterCardBlock,
  ChapterEndBlock,
  ForkBlock,
  LogbookBlock,
  PlateBlock,
  ProseBlock,
  RoomBlock,
  RotatedBlock,
  StaircaseBlock,
  ThoughtBlock,
  VoiceBlock,
} from './blocks';
import { RadioTuner } from './RadioTuner';
import { Keypad } from './Keypad';
import { MelodyBox } from './MelodyBox';
import { Hotspot } from './Hotspot';
import { KnockBlock } from './KnockBlock';
import { FlipBlock } from './FlipBlock';
import { SealPlate } from './SealPlate';
import { LampBlock } from './LampBlock';
import { RotaryDial } from './RotaryDial';
import { ClockDial } from './ClockDial';
import { CompassBlock } from './CompassBlock';
import { SceneBackdrop } from './SceneBackdrop';
import { ProseReveal } from './ProseReveal';

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
  const geom = useRef({
    y: 0,
    viewH: 0,
    tops: new Map<number, number>(),
    heights: new Map<number, number>(),
    fired: new Set<number>(),
    // Blocks whose one-shot is (possibly) still sounding: stop-on-exit must
    // fire ONLY on the transition off-page. A long-gone block calling stop
    // every scroll tick silenced any LATER block sharing the same cue name
    // (the second staircase's footsteps died at birth).
    sounding: new Set<number>(),
  });

  // Room blocks that set an ambient backdrop, in order.
  const roomScenes = useMemo(
    () =>
      blocks.flatMap((b, i) =>
        b.kind === 'room' && b.scene ? [{ index: i, scene: b.scene }] : [],
      ),
    [blocks],
  );
  const [activeScene, setActiveScene] = useState<SceneId | null>(
    () => roomScenes[0]?.scene ?? null,
  );
  const activeRef = useRef<SceneId | null>(roomScenes[0]?.scene ?? null);

  const updateScene = () => {
    if (!roomScenes.length) return;
    const g = geom.current;
    // The active room is the last one whose label has scrolled into the
    // upper third of the screen.
    const line = g.y + g.viewH * 0.35;
    let scene = roomScenes[0].scene;
    for (const rs of roomScenes) {
      const top = g.tops.get(rs.index);
      if (top !== undefined && top <= line) scene = rs.scene;
    }
    if (scene !== activeRef.current) {
      activeRef.current = scene;
      setActiveScene(scene);
    }
  };

  // The static bed belongs to the RECEIVER, and only while it is on the
  // page: full while the set is untuned, a faint hiss once locked, gone when
  // the reader scrolls away. (A one-shot swell cue left it hissing forever.)
  const RECEIVER_SPAN = 380; // ≈ tuner widget height in pt
  const updateReceiverBed = () => {
    const g = geom.current;
    let level = 0;
    for (let i = 0; i < count; i++) {
      if (blocks[i].kind !== 'radio') continue;
      const top = g.tops.get(i);
      if (top === undefined) continue;
      const onScreen = top < g.y + g.viewH && top > g.y - RECEIVER_SPAN;
      if (onScreen) level = Math.max(level, solved.has(i) ? 0.04 : 0.18);
    }
    setStaticLevel(level);
  };

  // Diegetic one-shots that belong to a PLACE on the page (the study door,
  // the log's pages, the stairs, the sending key): they re-arm when the
  // reader scrolls away, so walking back through the space plays the space
  // again — from either direction.
  const REARM_CUES = useMemo(
    () => new Set(['key-unlock', 'page-turn', 'footsteps', 'morse-key']),
    [],
  );
  // cue -> gate indices whose solving stops that cue (e.g. answering the
  // telephone stops the ringing).
  const stoppedBy = useMemo(() => {
    const m = new Map<string, number[]>();
    blocks.forEach((b, i) => {
      if ('stopsCue' in b && b.stopsCue) m.set(b.stopsCue, [...(m.get(b.stopsCue) ?? []), i]);
    });
    return m;
  }, [blocks]);

  // Already-fired, place-bound block: the sound stops the moment its block
  // leaves the page (either direction) and re-arms right there — returning
  // to the place replays it, whether the reader comes from above or below.
  // Stop fires only on the TRANSITION off-page, so a long-gone block cannot
  // keep silencing a later block that shares the cue.
  const rearmOrStop = (i: number, cueName: string, top: number, _line: number) => {
    const g = geom.current;
    if (!REARM_CUES.has(cueName)) return;
    const h = g.heights.get(i) ?? 300;
    const offPage = top + h < g.y || top > g.y + g.viewH;
    if (!offPage) return;
    if (g.sounding.has(i)) {
      g.sounding.delete(i);
      stopOneShot(cueName);
    }
    g.fired.delete(i);
  };

  const fireCues = () => {
    const g = geom.current;
    if (g.viewH === 0) return;
    const line = g.y + g.viewH * 0.72;
    for (let i = 0; i < count; i++) {
      const b = blocks[i];
      if (!('cue' in b) || !b.cue) continue;
      const top = g.tops.get(i);
      if (top === undefined) continue;
      if (g.fired.has(i)) {
        rearmOrStop(i, b.cue, top, line);
        continue;
      }
      if (top > line) continue;
      g.fired.add(i);
      // Never (re)start a loop an already-solved gate was meant to stop —
      // on a re-read, the answered telephone must NOT ring forever.
      if (stoppedBy.get(b.cue)?.some((gi) => solved.has(gi))) continue;
      if (REARM_CUES.has(b.cue)) g.sounding.add(i);
      cue(b.cue);
    }
    updateReceiverBed();
    updateScene();
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
    const b = blocks[index];
    if (b && 'stopsCue' in b && b.stopsCue) stopSfx(b.stopsCue); // e.g. the ringing stops because you answered
    setSolved((prev) => {
      const next = new Set(prev);
      next.add(index);
      // Persist the first UNSOLVED gate index (progressIndex), NOT
      // visibleCount — the latter includes the pending gate and made resume
      // mark it solved (skipped puzzles after leaving mid-chapter).
      onAdvance(progressIndex(blocks, next));
      return next;
    });
  };

  const recordTop = (index: number) => (y: number, height?: number) => {
    geom.current.tops.set(index, y);
    if (height !== undefined) geom.current.heights.set(index, height);
    fireCues();
  };

  return (
    <View style={styles.root}>
      <SceneBackdrop sceneId={activeScene} />
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
        {blocks.slice(0, count).map((block, i) =>
          // Narration reveals line by line (its own scroll-driven opacity per
          // line); every other block reveals as a whole.
          block.kind === 'prose' ? (
            <ProseReveal
              key={i}
              text={block.text}
              faded={block.faded}
              scrollY={scrollY}
              viewH={viewH}
              onMeasure={recordTop(i)}
            />
          ) : (
            <BlockReveal
              key={i}
              scrollY={scrollY}
              viewH={viewH}
              exempt={isGate(block) || block.kind === 'chapterEnd'}
              onMeasure={recordTop(i)}
            >
              {renderBlock(block, i, solved.has(i), solveGate, onComplete)}
            </BlockReveal>
          ),
        )}
      </Animated.ScrollView>
    </View>
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
  onMeasure: (y: number, height?: number) => void;
  children: React.ReactNode;
}) {
  const [top, setTop] = useState<number | null>(null);
  const opacity = useMemo(() => {
    if (exempt) return 1 as unknown as Animated.AnimatedInterpolation<number>;
    if (top == null || viewH === 0)
      return 0 as unknown as Animated.AnimatedInterpolation<number>;
    // Ease-in matching the per-line prose reveal: invisible across the bottom,
    // resolves near mid-screen. 0% at the bottom edge, 100% at the middle.
    return scrollY.interpolate({
      inputRange: [top - viewH, top - viewH * 0.62, top - viewH * 0.5],
      outputRange: [0, 0.08, 1],
      extrapolate: 'clamp',
    });
  }, [scrollY, viewH, top, exempt]);

  return (
    <Animated.View
      style={{ opacity }}
      onLayout={(e: LayoutChangeEvent) => {
        const y = e.nativeEvent.layout.y;
        setTop(y);
        onMeasure(y, e.nativeEvent.layout.height);
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
    case 'plate':
      return <PlateBlock image={block.image} caption={block.caption} />;
    case 'chapterEnd':
      return <ChapterEndBlock title={block.title} onDone={onComplete} />;
    default:
      return renderGate(block, index, gateSolved, solveGate);
  }
}

/** The interactive gates, split out to keep renderBlock under the complexity cap. */
function renderGate(
  block: ChapterBlock,
  index: number,
  gateSolved: boolean,
  solveGate: (i: number) => void,
) {
  switch (block.kind) {
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
          solveCue={block.solveCue}
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
          solveCue={block.solveCue}
          solved={gateSolved}
          onSolved={() => solveGate(index)}
        />
      );
    case 'melody':
      return (
        <MelodyBox
          answer={block.answer}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          solved={gateSolved}
          onSolved={() => solveGate(index)}
        />
      );
    case 'hotspot':
      return (
        <Hotspot
          image={block.image}
          target={block.target}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          solved={gateSolved}
          onSolved={() => solveGate(index)}
        />
      );
    default:
      return renderInstrumentGate(block, index, gateSolved, solveGate);
  }
}

/** The Broadcast Two instrument gates — the phone's physical senses. */
function renderInstrumentGate(
  block: ChapterBlock,
  index: number,
  gateSolved: boolean,
  solveGate: (i: number) => void,
) {
  const common = { solved: gateSolved, onSolved: () => solveGate(index) };
  switch (block.kind) {
    case 'knock':
      return (
        <KnockBlock
          groups={block.groups}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          {...common}
        />
      );
    case 'seal':
      return (
        <SealPlate
          image={block.image}
          caption={block.caption}
          tornCaption={block.tornCaption}
          solveCue={block.solveCue}
          {...common}
        />
      );
    case 'flip':
      return (
        <FlipBlock
          front={block.front}
          back={block.back}
          targetWord={block.targetWord}
          prompt={block.prompt}
          backPrompt={block.backPrompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          {...common}
        />
      );
    case 'lamp':
      return (
        <LampBlock
          aboveText={block.aboveText}
          hiddenLine={block.hiddenLine}
          targetWord={block.targetWord}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          {...common}
        />
      );
    case 'rotary':
      return (
        <RotaryDial
          answer={block.answer}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          {...common}
        />
      );
    case 'clock':
      return (
        <ClockDial
          answerHour={block.answerHour}
          answerMinute={block.answerMinute}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          {...common}
        />
      );
    case 'compass':
      return (
        <CompassBlock
          targetDeg={block.targetDeg}
          toleranceDeg={block.toleranceDeg}
          prompt={block.prompt}
          unlockedText={block.unlockedText}
          solveCue={block.solveCue}
          {...common}
        />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: 26, paddingTop: 104, paddingBottom: 120 },
});
