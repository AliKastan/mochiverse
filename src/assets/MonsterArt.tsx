import type { SpeciesId, Stage, PetState } from '../game/types';
import { SPECIES } from '../game/constants';

// ============================================================
// Parametric placeholder monster — a cute chibi blob drawn as SVG.
// Colored per species, detailed per stage, expressive per state.
// This is a stand-in until real PixelLab frames are dropped into
// the asset registry; the API (species/stage/state) is identical,
// so swapping is transparent to callers.
// ============================================================

interface Props {
  species: SpeciesId;
  stage: Stage;
  state: PetState;
  size?: number;
}

/** blend two hex colors; t=0 → a, t=1 → b */
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function MonsterArt({ species, stage, state, size = 200 }: Props) {
  const s = SPECIES[species];
  const ghost = state === 'ghost';
  const sick = state === 'sick';

  // per-stage geometry
  const scale = stage === 'baby' ? 0.9 : stage === 'teen' ? 1 : 1.06;
  // ghosts keep a faint tint of their species so they stay distinguishable
  const bodyFill = ghost ? mix(s.color, '#EAF2FF', 0.6) : s.color;
  const bodyDark = ghost ? mix(s.colorDark, '#CBD9EE', 0.55) : s.colorDark;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`body-${species}`} cx="42%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="42%" stopColor={bodyFill} />
          <stop offset="100%" stopColor={bodyDark} />
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>

      <g transform={`translate(50 54) scale(${scale}) translate(-50 -54)`} opacity={ghost ? 0.82 : 1}>
        {/* soft ground shadow */}
        {!ghost && <ellipse cx="50" cy="90" rx="26" ry="5.5" fill="rgba(120,90,140,0.16)" />}

        {/* legendary crown */}
        {stage === 'legendary' && !ghost && (
          <g transform="translate(50 12)">
            <path d="M-13 6 L-13 -6 L-6 1 L0 -9 L6 1 L13 -6 L13 6 Z"
              fill="#FFD86B" stroke="#F5B94B" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="0" cy="-9" r="2.2" fill="#FF7FB6" />
            <circle cx="-13" cy="-6" r="1.8" fill="#7FC4FF" />
            <circle cx="13" cy="-6" r="1.8" fill="#7FE3C0" />
          </g>
        )}

        {/* teen little ears / tuft */}
        {stage !== 'baby' && !ghost && (
          <>
            <path d="M32 30 Q28 14 40 24 Z" fill={bodyDark} />
            <path d="M68 30 Q72 14 60 24 Z" fill={bodyDark} />
          </>
        )}

        {/* body */}
        {ghost ? (
          <path
            d="M50 24 C34 24 25 38 25 56 L25 84 Q28 80 31 84 Q35 88 39 84 Q43 80 47 84 Q50 88 53 84 Q57 80 61 84 Q65 88 69 84 Q72 80 75 84 L75 56 C75 38 66 24 50 24 Z"
            fill={`url(#body-${species})`} stroke={bodyDark} strokeWidth="1" strokeOpacity="0.5"
          />
        ) : (
          <path
            d="M50 22 C31 22 22 37 22 57 C22 77 34 90 50 90 C66 90 78 77 78 57 C78 37 69 22 50 22 Z"
            fill={`url(#body-${species})`} stroke={bodyDark} strokeWidth="1.2" strokeOpacity="0.35"
          />
        )}

        {/* sick green tint overlay */}
        {sick && (
          <path
            d="M50 22 C31 22 22 37 22 57 C22 77 34 90 50 90 C66 90 78 77 78 57 C78 37 69 22 50 22 Z"
            fill="#8FE38F" opacity="0.28"
          />
        )}

        {/* feet */}
        {!ghost && (
          <>
            <ellipse cx="40" cy="89" rx="7" ry="4.5" fill={bodyDark} />
            <ellipse cx="60" cy="89" rx="7" ry="4.5" fill={bodyDark} />
          </>
        )}

        <Face state={state} cheek={s.cheek} />

        {/* sleeping Zzz */}
        {state === 'sleeping' && (
          <g fill="#9A86A6" fontFamily="Fredoka, sans-serif" fontWeight="600">
            <text x="72" y="30" fontSize="9">z</text>
            <text x="79" y="22" fontSize="12">Z</text>
          </g>
        )}
        {/* sick sweat drop */}
        {sick && <path d="M74 44 q3 5 0 8 q-3 -3 0 -8Z" fill="#8FD4FF" opacity="0.9" />}
      </g>
    </svg>
  );
}

