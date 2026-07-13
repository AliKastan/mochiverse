// ============================================================
// UI icons — PixelLab-generated pixel art (was hand-drawn SVG).
// Same component names/signatures so callers are unchanged; the
// optional `color` prop on a couple is kept for compatibility
// but ignored (the sprites carry their own colors).
// ============================================================
import candyPng from '../assets/sprites/icons/candy.png';
import medicinePng from '../assets/sprites/icons/medicine.png';
import heartPng from '../assets/sprites/icons/heart.png';
import moodPng from '../assets/sprites/icons/mood.png';
import healthPng from '../assets/sprites/icons/health.png';
import firePng from '../assets/sprites/icons/fire.png';
import sparklePng from '../assets/sprites/icons/sparkle.png';
import gravestonePng from '../assets/sprites/icons/gravestone.png';
import timerPng from '../assets/sprites/icons/timer.png';
import trophyPng from '../assets/sprites/icons/trophy.png';
import soundOnPng from '../assets/sprites/icons/sound_on.png';
import soundOffPng from '../assets/sprites/icons/sound_off.png';

interface IconProps { size?: number; }

// `smooth` icons use high-res (200px) art and are downscaled cleanly with `auto`;
// the rest are low-res pixel art that must stay crisp with `pixelated`.
function PixIcon({ src, size = 24, alt = '', smooth = false }: { src: string; size?: number; alt?: string; smooth?: boolean }) {
  return (
    <img src={src} width={size} height={size} alt={alt} draggable={false}
      style={{ imageRendering: smooth ? 'auto' : 'pixelated', objectFit: 'contain', display: 'block' }} />
  );
}

export const CandyIcon = ({ size = 24 }: IconProps) => <PixIcon src={candyPng} size={size} alt="candy" smooth />;
export const MedicineIcon = ({ size = 24 }: IconProps) => <PixIcon src={medicinePng} size={size} alt="medicine" smooth />;
export const HeartIcon = ({ size = 24 }: IconProps & { color?: string }) => <PixIcon src={heartPng} size={size} alt="heart" />;
// distinct stat icons: Mood = smiling star, Health = shield+cross
export const MoodIcon = ({ size = 24 }: IconProps & { color?: string }) => <PixIcon src={moodPng} size={size} alt="mood" />;
export const HealthIcon = ({ size = 24 }: IconProps & { color?: string }) => <PixIcon src={healthPng} size={size} alt="health" />;
export const FireIcon = ({ size = 24 }: IconProps) => <PixIcon src={firePng} size={size} alt="streak" />;
export const SparkleIcon = ({ size = 24 }: IconProps & { color?: string }) => <PixIcon src={sparklePng} size={size} alt="sparkle" />;
export const GravestoneIcon = ({ size = 24 }: IconProps) => <PixIcon src={gravestonePng} size={size} alt="memorial" />;
export const TimerIcon = ({ size = 24 }: IconProps) => <PixIcon src={timerPng} size={size} alt="timer" />;
export const TrophyIcon = ({ size = 24 }: IconProps) => <PixIcon src={trophyPng} size={size} alt="trophy" />;
export const MuteIcon = ({ size = 22, muted }: IconProps & { muted: boolean }) =>
  <PixIcon src={muted ? soundOffPng : soundOnPng} size={size} alt={muted ? 'muted' : 'sound on'} />;
