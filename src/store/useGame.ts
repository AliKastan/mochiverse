import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Pet, DeadPet, Inventory, Settings, Screen, FocusSession, SpeciesId, LocaleId, Subject,
} from '../game/types';
import {
  ALL_SPECIES, SPECIES, STARTING_COINS, REWARD, PENALTY, FEED, PET,
  EPITAPHS, COIN, SHOP_BY_ID, CRITICAL_THRESHOLD,
  DEFAULT_SUBJECTS, GENERAL_SUBJECT_ID, MAX_SUBJECTS,
} from '../game/constants';
import {
  decayOver, clampStats, daysBetween,
} from '../game/logic';
import {
  TREE, CELL_ID, freshCare, nextForm, STAGE_XP, CARE_XP,
} from '../game/tree';
import { localDateKey } from '../game/time';
import { PREMIUM } from '../game/premium';
import { sound } from '../audio/sound';

// ------- transient one-shot events the UI reacts to -------
export interface RewardEvent {
  candy: number;
  medicine: number;
  coins: number;
  mood: number;
  health: number;
  streak: number;
  minutes: number;
}
export type EvolveEvent = { to: 'baby' | 'teen' | 'legendary' } | null;

interface GameState {
  // ---- persisted domain ----
  onboarded: boolean;
  pet: Pet | null;
  memorial: DeadPet[];
  inventory: Inventory;
  /** id of the cosmetic the pet is currently wearing (null = none) */
  equipped: string | null;
  coins: number;
  streak: number;
  longestStreak: number;
  totalFocusMinutes: number;
  totalSessions: number;
  focusHistory: Record<string, number>; // dateKey -> minutes
  /** colour-coded focus topics the user defined */
  subjects: Subject[];
  /** subject currently selected for the next focus session */
  activeSubjectId: string;
  /** focused minutes per subject per day: subjectId -> dateKey -> minutes */
  subjectHistory: Record<string, Record<string, number>>;
  /** premium Pro feature: weekly focus target in minutes (0 = not set) */
  weeklyGoalMinutes: number;
  /** every tree form ever reached, across all pets (the long-term collection) */
  discovered: string[];
  settings: Settings;
  /** active subscription entitlement (see billing.ts / premium.ts) */
  premium: boolean;
  /** full snapshot of the last pet that died — restored by revivePet() (paid IAP) */
  revivablePet: Pet | null;
  lastSeenAt: number;
  petTimestamps: number[]; // epoch ms of recent pettings (rate limit)

  // ---- transient (not persisted) ----
  screen: Screen;
  session: FocusSession | null;
  lastReward: RewardEvent | null;
  evolveEvent: EvolveEvent;
  heartbroken: boolean;

  // ---- lifecycle ----
  resume: () => void;
  tick: () => void;
  /** internal: move the (already-decayed) current pet into the memorial */
  killPetInternal: (deadState: Pet) => void;

  // ---- navigation ----
  go: (screen: Screen) => void;
  finishOnboarding: () => void;
  createEgg: () => void;
  hatch: (name: string) => void;

  // ---- care ----
  feed: () => boolean;
  petPet: () => boolean;
  heal: () => 'ok' | 'notsick' | 'nomed';

  // ---- shop / items ----
  buyItem: (id: string) => 'ok' | 'nocoins';
  useItem: (id: string) => boolean;
  /** equip a owned cosmetic (or pass the same id / null to take it off) */
  equip: (id: string | null) => void;

  // ---- settings ----
  setLocale: (locale: LocaleId) => void;
  setTheme: (id: string) => void;
  setSkin: (id: string) => void;
  setFocusSound: (id: string) => void;
  setReminder: (hhmm: string | null) => void;

  // ---- premium / IAP ----
  setPremium: (on: boolean) => void;
  /** grant purchased coins (called after a successful coin-pack IAP) */
  addCoins: (n: number) => void;
  /** bring the last-died pet back to life (called after a successful revive purchase) */
  revivePet: () => void;
  /** premium Pro: set the weekly focus goal (minutes; 0 clears it) */
  setWeeklyGoal: (minutes: number) => void;

  // ---- focus ----
  startFocus: (durationMin: number, subjectId?: string) => void;
  addHiddenTime: (ms: number) => void;
  completeFocus: () => void;
  quitFocus: () => void;

