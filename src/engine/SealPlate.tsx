// src/engine/SealPlate.tsx
// A sealed thing set into the page — the reveal stops at it until the reader
// tears it open. One tap, an act rather than a puzzle (the fork's cousin):
// the paper rips, the caption turns over, and the page continues below.

import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SceneId } from '../models';
import { SCENES } from './scenes';
import { cue } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export function SealPlate({
  image,
  caption,
  tornCaption,
  solved,
  onSolved,
  solveCue = 'letter-tear',
}: {
  image: SceneId;
  caption: string;
  tornCaption: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [torn, setTorn] = useState(solved);

  const tear = () => {
    if (torn) return;
    setTorn(true);
    cue(solveCue);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
    onSolved();
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={tear} style={styles.frame} disabled={torn}>
        <Image source={SCENES[image]} resizeMode="cover" style={[styles.img, !torn && styles.imgSealed]} />
      </Pressable>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {torn ? tornCaption : caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  frame: {
    width: '72%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    overflow: 'hidden',
    backgroundColor: colors.panel,
  },
  img: { width: '100%', height: '100%' },
  imgSealed: { opacity: 0.88 }, // unopened things sit a shade darker on the page
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
