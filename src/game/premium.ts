// ============================================================
// Premium content catalog — the things a $3/mo subscription unlocks.
// Cosmetic + additive only (no pay-to-win): background THEMES, pet SKINS,
// and the "Pro" focus analytics gate. Kept data-only so screens can render
// and lock them uniformly.
// ============================================================

export interface Theme {
  id: string;
  /** i18n key under COPY.themes for the display name */
  nameKey: string;
  premium: boolean;
  /** full-screen CSS background (gradient) painted behind the pixel sky props */
  sky: string;
  /** CSS filter applied to the pixel sun/cloud sprites so they match the mood */
  spriteFilter?: string;
  /** hide the sun (e.g. night / aurora) */
  hideSun?: boolean;
  /** small swatch gradient for the picker button */
  swatch: string;
  /** night-style scene (stars instead of sun/clouds) */
  night?: boolean;
}

export const THEMES: Theme[] = [
  // --- free ---
  { id: 'day', nameKey: 'day', premium: false,
    sky: 'linear-gradient(180deg,#bfe3ff 0%,#dcd2f5 55%,#f6d7ea 100%)',
    swatch: 'linear-gradient(135deg,#bfe3ff,#f6d7ea)' },
  { id: 'night', nameKey: 'night', premium: false, night: true, hideSun: true,
    sky: 'linear-gradient(180deg,#1b1440 0%,#3a2b6b 55%,#6b4a86 100%)',
    swatch: 'linear-gradient(135deg,#1b1440,#6b4a86)' },
  // --- premium ---
  { id: 'sunset', nameKey: 'sunset', premium: true,
    sky: 'linear-gradient(180deg,#ffd59e 0%,#ff9eb0 45%,#a06bd0 100%)',
    spriteFilter: 'hue-rotate(-18deg) saturate(1.15) brightness(1.03)',
    swatch: 'linear-gradient(135deg,#ffd59e,#a06bd0)' },
  { id: 'aurora', nameKey: 'aurora', premium: true, night: true, hideSun: true,
    sky: 'linear-gradient(180deg,#0b2a3a 0%,#12604f 40%,#3a2b6b 100%)',
    spriteFilter: 'hue-rotate(120deg) saturate(1.3)',
    swatch: 'linear-gradient(135deg,#12604f,#3a2b6b)' },
  { id: 'sakura', nameKey: 'sakura', premium: true,
    sky: 'linear-gradient(180deg,#ffe3ef 0%,#ffc8dd 50%,#e7c6f0 100%)',
    spriteFilter: 'hue-rotate(-30deg) saturate(1.1)',
    swatch: 'linear-gradient(135deg,#ffe3ef,#e7c6f0)' },
  { id: 'midnight', nameKey: 'midnight', premium: true, night: true, hideSun: true,
    sky: 'linear-gradient(180deg,#05060f 0%,#141a3a 55%,#2a1a4a 100%)',
    spriteFilter: 'brightness(0.9) hue-rotate(210deg)',
    swatch: 'linear-gradient(135deg,#05060f,#2a1a4a)' },
  { id: 'ocean', nameKey: 'ocean', premium: true,
    sky: 'linear-gradient(180deg,#8fe3ff 0%,#4aa8d8 45%,#2a5b8a 100%)',
    spriteFilter: 'hue-rotate(150deg) saturate(1.2)',
    swatch: 'linear-gradient(135deg,#8fe3ff,#2a5b8a)' },
  { id: 'galaxy', nameKey: 'galaxy', premium: true, night: true, hideSun: true,
    sky: 'linear-gradient(180deg,#0a0620 0%,#3a1a5e 45%,#7a2b7e 100%)',
    spriteFilter: 'hue-rotate(260deg) saturate(1.5) brightness(1.05)',
    swatch: 'linear-gradient(135deg,#0a0620,#7a2b7e)' },
  { id: 'candy', nameKey: 'candy', premium: true,
    sky: 'linear-gradient(180deg,#fff0f7 0%,#ffc2e2 45%,#c9a0ff 100%)',
    spriteFilter: 'saturate(1.2) brightness(1.04)',
    swatch: 'linear-gradient(135deg,#fff0f7,#c9a0ff)' },
  { id: 'forest', nameKey: 'forest', premium: true,
    sky: 'linear-gradient(180deg,#cdefa0 0%,#7fc98a 45%,#3a7a5e 100%)',
    spriteFilter: 'hue-rotate(70deg) saturate(1.15)',
    swatch: 'linear-gradient(135deg,#cdefa0,#3a7a5e)' },
  { id: 'dawn', nameKey: 'dawn', premium: true,
    sky: 'linear-gradient(180deg,#ffe9c7 0%,#ffb4c6 40%,#8fb8ff 100%)',
    spriteFilter: 'brightness(1.05) saturate(1.1)',
    swatch: 'linear-gradient(135deg,#ffe9c7,#8fb8ff)' },
  { id: 'ember', nameKey: 'ember', premium: true, night: true, hideSun: true,
    sky: 'linear-gradient(180deg,#1a0a0a 0%,#5e1a1a 45%,#a8471a 100%)',
    spriteFilter: 'hue-rotate(-20deg) saturate(1.3) brightness(1.05)',
    swatch: 'linear-gradient(135deg,#1a0a0a,#a8471a)' },
  { id: 'frost', nameKey: 'frost', premium: true,
    sky: 'linear-gradient(180deg,#eaf6ff 0%,#c2e0f5 45%,#8fb4e0 100%)',
    spriteFilter: 'hue-rotate(180deg) saturate(0.85) brightness(1.06)',
    swatch: 'linear-gradient(135deg,#eaf6ff,#8fb4e0)' },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export interface Skin {
  id: string;
  nameKey: string;
  premium: boolean;
  /** CSS filter applied to the pet sprite img; '' = original */
  filter: string;
  swatch: string;
}

export const SKINS: Skin[] = [
  { id: 'none', nameKey: 'original', premium: false, filter: '', swatch: 'linear-gradient(135deg,#f3d9c6,#e7b7a0)' },
  { id: 'golden', nameKey: 'golden', premium: true,
    filter: 'sepia(0.7) saturate(2.2) hue-rotate(-18deg) brightness(1.08) drop-shadow(0 0 3px rgba(255,210,90,0.7))',
    swatch: 'linear-gradient(135deg,#ffe08a,#f5b942)' },
  { id: 'cosmic', nameKey: 'cosmic', premium: true,
    filter: 'hue-rotate(220deg) saturate(1.6) brightness(1.05) drop-shadow(0 0 3px rgba(150,120,255,0.8))',
    swatch: 'linear-gradient(135deg,#b39dff,#6d5ae0)' },
  { id: 'mint', nameKey: 'mint', premium: true,
    filter: 'hue-rotate(110deg) saturate(1.35) brightness(1.04)',
    swatch: 'linear-gradient(135deg,#a0eac9,#5fcf9e)' },
  { id: 'rainbow', nameKey: 'rainbow', premium: true,
    filter: 'saturate(2) hue-rotate(0deg) contrast(1.1) drop-shadow(0 0 3px rgba(255,150,220,0.8))',
    swatch: 'linear-gradient(135deg,#ff9eb0,#ffe08a 40%,#a0eac9 70%,#b39dff)' },
  { id: 'shadow', nameKey: 'shadow', premium: true,
    filter: 'brightness(0.45) saturate(0.6) hue-rotate(230deg) drop-shadow(0 0 4px rgba(120,90,200,0.7))',
    swatch: 'linear-gradient(135deg,#4a3a6a,#1a1230)' },
  { id: 'rose', nameKey: 'rose', premium: true,
    filter: 'hue-rotate(-25deg) saturate(1.5) brightness(1.03)',
    swatch: 'linear-gradient(135deg,#ffb6c9,#e0587f)' },
  { id: 'aqua', nameKey: 'aqua', premium: true,
    filter: 'hue-rotate(160deg) saturate(1.4) brightness(1.05) drop-shadow(0 0 3px rgba(120,220,255,0.7))',
    swatch: 'linear-gradient(135deg,#a0e8ff,#4aa8d8)' },
];

export function getSkin(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

/** Subscription product config — matched to the App Store / RevenueCat product. */
export const PREMIUM = {
  priceLabel: '$5',
  period: 'ay',
  /** RevenueCat entitlement id / StoreKit product id — set these when wiring IAP */
  productId: 'mochiverse_premium_monthly',
  entitlementId: 'premium',
  /** premium perk: pets decay this much slower (0.6 = 40% slower) so they need
   *  less babysitting — a genuine "worth it" quality-of-life benefit. */
  decayRate: 0.6,
};

/** One-time consumable IAP: bring a pet back from the dead. Free for Premium. */
export const REVIVE = {
  priceLabel: '$2',
  productId: 'mochiverse_revive',
};

/** Consumable coin packs — buy in-game coins with real money via App Store IAP.
 *  `productId` must match the App Store Connect / RevenueCat consumable products. */
export interface CoinPack {
  id: string;
  coins: number;
  priceLabel: string;
  productId: string;
  /** i18n badge key under COPY.coins (e.g. 'popular', 'bestValue') — optional */
  badgeKey?: 'popular' | 'bestValue';
  /** bonus % to advertise ("+25%") — cosmetic marketing only */
  bonus?: number;
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'pouch',    coins: 100,  priceLabel: '$0.99',  productId: 'mochiverse_coins_100' },
  { id: 'bag',      coins: 550,  priceLabel: '$3.99',  productId: 'mochiverse_coins_550',  bonus: 10 },
  { id: 'chest',    coins: 1500, priceLabel: '$8.99',  productId: 'mochiverse_coins_1500', bonus: 25, badgeKey: 'popular' },
  { id: 'treasure', coins: 4000, priceLabel: '$19.99', productId: 'mochiverse_coins_4000', bonus: 35, badgeKey: 'bestValue' },
];
