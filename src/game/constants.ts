import type { SpeciesId, Stage, ShopItem, WearAnchor, Subject } from'./types';

// ============================================================
// Balance / tuning — STRICT Tamagotchi. No mercy.
// ============================================================

/** Per-hour decay rates (points/hour) applied in real time. */
export const DECAY = {
 hunger: 4,
 mood: 3,
 /** health drain per hour while hunger OR mood is at 0 */
 healthWhenStarving: 8,
} as const;

/** Below this health, the pet is sick (needs medicine). */
export const SICK_THRESHOLD = 40;
/** At/below this, a stat bar pulses red. */
export const CRITICAL_THRESHOLD = 20;

/** Sessions completed to reach each stage (blob is the starting hatchling = 0). */
export const EVOLUTION = {
 baby: 1,
 teen: 3,
 legendary: 8,
} as const;

/** Rewards for completing a focus session. */
export const REWARD = {
 candy: 2,
 mood: 18,
 health: 6,
 /** +1 medicine every Nth session */
 medicineEvery: 3,
} as const;

/** Punishment for quitting a session mid-way. */
export const PENALTY = {
 mood: 30,
 health: 20,
} as const;

/** Feeding */
export const FEED = {
 candyCost: 1,
 hunger: 35,
} as const;

/** Petting */
export const PET = {
 mood: 2,
 maxPerHour: 5,
} as const;

/** Anti-cheat visibility thresholds during a focus session (ms). */
export const ANTICHEAT = {
 warnMs: 10_000,
 failMs: 20_000,
} as const;

export const TIMER_PRESETS = [15, 25, 45, 60] as const;

export const STARTING_INVENTORY = { candy: 3, medicine: 1, items: {} as Record<string, number> };

export const STARTING_COINS = 25;

// ---- Focus subjects (colour-coded topics) ----------------------------------
/** Cute pastel palette offered when creating/colour-coding a focus subject. */
export const SUBJECT_COLORS = [
 '#FF8FC7', // pink
 '#C79BFF', // lavender
 '#7FE3C0', // mint
 '#8FBEFF', // sky
 '#FFB27F', // peach
 '#FF9EB0', // rose
 '#A9DE5C', // green
 '#F5C542', // gold
];
/** The starter subject every save begins with. Its label is localized in the UI
 *  (see subjectLabel), so the stored name here is only a fallback. */
export const GENERAL_SUBJECT_ID = 'general';
export const DEFAULT_SUBJECTS: Subject[] = [
 { id: GENERAL_SUBJECT_ID, name: 'Genel', color: SUBJECT_COLORS[1] },
];
export const MAX_SUBJECTS = 12;

// ============================================================
// Coin economy — focus is the money-maker
// ============================================================
export const COIN = {
 /** coins earned per focused minute */
 perMinute: 1,
 /** streak multiplier: +5% per streak day, capped at 2x */
 streakMultiplier: (streak: number) => 1 + Math.min(Math.max(streak - 1, 0), 20) * 0.05,
} as const;

// ============================================================
// Shop catalogue — foods, medicine, toys, cosmetics
// ============================================================
export const SHOP_CATALOG: ShopItem[] = [
 { id:'candy', kind:'food', price: 5, icon:'candy', stat:'hunger', restore: 12 },
 { id:'apple', kind:'food', price: 8, icon:'apple', stat:'hunger', restore: 22 },
 { id:'fish', kind:'food', price: 14, icon:'fish', stat:'hunger', restore: 35 },
 { id:'cake', kind:'food', price: 22, icon:'cake', stat:'hunger', restore: 55 },
 { id:'medicine', kind:'medicine', price: 30, icon:'medicine', stat:'health', restore: 45 },
 { id:'ball', kind:'toy', price: 16, icon:'ball', stat:'mood', restore: 25 },
 { id:'star_toy', kind:'toy', price: 26, icon:'star_toy', stat:'mood', restore: 40 },
 // Cosmetics — wearable accessories that render on the pet. Geometry is
 // HEAD-RELATIVE (see MonsterView): wearScale = the accessory's VISIBLE width as
 // a multiple of the creature's detected head width; wearY meaning depends on the
 // anchor — head: how far the visible art's BOTTOM sinks below the head top
 // (head-width units, negative = floats above); face/neck: vertical CENTRE of the
 // visible art below the head top. Placement is measured off each item's tight
 // content box (ITEM_BOX) so the art sits on the head instead of floating on its
 // transparent padding.
 { id:'bow', kind:'cosmetic', price: 40, icon:'bow', anchor:'head', wearScale: 0.72, wearY: 0.42 },
 { id:'crown', kind:'cosmetic', price: 60, icon:'crown', anchor:'head', wearScale: 1.0, wearY: 0.35 },
 { id:'top_hat', kind:'cosmetic', price: 55, icon:'top_hat', anchor:'head', wearScale: 1.0, wearY: 0.26 },
 { id:'party_hat', kind:'cosmetic', price: 35, icon:'party_hat', anchor:'head', wearScale: 0.82, wearY: 0.20 },
 { id:'flower_crown', kind:'cosmetic', price: 45, icon:'flower_crown', anchor:'head', wearScale: 1.15, wearY: 0.34 },
 { id:'wizard_hat', kind:'cosmetic', price: 65, icon:'wizard_hat', anchor:'head', wearScale: 1.0, wearY: 0.20 },
 { id:'cap', kind:'cosmetic', price: 40, icon:'cap', anchor:'head', wearScale: 1.05, wearY: 0.30 },
 { id:'halo', kind:'cosmetic', price: 70, icon:'halo', anchor:'head', wearScale: 1.0, wearY: -0.04 },
 { id:'glasses', kind:'cosmetic', price: 30, icon:'glasses', anchor:'face', wearScale: 1.0, wearY: 0.52 },
 { id:'sunglasses', kind:'cosmetic', price: 38, icon:'sunglasses', anchor:'face', wearScale: 1.0, wearY: 0.52 },
 { id:'headphones', kind:'cosmetic', price: 48, icon:'headphones', anchor:'head', wearScale: 1.2, wearY: 0.5 },
 { id:'scarf', kind:'cosmetic', price: 42, icon:'scarf', anchor:'neck', wearScale: 1.05, wearY: 0.4 },
 { id:'cat_ears', kind:'cosmetic', price: 40, icon:'cat_ears', anchor:'head', wearScale: 1.1, wearY: 0.14 },
 { id:'devil_horns', kind:'cosmetic', price: 50, icon:'devil_horns', anchor:'head', wearScale: 0.95, wearY: 0.38 },
 { id:'tiara', kind:'cosmetic', price: 58, icon:'tiara', anchor:'head', wearScale: 0.95, wearY: 0.33 },
 { id:'heart_glasses', kind:'cosmetic', price: 36, icon:'heart_glasses', anchor:'face', wearScale: 1.0, wearY: 0.52 },
 { id:'bowtie', kind:'cosmetic', price: 28, icon:'bowtie', anchor:'neck', wearScale: 0.55, wearY: 0.35 },
];

