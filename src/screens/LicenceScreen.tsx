// src/screens/LicenceScreen.tsx
// THE LICENCE. The one thing this app sells, framed as the thing it actually
// is in the fiction: Halloran's wireless receiving licence, No. 46-25, marked
// RENEW BY JUNE and never renewed. You are not buying chapters. You are taking
// over the licence he let lapse.
//
// The framing is atmosphere; the commerce underneath it is not. App Review and
// the reader both need the same facts unmissable on this screen — what is
// bought, what it costs in the reader's own currency, that it is one payment
// and not a subscription, and a way to restore a purchase already made. None
// of that is ever softened for the sake of the voice.
//
// This screen is unreachable in a fail-open build: with no native module or a
// placeholder key the story is already unlocked and nothing links here.

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BodyText, ChromeText } from '../engine/ui';
import {
  getLicenceOffer,
  renewLicence,
  restorePurchases,
  useStoryUnlocked,
  type LicenceOffer,
} from '../proAccess';
import { amberGlow, colors, fonts } from '../theme';

type Status = 'idle' | 'working' | 'refused' | 'nothing-to-restore';

export default function LicenceScreen({
  onBack,
  onRenewed,
}: {
  onBack: () => void;
  onRenewed: () => void;
}) {
  // Reachable by deep link (numbernine://screen/licence) and shown again for
  // a moment after a renewal, so it must be honest about a licence already
  // held rather than offering to sell it twice.
  const held = useStoryUnlocked();
  const [offer, setOffer] = useState<LicenceOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    let live = true;
    getLicenceOffer()
      .then((o) => live && setOffer(o))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const renew = async () => {
    if (!offer || status === 'working') return;
    setStatus('working');
    const res = await renewLicence(offer.pkg);
    if (res === 'renewed') {
      onRenewed();
      return;
    }
    // A reader who changes their mind gets nothing said to them at all.
    setStatus(res === 'cancelled' ? 'idle' : 'refused');
  };

  const restore = async () => {
    if (status === 'working') return;
    setStatus('working');
    const ok = await restorePurchases();
    if (ok) {
      onRenewed();
      return;
    }
    setStatus('nothing-to-restore');
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <ChromeText style={styles.back}>‹ the set</ChromeText>
        </Pressable>
        <ChromeText style={styles.title} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          THE LICENCE
        </ChromeText>
        <View style={{ width: 52 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* The artefact. Straight out of B1's probate inventory. */}
        <View style={styles.certificate}>
          <ChromeText style={styles.certHead} allowFontScaling={false}>
            WIRELESS RECEIVING LICENCE
          </ChromeText>
          <View style={styles.rule} />
          <CertRow label="No." value="46-25" />
          <CertRow label="Issued to" value="H. MARSH" />
          <CertRow label="Station" value="THE MARSH HOUSE" />
          <CertRow label="Marked" value="RENEW BY JUNE" />
          <CertRow label="Status" value="LAPSED" danger />
        </View>

        <BodyText style={styles.prose} maxFontSizeMultiplier={1.4}>
          His brother let it run out. The set goes on receiving regardless — it
          has never much cared whose name is on the paper — but the rest of the
          count is not addressed to a man without a licence.
        </BodyText>
        <BodyText style={styles.aside} maxFontSizeMultiplier={1.4}>
          Put your own name to it, and she will go on.
        </BodyText>

        <View style={styles.rule} />

        {/* The commerce. Plain, complete, and never dressed up. */}
        <ChromeText style={styles.label} allowFontScaling={false}>What renewing grants</ChromeText>
        <BodyText style={styles.plain} maxFontSizeMultiplier={1.4}>
          Broadcasts Two, Three, Four, Five and Six — the rest of the story,
          about six hours of it, and every puzzle in them.
        </BodyText>
        <BodyText style={styles.plain} maxFontSizeMultiplier={1.4}>
          One payment. Not a subscription, and it never renews itself.
          Broadcast One and Tonight’s Signal stay free forever, as they are now.
        </BodyText>
        <BodyText style={styles.plain} maxFontSizeMultiplier={1.4}>
          No advertising. No tracking. The whole thing works offline.
        </BodyText>

        {held ? (
          <BodyText style={styles.heldNote} maxFontSizeMultiplier={1.4}>
            The licence stands in your name. Nothing further is owed, and
            nothing here will charge you again.
          </BodyText>
        ) : loading ? (
          <ActivityIndicator color={colors.dial} style={{ marginTop: 26 }} />
        ) : offer ? (
          <Pressable
            style={[styles.renew, status === 'working' && styles.renewBusy]}
            onPress={renew}
            disabled={status === 'working'}
          >
            <ChromeText style={styles.renewText} allowFontScaling={false}>
              {status === 'working' ? 'ON THE LINE…' : `RENEW THE LICENCE · ${offer.price}`}
            </ChromeText>
          </Pressable>
        ) : (
          <BodyText style={styles.unavailable} maxFontSizeMultiplier={1.4}>
            The exchange is not answering. The licence cannot be renewed just
            now — no charge has been made. Try again when you have a signal.
          </BodyText>
        )}

        {!held && (
        <Pressable onPress={restore} hitSlop={10} disabled={status === 'working'}>
          <ChromeText style={styles.restore}>
            already renewed it? restore
          </ChromeText>
        </Pressable>
        )}

        {status === 'refused' && (
          <BodyText style={styles.refused} maxFontSizeMultiplier={1.4}>
            The renewal did not go through, and nothing has been charged.
          </BodyText>
        )}
        {status === 'nothing-to-restore' && (
          <BodyText style={styles.refused} maxFontSizeMultiplier={1.4}>
            No previous renewal was found for this Apple Account.
          </BodyText>
        )}

        <ChromeText style={styles.footnote}>
          Payment is charged to your Apple Account at confirmation. A renewal
          carries to every device signed in to the same account.
        </ChromeText>
      </ScrollView>
    </View>
  );
}

function CertRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.certRow}>
      <ChromeText style={styles.certLabel} allowFontScaling={false}>{label}</ChromeText>
      <ChromeText
        style={[styles.certValue, danger && { color: colors.danger }]}
        allowFontScaling={false}
      >
        {value}
      </ChromeText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 62 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
  },
  back: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  title: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 3, color: colors.prose },
  body: { paddingHorizontal: 26, paddingBottom: 60 },

  certificate: {
    marginTop: 30,
    borderColor: colors.panelBorder,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.panel,
    padding: 18,
  },
  certHead: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.muted,
    textAlign: 'center',
  },
  certRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  certLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.faint },
  certValue: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.prose },

  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginVertical: 16,
  },

  prose: {
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 28,
    color: colors.prose,
    marginTop: 22,
  },
  aside: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.proseFaded,
    textAlign: 'center',
    marginTop: 18,
  },

  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.faint,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  plain: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 25,
    color: colors.prose,
    marginBottom: 12,
  },

  renew: {
    marginTop: 22,
    borderColor: colors.dial,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  renewBusy: { opacity: 0.5 },
  renewText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.dial,
    ...amberGlow,
  },
  restore: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  heldNote: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 26,
    color: colors.lockGlow,
    marginTop: 24,
    textAlign: 'center',
  },
  unavailable: {
    fontFamily: fonts.serif,
    fontSize: 14,
    lineHeight: 24,
    color: colors.proseFaded,
    marginTop: 22,
  },
  refused: {
    fontFamily: fonts.serif,
    fontSize: 14,
    lineHeight: 24,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 18,
  },
  footnote: {
    fontFamily: fonts.mono,
    fontSize: 9,
    lineHeight: 16,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 30,
  },
});