  // ---- subjects ----
  addSubject: (name: string, color: string) => string;
  setActiveSubject: (id: string) => void;
  deleteSubject: (id: string) => void;
  clearHeartbroken: () => void;
  ackEvolve: () => void;

  // ---- settings ----
  toggleMute: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function freshPet(species: SpeciesId): Pet {
  return {
    id: uid(),
    species,
    name: SPECIES[species].displayName,
    stage: 'blob',
    form: CELL_ID,
    xp: 0,
    care: freshCare(),
    stats: { hunger: 100, mood: 100, health: 100 },
    bornAt: Date.now(),
    sessionsCompleted: 0,
    focusMinutes: 0,
    isEgg: true,
  };
}

function randomSpecies(): SpeciesId {
  return ALL_SPECIES[Math.floor(Math.random() * ALL_SPECIES.length)];
}

function pickEpitaph(): string {
  return EPITAPHS[Math.floor(Math.random() * EPITAPHS.length)];
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      pet: null,
      memorial: [],
      inventory: { candy: 0, medicine: 0, items: { candy: 3, medicine: 1 } },
      equipped: null,
      coins: STARTING_COINS,
      streak: 0,
      longestStreak: 0,
      totalFocusMinutes: 0,
      totalSessions: 0,
      focusHistory: {},
      subjects: DEFAULT_SUBJECTS,
      activeSubjectId: GENERAL_SUBJECT_ID,
      subjectHistory: {},
      weeklyGoalMinutes: 0,
      discovered: [],
      settings: { muted: false, locale: null, theme: 'day', skin: 'none', focusSound: 'off', reminder: null },
      premium: false,
      revivablePet: null,
      lastSeenAt: Date.now(),
      petTimestamps: [],

      screen: 'onboarding',
      session: null,
      lastReward: null,
      evolveEvent: null,
      heartbroken: false,

      // -------------------------------------------------
      resume: () => {
        const s = get();
        const now = Date.now();
        sound.setMuted(s.settings.muted);

        if (!s.onboarded) {
          set({ screen: 'onboarding', lastSeenAt: now });
          return;
        }
        // No living pet? spin up a fresh egg.
        if (!s.pet) {
          set({ screen: 'hatch', lastSeenAt: now });
          get().createEgg();
          return;
        }
        if (s.pet.isEgg) {
          set({ screen: 'hatch', lastSeenAt: now });
          return;
        }

        // Living pet: integrate decay across the closed interval.
        const elapsed = now - s.lastSeenAt;
        const { stats, died } = decayOver(s.pet.stats, elapsed, s.premium ? PREMIUM.decayRate : 1);

        if (died) {
          get().killPetInternal({ ...s.pet, stats });
          set({ screen: 'death', lastSeenAt: now });
        } else {
          set({ pet: { ...s.pet, stats }, screen: 'home', lastSeenAt: now });
        }
      },

      tick: () => {
        const s = get();
        // Decay pauses while focusing.
        if (s.session || !s.pet || s.pet.isEgg) {
          set({ lastSeenAt: Date.now() });
          return;
        }
        const now = Date.now();
        const elapsed = now - s.lastSeenAt;
        if (elapsed < 1000) return;
        const { stats, died } = decayOver(s.pet.stats, elapsed, s.premium ? PREMIUM.decayRate : 1);
        if (died) {
          get().killPetInternal({ ...s.pet, stats });
          set({ screen: 'death', lastSeenAt: now });
        } else {
          // continuously accumulate care quality for the current stage's branch:
          // a running average of the three stats, plus a neglect counter that ticks
          // up once each time the pet newly crosses into a critical zone.
          const prev = s.pet.stats;
          const wasCrit = prev.hunger < CRITICAL_THRESHOLD || prev.mood < CRITICAL_THRESHOLD || prev.health < CRITICAL_THRESHOLD;
          const nowCrit = stats.hunger < CRITICAL_THRESHOLD || stats.mood < CRITICAL_THRESHOLD || stats.health < CRITICAL_THRESHOLD;
          const care = {
            sum: s.pet.care.sum + (stats.hunger + stats.mood + stats.health) / 3,
            n: s.pet.care.n + 1,
            neglect: s.pet.care.neglect + (nowCrit && !wasCrit ? 1 : 0),
          };
          set({ pet: { ...s.pet, stats, care }, lastSeenAt: now });
        }
      },

      // internal: move current pet to the memorial garden. (not in interface, used via cast)
      killPetInternal: (deadState: Pet) => {
        const s = get();
        const now = Date.now();
        const dead: DeadPet = {
          id: deadState.id,
          species: deadState.species,
          name: deadState.name,
          stage: deadState.stage,
          bornAt: deadState.bornAt,
          diedAt: now,
          daysSurvived: daysBetween(deadState.bornAt, now),
          totalFocusHours: Math.round((deadState.focusMinutes / 60) * 10) / 10,
          epitaph: pickEpitaph(),
        };
        sound.play('death');
        set({
          pet: null,
          memorial: [dead, ...s.memorial],
          // keep the full pet so a paid revive can restore it exactly (until the
          // player starts a new egg, which clears the offer).
          revivablePet: deadState,
          streak: 0,
          session: null,
          equipped: null,   // a fresh pet starts bare; the accessory stays owned
        });
      },

      // -------------------------------------------------
      go: (screen) => set({ screen }),

      finishOnboarding: () => {
        set({ onboarded: true });
        get().createEgg();
        set({ screen: 'hatch' });
      },

      createEgg: () => {
        // Guard (#2): a pet's species is decided exactly ONCE, here, and is then
        // immutable for that pet's life — it may only change inside the evolution
        // function. Never re-roll a pet that already exists and is still alive;
        // a new egg is only ever started from an empty slot (first launch) or
        // after a death (health 0). This makes species impossible to randomise
        // on mount, re-render, or reload.
        const s = get();
        if (s.pet && s.pet.stats.health > 0) return;
        // starting a fresh egg abandons the paid-revive offer for the dead pet
        set({ pet: freshPet(randomSpecies()), screen: 'hatch', revivablePet: null });
      },

      hatch: (name) => {
        const s = get();
        if (!s.pet) return;
        const clean = name.trim().slice(0, 14) || SPECIES[s.pet.species].displayName;
        sound.play('chime');
        set({
          pet: { ...s.pet, name: clean, isEgg: false, bornAt: Date.now() },
          discovered: s.discovered.includes(CELL_ID) ? s.discovered : [...s.discovered, CELL_ID],
          screen: 'home',
          lastSeenAt: Date.now(),
        });
      },

      // -------------------------------------------------
      feed: () => {
        const s = get();
        if (!s.pet || s.pet.isEgg) return false;
        const candy = s.inventory.items.candy ?? 0;
        if (candy < FEED.candyCost) {
          sound.play('error');
          return false;
        }
        sound.play('pop');
        set({
          inventory: { ...s.inventory, items: { ...s.inventory.items, candy: candy - FEED.candyCost } },
          pet: {
            ...s.pet,
            xp: s.pet.xp + CARE_XP.feed,
            stats: clampStats({
              ...s.pet.stats,
              hunger: s.pet.stats.hunger + FEED.hunger,
            }),
          },
        });
        return true;
      },

      petPet: () => {
        const s = get();
        if (!s.pet || s.pet.isEgg || s.pet.stats.health <= 0) return false;
        const now = Date.now();
        const recent = s.petTimestamps.filter((t) => now - t < 3_600_000);
        if (recent.length >= PET.maxPerHour) return false;
        sound.play('pop');
        set({
          petTimestamps: [...recent, now],
          pet: {
            ...s.pet,
            xp: s.pet.xp + CARE_XP.pet,
            stats: clampStats({ ...s.pet.stats, mood: s.pet.stats.mood + PET.mood }),
          },
        });
        return true;
      },

      heal: () => {
        const s = get();
        if (!s.pet || s.pet.isEgg) return 'notsick';
        if (s.pet.stats.health >= 40) return 'notsick';
        const medicine = s.inventory.items.medicine ?? 0;
        if (medicine < 1) {
          sound.play('error');
          return 'nomed';
        }
        sound.play('chime');
        set({
          inventory: { ...s.inventory, items: { ...s.inventory.items, medicine: medicine - 1 } },
          pet: {
            ...s.pet,
            xp: s.pet.xp + CARE_XP.heal,
            stats: clampStats({ ...s.pet.stats, health: s.pet.stats.health + 45 }),
          },
        });
        return 'ok';
      },

      // ---- shop / items ----
      buyItem: (id) => {
        const s = get();
        const item = SHOP_BY_ID[id];
        if (!item) return 'nocoins';
        if (s.coins < item.price) { sound.play('error'); return 'nocoins'; }
        sound.play('pop');
        set({
          coins: s.coins - item.price,
          inventory: {
            ...s.inventory,
            items: { ...s.inventory.items, [id]: (s.inventory.items[id] ?? 0) + 1 },
          },
        });
        return 'ok';
      },

      useItem: (id) => {
        const s = get();
        if (!s.pet || s.pet.isEgg) return false;
        const item = SHOP_BY_ID[id];
        const owned = s.inventory.items[id] ?? 0;
        if (!item || owned <= 0) return false;
        sound.play(item.kind === 'medicine' ? 'chime' : 'pop');
        let stats = s.pet.stats;
        if (item.stat && item.restore) {
          stats = clampStats({ ...stats, [item.stat]: stats[item.stat] + item.restore });
        }
        set({
          pet: { ...s.pet, stats },
          inventory: { ...s.inventory, items: { ...s.inventory.items, [id]: owned - 1 } },
        });
        return true;
      },

      equip: (id) => {
        const s = get();
        // taking it off, or toggling the currently-worn one off
        if (id === null || s.equipped === id) { sound.play('pop'); set({ equipped: null }); return; }
        // can only wear a cosmetic that is actually owned
        if ((s.inventory.items[id] ?? 0) <= 0) { sound.play('error'); return; }
        sound.play('pop');
        set({ equipped: id });
      },

      setLocale: (locale) => set({ settings: { ...get().settings, locale } }),
      setTheme: (id) => set({ settings: { ...get().settings, theme: id } }),
      setSkin: (id) => set({ settings: { ...get().settings, skin: id } }),
      setFocusSound: (id) => set({ settings: { ...get().settings, focusSound: id } }),
      setReminder: (hhmm) => set({ settings: { ...get().settings, reminder: hhmm } }),
      setPremium: (on) => set({ premium: on }),
      addCoins: (n) => set({ coins: get().coins + Math.max(0, Math.round(n)) }),

      revivePet: () => {
        const s = get();
        const p = s.revivablePet;
        if (!p) return;
        // bring it back on the brink — alive but needy, so revival feels earned.
        const revived: Pet = { ...p, stats: clampStats({ hunger: 50, mood: 50, health: 55 }) };
        const [, ...restMemorial] = s.memorial; // drop the death entry we just added
        sound.play('success');
        set({
          pet: revived,
          memorial: restMemorial,
          revivablePet: null,
          screen: 'home',
          lastSeenAt: Date.now(),
        });
      },

      setWeeklyGoal: (minutes) => set({ weeklyGoalMinutes: Math.max(0, Math.round(minutes)) }),

      // -------------------------------------------------
      startFocus: (durationMin, subjectId) => {
        const s = get();
        if (!s.pet) return;
        // resolve to a real, existing subject (fall back to active, then general)
        const wanted = subjectId ?? s.activeSubjectId;
        const sid = s.subjects.some((x) => x.id === wanted) ? wanted : GENERAL_SUBJECT_ID;
        set({
          session: { durationMin, startedAt: Date.now(), hiddenMs: 0, subjectId: sid },
          activeSubjectId: sid,
          screen: 'focus',
          lastSeenAt: Date.now(),
        });
      },

      addSubject: (name, color) => {
        const s = get();
        const clean = name.trim().slice(0, 18) || '•';
        if (s.subjects.length >= MAX_SUBJECTS) return s.activeSubjectId;
        const id = uid();
        set({
          subjects: [...s.subjects, { id, name: clean, color }],
          activeSubjectId: id,
        });
        return id;
      },

      setActiveSubject: (id) => {
        if (get().subjects.some((x) => x.id === id)) set({ activeSubjectId: id });
      },

      deleteSubject: (id) => {
        // the starter "general" subject is permanent so there's always one left
        if (id === GENERAL_SUBJECT_ID) return;
        const s = get();
        const subjects = s.subjects.filter((x) => x.id !== id);
        const subjectHistory = { ...s.subjectHistory };
        delete subjectHistory[id];
        set({
          subjects,
          subjectHistory,
          activeSubjectId: s.activeSubjectId === id ? GENERAL_SUBJECT_ID : s.activeSubjectId,
        });
      },

      addHiddenTime: (ms) => {
        const s = get();
        if (!s.session) return;
        set({ session: { ...s.session, hiddenMs: s.session.hiddenMs + ms } });
      },

      completeFocus: () => {
        const s = get();
        if (!s.pet || !s.session) return;
        const now = Date.now();
        const minutes = s.session.durationMin;

        const nextSessions = s.pet.sessionsCompleted + 1;
        const petFocusMin = s.pet.focusMinutes + minutes;

        // rewards
        const gotMedicine = nextSessions % REWARD.medicineEvery === 0 ? 1 : 0;
        const newStreak = s.streak + 1;

        const dateKey = localDateKey(now);
        const focusHistory = { ...s.focusHistory };
        focusHistory[dateKey] = (focusHistory[dateKey] ?? 0) + minutes;

        // per-subject tally for the weekly breakdown
        const sid = s.session.subjectId && s.subjects.some((x) => x.id === s.session!.subjectId)
          ? s.session.subjectId : GENERAL_SUBJECT_ID;
        const subjectHistory = { ...s.subjectHistory, [sid]: { ...(s.subjectHistory[sid] ?? {}) } };
        subjectHistory[sid][dateKey] = (subjectHistory[sid][dateKey] ?? 0) + minutes;

        const coinsEarned = Math.round(minutes * COIN.perMinute * COIN.streakMultiplier(newStreak));

        const reward: RewardEvent = {
          candy: REWARD.candy,
          medicine: gotMedicine,
          coins: coinsEarned,
          mood: REWARD.mood,
          health: REWARD.health,
          streak: newStreak,
          minutes,
        };

        // --- XP + branching evolution ---
        const node = TREE[s.pet.form];
        let newForm = s.pet.form;
        let newStage: typeof s.pet.stage = s.pet.stage;
        let newXp = s.pet.xp + minutes;               // 1 XP per focused minute
        let newCare = s.pet.care;
        let evolve: EvolveEvent = null;
        const discovered = [...s.discovered];

        if (node && node.children.length > 0 && newXp >= STAGE_XP[s.pet.stage]) {
          const picked = nextForm(s.pet.form, {
            care: s.pet.care, focusMinutes: petFocusMin, rng: Math.random(),
          });
          if (picked) {
            newForm = picked;
            newStage = TREE[picked].stage;
            newXp = 0;                 // reset toward the next stage
            newCare = freshCare();     // fresh care window for the new stage
            evolve = { to: newStage as 'baby' | 'teen' | 'legendary' };
            if (!discovered.includes(picked)) discovered.push(picked);
          }
        }

        if (evolve) sound.play('evolve');
        else sound.play('success');

        set({
          pet: {
            ...s.pet,
            sessionsCompleted: nextSessions,
            stage: newStage,
            form: newForm,
            xp: newXp,
            care: newCare,
            focusMinutes: petFocusMin,
            stats: clampStats({
              ...s.pet.stats,
              mood: s.pet.stats.mood + REWARD.mood,
              health: s.pet.stats.health + REWARD.health,
            }),
          },
          discovered,
          inventory: {
            ...s.inventory,
            items: {
              ...s.inventory.items,
              candy: (s.inventory.items.candy ?? 0) + REWARD.candy,
              medicine: (s.inventory.items.medicine ?? 0) + gotMedicine,
            },
          },
          coins: s.coins + coinsEarned,
          streak: newStreak,
          longestStreak: Math.max(s.longestStreak, newStreak),
          totalFocusMinutes: s.totalFocusMinutes + minutes,
          totalSessions: s.totalSessions + 1,
          focusHistory,
          subjectHistory,
          session: null,
          lastReward: reward,
          evolveEvent: evolve,
          screen: 'complete',
          lastSeenAt: now,
        });
      },

      quitFocus: () => {
        const s = get();
        if (!s.pet) {
          set({ session: null, screen: 'home' });
          return;
        }
        sound.play('sad');
        set({
          pet: {
            ...s.pet,
            stats: clampStats({
              ...s.pet.stats,
              mood: s.pet.stats.mood - PENALTY.mood,
              health: s.pet.stats.health - PENALTY.health,
            }),
          },
          streak: 0,
          session: null,
          screen: 'home',
          heartbroken: true,
          lastSeenAt: Date.now(),
        });
      },

      clearHeartbroken: () => set({ heartbroken: false }),
      ackEvolve: () => set({ evolveEvent: null }),

      toggleMute: () => {
        const muted = !get().settings.muted;
        sound.setMuted(muted);
        set({ settings: { ...get().settings, muted } });
      },
    }),
    {
      name: 'mochiverse-v1',
      version: 5,
      // Backfill fields added after a save was first written.
      migrate: (persisted) => {
        const p = persisted as Partial<GameState> | undefined;
        if (p?.inventory) {
          const inv = p.inventory as Inventory & { candy?: number; medicine?: number };
          if (inv.items === undefined) inv.items = {};
          // fold the old top-level candy/medicine counts into the items map
          if (inv.candy) { inv.items.candy = (inv.items.candy ?? 0) + inv.candy; inv.candy = 0; }
          if (inv.medicine) { inv.items.medicine = (inv.items.medicine ?? 0) + inv.medicine; inv.medicine = 0; }
        }
        if (p && typeof p.coins !== 'number') p.coins = STARTING_COINS;
        if (p && !Array.isArray(p.discovered)) p.discovered = [];
        // Backfill the branching-tree fields onto an older pet (map its stage to a form).
        if (p?.pet) {
          const pet = p.pet as Pet & Partial<Pet>;
          if (typeof pet.form !== 'string') {
            pet.form = pet.stage === 'blob' ? CELL_ID
              : pet.stage === 'baby' ? 'puff'
              : pet.stage === 'teen' ? 'puffling'
              : 'seraphin';
          }
          if (typeof pet.xp !== 'number') pet.xp = 0;
          if (!pet.care || typeof pet.care.n !== 'number') pet.care = freshCare();
        }
        // v4: focus subjects. Seed the starter subject + empty per-subject history.
        if (p && (!Array.isArray(p.subjects) || p.subjects.length === 0)) p.subjects = DEFAULT_SUBJECTS;
        if (p && typeof p.activeSubjectId !== 'string') p.activeSubjectId = GENERAL_SUBJECT_ID;
        if (p && (typeof p.subjectHistory !== 'object' || p.subjectHistory === null)) p.subjectHistory = {};
        // v5: premium + theme/skin settings
        if (p?.settings) {
          if (typeof p.settings.theme !== 'string') p.settings.theme = 'day';
          if (typeof p.settings.skin !== 'string') p.settings.skin = 'none';
          if (typeof p.settings.focusSound !== 'string') p.settings.focusSound = 'off';
          if (p.settings.reminder === undefined) p.settings.reminder = null;
        }
        if (p && typeof p.premium !== 'boolean') p.premium = false;
        if (p && typeof p.weeklyGoalMinutes !== 'number') p.weeklyGoalMinutes = 0;
        return p as GameState;
      },
      partialize: (s) => ({
        onboarded: s.onboarded,
        pet: s.pet,
        memorial: s.memorial,
        inventory: s.inventory,
        equipped: s.equipped,
        coins: s.coins,
        streak: s.streak,
        longestStreak: s.longestStreak,
        totalFocusMinutes: s.totalFocusMinutes,
        totalSessions: s.totalSessions,
        focusHistory: s.focusHistory,
        subjects: s.subjects,
        activeSubjectId: s.activeSubjectId,
        subjectHistory: s.subjectHistory,
        weeklyGoalMinutes: s.weeklyGoalMinutes,
        discovered: s.discovered,
        settings: s.settings,
        premium: s.premium,
        revivablePet: s.revivablePet,
        lastSeenAt: s.lastSeenAt,
        petTimestamps: s.petTimestamps,
      }),
    },
  ),
);

// Dev-only: expose the store for debugging / automated screenshots.
if (import.meta.env.DEV) {
  (window as unknown as { useGame: typeof useGame }).useGame = useGame;
}
