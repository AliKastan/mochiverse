import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { SpeciesId, Stage } from '../game/types';
import { MonsterView } from './MonsterView';
import { ItemIcon } from './ItemIcon';
import { HeartIcon } from './Icons';
import { getToyPlay } from '../game/toys';

// ============================================================
// Toy play mini-scene. A toy (e.g. the ball) drops onto the
// ground; the pet chases it, kicks it, and the toy flies with
// simple physics — gravity, ground + wall bounces, and friction
// that slows it to a stop. After a few kicks the session ends and
// the toy fades away. Little hearts pop on each kick to show the
// mood lift the play already granted.
//
// The physics adapts to the live container size (read every frame
// from the wrapper ref), so bounces land correctly on any screen
// width. Behaviour comes from game/toys.ts, so new toys just add a
// config there and reuse this scene.
// ============================================================

interface Props {
  toyId: string;
  species: SpeciesId;
  stage: Stage;
  form: string;
  /** height of the ground strip at the bottom of the play area (px) */
  groundHeight?: number;
  /** worn cosmetic id, forwarded to the pet sprite */
  skin?: string;
  onEnd: () => void;
}

interface Heart { id: number; x: number; y: number }
let heartSeq = 0;

interface Sim {
  bx: number; by: number; vx: number; vy: number; roll: number;
  px: number; facing: number;
  kicks: number; cooldown: number;
  phase: 'drop' | 'play' | 'end';
  started: boolean; elapsed: number;
  /** time of the last kick, to drive a tiny fixed hop (character never tracks ball height) */
  lastKick: number;
}

const PET_SIZE = 120;
const GRAV = 1500;      // px/s^2
const WALK = 155;       // px/s pet chase speed

