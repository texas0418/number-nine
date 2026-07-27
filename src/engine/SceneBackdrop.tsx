// src/engine/SceneBackdrop.tsx
// The ambient room backdrop: a full-screen image that lives BEHIND the prose
// and cross-fades when the reader moves from one room to the next. The art is
// pre-darkened (max luminance ~60), so even at half opacity it reads as an
// impression of the room without ever competing with the text; a faint scrim
// guarantees contrast regardless of what's under a given paragraph.

import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { SceneId } from '../models';
import { SCENES } from './scenes';
import { colors } from '../theme';

// Real photography is delivered properly exposed (and already dark/moody), so
// it shows at high opacity; a top scrim band protects the reading zone where
// the first lines of each room sit over lighter wall.
const BASE_OPACITY = 0.72;

export function SceneBackdrop({ sceneId }: { sceneId: SceneId | null }) {
  const [shown, setShown] = useState<SceneId | null>(sceneId);
  const [opacity] = useState(() => new Animated.Value(sceneId ? BASE_OPACITY : 0));

  useEffect(() => {
    if (sceneId === shown) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setShown(sceneId);
      if (sceneId) {
        Animated.timing(opacity, {
          toValue: BASE_OPACITY,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [sceneId, shown, opacity]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {shown && (
        <Animated.Image
          source={SCENES[shown]}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { opacity }]}
        />
      )}
      <View style={styles.scrim} />
      {/* Faux top gradient (stacked bands, no gradient lib): darkens the upper
          reading zone so first lines stay crisp over lighter wall. */}
      <View style={[styles.band, styles.band1]} />
      <View style={[styles.band, styles.band2]} />
      <View style={[styles.band, styles.band3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    opacity: 0.14,
  },
  band: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.bg },
  band1: { height: '22%', opacity: 0.5 },
  band2: { height: '34%', opacity: 0.3 },
  band3: { height: '48%', opacity: 0.18 },
});
