import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, SparkleIcon } from './Icons';

// ============================================================
// Particle bursts: floating hearts (petting), sparkles, confetti
// (evolution / celebration). Purely decorative, pointer-transparent.
// ============================================================

export interface Burst { id: number; x: number; y: number; }

export function HeartBurst({ bursts }: { bursts: Burst[] }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, overflow: 'hidden' }}>
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div key={b.id} style={{ position: 'absolute', left: b.x, top: b.y }}
            initial={{ opacity: 0, scale: 0.3, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 0.9], y: -90, x: (b.id % 2 ? 24 : -24) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}>
            <HeartIcon size={30} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const CONFETTI_COLORS = ['#FF8FC7', '#B39DFF', '#7FE3C0', '#7FC4FF', '#FFE38F', '#FFB68F'];

export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const a = (i * 9301 + 49297) % 233280;
    const b = (i * 4021 + 1231) % 233280;
    return {
      x: (a / 233280) * 100,
      delay: (b / 233280) * 0.6,
      rot: (a % 360),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      dur: 2 + (b / 233280) * 1.6,
      size: 7 + (i % 4) * 3,
    };
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 55 }}>
      {pieces.map((p, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: `${p.x}%`, top: -20, width: p.size, height: p.size * 0.6,
            background: p.color, borderRadius: 2 }}
          initial={{ y: -20, rotate: p.rot, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rot + 360, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export function SparkleRing() {
  const sparks = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'grid', placeItems: 'center' }}>
      {sparks.map((ang, i) => (
        <motion.div key={i} style={{ position: 'absolute' }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.6],
            x: Math.cos(ang) * 120, y: Math.sin(ang) * 120 }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08, ease: 'easeOut' }}>
          <SparkleIcon size={20} />
        </motion.div>
      ))}
    </div>
  );
}
