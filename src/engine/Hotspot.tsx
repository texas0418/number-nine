// src/engine/Hotspot.tsx
// The OBSERVATION puzzle: a photograph with a secret. Touch the detail that
// doesn't belong. Wrong touches get a dull knock and nothing else — the
// reader must actually LOOK. (DEVICE 6 rules: noticing is the key.)

import { useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SceneId } from '../models';
import { SCENES } from './scenes';
import { cue, playSfx } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

export function Hotspot({
  image,
  target,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  image: SceneId;
  target: { x: number; y: number; w: number; h: number };
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const tap = (e: GestureResponderEvent) => {
    if (done || size.w === 0) return;
    const nx = e.nativeEvent.locationX / size.w;
    const ny = e.nativeEvent.locationY / size.h;
    const hit =
      nx >= target.x && nx <= target.x + target.w &&
      ny >= target.y && ny <= target.y + target.h;
    if (hit) {
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    } else {
      // a dull knock on the wrong spot; the room absorbs it
      playSfx('knock', 0.7);
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={tap}
        style={styles.frame}
        onLayout={(e: LayoutChangeEvent) =>
          setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        <Image source={SCENES[image]} resizeMode="cover" style={styles.img} />
        {done && (
          <View
            pointerEvents="none"
            style={[
              styles.reveal,
              {
                left: `${target.x * 100}%`,
                top: `${target.y * 100}%`,
                width: `${target.w * 100}%`,
                height: `${target.h * 100}%`,
              },
            ]}
          />
        )}
      </Pressable>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  frame: {
    width: '86%',
    aspectRatio: 0.72,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    overflow: 'hidden',
    backgroundColor: colors.panel,
  },
  img: { width: '100%', height: '100%' },
  reveal: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: colors.dial,
    borderRadius: 6,
  },
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
