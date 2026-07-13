import { motion, useReducedMotion } from 'framer-motion';
import skyNight from '../../assets/sprites/bg/night/sky.png';
import moonImg from '../../assets/sprites/bg/night/moon.png';
import starImg from '../../assets/sprites/bg/night/star.png';
import fireflyImg from '../../assets/sprites/bg/night/firefly.png';

// ============================================================
// Cozy night scene, fully pixel art (PixelLab). A dithered dark
// sky panel, a soft crescent moon, twinkling pixel stars and a
// few drifting fireflies. Used in Focus mode. No CSS gradients.
// ============================================================

const px = { imageRendering: 'pixelated' as const };

// deterministic star field so stars don't jump between renders
const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = (i * 9301 + 49297) % 233280;
  const b = (i * 4021 + 1231) % 233280;
  return { x: (a / 233280) * 100, y: (b / 233280) * 58, s: 10 + (i % 4) * 4, d: 2 + (i % 5) };
});

const FIREFLIES = Array.from({ length: 6 }, (_, i) => {
  const a = (i * 6151 + 1013) % 233280;
  return { x: 10 + (a / 233280) * 80, y: 58 + (i % 3) * 10, d: 5 + (i % 4) };
});

export function NightBackground({ dim = false }: { dim?: boolean }) {
  const reduced = !!useReducedMotion();
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* dithered pixel night sky (smoothed to avoid upscale banding) */}
      <img src={skyNight} draggable={false}
        style={{ position: 'absolute', inset: -2, width: 'calc(100% + 4px)', height: 'calc(100% + 4px)',
          objectFit: 'cover', imageRendering: 'auto' }} />

      {/* moon */}
      <img src={moonImg} width={92} draggable={false}
        style={{ position: 'absolute', top: '7%', left: '10%', ...px }} />

      {/* twinkling stars */}
      {STARS.map((s, i) => (
        <motion.img key={i} src={starImg} width={s.s} draggable={false}
          style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, ...px, willChange: 'opacity, transform' }}
          animate={reduced ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: s.d, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.3 }} />
      ))}

      {/* drifting fireflies */}
      {FIREFLIES.map((f, i) => (
        <motion.img key={`f${i}`} src={fireflyImg} width={16} draggable={false}
          style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, ...px, willChange: 'transform, opacity' }}
          animate={reduced ? undefined : { x: [0, 14, -6, 0], y: [0, -10, 4, 0], opacity: [0.4, 1, 0.5, 0.4] }}
          transition={{ duration: f.d, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }} />
      ))}

      {dim && <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,14,40,0.35)' }} />}
    </div>
  );
}
