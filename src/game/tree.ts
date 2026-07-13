import type { Stage } from './types';

// ============================================================
// Branching evolution tree — classic Tamagotchi wheel scale.
//
//   Stage 0 EGG → Stage 1 CELL (blob, same for everyone)
//   → Stage 2 BABY   (RANDOM: 1 of 3)
//   → Stage 3 TEEN   (CARE tier: great / good / poor → 3 per baby)
//   → Stage 4 ADULT  (CARE + total FOCUS: best / other → 2 per teen)
//
//   1 cell → 3 babies → 9 teens → 18 adults  (31 forms)
//
//   Children ordering conventions:
//     cell.children  = [a, b, c]                 (random roll)
//     baby.children  = [greatTeen, goodTeen, poorTeen]
//     teen.children  = [bestAdult(care+focus), otherAdult]
// ============================================================

export interface FormDef {
  id: string;
  stage: Stage;
  /** display name — only shown once discovered */
  name: string;
  parent: string | null;
  children: string[];
  /** the prettiest/rarest adult of its line (best care + high focus) */
  rare?: boolean;
}

export const CELL_ID = 'cell';

// helper to keep the big table terse
const F = (id: string, stage: Stage, name: string, parent: string | null, children: string[], rare = false): FormDef =>
  ({ id, stage, name, parent, children, rare });

export const TREE: Record<string, FormDef> = Object.fromEntries([
  F('cell', 'blob', 'Cell', null, ['puff', 'sprout', 'dewdrop']),

  // --- babies (random) ---
  F('puff', 'baby', 'Puff', 'cell', ['puffling', 'pompom', 'tuftling']),
  F('sprout', 'baby', 'Sprout', 'cell', ['bloomkin', 'leafling', 'weedling']),
  F('dewdrop', 'baby', 'Dewdrop', 'cell', ['dewling', 'puddle', 'murkling']),

  // --- teens (care tier: [great, good, poor]) ---
  F('puffling', 'teen', 'Puffling', 'puff', ['seraph', 'cirrus']),
  F('pompom', 'teen', 'Pompom', 'puff', ['floofa', 'pomkin']),
  F('tuftling', 'teen', 'Tuftling', 'puff', ['snarl', 'grym']),
  F('bloomkin', 'teen', 'Bloomkin', 'sprout', ['faerie', 'petala']),
  F('leafling', 'teen', 'Leafling', 'sprout', ['fernix', 'sprig']),
  F('weedling', 'teen', 'Weedling', 'sprout', ['thorne', 'bramble']),
  F('dewling', 'teen', 'Dewling', 'dewdrop', ['aquara', 'tidus']),
  F('puddle', 'teen', 'Puddle', 'dewdrop', ['splasha', 'plip']),
  F('murkling', 'teen', 'Murkling', 'dewdrop', ['mirok', 'sludge']),

  // --- adults ([best, other]); best of each great-care teen is rare ---
  F('seraph', 'legendary', 'Seraph', 'puffling', [], true),
  F('cirrus', 'legendary', 'Cirrus', 'puffling', []),
  F('floofa', 'legendary', 'Floofa', 'pompom', []),
  F('pomkin', 'legendary', 'Pomkin', 'pompom', []),
  F('snarl', 'legendary', 'Snarl', 'tuftling', []),
  F('grym', 'legendary', 'Grym', 'tuftling', []),
  F('faerie', 'legendary', 'Faerie', 'bloomkin', [], true),
  F('petala', 'legendary', 'Petala', 'bloomkin', []),
  F('fernix', 'legendary', 'Fernix', 'leafling', []),
  F('sprig', 'legendary', 'Sprig', 'leafling', []),
  F('thorne', 'legendary', 'Thorne', 'weedling', []),
  F('bramble', 'legendary', 'Bramble', 'weedling', []),
  F('aquara', 'legendary', 'Aquara', 'dewling', [], true),
  F('tidus', 'legendary', 'Tidus', 'dewling', []),
  F('splasha', 'legendary', 'Splasha', 'puddle', []),
  F('plip', 'legendary', 'Plip', 'puddle', []),
  F('mirok', 'legendary', 'Mirok', 'murkling', []),
  F('sludge', 'legendary', 'Sludge', 'murkling', []),
].map((f) => [f.id, f]));

/** All form ids grouped by stage, for the collection grid (stable order). */
export const TREE_BY_STAGE: Record<Stage, string[]> =
  (['blob', 'baby', 'teen', 'legendary'] as Stage[]).reduce((acc, st) => {
    acc[st] = Object.values(TREE).filter((f) => f.stage === st).map((f) => f.id);
    return acc;
  }, {} as Record<Stage, string[]>);

/** Care accumulated since the last evolution. */
export interface Care {
  sum: number;   // sum of (hunger+mood+health)/3 samples
  n: number;     // number of samples
  neglect: number; // times a stat newly crossed into critical
}

export const freshCare = (): Care => ({ sum: 0, n: 0, neglect: 0 });

/** Average care score 0..100 (optimistic default before any samples). */
export function careAverage(care: Care): number {
  return care.n > 0 ? care.sum / care.n : 80;
}

/** Care tier since last evolution: 0 = great, 1 = good, 2 = poor. */
export function careTier(care: Care): 0 | 1 | 2 {
  const avg = careAverage(care);
  if (avg >= 70 && care.neglect <= 1) return 0;
  if (avg >= 50 && care.neglect <= 4) return 1;
  return 2;
}

/** Was this stage cared for well? (used for the teen→adult "best" branch) */
export function careWasGood(care: Care): boolean {
  return careTier(care) === 0;
}

// Total focus minutes (over the pet's life) needed for the *best* adult branch.
export const BEST_ADULT_FOCUS_MIN = 90;

/**
 * Choose the next form when evolving out of `currentId`.
 * @param rng 0..1 random roll (injectable for determinism/testing)
 */
export function nextForm(
  currentId: string,
  ctx: { care: Care; focusMinutes: number; rng: number },
): string | null {
  const node = TREE[currentId];
  if (!node || node.children.length === 0) return null;

  switch (node.stage) {
    case 'blob':
      // cell → baby: pure random branch among the 3
      return node.children[Math.min(node.children.length - 1, Math.floor(ctx.rng * node.children.length))];
    case 'baby':
      // baby → teen: care tier selects great/good/poor (clamped to available)
      return node.children[Math.min(careTier(ctx.care), node.children.length - 1)];
    case 'teen':
      // teen → adult: the rare/best form needs good care AND enough focus
      return careWasGood(ctx.care) && ctx.focusMinutes >= BEST_ADULT_FOCUS_MIN
        ? node.children[0]
        : node.children[node.children.length - 1];
    default:
      return null;
  }
}

/** XP required to leave each stage (fills from focus minutes + care actions). */
export const STAGE_XP: Record<Stage, number> = {
  blob: 25,   // cell → baby
  baby: 80,   // baby → teen
  teen: 220,  // teen → adult
  legendary: Infinity,
};

/** XP granted by care actions. */
export const CARE_XP = { feed: 5, pet: 1, heal: 8 } as const;

/** 0..1 progress toward the next stage for the evolution bar. */
export function xpRatio(stage: Stage, xp: number): number {
  const t = STAGE_XP[stage];
  return t === Infinity ? 1 : Math.max(0, Math.min(1, xp / t));
}

/** Does this form still have somewhere to evolve to? */
export function hasNextForm(formId: string): boolean {
  return (TREE[formId]?.children.length ?? 0) > 0;
}
