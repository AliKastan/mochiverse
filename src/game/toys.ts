// ============================================================
// Toy play registry — the single place that describes how each
// toy behaves when the pet plays with it. Kept generic so new
// toys can be added later with different animations: give the toy
// a config here keyed by its shop id. <ToyPlay> reads this config
// to drive the mini interaction; unknown toys fall back to the
// physics "kick" game so a newly added toy is never broken.
// ============================================================

/** How a toy animates during a play session. */
export type ToyPlayKind = 'kick';

export interface ToyPlayConfig {
  kind: ToyPlayKind;
  /** displayed size of the toy sprite in px (kept an integer for crisp pixels) */
  size: number;
  /** how many times the pet chases + kicks before the session ends */
  kicks: number;
  /** launch speed (px/s) imparted by a kick */
  kickSpeed: number;
  /** upward pop (px/s) added on a kick so it arcs */
  kickLift: number;
  /** 0..1 energy kept when bouncing off the ground */
  groundBounce: number;
  /** 0..1 energy kept when bouncing off a side wall */
  wallBounce: number;
}

const KICK_DEFAULT: ToyPlayConfig = {
  kind: 'kick',
  size: 34,
  kicks: 4,
  kickSpeed: 300,
  kickLift: 300,
  groundBounce: 0.55,
  wallBounce: 0.72,
};

// Per-toy overrides. The star toy is a touch bouncier/lighter than the ball.
const TOY_PLAYS: Record<string, ToyPlayConfig> = {
  ball: { ...KICK_DEFAULT },
  star_toy: { ...KICK_DEFAULT, size: 36, kickLift: 360, groundBounce: 0.66, kicks: 5 },
};

/** Config for a toy id, falling back to the generic kick game. */
export function getToyPlay(id: string): ToyPlayConfig {
  return TOY_PLAYS[id] ?? KICK_DEFAULT;
}
