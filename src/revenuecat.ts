// src/revenuecat.ts
// RevenueCat config for Number Nine. The ONE product: the licence — Broadcasts
// Two through Six. Broadcast One and the nightly signal are free forever.
//
// WHILE THE KEYS BELOW ARE PLACEHOLDERS THE STORY IS FREE. proAccess.ts fails
// OPEN by design, so a build that cannot reach RevenueCat never hides a
// chapter behind a wall the reader cannot pay through. That is correct in
// development and fatal at launch: shipping with a placeholder gives the paid
// chapters away.
//
// TO GO LIVE (the parts only a human with the accounts can do):
//
//   App Store Connect
//     1. App record for com.numbernine.app.
//     2. Paid Applications agreement — tax and banking ACTIVE. Nothing can be
//        sold until it is, and the IAP will not even load without it.
//     3. In-app purchase `nn_story_unlock`, type NON-CONSUMABLE, at the $5.99
//        tier, with a review screenshot and description.
//     4. A Sandbox tester account (Users and Access → Sandbox). A purchase
//        cannot be tested without one, and never test with a real Apple ID.
//
//   RevenueCat
//     5. Project, then an App Store app pointed at com.numbernine.app.
//     6. Give it the App Store Connect in-app purchase key so it can verify
//        receipts server-side.
//     7. Entitlement id EXACTLY `story` — ENTITLEMENT_ID below is what the app
//        checks, and a mismatch reads as "not purchased" forever.
//     8. Attach product `nn_story_unlock` to that entitlement, and put it in
//        the CURRENT Offering. getLicenceOffer takes the first package of the
//        current offering; with no offering there is nothing to sell and the
//        licence screen says so.
//     9. Copy the iOS PUBLIC SDK key (`appl_...`) into IOS_KEY below. It is
//        publishable and designed to ship inside the binary — it is not the
//        secret key, which must never be in this repo.
//
//   Then verify, on a real device with the sandbox account:
//     · the licence screen shows a real localised price
//     · a purchase unlocks Broadcast Two and survives a relaunch
//     · deleting and reinstalling, then "restore", unlocks it again
//     · declining the purchase says nothing and charges nothing

import { Platform } from 'react-native';

export const ENTITLEMENT_ID = 'story';
export const PRODUCT_ID = 'nn_story_unlock';

const IOS_KEY = 'appl_AIRpeyCjFESLdxpceHHyeXRUlfH';
const ANDROID_KEY = 'REVENUECAT_ANDROID_KEY_PLACEHOLDER';

export const keyForPlatform = (): string =>
  Platform.OS === 'android' ? ANDROID_KEY : IOS_KEY;

export const isPlaceholderKey = (key: string): boolean =>
  key.includes('PLACEHOLDER');