export function ToyPlay({ toyId, species, stage, form, groundHeight = 58, skin, onEnd }: Props) {
  const reduced = useReducedMotion();
  const cfg = getToyPlay(toyId);
  const ballR = cfg.size / 2;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sim = useRef<Sim>({
    bx: 0, by: 0, vx: 0, vy: 0, roll: 0, px: 0, facing: 1,
    kicks: 0, cooldown: 0, phase: 'drop', started: false, elapsed: 0, lastKick: -10,
  });
  const ended = useRef(false);
  const [, setFrame] = useState(0);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [fading, setFading] = useState(false);

  // Place the toy + pet on first paint (before rAF) so the scene shows immediately.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    const s = sim.current;
    if (el && !s.started) {
      const w = el.clientWidth;
      if (w > 0) {
        s.bx = w * 0.5; s.by = 24 + ballR; s.vx = 55; s.vy = 0;
        s.px = w * 0.3; s.started = true;
        setFrame((f) => f + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    if (ended.current) return;
    ended.current = true;
    setFading(true);
    window.setTimeout(onEnd, 520);
  };

  const spawnHearts = (x: number, y: number) => {
    const batch = [0, 1].map(() => ({ id: ++heartSeq, x: x + (heartSeq % 3) * 8 - 8, y }));
    setHearts((prev) => [...prev, ...batch]);
    batch.forEach((h) =>
      window.setTimeout(() => setHearts((prev) => prev.filter((p) => p.id !== h.id)), 1100));
  };

  // Reduced motion: skip the physics entirely — a brief happy beat, then end.
  useEffect(() => {
    if (!reduced) return;
    const el = wrapRef.current;
    if (el) {
      const w = el.clientWidth;
      const s = sim.current;
      s.px = w * 0.42;
      s.bx = w * 0.58;
      s.by = el.clientHeight - groundHeight - ballR + 8;
      s.started = true;
      spawnHearts(s.px, s.by - 30);
      setFrame((f) => f + 1);
    }
    const t = window.setTimeout(finish, 1600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = 0;

    const step = (t: number) => {
      const el = wrapRef.current;
      if (!el) { raf = requestAnimationFrame(step); return; }
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!last) last = t;
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;

      const s = sim.current;
      if (w > 0 && h > 0) {
        const ballFloor = h - groundHeight - ballR + 8;   // ball center at rest
        const petFeet = h - groundHeight + 14;            // pet bottom edge

        if (!s.started) {
          s.bx = w * 0.5;
          s.by = 24 + ballR;
          s.vx = 55;
          s.vy = 0;
          s.px = w * 0.3;
          s.started = true;
        }

        s.elapsed += dt;
        s.cooldown = Math.max(0, s.cooldown - dt);

        // --- ball physics ---
        s.vy += GRAV * dt;
        s.bx += s.vx * dt;
        s.by += s.vy * dt;
        s.roll += s.vx * dt * 1.4;

        if (s.by >= ballFloor) {
          s.by = ballFloor;
          if (s.vy > 60) s.vy = -s.vy * cfg.groundBounce; else s.vy = 0;
          s.vx *= 0.9;                       // ground rolling friction
        }
        if (s.bx - ballR <= 0) { s.bx = ballR; s.vx = Math.abs(s.vx) * cfg.wallBounce; }
        else if (s.bx + ballR >= w) { s.bx = w - ballR; s.vx = -Math.abs(s.vx) * cfg.wallBounce; }
        s.vx *= (1 - 0.16 * dt);             // air drag

        // start chasing shortly after the drop
        if (s.phase === 'drop' && s.elapsed > 0.35) s.phase = 'play';

        // --- pet chase + kick ---
        if (s.phase === 'play') {
          const dx = s.bx - s.px;
          const dist = Math.abs(dx);
          if (dist > PET_SIZE * 0.32) {
            s.px += Math.sign(dx) * Math.min(WALK * dt, dist);
            s.facing = dx >= 0 ? 1 : -1;
          }
          // Only kick when the ball is on/near the ground within range — the pet
          // follows under it and waits for it to land, it never jumps up to it.
          const kickable = s.by >= ballFloor - 24;
          if (dist <= PET_SIZE * 0.42 && kickable && s.cooldown <= 0 && s.kicks < cfg.kicks) {
            const kdir = dist < 6 ? (s.px < w / 2 ? 1 : -1) : (dx >= 0 ? 1 : -1);
            s.vx = kdir * cfg.kickSpeed;
            s.vy = -cfg.kickLift;
            s.facing = kdir;
            s.kicks += 1;
            s.cooldown = 0.45;
            s.lastKick = s.elapsed;   // triggers a small fixed hop, purely cosmetic
            spawnHearts(s.px + kdir * 8, petFeet - PET_SIZE * 0.62);
          }

          // end once all kicks are spent and the ball has rolled to a near-stop,
          // or as a safety net after a hard time cap.
          const settled = s.kicks >= cfg.kicks && Math.abs(s.vx) < 26 && s.by >= ballFloor - 1;
          if ((settled || s.elapsed > 15) && !ended.current) {
            s.phase = 'end';
            finish();
          }
        }
      }

      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const s = sim.current;
  // Shadow shrinks as the ball rises off the ground.
  const el = wrapRef.current;
  const ballFloor = el ? el.clientHeight - groundHeight - ballR + 8 : 0;
  const airGap = Math.max(0, ballFloor - s.by);
  const shadowScale = Math.max(0.35, 1 - airGap / 220);
  // The character stays on the ground; a kick triggers only a tiny fixed hop
  // (a quick up-and-down over ~0.28s) that always returns to the ground line.
  // Align the sprite's VISUAL feet (it has transparent padding below) to the grass.
  const feetY = (el ? el.clientHeight : 0) - groundHeight + 14;
  const petGroundTop = feetY - (PET_SIZE - PET_SIZE * 0.34);
  const sinceKick = s.elapsed - s.lastKick;
  const kickHop = sinceKick >= 0 && sinceKick < 0.28 ? Math.sin((sinceKick / 0.28) * Math.PI) * 9 : 0;

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none',
        opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease' }}
    >
      {s.started && (
        <>
          {/* pet shadow — clamped to the ground under the character's feet, never hops */}
          <div style={{ position: 'absolute', left: s.px - 30,
            top: feetY - 8, width: 60, height: 11,
            borderRadius: '50%', background: 'rgba(70,50,90,0.30)' }} />

          {/* pet: grounded, walks (X only) to chase; kick adds a tiny fixed hop */}
          <div style={{ position: 'absolute', left: s.px - PET_SIZE / 2,
            top: petGroundTop - kickHop,
            width: PET_SIZE, height: PET_SIZE, transform: `scaleX(${s.facing})` }}>
            <MonsterView species={species} stage={stage} state="walking" form={form} size={PET_SIZE} skin={skin} />
          </div>

          {/* ball shadow */}
          <div style={{ position: 'absolute', left: s.bx - ballR * shadowScale,
            top: ballFloor + ballR - 6, width: ballR * 2 * shadowScale, height: 7,
            borderRadius: '50%', background: 'rgba(70,50,90,0.28)' }} />

          {/* the toy */}
          <div style={{ position: 'absolute', left: s.bx - ballR, top: s.by - ballR,
            width: cfg.size, height: cfg.size, transform: `rotate(${s.roll}deg)`, willChange: 'transform, top, left' }}>
            <ItemIcon icon={toyId} size={cfg.size} />
          </div>

          {/* mood-lift hearts on each kick */}
          {hearts.map((hh) => (
            <div key={hh.id} className="toyplay-heart"
              style={{ position: 'absolute', left: hh.x, top: hh.y }}>
              <HeartIcon size={18} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
