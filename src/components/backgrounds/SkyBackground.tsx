import { motion, useReducedMotion } from 'framer-motion';
import skyDay from '../../assets/sprites/bg/day/sky.png';
import sunImg from '../../assets/sprites/bg/day/sun.png';
import cloud1 from '../../assets/sprites/bg/day/cloud1.png';
import cloud2 from '../../assets/sprites/bg/day/cloud2.png';
import { useGame } from '../../store/useGame';
import { getTheme, THEMES } from '../../game/premium';

// ============================================================
// The sky. Theme-aware: the free "day" theme uses the original dithered
// PixelLab sky PNG; premium themes (sunset / aurora / sakura / midnight) paint
// a full-screen gradient and tint the sun/cloud sprites to match, so unlocking
// a theme visibly transforms the whole app. Night-style themes swap the sun for
// drifting stars. The ground is still owned by each screen.
// ============================================================

const px = { imageRendering: 'pixelated' as const };

function Cloud({ src, x, y, w, dur, delay, reduced, filter }:
  { src: string; x: number; y: number; w: number; dur: number; delay: number; reduced: boolean; filter?: string }) {
  return (
    <motion.img
      src={src} width={w} draggable={false}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, ...px, filter, willChange: 'transform' }}
      animate={reduced ? undefined : { x: ['-10%', '10%', '-10%'] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// A field of soft twinkling stars for the night-style themes.
function Stars({ reduced }: { reduced: boolean }) {
  const stars = [
    [12, 14], [26, 8], [40, 18], [58, 10], [72, 22], [86, 12], [20, 30],
    [50, 28], [80, 34], [34, 40], [66, 44], [90, 26], [8, 44], [46, 6],
  ];
  return (
    <>
      {stars.map(([x, y], i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: i % 3 ? 3 : 4, height: i % 3 ? 3 : 4,
            borderRadius: '50%', background: '#fff', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }}
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 2 + (i % 4), delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </>
  );
}

export function SkyBackground() {
  const reduced = !!useReducedMotion();
  const themeId = useGame((s) => s.settings.theme);
  const premium = useGame((s) => s.premium);
  // enforce entitlement at render: a premium theme falls back to the free "day"
  // theme if the subscription isn't (or is no longer) active.
  const picked = getTheme(themeId);
  const theme = picked.premium && !premium ? THEMES[0] : picked;
  const isDay = theme.id === 'day';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: theme.sky }}>
      {/* the free "day" theme keeps the original dithered pixel sky on top of the gradient */}
      {isDay && (
        <img src={skyDay} draggable={false}
          style={{ position: 'absolute', inset: -2, width: 'calc(100% + 4px)', height: 'calc(100% + 4px)',
            objectFit: 'cover', imageRendering: 'auto' }} />
      )}

      {theme.night && <Stars reduced={reduced} />}

      {!theme.hideSun && (
        <motion.img src={sunImg} width={104} draggable={false}
          style={{ position: 'absolute', top: '5%', right: '8%', ...px, filter: theme.spriteFilter, willChange: 'transform' }}
          animate={reduced ? undefined : { y: [0, -4, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      )}

      {/* parallax clouds (skipped on deep-night themes for a clearer starfield) */}
      {!theme.night && (
        <>
          <Cloud src={cloud1} x={-6} y={12} w={130} dur={22} delay={0} reduced={reduced} filter={theme.spriteFilter} />
          <Cloud src={cloud2} x={58} y={7} w={92} dur={30} delay={2} reduced={reduced} filter={theme.spriteFilter} />
          <Cloud src={cloud2} x={22} y={40} w={80} dur={26} delay={1} reduced={reduced} filter={theme.spriteFilter} />
          <Cloud src={cloud1} x={64} y={50} w={150} dur={34} delay={3} reduced={reduced} filter={theme.spriteFilter} />
        </>
      )}
    </div>
  );
}
