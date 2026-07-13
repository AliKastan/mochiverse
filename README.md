# Mochiverse 🌸

A focus / Pomodoro app with **full Tamagotchi logic** — your pixel pet thrives when
you focus and **dies permanently** if you neglect it. Built for students and anyone
fighting procrastination. Cozy, candy-pastel, mobile-first.

> **Odaklan ve büyüsün. İhmal et ve sonsuza dek kaybet.**
> (The UI is in Turkish — all copy lives in [`src/game/copy.ts`](src/game/copy.ts) for easy editing.)

---

## ✨ Features

- **Strict Tamagotchi survival** — hunger, mood & health decay in **real time, even
  while the app is closed** (computed from `lastSeenAt` on load). Neglect actually hurts.
- **Permadeath** — health hits 0 → the pet is gone forever. A gravestone scene shows its
  name, days survived and total focus hours, then it joins the **Memorial Garden**. No
  revive, no undo.
- **Sickness** — below 40 health the pet turns green & woozy; only medicine cures it.
- **Evolution** — 3 sessions → teen, 8 → legendary (crown), with a full-screen confetti
  celebration.
- **Pomodoro focus** — 15 / 25 / 50 min + custom. The pet sleeps and decay pauses while
  you focus.
- **Anti-cheat** — the Page Visibility API watches the tab. Leave for >20s cumulative and
  it counts as quitting (a gentle warning fires at 10s). Quitting costs mood, health and
  your streak, and plays a heartbroken animation.
- **Care loop** — feed with candy, pet for floating hearts (max 5/hr), heal with medicine.
- **Stats** — GitHub-style contribution heatmap of daily focus minutes, longest streak,
  total hours & sessions.
- **Polish** — glassmorphism, animated gradient skies, spring physics, particle bursts,
  synthesized Howler sound with a mute toggle, `prefers-reduced-motion` support.

## 🛠 Tech stack

| Concern      | Choice |
|--------------|--------|
| Build        | Vite + React + TypeScript |
| State        | Zustand + `persist` (localStorage) |
| Animation    | Framer Motion |
| Sound        | Howler.js (WAV data-URIs synthesized at runtime — no audio assets to ship) |
| Art          | PixelLab (see below) with a code-drawn placeholder fallback |

## 🚀 Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

No backend — everything is client-side and persisted to `localStorage`
(key `mochiverse-v1`). To reset your save, clear that key or run
`localStorage.removeItem('mochiverse-v1')` in the console.

## 📁 Structure

```
src/
  game/            # pure domain: types, constants (balance), decay/evolution logic, TR copy
  store/useGame.ts # Zustand store: real-time decay, permadeath, focus rewards, persistence
  audio/sound.ts   # Howler sound manager (runtime-synthesized tones)
  assets/          # MonsterArt / EggArt placeholders + registry.ts (the real-art swap point)
  components/      # MonsterView, SpriteAnimation, StatBar, Icons, Particles, backgrounds, toast
  screens/         # Onboarding, Hatch, Home, Focus, SessionComplete, DeathScene, Memorial, Stats
  App.tsx          # screen router, resume-on-load decay, live tick, global mute
```

## 🎨 Art: PixelLab + placeholders

The pet, egg and effects currently render as **parametric SVG placeholders**
(`src/assets/MonsterArt.tsx`, `EggArt.tsx`) so the game is fully playable today.

Real [PixelLab](https://pixellab.ai) pixel-art frames drop in through a single swap point,
[`src/assets/registry.ts`](src/assets/registry.ts) — no component changes needed:

```ts
import mochiBabyIdle0 from './sprites/mochi/baby/idle_0.png';
// ...more frames
MONSTER_FRAMES['mochi/baby/idle'] = [mochiBabyIdle0, mochiBabyIdle1, ...];
EGG_FRAMES = [egg0, egg1, egg2, egg3];
```

`MonsterView` automatically plays real frames via `SpriteAnimation` when the registry has
them for a `species/stage/state`, and falls back to the placeholder otherwise.

**Planned generated assets:** 5 species × 3 stages (baby → teen → legendary+crown), each
with idle / happy / sad / sick / sleeping / ghost frames; egg crack frames; 2 parallax
backgrounds; UI icons. Balance & tuning live in `src/game/constants.ts`.

## ⚖️ Balance (default)

Decay: hunger −4/hr, mood −3/hr; health −8/hr while hunger **or** mood is empty.
Session reward: +2 candy, +18 mood, +6 health, +1 medicine every 3rd session, streak +1.
Quit penalty: −30 mood, −20 health, streak reset. Feeding: −1 candy, +35 hunger.
Tune everything in [`src/game/constants.ts`](src/game/constants.ts).
