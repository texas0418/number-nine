// src/screens/SettingsScreen.tsx
// "The set": about, restore purchases, and the one destructive control
// (reset story progress) behind a confirm.

import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { resetProgress } from '../db';
import { restorePurchases, useStoryUnlocked } from '../proAccess';
import { openSociety } from '../society';
import { colors, fonts } from '../theme';

export default function SettingsScreen({
  onBack,
  onCredits,
}: {
  onBack: () => void;
  onCredits: () => void;
}) {
  const unlocked = useStoryUnlocked();

  const confirmReset = () =>
    Alert.alert('Reset the story?', 'Broadcast progress is erased. The nightly signal log is kept.', [
      { text: 'Keep listening', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetProgress() },
    ]);

  const restore = async () => {
    const ok = await restorePurchases();
    Alert.alert(ok ? 'Restored' : 'Nothing to restore', ok ? 'The story is unlocked.' : 'No previous purchase was found.');
  };

  // Framed before it opens, for two reasons: help is a thing a listener
  // should choose deliberately (the archive grades itself, but the door
  // should still be a door), and it leaves the app for a browser.
  const society = () =>
    Alert.alert(
      'The Listeners’ Society',
      'A circle of listeners keeps notes on every broadcast. They open in three stages — where to listen, then a member saying it plainly, and only then the answer.\n\nIt opens outside the app.',
      [
        { text: 'Not yet', style: 'cancel' },
        { text: 'Open', onPress: () => void openSociety() },
      ],
    );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back} maxFontSizeMultiplier={1.3}>‹ the set</Text>
        </Pressable>
        <Text style={styles.title} maxFontSizeMultiplier={1.2} numberOfLines={1}>THE SET</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.rows}>
        <Row label={unlocked ? 'story unlocked' : 'restore purchases'} onPress={restore} />
        <Row label="the listeners’ society" onPress={society} />
        <Row label="credits" onPress={onCredits} />
        <Row label="reset story progress" onPress={confirmReset} danger />
      </View>

      <Text style={styles.about}>
        Number Nine is a story you receive, not read.{'\n'}
        Headphones on. Lights off. One broadcast a night.{'\n\n'}
        No ads. No tracking. The nightly signal is free forever.
      </Text>
    </View>
  );
}

function Row({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowText, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 62, paddingHorizontal: 26 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 3, color: colors.prose },
  rows: { marginTop: 44, gap: 26 },
  row: {},
  rowText: { fontFamily: fonts.mono, fontSize: 14, letterSpacing: 1, color: colors.lockGlow },
  about: {
    marginTop: 'auto',
    marginBottom: 50,
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 20,
    color: colors.faint,
    textAlign: 'center',
  },
});
