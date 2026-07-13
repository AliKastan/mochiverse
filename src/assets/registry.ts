import { useEffect, useState } from 'react';
import type { SpeciesId, Stage, PetState } from '../game/types';

// ============================================================
// Asset registry — the single swap point for real art.
//
// PixelLab-generated pixel-art frames live under ./sprites/ as
// `<species>/<stage>/<state>_<n>.png`. There are ~1500 of them.
//
// IMPORTANT (why this is lazy): loading every frame up front with an EAGER
// `?url` glob makes the Vite DEV server fire ~1500 asset requests on boot. That
// floods the browser's 6-connection-per-host limit, so some requests get
// dropped and images (often the small icons) randomly fail to appear. A
// production build is fine (assets are bundled / inlined), but dev is not.
//
// So we discover which frames EXIST synchronously (from the glob's keys, which
// need no network) but only FETCH a form+state's frame URLs the first time it's
// actually shown. `useSpriteVersion()` re-renders the sprite components when a
// requested group finishes loading. The tiny, always-needed blob + egg frames
// stay eager so there's an instant fallback.
// ============================================================

// ---- reactive nudge: re-render sprite views when lazy frames finish loading ----
let spriteVersion = 0;
const listeners = new Set<() => void>();
function notifyLoaded() { spriteVersion++; for (const l of listeners) l(); }

/** Subscribe a sprite-rendering component so it re-renders once newly requested
 *  frames have loaded. Call it once at the top of any component that reads the
 *  get*Frames helpers. */
export function useSpriteVersion(): number {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return spriteVersion;
}

type Loader = () => Promise<string>;

// Group lazy loaders by a parsed key, ordered by frame index — all from the glob
// KEYS (paths), which are known synchronously without any fetch.
function buildIndex(loaders: Record<string, Loader>, parse: (p: string) => { key: string; n: number } | null) {
  const index: Record<string, { n: number; load: Loader }[]> = {};
  for (const [path, load] of Object.entries(loaders)) {
    const p = parse(path);
    if (!p) continue;
    (index[p.key] ||= []).push({ n: p.n, load });
  }
  for (const k of Object.keys(index)) index[k].sort((a, b) => a.n - b.n);
  return index;
}

const urlCache: Record<string, string[]> = {}; // key -> resolved frame URLs
const inflight = new Set<string>();

// Return the cached URLs for a group, or null while (kicking off) its load.
function ensure(index: Record<string, { n: number; load: Loader }[]>, key: string): string[] | null {
  const cached = urlCache[key];
  if (cached) return cached;
  const group = index[key];
  if (!group || !group.length) return null;
  if (!inflight.has(key)) {
    inflight.add(key);
    Promise.all(group.map((g) => g.load()))
      .then((urls) => { urlCache[key] = urls; inflight.delete(key); notifyLoaded(); })
      .catch(() => { inflight.delete(key); });
  }
  return null;
}

/** frame image URLs per animation, keyed `${species}/${stage}/${state}` (populated on demand) */
export const MONSTER_FRAMES = urlCache; // back-compat alias (reads resolved groups)

// ---- species/stage frames (LAZY) ----
const MONSTER_INDEX = buildIndex(
  import.meta.glob('./sprites/*/*/*_*.png', { query: '?url', import: 'default' }) as Record<string, Loader>,
  (path) => {
    const m = path.match(/\/sprites\/([^/]+)\/([^/]+)\/([a-z]+)_(\d+)\.png$/);
    return m ? { key: `${m[1]}/${m[2]}/${m[3]}`, n: Number(m[4]) } : null;
  },
);

export function monsterKey(species: SpeciesId, stage: Stage, state: PetState): string {
  return `${species}/${stage}/${state}`;
}

export function getMonsterFrames(species: SpeciesId, stage: Stage, state: PetState): string[] | null {
  const exact = ensure(MONSTER_INDEX, monsterKey(species, stage, state));
  if (exact && exact.length) return exact;
  const idle = ensure(MONSTER_INDEX, monsterKey(species, stage, 'idle'));
  return idle && idle.length ? idle : null;
}

// ---- egg crack frames (tiny set → EAGER, always ready) ----
const eggModules = import.meta.glob('./sprites/egg/egg_*.png', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

export const EGG_FRAMES: string[] = Object.entries(eggModules)
  .map(([path, url]) => ({ n: Number(path.match(/egg_(\d+)\.png$/)?.[1] ?? 0), url }))
  .sort((a, b) => a.n - b.n)
  .map((x) => x.url);

// ---- blob stage (species-agnostic hatchling + universal fallback → EAGER) ----
const blobModules = import.meta.glob('./sprites/_blob/*_*.png', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

export const BLOB_FRAMES: Partial<Record<string, string[]>> = {};
{
  const grouped: Record<string, { n: number; url: string }[]> = {};
  for (const [path, url] of Object.entries(blobModules)) {
    const m = path.match(/\/_blob\/([a-z]+)_(\d+)\.png$/);
    if (!m) continue;
    (grouped[m[1]] ||= []).push({ n: Number(m[2]), url });
  }
  for (const [state, arr] of Object.entries(grouped)) {
    arr.sort((a, b) => a.n - b.n);
    BLOB_FRAMES[state] = arr.map((x) => x.url);
  }
}

export function getBlobFrames(state: PetState): string[] | null {
  return BLOB_FRAMES[state] ?? BLOB_FRAMES['idle'] ?? null;
}

// ---- branching-tree forms: sprites/tree/<formId>/<state>_<n>.png (LAZY) ----
const FORM_INDEX = buildIndex(
  import.meta.glob('./sprites/tree/*/*_*.png', { query: '?url', import: 'default' }) as Record<string, Loader>,
  (path) => {
    const m = path.match(/\/tree\/([a-z0-9_]+)\/([a-z]+)_(\d+)\.png$/);
    return m ? { key: `${m[1]}/${m[2]}`, n: Number(m[3]) } : null;
  },
);

/** Frames for a tree form + state. `cell` reuses the blob sprites. Returns null if not generated / not loaded yet. */
export function getFormFrames(formId: string, state: PetState): string[] | null {
  if (formId === 'cell') return getBlobFrames(state);
  const exact = ensure(FORM_INDEX, `${formId}/${state}`);
  if (exact && exact.length) return exact;
  const idle = ensure(FORM_INDEX, `${formId}/idle`);
  return idle && idle.length ? idle : null;
}

// Warm ALL of a creature's states as soon as it appears, so switching state
// (idle ⇄ walking, a happy hop, sickness…) never hits an unloaded group and
// blanks the sprite. Only the currently-shown creature is warmed — still far
// from the old "load all 1557 up front" flood.
export function preloadForm(formId: string): void {
  if (formId === 'cell') return; // blob is eager
  const prefix = `${formId}/`;
  for (const key of Object.keys(FORM_INDEX)) if (key.startsWith(prefix)) ensure(FORM_INDEX, key);
}
export function preloadMonster(species: SpeciesId, stage: Stage): void {
  const prefix = `${species}/${stage}/`;
  for (const key of Object.keys(MONSTER_INDEX)) if (key.startsWith(prefix)) ensure(MONSTER_INDEX, key);
}

/** frames-per-second per state for real sprite playback */
export const STATE_FPS: Record<PetState, number> = {
  idle: 4, walking: 8, happy: 8, sad: 3, sick: 5, eating: 6, sleeping: 2, ghost: 3,
};
