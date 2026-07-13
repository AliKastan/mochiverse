import { motion } from 'framer-motion';
import { EGG_FRAMES } from './registry';
import { SpriteAnimation } from '../components/SpriteAnimation';

// ============================================================
// Egg with 4 crack stages (0 = intact, 3 = about to hatch).
// Placeholder SVG; upgrades to real frames if EGG_FRAMES is set.
// ============================================================

interface Props {
  crackStage: 0 | 1 | 2 | 3;
  size?: number;
}

export function EggArt({ crackStage, size = 190 }: Props) {
  if (EGG_FRAMES.length >= 4) {
    // wobble intensifies slightly as the egg cracks toward hatching
    const wob = 2 + crackStage;
    return (
      <motion.div
        style={{ display: 'grid', placeItems: 'center' }}
        animate={{ rotate: [-wob, wob, -wob], y: [0, -2, 0] }}
        transition={{ duration: Math.max(0.5, 1.7 - crackStage * 0.35), repeat: Infinity, ease: 'easeInOut' }}
      >
        <SpriteAnimation frames={[EGG_FRAMES[crackStage]]} size={size} loop={false} />
      </motion.div>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="egg-g" cx="40%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FFE7F3" />
          <stop offset="100%" stopColor="#FFC3E0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="24" ry="5" fill="rgba(120,90,140,0.16)" />
      {/* egg body */}
      <path d="M50 12 C30 12 22 44 22 62 C22 82 35 92 50 92 C65 92 78 82 78 62 C78 44 70 12 50 12 Z"
        fill="url(#egg-g)" stroke="#F3A9CE" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* cute spots */}
      <circle cx="38" cy="46" r="4" fill="#FFB0D6" opacity="0.7" />
      <circle cx="60" cy="58" r="5.5" fill="#B9E7FF" opacity="0.7" />
      <circle cx="52" cy="36" r="3" fill="#C9F5DE" opacity="0.7" />
      {/* highlight */}
      <ellipse cx="40" cy="34" rx="7" ry="10" fill="#fff" opacity="0.55" />

      {/* cracks appear progressively */}
      {crackStage >= 1 && (
        <path d="M50 24 L46 34 L54 40 L48 50" stroke="#B07B9A" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {crackStage >= 2 && (
        <path d="M34 52 L44 56 L38 64 L48 68 L42 78" stroke="#B07B9A" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {crackStage >= 3 && (
        <>
          <path d="M62 46 L54 52 L64 58 L56 66" stroke="#B07B9A" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 60 Q50 54 74 60" stroke="#B07B9A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
