import { Howl, Howler } from 'howler';
import popMp3 from '../assets/audio/pop.mp3';
import chimeMp3 from '../assets/audio/chime.mp3';
import successMp3 from '../assets/audio/success.mp3';
import evolveMp3 from '../assets/audio/evolve.mp3';
import sadMp3 from '../assets/audio/sad.mp3';
import deathMp3 from '../assets/audio/death.mp3';
import errorMp3 from '../assets/audio/error.mp3';

// ============================================================
// Sound manager. Plays cute, theme-appropriate UI sound effects (generated with
// ElevenLabs — soft/kawaii, not the old synth beeps) through Howler.js. Lazily
// creates each Howl on first use so nothing loads until sound is actually played.
// ============================================================

const SOURCES = {
  pop: popMp3,
  chime: chimeMp3,
  success: successMp3,
  evolve: evolveMp3,
  sad: sadMp3,
  death: deathMp3,
  error: errorMp3,
} as const;

export type SoundName = keyof typeof SOURCES;

class SoundManager {
  private howls = new Map<SoundName, Howl>();
  private muted = false;

  private get(name: SoundName): Howl {
    let h = this.howls.get(name);
    if (!h) {
      h = new Howl({ src: [SOURCES[name]], format: ['mp3'], volume: 0.55 });
      this.howls.set(name, h);
    }
    return h;
  }

  setMuted(m: boolean) {
    this.muted = m;
    Howler.mute(m);
  }

  isMuted() { return this.muted; }

  play(name: SoundName) {
    if (this.muted) return;
    try { this.get(name).play(); } catch { /* audio not available — ignore */ }
  }
}

export const sound = new SoundManager();
