// src/screens/TitleScreen.tsx
// The set, switched off. Everything in the game starts from this dark room.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStoryUnlocked } from '../proAccess';
import { colors, fonts } from '../theme';

export default function TitleScreen({
  chapterOneStarted,
  chapterOneDone,
  streak,
  todaySolved,
  onStory,
  onStoryTwo,
  onStoryThree,
  onStoryFour,
  onDaily,
  onSettings,
}: {
  chapterOneStarted: boolean;
  chapterOneDone: boolean;
  streak: number;
  todaySolved: boolean;
  onStory: () => void;
  onStoryTwo: () => void;
  onStoryThree: () => void;
  onStoryFour: () => void;
  onDaily: () => void;
  onSettings: () => void;
}) {
  const unlocked = useStoryUnlocked();
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

      <View style={styles.menu}>
        <MenuRow label={storyLabel} hint="the story · chapter one is free" onPress={onStory} />
        <MenuRow
          label={unlocked ? 'broadcast two' : 'broadcasts two — six · locked'}
          hint={unlocked ? 'the aerial' : 'one purchase, no ads, ever'}
          onPress={unlocked ? onStoryTwo : onStory}
          dim={!unlocked}
        />
        {unlocked && (
          <MenuRow label="broadcast three" hint="the instructions" onPress={onStoryThree} />
        )}
        {unlocked && (
          <MenuRow label="broadcast four" hint="the examination" onPress={onStoryFour} />
        )}
        <MenuRow
          label={todaySolved ? 'tonight’s signal · received' : 'tonight’s signal'}
          hint={streak > 0 ? `${streak} night${streak === 1 ? '' : 's'} listening` : 'a fresh cipher every night'}
          onPress={onDaily}
        />
        <MenuRow label="the set" hint="settings · about" onPress={onSettings} />
      </View>

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
  menu: { gap: 26 },
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