function Face({ state, cheek }: { state: PetState; cheek: string }) {
  // eye positions
  const lx = 40, rx = 60, ey = 54;

  if (state === 'ghost') {
    return (
      <g fill="#7C6B8C">
        <ellipse cx={lx} cy={ey} rx="2.6" ry="3.4" />
        <ellipse cx={rx} cy={ey} rx="2.6" ry="3.4" />
        <path d={`M45 64 Q50 61 55 64`} stroke="#7C6B8C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  const HappyEye = ({ x }: { x: number }) => (
    <path d={`M${x - 5} ${ey + 1} Q${x} ${ey - 6} ${x + 5} ${ey + 1}`} stroke="#4A3A55" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  );
  const SleepEye = ({ x }: { x: number }) => (
    <path d={`M${x - 5} ${ey} Q${x} ${ey + 4} ${x + 5} ${ey}`} stroke="#4A3A55" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  );
  const OpenEye = ({ x, droop = false }: { x: number; droop?: boolean }) => (
    <g>
      <ellipse cx={x} cy={ey + (droop ? 1 : 0)} rx="4.6" ry="5.6" fill="#3E3048" />
      <circle cx={x + 1.6} cy={ey - 2} r="1.7" fill="#fff" />
      <circle cx={x - 1.4} cy={ey + 2.2} r="0.9" fill="#fff" opacity="0.8" />
    </g>
  );

  const cheeks = (
    <>
      <ellipse cx="31" cy="62" rx="4.6" ry="3.1" fill={cheek} opacity="0.55" />
      <ellipse cx="69" cy="62" rx="4.6" ry="3.1" fill={cheek} opacity="0.55" />
    </>
  );

  switch (state) {
    case 'happy':
      return (
        <g>
          {cheeks}
          <HappyEye x={lx} /><HappyEye x={rx} />
          <path d="M44 64 Q50 71 56 64" stroke="#C24E7D" strokeWidth="2" fill="#F7A9C6" strokeLinecap="round" />
        </g>
      );
    case 'sad':
      return (
        <g>
          {cheeks}
          <OpenEye x={lx} droop /><OpenEye x={rx} droop />
          {/* tears */}
          <path d="M37 60 q2 5 0 8 q-2 -3 0 -8Z" fill="#8FD4FF" />
          <path d="M63 60 q2 5 0 8 q-2 -3 0 -8Z" fill="#8FD4FF" />
          <path d="M45 68 Q50 64 55 68" stroke="#B96A88" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'sick':
      return (
        <g>
          <ellipse cx="31" cy="62" rx="4.6" ry="3.1" fill="#9ED89E" opacity="0.6" />
          <ellipse cx="69" cy="62" rx="4.6" ry="3.1" fill="#9ED89E" opacity="0.6" />
          {/* woozy spiral eyes */}
          <path d={`M${lx} ${ey} m-4 0 a4 4 0 1 0 8 0 a2.6 2.6 0 1 0 -5 0`} stroke="#4A3A55" strokeWidth="1.5" fill="none" />
          <path d={`M${rx} ${ey} m-4 0 a4 4 0 1 0 8 0 a2.6 2.6 0 1 0 -5 0`} stroke="#4A3A55" strokeWidth="1.5" fill="none" />
          <path d="M45 66 q5 -3 10 0" stroke="#6E8E6E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'sleeping':
      return (
        <g>
          {cheeks}
          <SleepEye x={lx} /><SleepEye x={rx} />
          <ellipse cx="50" cy="65" rx="2.2" ry="1.6" fill="#C24E7D" opacity="0.6" />
        </g>
      );
    default: // idle
      return (
        <g>
          {cheeks}
          <OpenEye x={lx} /><OpenEye x={rx} />
          <path d="M46 64 Q50 68 54 64" stroke="#C24E7D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}
