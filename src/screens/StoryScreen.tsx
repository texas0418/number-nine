// src/screens/StoryScreen.tsx
// Hosts the typographic engine for one chapter, persisting the furthest
// revealed block so the reader resumes exactly at the locked door they left.

import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Chapter } from '../models';
import { ChapterView } from '../engine/ChapterView';
import { BROADCAST_ONE } from '../chapters/broadcast1';
import { BROADCAST_TWO } from '../chapters/broadcast2';
import { BROADCAST_THREE } from '../chapters/broadcast3';
import { getProgress, saveProgress } from '../db';
import { setStaticLevel, stopAllLoops } from '../audio';
import { colors, fonts } from '../theme';

const CHAPTERS: Record<number, Chapter> = {
  [BROADCAST_ONE.id]: BROADCAST_ONE,
  [BROADCAST_TWO.id]: BROADCAST_TWO,
  [BROADCAST_THREE.id]: BROADCAST_THREE,
};

export default function StoryScreen({
  chapterId = 1,
  onBack,
}: {
  chapterId?: number;
  onBack: () => void;
}) {
  const chapter = CHAPTERS[chapterId] ?? BROADCAST_ONE;
  const [initial] = useState(() => getProgress(chapter.id)?.blockIndex ?? 0);

  // Leaving the page silences the page: no ringing phone or marsh wind may
  // follow the reader back to the title screen.
  useEffect(() => () => stopAllLoops(), []);

  const advance = useCallback(
    (blockIndex: number) =>
      saveProgress({ chapterId: chapter.id, blockIndex, completedMs: null }),
    [chapter.id],
  );

  const complete = useCallback(() => {
    saveProgress({
      chapterId: chapter.id,
      blockIndex: chapter.blocks.length,
      completedMs: Date.now(),
    });
    setStaticLevel(0);
    onBack();
  }, [chapter, onBack]);

  return (
    <View style={styles.root}>
      {/* ChapterView fills the whole screen so the room backdrop is full-bleed
          behind everything; the header floats over it. */}
      <ChapterView
        chapter={chapter}
        initialBlockIndex={initial}
        onAdvance={advance}
        onComplete={complete}
      />
      <View style={styles.header} pointerEvents="box-none">
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back} maxFontSizeMultiplier={1.3}>‹ the set</Text>
        </Pressable>
        <Text style={styles.title} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {chapter.title}
        </Text>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 62,
    paddingBottom: 14,
  },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.faint,
  },
  spacer: { width: 44 },
});
