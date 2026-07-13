// ============================================================
// Core domain types for Mochiverse
// ============================================================

export type SpeciesId = 'mochi' | 'pao' | 'yuki' | 'kiwi' | 'nori';

// blob = the mystery cell-like hatchling (species hidden); it evolves into the
// species baby, then teen, then legendary (adult).
export type Stage = 'blob' | 'baby' | 'teen' | 'legendary';

/** Visual/emotional state the sprite is currently showing. */
export type PetState =
  | 'idle'
  | 'walking'
  | 'happy'
  | 'sad'
  | 'sick'
  | 'eating'
  | 'sleeping'
  | 'ghost';

export interface Stats {
  hunger: number; // 0..100  (100 = full)
  mood: number;   // 0..100
  health: number; // 0..100
}

export interface Pet {
  id: string;
  species: SpeciesId;
  name: string;
  stage: Stage;
  /** current node in the branching evolution tree (see game/tree.ts) */
  form: string;
  /** evolution XP toward the next stage (focus minutes + care actions) */
  xp: number;
  /** care accumulated since the last evolution (drives teen/adult branch) */
  care: { sum: number; n: number; neglect: number };
  stats: Stats;
  bornAt: number;          // epoch ms
  sessionsCompleted: number;
  /** total minutes this specific pet has been focused for (for its epitaph) */
  focusMinutes: number;
  /** Whether the pet is still an unhatched egg. */
  isEgg: boolean;
}

export interface DeadPet {
  id: string;
  species: SpeciesId;
  name: string;
  stage: Stage;
  bornAt: number;
  diedAt: number;
  daysSurvived: number;
  totalFocusHours: number;
  epitaph: string;
}

/** One day's focus record for the contribution heatmap. */
export interface FocusDay {
  date: string;   // YYYY-MM-DD (local)
  minutes: number;
}

export interface Inventory {
  candy: number;
  medicine: number;
  /** owned shop items, keyed by ShopItem id -> count */
  items: Record<string, number>;
}

export type LocaleId =
  | 'tr' | 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'pt' | 'fr' | 'de' | 'ja';

export interface Settings {
  muted: boolean;
  /** chosen UI language; null = not yet chosen (auto-detect on first launch) */
  locale: LocaleId | null;
  /** selected background theme id (see game/premium THEMES); 'day' by default */
  theme: string;
  /** selected pet skin id (see game/premium SKINS); 'none' by default */
  skin: string;
  /** preferred ambient focus sound id (see audio/focusSound); 'off' by default */
  focusSound: string;
  /** daily focus reminder — local time "HH:MM", or null when off */
  reminder: string | null;
}

export type ItemKind = 'food' | 'medicine' | 'toy' | 'cosmetic';

/** Where a wearable cosmetic sits on the pet's body. */
export type WearAnchor = 'head' | 'face' | 'neck';

export interface ShopItem {
  id: string;
  kind: ItemKind;
  price: number;
  /** icon key (matches a sprite in assets/sprites/icons or items) */
  icon: string;
  /** stat this item restores when used, and by how much */
  stat?: 'hunger' | 'health' | 'mood';
  restore?: number;
  /** for cosmetics: where it attaches on the pet + fine-tuning overrides */
  anchor?: WearAnchor;
  /** overlay width as a fraction of the pet's display size (defaults per anchor) */
  wearScale?: number;
  /** overlay top offset as a fraction of the pet's display size (defaults per anchor) */
  wearY?: number;
}

export type Screen =
  | 'onboarding'
  | 'hatch'
  | 'home'
  | 'focus'
  | 'complete'
  | 'death'
  | 'memorial'
  | 'stats'
  | 'shop'
  | 'collection'
  | 'settings'
  | 'premium'
  | 'coins';

export interface FocusSession {
  durationMin: number;
  startedAt: number;
  /** cumulative ms the tab spent hidden during this session */
  hiddenMs: number;
  /** id of the subject/topic this session is focused on (see Subject) */
  subjectId?: string;
}

/** A colour-coded topic the user focuses on (e.g. "Physics"), so focus time
 *  can be tallied per subject and shown as a weekly breakdown. */
export interface Subject {
  id: string;
  name: string;
  /** hex colour used for the subject's chip and its bars in Stats */
  color: string;
}