/** Default head-relative geometry per anchor (see MonsterView for y semantics). */
export const WEAR_ANCHOR: Record<WearAnchor, { scale: number; y: number }> = {
 head: { scale: 1.05, y: 0.28 },
 face: { scale: 0.98, y: 0.52 },
 neck: { scale: 1.0, y: 0.4 },
};

/** wearable cosmetics only */
export const COSMETIC_ITEMS = SHOP_CATALOG.filter((it) => it.kind ==='cosmetic');

export const SHOP_BY_ID: Record<string, ShopItem> = Object.fromEntries(
 SHOP_CATALOG.map((it) => [it.id, it]),
);

/** foods that can be used from the feed menu */
export const FOOD_ITEMS = SHOP_CATALOG.filter((it) => it.kind ==='food');
/** toys the pet can play with (mood boost) */
export const TOY_ITEMS = SHOP_CATALOG.filter((it) => it.kind ==='toy');

// ============================================================
// Species catalogue
// ============================================================

export interface SpeciesDef {
 id: SpeciesId;
 displayName: string;
 /** base body color used by the placeholder renderer */
 color: string;
 colorDark: string;
 cheek: string;
 accent: string;
 tagline: string;
}

export const SPECIES: Record<SpeciesId, SpeciesDef> = {
 mochi: {
 id:'mochi', displayName:'Mochi', color:'#FFC6E4', colorDark:'#FF9BCB',
 cheek:'#FF7BA9', accent:'#FF6FA8', tagline:'Pamuk şekeri kadar yumuşak.',
 },
 pao: {
 id:'pao', displayName:'Pao', color:'#CFC2FF', colorDark:'#B6A2FF',
 cheek:'#9B7BFF', accent:'#8A6BFF', tagline:'Yıldız tozundan doğdu.',
 },
 yuki: {
 id:'yuki', displayName:'Yuki', color:'#BFEFFF', colorDark:'#9BDBFF',
 cheek:'#5FB6E8', accent:'#4FA6E0', tagline:'Bir kar tanesi kadar sakin.',
 },
 kiwi: {
 id:'kiwi', displayName:'Kiwi', color:'#C6F3D9', colorDark:'#9CE7BC',
 cheek:'#5FCf98', accent:'#4FBF88', tagline:'Bahçenin en tatlısı.',
 },
 nori: {
 id:'nori', displayName:'Nori', color:'#FFDDB0', colorDark:'#FFC58A',
 cheek:'#FF9E6B', accent:'#FF8E5B', tagline:'Güneşin küçük kardeşi.',
 },
};

export const ALL_SPECIES = Object.keys(SPECIES) as SpeciesId[];

export const STAGE_LABEL: Record<Stage, string> = {
 blob:'Yavru',
 baby:'Bebek',
 teen:'Genç',
 legendary:'Efsane',
};

// A pool of gentle epitaphs for the memorial garden.
export const EPITAPHS = [
'Sevgiyle hatırlanıyor.',
'Kısa ama tatlı bir hayat.',
'Yıldızlar arasında dinleniyor.',
'Bir gün seni bekledi… ama sen gelmedin.',
'En sevdiği şey odaklandığın anlardı.',
'Uçup gitti, kalbinde bir iz bıraktı.',
'Daha çok zamanı olmalıydı.',
] as const;
