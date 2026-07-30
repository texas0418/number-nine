// src/proAccess.ts
// Fail-open story gate for Number Nine. The one product: unlocking Broadcasts
// Two through Six. Broadcast One and the nightly signal are free forever.
//
// HOUSE RULE: if react-native-purchases is not in the running build (Expo Go, or a
// build without the native module) OR the RevenueCat key is still a placeholder, the
// story is UNLOCKED. Never hide a chapter behind a wall the player cannot pay through.

import { useSyncExternalStore } from 'react';
import {
  ENTITLEMENT_ID,
  isPlaceholderKey,
  keyForPlatform,
} from './revenuecat';

type Listener = (unlocked: boolean) => void;

// Placeholder-key builds are BORN unlocked — no init race can ever show the
// paid chapters as locked (QA: after a stressed force-quit relaunch, the
// title briefly gated Broadcast Two).
let unlocked = isPlaceholderKey(keyForPlatform());
let initialized = false;
let failOpen = unlocked; // true once we decide RC can't gate (no native module / placeholder key)
const listeners = new Set<Listener>();

function setUnlocked(next: boolean): void {
  if (next === unlocked) return;
  unlocked = next;
  listeners.forEach((l) => l(unlocked));
}

// Lazy, guarded access to the native SDK. Returns null when it isn't in this build.
function getPurchases(): any | null {
  try {
    // require (not a static import) so a missing native module can't crash module load.
    const mod = require('react-native-purchases');
    return mod?.default ?? mod ?? null;
  } catch {
    return null;
  }
}

export function initPurchases(): void {
  if (initialized) return;
  initialized = true;
  const key = keyForPlatform();
  const Purchases = getPurchases();
  if (!Purchases || isPlaceholderKey(key)) {
    failOpen = true;
    setUnlocked(true);
    return;
  }
  try {
    Purchases.configure({ apiKey: key });
    Purchases.addCustomerInfoUpdateListener((info: any) => {
      setUnlocked(Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]));
    });
    Purchases.getCustomerInfo()
      .then((info: any) =>
        setUnlocked(Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID])),
      )
      .catch(() => {
        failOpen = true;
        setUnlocked(true);
      });
  } catch {
    failOpen = true;
    setUnlocked(true);
  }
}

export const isFailOpen = (): boolean => failOpen;

export function useStoryUnlocked(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const l: Listener = () => onChange();
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => unlocked,
  );
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases || failOpen) return unlocked;
  try {
    const info = await Purchases.restorePurchases();
    const active = Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
    setUnlocked(active);
    return active;
  } catch {
    return unlocked;
  }
}
