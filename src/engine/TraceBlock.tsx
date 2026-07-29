// src/engine/TraceBlock.tsx
/* eslint-disable react-hooks/refs -- trace progress lives in refs read by
   the once-created PanResponder; render reads mirrored useState values. */
// TRACE THE CIRCUIT (B4): terminals on a tag-strip; one unbroken drag must
// visit them in the order the clues dictate. Touch a wrong terminal and it
// SPARKS — heavy haptic, a snap, the static swells — and the path dies.
// Lifting the finger mid-way loses the path quietly. The order is never
// printed here; it is deduced (chapter clues), so this is a deduction gate
// expressed through the hand, not typing.

import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { cue, playSfx, setStaticLevel } from '../audio';
import { colors, fonts } from '../theme';

let Haptics: any | null = null;
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

const PANEL = 260;
const NODE_R = 24; // touch radius around a terminal

export function TraceBlock({
  nodes,
  order,
  prompt,
  unlockedText,
  solved,
  onSolved,
  solveCue = 'unlock',
}: {
  nodes: string[];
  order: number[];
  prompt: string;
  unlockedText: string;
  solved: boolean;
  onSolved: () => void;
  solveCue?: string;
}) {
  const [done, setDone] = useState(solved);
  const [claimed, setClaimed] = useState<number[]>([]);
  const state = useRef({ done: solved, claimed: [] as number[] });

  // Terminals around a ring, first at 12 o'clock.
  const positions = useMemo(
    () =>
      nodes.map((_, i) => {
        const a = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
        const r = PANEL / 2 - 34;
        return {
          x: PANEL / 2 + r * Math.cos(a),
          y: PANEL / 2 + r * Math.sin(a),
        };
      }),
    [nodes],
  );

  const nearestNode = (x: number, y: number): number | null => {
    let best = -1;
    let bestD = NODE_R;
    positions.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best >= 0 ? best : null;
  };

  const reset = () => {
    state.current.claimed = [];
    setClaimed([]);
  };

  const spark = () => {
    playSfx('spark', 0.6);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
    setStaticLevel(0.22);
    setTimeout(() => setStaticLevel(0.05), 450);
    reset();
  };

  const visit = (node: number | null) => {
    const s = state.current;
    if (s.done || node === null) return;
    if (s.claimed.includes(node)) return; // sliding back over the path is free
    const expected = order[s.claimed.length];
    if (node !== expected) {
      spark();
      return;
    }
    s.claimed = [...s.claimed, node];
    setClaimed(s.claimed);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Rigid);
    if (s.claimed.length === order.length) {
      s.done = true;
      setDone(true);
      cue(solveCue);
      Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      onSolved();
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.done,
        onMoveShouldSetPanResponder: () => !state.current.done,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e) => {
          reset();
          visit(nearestNode(e.nativeEvent.locationX, e.nativeEvent.locationY));
        },
        onPanResponderMove: (e) => {
          visit(nearestNode(e.nativeEvent.locationX, e.nativeEvent.locationY));
        },
        onPanResponderRelease: () => {
          if (!state.current.done) reset(); // a broken path is no path
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positions],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.panel} {...(done ? {} : pan.panHandlers)}>
        {nodes.map((label, i) => {
          const lit = done || claimed.includes(i);
          return (
            <View
              key={i}
              pointerEvents="none"
              style={[
                styles.node,
                { left: positions[i].x - 16, top: positions[i].y - 16 },
                lit && styles.nodeLit,
              ]}
            >
              <Text
                style={[styles.nodeLabel, lit && { color: colors.dial }]}
                allowFontScaling={false}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.caption} maxFontSizeMultiplier={1.3}>
        {done ? unlockedText : prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 24 },
  panel: {
    width: PANEL,
    height: PANEL,
    borderRadius: 12,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  node: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLit: { borderColor: colors.dialDim },
  nodeLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
  },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
