// src/engine/ui.tsx
// Text with explicit Dynamic Type ceilings (theme.TYPE_CAPS). Use these
// instead of raw <Text>: Text.defaultProps is silently dead under React 19,
// so caps must ride every component (max-type sweep, 2026-08-02).
// Explicit maxFontSizeMultiplier / allowFontScaling props at a call site
// override the surface cap — the spread wins.
// (No TextInput wrapper: the game has no TextInput; entry is via widgets.)

import { Text, type TextProps } from 'react-native';

import { TYPE_CAPS } from '../theme';

/** The set's furniture: headers, back links, labels, buttons, captions. */
export const ChromeText = (props: TextProps) => (
  <Text maxFontSizeMultiplier={TYPE_CAPS.chrome} {...props} />
);

/** The book: story prose, thoughts, voices, reveals. Scales generously. */
export const BodyText = (props: TextProps) => (
  <Text maxFontSizeMultiplier={TYPE_CAPS.body} {...props} />
);

/** Puzzle mechanism blocks (src/engine): tight cap — alignment IS the
 *  puzzle. Text that is drawn geometry also passes allowFontScaling. */
export const MechText = (props: TextProps) => (
  <Text maxFontSizeMultiplier={TYPE_CAPS.mechanism} {...props} />
);

/** Text captured into a fixed-size image (the share card): never scales. */
export const FixedText = (props: TextProps) => (
  <Text maxFontSizeMultiplier={TYPE_CAPS.fixed} {...props} />
);
