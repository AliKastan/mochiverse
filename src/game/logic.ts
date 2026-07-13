import type { Pet, PetState, Stats } from './types';
import { DECAY, SICK_THRESHOLD, EVOLUTION } from './constants';

const HOUR = 3_600_000;
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export const clampStats = (s: Stats): Stats => ({
  hunger: clamp(s.hunger),
  mood: clamp(s.mood),
  health: clamp(s.health),
});

/**
 * Apply real-time decay to a pet given the elapsed wall-clock time.
 * This is the heart of the "it decays even while closed" behaviour:
 * we integrate over `elapsedMs` since the pet was last seen.
 *
 * Returns the new stats AND whether the pet died during the interval.
 * Pure — does not mutate the input.
 */
export function decayOver(stats: Stats, elapsedMs: number, rate = 1): { stats: Stats; died: boolean } {
  if (elapsedMs <= 0) return { stats: clampStats(stats), died: false };

  // Integrate hour-by-hour so that health only drains during the sub-interval
  // where hunger/mood are actually empty (approximation via small steps).
  // `rate` scales the whole decay — Premium's slower-decay perk passes < 1.
  const STEP = Math.min(elapsedMs, HOUR / 6); // 10-min steps, capped
  let { hunger, mood, health } = stats;
  let remaining = elapsedMs;
  let died = false;

  while (remaining > 0) {
    const dt = Math.min(STEP, remaining);
    const hours = dt / HOUR * rate;

    hunger = clamp(hunger - DECAY.hunger * hours);
    mood = clamp(mood - DECAY.mood * hours);

    if (hunger <= 0 || mood <= 0) {
      health = clamp(health - DECAY.healthWhenStarving * hours);
    }

    if (health <= 0) {
      health = 0;
      died = true;
      break;
    }
    remaining -= dt;
  }

  return { stats: { hunger, mood, health }, died };
}

/** Which visual state should the pet show, given stats + context. */
export function deriveState(pet: Pet | null, opts: { sleeping?: boolean } = {}): PetState {
  if (!pet) return 'idle';
  if (opts.sleeping) return 'sleeping';
  const { hunger, mood, health } = pet.stats;
  if (health <= 0) return 'ghost';
  if (health < SICK_THRESHOLD) return 'sick';
  if (mood < 30 || hunger < 25) return 'sad';
  // Note: a content pet rests in a calm `idle` — `happy` is NOT derived from
  // stats (that made a healthy pet jump forever). Happy is played only as a
  // transient reaction to events (feeding, petting) by the calling screen.
  return 'idle';
}

export function isSick(pet: Pet): boolean {
  return pet.stats.health > 0 && pet.stats.health < SICK_THRESHOLD;
}

/** Determine the correct evolution stage for a given session count. */
export function stageForSessions(sessions: number): Pet['stage'] {
  if (sessions >= EVOLUTION.legendary) return 'legendary';
  if (sessions >= EVOLUTION.teen) return 'teen';
  if (sessions >= EVOLUTION.baby) return 'baby';
  return 'blob';
}

export function daysBetween(a: number, b: number): number {
  return Math.max(0, Math.floor((b - a) / 86_400_000));
}

/** Progress (0..1) toward the next evolution stage, plus a label. */
export function evolutionProgress(sessions: number): { ratio: number; next: 'baby' | 'teen' | 'legendary' | null } {
  if (sessions >= EVOLUTION.legendary) return { ratio: 1, next: null };
  if (sessions >= EVOLUTION.teen) {
    return { ratio: (sessions - EVOLUTION.teen) / (EVOLUTION.legendary - EVOLUTION.teen), next: 'legendary' };
  }
  if (sessions >= EVOLUTION.baby) {
    return { ratio: (sessions - EVOLUTION.baby) / (EVOLUTION.teen - EVOLUTION.baby), next: 'teen' };
  }
  return { ratio: sessions / EVOLUTION.baby, next: 'baby' };
}
