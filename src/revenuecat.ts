// src/revenuecat.ts
// RevenueCat config for Number Nine. Keys are placeholders until the app has
// an App Store Connect record + RevenueCat project (pre-ship checklist).
// While placeholders are in place, proAccess.ts fails OPEN (story unlocked).

import { Platform } from 'react-native';

export const ENTITLEMENT_ID = 'story';
export const PRODUCT_ID = 'nn_story_unlock';

const IOS_KEY = 'REVENUECAT_IOS_KEY_PLACEHOLDER';
const ANDROID_KEY = 'REVENUECAT_ANDROID_KEY_PLACEHOLDER';

export const keyForPlatform = (): string =>
  Platform.OS === 'android' ? ANDROID_KEY : IOS_KEY;

export const isPlaceholderKey = (key: string): boolean =>
  key.includes('PLACEHOLDER');
