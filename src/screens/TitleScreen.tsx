// src/screens/TitleScreen.tsx
// The set, switched off. Everything in the game starts from this dark room.

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStoryUnlocked } from '../proAccess';
import { colors, fonts } from '../theme';

export default function TitleScreen({
  chapterOneStarted,
  chapterOneDone,
  receivedThrough,
  streak,
  todaySolved,
  onStory,
  onStoryTwo,
  onStoryThree,
  onStoryFour,
  onStoryFive,
  onStorySix,
  onDaily,
  onSettings,
}: {
  chapterOneStarted: boolean;
  chapterOneDone: boolean;
  /** Highest broadcast received in an unbroken run from one. */
  receivedThrough: number;
  streak: number;
  todaySolved: boolean;
  onStory: () => void;
  onStoryTwo: () => void;
  onStoryThree: () => void;
  onStoryFour: () => void;
  onStoryFive: () => void;
  onStorySix: () => void;
  onDaily: () => void;
  onSettings: () => void;
}) {
  const unlocked = useStoryUnlocked();
  const NOOP = () => {}; // a locked row is inert, not absent — it shows what is coming
  const LATER = [
    { id: 2, label: 'broadcast two', hint: 'the aerial' },
    { id: 3, label: 'broadcast three', hint: 'the instructions' },
    { id: 4, label: 'broadcast four', hint: 'the examination' },
    { id: 5, label: 'broadcast five', hint: 'the other listeners' },
    { id: 6, label: 'broadcast six', hint: 'ninety-one · three real nights' },
  ];
  const PRESS: Record<number, () => void> = {
    2: onStoryTwo, 3: onStoryThree, 4: onStoryFour, 5: onStoryFive, 6: onStorySix,
  };
  const WORD: Record<number, string> = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  };
  const storyLabel = chapterOneDone
    ? 'broadcast one · again'
    : chapterOneStarted
      ? 'broadcast one · resume'
      : 'broadcast one · begin';
  return (
    <View style={styles.root}>
      <Text style={styles.ident} maxFontSizeMultiplier={1.5}>· · · — — — · · ·</Text>
      <Text style={styles.title} maxFontSizeMultiplier={1.15}>NUMBER{'\n'}NINE</Text>
      <Text style={styles.sub} maxFontSizeMultiplier={1.2}>a story received, not read</Text>

      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menu}
        showsVerticalScrollIndicator={false}
      >
        <MenuRow label={storyLabel} hint="the story · chapter one is free" onPress={onStory} />
        {!unlocked && (
          <MenuRow
            label="broadcasts two — six · locked"
            hint="one purchase, no ads, ever"
            onPress={onStory}
            dim
          />
        )}
        {unlocked &&
          LATER.map(({ id, label, hint }) => {
            // Serial by design: each broadcast's puzzles cite the rules the
            // one before it taught, so the count runs in order.
            const open = receivedThrough >= id - 1;
            return (
              <MenuRow
                key={id}
                label={open ? label : `${label} · not yet`}
                hint={open ? hint : `receive broadcast ${WORD[id - 1]} first`}
                onPress={open ? PRESS[id] : NOOP}
                dim={!open}
              />
            );
          })}
        <MenuRow
          label={todaySolved ? 'tonight’s signal · received' : 'tonight’s signal'}
          hint={streak > 0 ? `${streak} night${streak === 1 ? '' : 's'} listening` : 'a fresh cipher every night'}
          onPress={onDaily}
        />
        <MenuRow label="the set" hint="settings · about" onPress={onSettings} />
      </ScrollView>

      <Text style={styles.footer} maxFontSizeMultiplier={1.3}>
        headphones recommended{'\n'}play in the dark
      </Text>
    </View>
  );
}

function MenuRow({
  label,
  hint,
  onPress,
  dim,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  dim?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, dim && { color: colors.faint }]} maxFontSizeMultiplier={1.25}>
        {label}
      </Text>
      <Text style={styles.rowHint} maxFontSizeMultiplier={1.25}>
        {hint}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 30, justifyContent: 'center' },
  ident: { fontFamily: fonts.mono, fontSize: 13, color: colors.faint, marginBottom: 18 },
  title: {
    fontFamily: fonts.mono,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: 10,
    color: colors.prose,
    marginBottom: 10,
  },
  sub: { fontFamily: fonts.serif, fontSize: 15, color: colors.muted, marginBottom: 48 },
  // The menu SCROLLS once the broadcasts outnumber the screen; the footer
  // stays put below it (device QA: the list ran onto the footer).
  menuScroll: { flexGrow: 0, maxHeight: '46%' },
  menu: { gap: 26, paddingBottom: 8 },
  row: {},
  rowLabel: { fontFamily: fonts.mono, fontSize: 15, letterSpacing: 2, color: colors.lockGlow },
  rowHint: { fontFamily: fonts.mono, fontSize: 11, color: colors.faint, marginTop: 4 },
  footer: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1,
    color: colors.faint,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
