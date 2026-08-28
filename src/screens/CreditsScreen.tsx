// src/screens/CreditsScreen.tsx
// Who made the sounds. Reached from "the set", not the title screen: a reader
// arriving at the book should meet the book, and anyone who wants the colophon
// will look where the settings are.
//
// The music licence does NOT require attribution (Tim Beek Premium, purchased
// 2026-07-28, see CREDITS.md). This page exists because crediting someone whose
// work carries the whole opening is worth doing when nobody is making you.
//
// Links open outside the app and fail silently, exactly as the Society link
// does: the app is fully playable offline and a reader with no signal should
// get nothing rather than an error.

import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ChromeText } from '../engine/ui';
import { colors, fonts } from '../theme';

const open = (url: string) => {
  void Linking.openURL(url).catch(() => {});
};

function Credit({
  role,
  name,
  detail,
  url,
}: {
  role: string;
  name: string;
  detail?: string;
  url?: string;
}) {
  return (
    <View style={styles.entry}>
      <ChromeText style={styles.role}>{role}</ChromeText>
      <ChromeText style={styles.name} maxFontSizeMultiplier={1.4}>
        {name}
      </ChromeText>
      {detail ? (
        <ChromeText style={styles.detail} maxFontSizeMultiplier={1.4}>
          {detail}
        </ChromeText>
      ) : null}
      {url ? (
        <Pressable onPress={() => open(url)} hitSlop={10}>
          <ChromeText style={styles.link}>
            {url.replace(/^https?:\/\//, '')}
          </ChromeText>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function CreditsScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <ChromeText style={styles.back}>‹ the set</ChromeText>
        </Pressable>
        <ChromeText style={styles.title} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          CREDITS
        </ChromeText>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Credit
          role="Theme music"
          name="“Ghost” by Tim Beek"
          detail="Licensed for commercial use. Attribution is not required; it is offered."
          url="https://timbeek.com"
        />

        <View style={styles.rule} />

        <Credit
          role="Her voice, and the station"
          name="Recorded by Simon Shih"
          detail="Every line she speaks, and the digits she counts, are recordings rather than synthesis."
        />

        <Credit
          role="Sound"
          name="Cut and treated from royalty-free recordings"
          detail="Shortwave static, the GPO speaking-clock pips, a rotary dial, a morse key, marsh wind, the pipes, and the rest of the house."
        />

        <Credit
          role="Additional sound"
          name="Generated for this book"
          detail="The six-note ident, the music-box bells, the telephone, and the lamp going out."
        />

        <View style={styles.rule} />

        <ChromeText style={styles.colophon} maxFontSizeMultiplier={1.4}>
          Number Nine was written, recorded and built by one person. The
          Listeners’ Society, which keeps the clues, is a fiction. So is the
          station, though it keeps better hours than most of us.
        </ChromeText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // The horizontal padding lives on the CONTENT, not the root. With it on the
  // root the ScrollView was inset too, which put its indicator exactly on the
  // right edge of the text (device, 2026-07-30). Full-width scroller, padded
  // content: the indicator now rides in the margin where it belongs.
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 62 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22 },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  spacer: { width: 52 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.prose,
  },
  body: { paddingTop: 30, paddingBottom: 60, paddingHorizontal: 22 },
  entry: { marginBottom: 26 },
  role: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.faint,
    marginBottom: 7,
  },
  name: { fontFamily: fonts.serif, fontSize: 17, color: colors.prose },
  detail: {
    fontFamily: fonts.serif,
    fontSize: 14,
    lineHeight: 22,
    color: colors.proseFaded,
    marginTop: 6,
  },
  link: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.dial,
    marginTop: 8,
  },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginBottom: 26 },
  colophon: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 23,
    color: colors.proseFaded,
    textAlign: 'center',
  },
});
