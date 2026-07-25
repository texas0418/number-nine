// src/screens/GalleryScreen.tsx
// DEV-ONLY layout gallery, reachable exclusively via the deep link
// numbernine://screen/gallery — never linked from the UI. Renders every
// engine block kind at once (gates pre-solved where needed) so layout can be
// audited on device/simulator at any Dynamic Type size without playing
// through the chapter.

import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
} from '../engine/blocks';
import { RadioTuner } from '../engine/RadioTuner';
import { Keypad } from '../engine/Keypad';
import { colors, fonts } from '../theme';

const noop = () => {};

export default function GalleryScreen({ onBack }: { onBack: () => void }) {
  // Auto-scroll one viewport every few seconds so headless layout audits
  // (simctl screenshots) can capture the whole gallery without touch input.
  const scroll = useRef<ScrollView>(null);
  const offset = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => {
      offset.current += 640;
      scroll.current?.scrollTo({ y: offset.current, animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <ScrollView ref={scroll} style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.header} onPress={onBack}>
        ‹ gallery (dev) · every block kind
      </Text>
      <Label text="chapter card" />
      <ChapterCardBlock number="BROADCAST ONE" title="The Licence" />
      <Label text="room label" />
      <RoomBlock text="The Cellar" />
      <Label text="thought" />
      <ThoughtBlock text="He had not told the radio his name." />
      <Label text="prose" />
      <ProseBlock text="The parcel arrived on a Tuesday, six weeks after the funeral: a shortwave receiver wrapped in oilcloth, and a logbook with water-swollen pages." />
      <Label text="prose · faded" />
      <ProseBlock faded text="Upstairs, faintly, the telephone began to ring." />
      <Label text="logbook" />
      <LogbookBlock
        lines={[
          'LISTENING LOG — H. MARSH',
          '11 JUNE 63 — 2314 — ident, then counting. 90 groups.',
          'margin, smaller hand: her words arrive turned around',
        ]}
      />
      <Label text="rotated · down (long — must not clip at any text size)" />
      <RotatedBlock text="The cellar stairs went down eleven steps, and the dark came up to meet him at the sixth, and from below — faint, patient, already switched on — something was humming in six notes." />
      <Label text="rotated · up" />
      <RotatedBlock
        direction="up"
        text="He took the stairs two at a time with the cold peeling off him, eleven steps up into the hall."
      />
      <Label text="voice · upside down" />
      <VoiceBlock mirrored={false} text="NINE. NINE. NINE. GOOD EVENING, LISTENER." />
      <Label text="voice · mirrored" />
      <VoiceBlock mirrored text="FIVE. NINE. TWO. EDWIN." />
      <Label text="fork" />
      <ForkBlock
        leftLabel="READ THE LOG"
        left="He opened the logbook to the blank fourteenth of June, and found it was not blank anymore."
        rightLabel="SEARCH THE BENCH"
        right="Under the bench, a biscuit tin: ninety index cards, each a night."
        join="Either way, the arithmetic was the same."
        onChosen={noop}
      />
      <Label text="radio tuner · unsolved" />
      <RadioTuner
        bandLowKhz={4400}
        bandHighKhz={4800}
        targetKhz={4625}
        lockedText="drag to tune · the static thins where the carrier is"
        unlockedText="carrier locked · she is singing"
        solved={false}
        onSolved={noop}
      />
      <Label text="radio tuner · solved" />
      <RadioTuner
        bandLowKhz={4400}
        bandHighKhz={4800}
        targetKhz={4625}
        lockedText=""
        unlockedText="carrier locked · she is singing"
        solved
        onSolved={noop}
      />
      <Label text="keypad · unsolved" />
      <Keypad
        answer="295"
        prompt="the telephone · dial what she said"
        unlockedText="the line clicks open"
        solved={false}
        onSolved={noop}
      />
      <Label text="chapter end" />
      <ChapterEndBlock title="END OF BROADCAST ONE" onDone={onBack} />
    </ScrollView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <View style={styles.labelWrap}>
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 26, paddingTop: 62, paddingBottom: 80 },
  header: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, marginBottom: 24 },
  labelWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.panelBorder,
    paddingTop: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.dialDim },
});
