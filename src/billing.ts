import { useGame } from './store/useGame';
import { PREMIUM, REVIVE, type CoinPack } from './game/premium';

// ============================================================
// Billing / In-App Purchase layer.
//
// The app ships to the App Store, so the real subscription runs through
// StoreKit — easiest via RevenueCat (`@revenuecat/purchases-capacitor`) once the
// web app is wrapped with Capacitor. This module is the single seam for that:
// screens call `purchasePremium()` / `restorePurchases()` and never touch the
// SDK directly. Until the native SDK is wired, a mock unlock lets the whole
// premium flow (paywall → unlock → premium content) be built and tested.
//
// TO GO LIVE (your part — needs an Apple Developer account + Mac/Xcode):
//   1. Wrap the app with Capacitor (`npx cap add ios`).
//   2. In App Store Connect create an auto-renewable subscription with product
//      id `PREMIUM.productId` at $3/mo; add it to a RevenueCat "premium" entitlement.
//   3. `npm i @revenuecat/purchases-capacitor`, configure with your RevenueCat key.
//   4. Replace the two mock blocks below with the SDK calls (marked TODO(IAP)).
// ============================================================

/** True when a real native IAP bridge is present (Capacitor + RevenueCat). */
function hasNativeIAP(): boolean {
  // RevenueCat plugin registers on the Capacitor bridge; absent on plain web.
  return typeof (globalThis as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform === 'function'
    && !!(globalThis as unknown as { Capacitor?: { isNativePlatform: () => boolean } })
      .Capacitor!.isNativePlatform();
}

function setPremium(on: boolean) {
  useGame.getState().setPremium(on);
}

/** Start the subscription purchase. Resolves true when the user is now premium. */
export async function purchasePremium(): Promise<boolean> {
  if (hasNativeIAP()) {
    // TODO(IAP): replace with RevenueCat, e.g.
    //   const { Purchases } = await import('@revenuecat/purchases-capacitor');
    //   const offerings = await Purchases.getOfferings();
    //   const pkg = offerings.current?.availablePackages[0];
    //   const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    //   const active = !!customerInfo.entitlements.active[PREMIUM.entitlementId];
    //   setPremium(active); return active;
    console.warn('Native IAP bridge present but RevenueCat not wired yet:', PREMIUM.productId);
    return false;
  }
  // Web / dev mock: simulate a successful purchase so the flow is testable.
  await new Promise((r) => setTimeout(r, 400));
  setPremium(true);
  return true;
}

/**
 * Revive the last-died pet. FREE for Premium members (a subscription perk);
 * otherwise a one-time $2 consumable IAP. Resolves true when the pet is revived.
 */
export async function purchaseReviveOrFree(): Promise<boolean> {
  const g = useGame.getState();
  if (!g.revivablePet) return false;

  // Premium members revive for free — a core reason to subscribe.
  if (g.premium) { g.revivePet(); return true; }

  if (hasNativeIAP()) {
    // TODO(IAP): replace with a RevenueCat CONSUMABLE purchase of REVIVE.productId, e.g.
    //   const { Purchases } = await import('@revenuecat/purchases-capacitor');
    //   const products = await Purchases.getProducts({ productIdentifiers: [REVIVE.productId] });
    //   await Purchases.purchaseStoreProduct({ product: products.products[0] });
    //   g.revivePet(); return true;
    console.warn('Native IAP bridge present but revive IAP not wired yet:', REVIVE.productId);
    return false;
  }
  // Web / dev mock: simulate a successful $2 purchase, then revive.
  await new Promise((r) => setTimeout(r, 400));
  g.revivePet();
  return true;
}

/** Buy a coin pack — a one-time CONSUMABLE App Store IAP. Grants the coins on
 *  success. Consumables are not restorable, so there's no restore for these. */
export async function purchaseCoins(pack: CoinPack): Promise<boolean> {
  if (hasNativeIAP()) {
    // TODO(IAP): RevenueCat consumable purchase, e.g.
    //   const { Purchases } = await import('@revenuecat/purchases-capacitor');
    //   const products = await Purchases.getProducts({ productIdentifiers: [pack.productId] });
    //   await Purchases.purchaseStoreProduct({ product: products.products[0] });
    //   useGame.getState().addCoins(pack.coins); return true;
    console.warn('Native IAP bridge present but coin IAP not wired yet:', pack.productId);
    return false;
  }
  // Web / dev mock: simulate a successful purchase, then grant coins.
  await new Promise((r) => setTimeout(r, 400));
  useGame.getState().addCoins(pack.coins);
  return true;
}

/** Restore a previously-bought subscription (required by App Store review). */
export async function restorePurchases(): Promise<boolean> {
  if (hasNativeIAP()) {
    // TODO(IAP): replace with RevenueCat, e.g.
    //   const { Purchases } = await import('@revenuecat/purchases-capacitor');
    //   const { customerInfo } = await Purchases.restorePurchases();
    //   const active = !!customerInfo.entitlements.active[PREMIUM.entitlementId];
    //   setPremium(active); return active;
    return false;
  }
  // Web / dev mock: whatever the local flag already says.
  return useGame.getState().premium;
}
