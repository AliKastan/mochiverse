import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SpeciesId, Stage, PetState } from '../game/types';
import { MonsterView } from './MonsterView';

// ============================================================
// Idle life: the pet wanders the ground on its own.
//
// A tiny state machine — IDLE ⇄ WANDER — picks a random spot on the
// ground, strolls there using the frame-based `walking` animation
// (falls back to the idle sprite with a gentle bob until real walk
// frames exist), pauses 2–6s, then wanders again. It flips to face
// its direction and never walks off-screen.
//
// Wandering only runs while the pet is calm (`idle`). Any other
// state — a feed/pet reaction (EAT/HAPPY), sadness, sickness, or the
// PLAY / SLEEP scenes owned by other components — makes it stand
// still and show that state instead, so animations never overlap.
//
// The vertical position is locked to the ground line (only X moves),
// and the shadow is clamped under the pet.
// ============================================================

interface Props {
  state: PetState;
  species: SpeciesId;
  stage: Stage;
  form: string;
  /** height of the ground strip so the feet land on the grass line */
  groundHeight: number;
  size?: number;
  /** premium pet skin id, forwarded to the pet sprite */
  skin?: string;
  onPet: (e: React.MouseEvent) => void;
}

interface Sim {
  x: number; targetX: number; facing: number;
  machine: 'idle' | 'wander';
  timer: number;       // seconds until the next idle→wander decision
  elapsed: number;
  hopAt: number;       // elapsed time of the last idle hop (small random action)
  started: boolean;
}

const WALK = 44;       // px/s — an unhurried stroll
const FEET = 16;       // how far the feet sink below the ground's top edge (onto the grass)
const PAD_FRAC = 0.34; // fraction of the sprite box that is transparent padding below the feet

export function RoamingPet({ state, species, stage, form, groundHeight, size = 150, skin, onPet }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sim = useRef<Sim>({ x: -1, targetX: 0, facing: 1, machine: 'idle', timer: 1.4, elapsed: 0, hopAt: -10, started: false });
  const [, setFrame] = useState(0);

  // Wander only when the pet is calm; a reaction / sad / sick state stands still.
  const canWander = state === 'idle';
  const canWanderRef = useRef(canWander);
  canWanderRef.current = canWander;

  // Place the pet on first paint (before rAF) so it's visible immediately.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (el && !sim.current.started) {
      const w = el.clientWidth;
      if (w > 0) {
        sim.current.x = w * 0.5;
        sim.current.targetX = w * 0.5;
        sim.current.started = true;
        setFrame((f) => f + 1);
      }
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const step = (t: number) => {
      const el = wrapRef.current;
      if (!el) { raf = requestAnimationFrame(step); return; }
      const w = el.clientWidth;
      if (!last) last = t;
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;

      const s = sim.current;
      const margin = size * 0.42;
      if (w > 0) {
        if (!s.started) { s.x = w * 0.5; s.targetX = s.x; s.started = true; }
        s.elapsed += dt;

        if (canWanderRef.current) {
          s.timer -= dt;
          if (s.machine === 'idle') {
            if (s.timer <= 0) {
              // pick a new spot anywhere on the ground (never off-screen) and set off
              s.targetX = rnd(margin, Math.max(margin, w - margin));
              s.machine = 'wander';
              s.facing = s.targetX >= s.x ? 1 : -1;
            }
          } else {
            const dx = s.targetX - s.x;
            const dist = Math.abs(dx);
            if (dist > 2) {
              s.x += Math.sign(dx) * Math.min(WALK * dt, dist);
              s.facing = dx >= 0 ? 1 : -1;
            } else {
              s.machine = 'idle';
              s.timer = rnd(2, 6);
              if (Math.random() < 0.5) s.hopAt = s.elapsed;   // occasional tiny hop between strolls
            }
          }
        } else {
          s.machine = 'idle';   // stand and show the current reaction/critical state
        }
      }

      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const s = sim.current;
  const el = wrapRef.current;
  const w = el ? el.clientWidth : 0;
  const h = el ? el.clientHeight : 0;
  // Render as soon as the container is measured — don't wait on an effect. Lazily
  // place the pet at centre on the first measured frame so it's always visible.
  const ready = w > 0 && h > 0;
  if (ready && s.x < 0) { s.x = w / 2; s.targetX = w / 2; s.started = true; }
  // The sprite has transparent padding below the body; align the VISUAL feet
  // (not the sprite box) to the grass line so the pet stands on the ground.
  const feetY = h - groundHeight + FEET;   // where the feet touch
  const groundTop = feetY - (size - size * PAD_FRAC);
  const wandering = canWander && s.machine === 'wander';
  const visual: PetState = canWander ? (wandering ? 'walking' : 'idle') : state;
  // a small, quick hop for the occasional idle action; always returns to ground
  const sinceHop = s.elapsed - s.hopAt;
  const hop = !wandering && sinceHop >= 0 && sinceHop < 0.32 ? Math.sin((sinceHop / 0.32) * Math.PI) * 7 : 0;

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
      {ready && (
        <>
          {/* shadow clamped to the ground under the pet's feet (never hops) */}
          <div style={{ position: 'absolute', left: s.x - size * 0.2,
            top: feetY - 8, width: size * 0.4, height: 12,
            borderRadius: '50%', background: 'rgba(70,50,90,0.30)' }} />

          {/* the pet — grounded, flips to face its walking direction */}
          <button onClick={onPet}
            style={{ position: 'absolute', left: s.x - size / 2, top: groundTop - hop,
              width: size, height: size, padding: 0, background: 'none',
              transform: `scaleX(${s.facing})`, pointerEvents: 'auto' }}>
            <MonsterView species={species} stage={stage} state={visual} form={form} size={size} skin={skin} />
          </button>
        </>
      )}
    </div>
  );
}
