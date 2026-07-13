import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { SpeciesId, Stage, PetState } from '../game/types';
import { getMonsterFrames, getBlobFrames, getFormFrames, STATE_FPS, useSpriteVersion, preloadForm, preloadMonster } from '../assets/registry';
import { SpriteAnimation } from './SpriteAnimation';
import { getSkin } from '../game/premium';

// ============================================================
// The pet, front and center. Renders ONLY the real PixelLab sprite
// PNGs — never a drawn/generated placeholder.
// Applies a lively, state-appropriate motion loop on top, plus an optional
// premium `skin` (a colour filter over the sprite — golden / cosmic / …).
// ============================================================

interface Props {
  species: SpeciesId;
  stage: Stage;
  state: PetState;
  size?: number;
  /** branching-tree form id; when set it drives the sprite (falls back to species/stage art) */
  form?: string;
  /** premium pet skin id (see game/premium SKINS); tints the sprite */
  skin?: string;
}

const loops: Record<PetState, Variants> = {
  // Calm resting state: the sprite frames carry the life (blink / tiny twitch),
  // so the wrapper stays still — no hop or squash on the body.
  idle: {
    animate: {},
  },
  // A gentle walk bounce. With real walk frames this reads as a natural stride;
  // with the idle-frame fallback (before walk art exists) it still looks alive.
  walking: {
    animate: { y: [0, -4, 0], transition: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' } },
  },
  happy: {
    animate: { y: [0, -18, 0, -6, 0], scaleY: [1, 1.06, 0.9, 1, 1],
      transition: { duration: 0.95, repeat: Infinity, ease: 'easeOut' } },
  },
  sad: {
    animate: { rotate: [-2, 2, -2], y: [0, 2, 0],
      transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
  },
  sick: {
    animate: { rotate: [-4, 4, -4], x: [-2, 2, -2],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
  },
  eating: {
    animate: { y: [0, -2, 0], scaleY: [1, 0.96, 1],
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } },
  },
  sleeping: {
    animate: { scale: [1, 1.035, 1], y: [0, 1, 0],
      transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  },
  ghost: {
    animate: { y: [0, -10, 0], opacity: [0.85, 1, 0.85],
      transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } },
  },
};

export function MonsterView({ species, stage, state, size = 210, form, skin }: Props) {
  const reduced = useReducedMotion();
  useSpriteVersion(); // re-render when this form/state's frames finish lazy-loading

  const skinFilter = skin ? getSkin(skin).filter : '';

  // Warm every state of THIS creature the moment it appears, so a later state
  // change (idle ⇄ walking, a happy hop, sickness) is served from cache and the
  // sprite never blanks mid-transition while a group lazy-loads.
  useEffect(() => {
    if (form) preloadForm(form);
    else if (stage !== 'blob') preloadMonster(species, stage);
  }, [form, species, stage]);

  // Resolve to the pet's own PixelLab PNG frames for this state. If this exact
  // state has no art, the registry already falls back to the form's idle PNGs.
  const requested = form
    ? getFormFrames(form, state)
    : stage === 'blob' ? getBlobFrames(state) : getMonsterFrames(species, stage, state);

  // The universal fallback is ALWAYS a PNG the user made — the blob idle frames,
  // which are bundled and always present — so we never draw a generated character.
  const blobIdle = getBlobFrames('idle') ?? [];
  const primary = requested && requested.length ? requested : blobIdle;

  // If a frame image fails to load (missing file / 404 in a mis-hosted build),
  // fall back to the idle PNG — never to a drawn placeholder.
  const [spriteFailed, setSpriteFailed] = useState(false);
  useEffect(() => { setSpriteFailed(false); }, [primary]);
  const computed = spriteFailed && blobIdle.length ? blobIdle : primary;

  // Never render an empty sprite: while a state's frames are still lazy-loading
  // (computed briefly empty), keep showing the last good frames so the pet never
  // vanishes-and-pops-back.
  const lastGood = useRef<string[]>([]);
  if (computed.length) lastGood.current = computed;
  const frames = computed.length ? computed : lastGood.current;

  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative', display: 'grid', placeItems: 'center',
        filter: skinFilter || undefined, willChange: 'transform' }}
      variants={reduced ? undefined : loops[state]}
      animate={reduced ? undefined : 'animate'}
    >
      {frames.length > 0 && (
        <SpriteAnimation frames={frames} fps={STATE_FPS[state]} size={size} alt={`${species} ${state}`}
          onError={() => setSpriteFailed(true)} />
      )}
    </motion.div>
  );
}
