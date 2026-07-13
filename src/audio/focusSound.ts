import { Howl } from 'howler';
import lofiMp3 from '../assets/audio/lofi.mp3';
import pianoMp3 from '../assets/audio/piano.mp3';
import rainMp3 from '../assets/audio/rain.mp3';

// ============================================================
// Ambient focus music — gentle, theme-appropriate loops (generated with
// ElevenLabs: calm lofi, a soft music-box/piano lullaby, and soft rain). Plays
// on a seamless loop for the whole session, with a soft fade in/out. Replaces
// the old procedural noise, which was harsh. Extra tracks are Premium.
// ============================================================

export type FocusSoundId = 'off' | 'lofi' | 'piano' | 'rain';

export interface FocusSoundDef { id: FocusSoundId; nameKey: string; premium: boolean; }
export const FOCUS_SOUNDS: FocusSoundDef[] = [
  { id: 'off', nameKey: 'off', premium: false },
  { id: 'lofi', nameKey: 'lofi', premium: false }, // flagship, free
  { id: 'piano', nameKey: 'piano', premium: true },
  { id: 'rain', nameKey: 'rain', premium: true },
];

const SRC: Record<Exclude<FocusSoundId, 'off'>, string> = { lofi: lofiMp3, piano: pianoMp3, rain: rainMp3 };
const VOL = 0.4;

const howls = new Map<string, Howl>();
let currentHowl: Howl | null = null;
let current: FocusSoundId = 'off';

function get(id: Exclude<FocusSoundId, 'off'>): Howl {
  let h = howls.get(id);
  if (!h) { h = new Howl({ src: [SRC[id]], format: ['mp3'], loop: true, volume: 0 }); howls.set(id, h); }
  return h;
}

export function playFocusSound(kind: FocusSoundId) {
  if (kind === current) return;
  stopFocusSound();
  current = kind;
  if (kind === 'off') return;
  try {
    const h = get(kind);
    currentHowl = h;
    h.play();
    h.fade(0, VOL, 700);
  } catch { /* audio unavailable — silent */ }
}

export function stopFocusSound() {
  const h = currentHowl;
  if (h) {
    try { h.fade(h.volume(), 0, 300); const id = window.setTimeout(() => h.stop(), 320); void id; }
    catch { try { h.stop(); } catch { /* ignore */ } }
  }
  currentHowl = null;
  current = 'off';
}

export function currentFocusSound(): FocusSoundId { return current; }
