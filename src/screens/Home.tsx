import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PetState } from '../game/types';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SPECIES, CRITICAL_THRESHOLD, FOOD_ITEMS, TOY_ITEMS } from '../game/constants';
import { getSkin } from '../game/premium';
import { deriveState, isSick } from '../game/logic';
import { TREE, xpRatio, hasNextForm } from '../game/tree';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { RoamingPet } from '../components/RoamingPet';
import { StatBar } from '../components/StatBar';
import { HeartBurst, type Burst } from '../components/Particles';
import { CandyIcon, MedicineIcon, MoodIcon, HealthIcon, FireIcon, GravestoneIcon, SparkleIcon, TrophyIcon } from '../components/Icons';
import { ItemIcon } from '../components/ItemIcon';
import { Ground } from '../components/Ground';
import { ToyPlay } from '../components/ToyPlay';
import { toast } from '../components/toast';

let burstSeq = 0;

// Three-bar hamburger glyph for the collapsed top-nav menu.
function MenuIcon({ size = 22 }: { size?: number }) {
 return (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
 {[5.5, 12, 18.5].map((y) => (
 <rect key={y} x="3" y={y - 1.4} width="18" height="2.8" rx="1.4" fill="var(--ink)" />
 ))}
 </svg>
 );
}

export function Home() {
 const COPY = useT();
 const pet = useGame((s) => s.pet);
 const inv = useGame((s) => s.inventory);
 const skinId = useGame((s) => s.settings.skin);
 const premium = useGame((s) => s.premium);
 const skin = getSkin(skinId).premium && !premium ? 'none' : skinId; // enforce entitlement
 const coins = useGame((s) => s.coins);
 const streak = useGame((s) => s.streak);
 const feed = useGame((s) => s.feed);
 const useItem = useGame((s) => s.useItem);
 const petPet = useGame((s) => s.petPet);
 const heal = useGame((s) => s.heal);
 const go = useGame((s) => s.go);
 const heartbroken = useGame((s) => s.heartbroken);
 const clearHeartbroken = useGame((s) => s.clearHeartbroken);

 const [bursts, setBursts] = useState<Burst[]>([]);
 const [feedOpen, setFeedOpen] = useState(false);
 const [menuOpen, setMenuOpen] = useState(false);
 const [playToy, setPlayToy] = useState<string | null>(null);

 // Transient reaction (e.g. a quick happy hop on feed/pet) that briefly
 // overrides the derived resting state, then reverts to calm idle.
 const [reaction, setReaction] = useState<PetState | null>(null);
 const reactionTimer = useRef<number | null>(null);
 const triggerReaction = (s: PetState, ms = 1600) => {
 setReaction(s);
 if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
 reactionTimer.current = window.setTimeout(() => setReaction(null), ms);
 };
 useEffect(() => () => { if (reactionTimer.current) window.clearTimeout(reactionTimer.current); }, []);

 useEffect(() => {
 if (heartbroken) {
 toast(COPY.focus.quitToast);
 const t = setTimeout(clearHeartbroken, 2600);
 return () => clearTimeout(t);
 }
 }, [heartbroken, clearHeartbroken]);

 if (!pet) return null;
 const species = SPECIES[pet.species];
 // Priority: heartbroken > active reaction > resting state derived from stats.
 const state = heartbroken ? 'sad' : (reaction ?? deriveState(pet));
 const sick = isSick(pet);
 const critical = pet.stats.health <= CRITICAL_THRESHOLD || pet.stats.mood <= CRITICAL_THRESHOLD || pet.stats.hunger <= CRITICAL_THRESHOLD;
 const evoRatio = xpRatio(pet.stage, pet.xp);
 const canEvolve = hasNextForm(pet.form);

 const onPet = (e: React.MouseEvent) => {
 const ok = petPet();
 if (!ok) { toast(COPY.home.petMax); return; }
 triggerReaction('happy');
 const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
 const id = ++burstSeq;
 const b: Burst = { id, x: e.clientX - rect.left, y: e.clientY - rect.top };
 setBursts((prev) => [...prev, b]);
 setTimeout(() => setBursts((prev) => prev.filter((x) => x.id !== id)), 1200);
 };

 // Feed menu: legacy candy + any owned shop foods.
 const feedList = [
 { id: 'candy', count: inv.items?.candy ?? 0 },
 ...FOOD_ITEMS.filter((f) => f.id !== 'candy').map((f) => ({ id: f.id, count: inv.items?.[f.id] ?? 0 })),
 ].filter((f) => f.count > 0);

 const eat = (id: string) => {
 const ok = id === 'candy' ? feed() : useItem(id);
 if (!ok) { toast(COPY.home.noCandy); return; }
 triggerReaction('eating', 1300);
 window.setTimeout(() => triggerReaction('happy', 1000), 1300);
 toast(COPY.home.fed);
 setFeedOpen(false);
 };

 const toyList = TOY_ITEMS.map((tt) => ({ id: tt.id, count: inv.items?.[tt.id] ?? 0 })).filter((tt) => tt.count > 0);
 const play = (id: string) => {
 // useItem already applies the toy's mood boost + consumes it; the ToyPlay
 // scene then runs the physics and calls back to clear itself when done.
 if (playToy || !useItem(id)) return;
 setPlayToy(id);
 setFeedOpen(false);
 toast(COPY.home.played);
 };
 const doHeal = () => {
 const r = heal();
 if (r === 'ok') toast(COPY.home.healed);
 else if (r === 'notsick') toast(COPY.home.notSick);
 else toast(COPY.home.noMed);
 };

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <SkyBackground />

 <div className="col" style={{ position: 'relative', flex: 1, minHeight: 0 }}>
 {/* top nav: coin balance + a single ☰ menu that collapses all navigation so
 it stays out of the way (opens a dropdown of shop / collection / etc.) */}
 <div className="row" style={{ justifyContent: 'space-between', padding: '16px 16px 0', alignItems: 'center' }}>
 <button className="chip" onClick={() => go('coins')} aria-label={COPY.coins.title} style={{ cursor: 'pointer', gap: 6 }}>
 <ItemIcon icon="coin" size={20} /> {coins}
 <span style={{ marginLeft: 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--lavender)', color: '#fff', fontSize: 13, lineHeight: '14px', fontWeight: 700, display: 'inline-grid', placeItems: 'center' }}>+</span>
 </button>
 <div style={{ position: 'relative', marginRight: 46 }}>
 <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)}
 aria-label={COPY.home.menu} aria-haspopup="true" aria-expanded={menuOpen}>
 <MenuIcon size={22} />
 </button>
 {menuOpen && (
 <>
 {/* click-away layer */}
 <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
 <motion.div className="menu-panel" role="menu"
 initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ duration: 0.14, ease: 'easeOut' }}>
 {[
 { key: 'premium', label: COPY.premium.menu, icon: <TrophyIcon size={22} />, gold: true },
 { key: 'shop', label: COPY.shop.title, icon: <ItemIcon icon="shop" size={22} /> },
 { key: 'collection', label: COPY.collection.title, icon: <SparkleIcon size={22} /> },
 { key: 'stats', label: COPY.stats.title, icon: <ItemIcon icon="chart" size={22} /> },
 { key: 'memorial', label: COPY.memorial.title, icon: <GravestoneIcon size={22} /> },
 { key: 'settings', label: COPY.settings.title, icon: <ItemIcon icon="gear" size={22} /> },
 ].map((m) => (
 <button key={m.key} className="menu-item" role="menuitem"
 style={m.gold ? { color: '#c58b00', fontWeight: 700 } : undefined}
 onClick={() => { setMenuOpen(false); go(m.key as Parameters<typeof go>[0]); }}>
 {m.icon}<span>{m.label}</span>
 </button>
 ))}
 </motion.div>
 </>
 )}
 </div>
 </div>

 {/* name + stage */}
 <div className="col" style={{ alignItems: 'center', marginTop: 4, gap: 2 }}>
 <h2 style={{ color: 'var(--ink)', fontSize: 24 }}>{pet.name}</h2>
 <span className="chip" style={{ padding: '4px 12px', fontSize: 13 }}>
 {pet.stage === 'blob' ? `${COPY.stage.blob} · ???` : `${COPY.stage[pet.stage]} · ${TREE[pet.form]?.name ?? species.displayName}`}
 </span>
 </div>

 {/* chips row */}
 <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap', padding: '0 12px' }}>
 <span className="chip"><FireIcon size={20} /> {streak}</span>
 <span className="chip"><CandyIcon size={20} /> {inv.items?.candy ?? 0}</span>
 <span className="chip"><MedicineIcon size={20} /> {inv.items?.medicine ?? 0}</span>
 </div>

 {/* pet stage */}
 <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
 <HeartBurst bursts={bursts} />
 {critical && (
 <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
 style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--danger)', zIndex: 5 }}>
 {COPY.home.critical}
 </motion.div>
 )}
 {/* While a toy is in play the physics scene owns the stage (its own pet
 that chases + kicks the toy); otherwise the pet roams the ground on its
 own, standing still to show any reaction/critical state. */}
 {playToy ? (
 <ToyPlay toyId={playToy} species={pet.species} stage={pet.stage} form={pet.form}
 groundHeight={78} skin={skin} onEnd={() => setPlayToy(null)} />
 ) : (
 <RoamingPet state={state} species={pet.species} stage={pet.stage} form={pet.form}
 groundHeight={78} size={150} skin={skin} onPet={onPet} />
 )}
 {/* ONE seamless grass+dirt floor: full-width edge-to-edge, solid dirt fill, zero gaps */}
 <Ground height={78} zIndex={1} />
 </div>

 {/* bottom control deck. A full-bleed DIRT backing sits behind it so the deck's
 rounded top corners (and the border inset at wide widths) reveal dirt, not the
 pink background — the floor visually continues under the deck, edge to edge. */}
 <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'rgb(193,135,117)', marginLeft: -8, marginRight: -8 }}>
 <div className="col" style={{ margin: 0, padding: '16px 24px 20px', gap: 14, borderRadius: '22px 22px 0 0',
 background: 'var(--cream)', borderTop: '3px solid var(--ink)', position: 'relative' }}>
 {/* evolution progress — reveal mechanic: never name what comes next */}
 {canEvolve && (
 <div className="col" style={{ gap: 4 }}>
 <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, fontFamily: 'Fredoka', fontWeight: 600, color: 'var(--ink-soft)' }}>
 <span>{COPY.evolution.label} · ???</span>
 <span>{Math.round(evoRatio * 100)}%</span>
 </div>
 <div style={{ height: 10, borderRadius: 3, background: 'rgba(106,83,117,0.14)', border: '2px solid rgba(106,83,117,0.4)', overflow: 'hidden' }}>
 <motion.div initial={false} animate={{ width: `${evoRatio * 100}%` }}
 transition={{ type: 'spring', stiffness: 120, damping: 18 }}
 style={{ height: '100%', background: 'var(--lavender)' }} />
 </div>
 </div>
 )}

 <StatBar label={COPY.home.hunger} value={pet.stats.hunger} from="#FFC978" to="var(--hunger)" icon={<CandyIcon size={22} />} />
 <StatBar label={COPY.home.mood} value={pet.stats.mood} from="#FFA6CE" to="var(--mood)" icon={<MoodIcon size={22} />} />
 <StatBar label={COPY.home.health} value={pet.stats.health} from="#8FE9C4" to="var(--health)" icon={<HealthIcon size={22} />} />

 <div className="row" style={{ gap: 10, marginTop: 2 }}>
 <button className="btn btn-peach" style={{ flex: 1, padding: '13px' }}
 onClick={() => ((feedList.length || toyList.length) ? setFeedOpen(true) : toast(COPY.home.noCandy))}>
 <CandyIcon size={22} /> {COPY.home.feed}
 </button>
 <button className={`btn ${sick ? 'btn-mint' : 'btn-ghost'}`} style={{ flex: 1, padding: '13px' }}
 onClick={doHeal}>
 <MedicineIcon size={22} /> {COPY.home.heal}
 </button>
 </div>

 <motion.button className="btn" style={{ padding: '16px', fontSize: '0.82rem' }}
 whileTap={{ scale: 0.97 }} animate={{ scale: [1, 1.02, 1] }}
 transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
 onClick={() => go('focus')}>
 {COPY.home.focus}
 </motion.button>
 </div>
 </div>
 </div>

 {/* feed menu: pick a food */}
 {feedOpen && (
 <div style={{ position: 'absolute', inset: 0, background: 'rgba(60,40,80,0.5)', display: 'grid', placeItems: 'center', zIndex: 90 }}
 onClick={() => setFeedOpen(false)}>
 <motion.div className="glass col" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
 style={{ padding: 18, gap: 12, width: 260, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.home.feed}</span>
 {feedList.length > 0 && (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
 {feedList.map((f) => (
 <button key={f.id} className="glass col" style={{ padding: 10, gap: 4, alignItems: 'center', border: '3px solid var(--ink)' }}
 onClick={() => eat(f.id)}>
 <ItemIcon icon={f.id} size={48} />
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 7, color: 'var(--ink)' }}>×{f.count}</span>
 </button>
 ))}
 </div>
 )}
 {toyList.length > 0 && (
 <>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: 'var(--ink-soft)', marginTop: 4 }}>{COPY.shop.toy}</span>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
 {toyList.map((tt) => (
 <button key={tt.id} className="glass col" style={{ padding: 10, gap: 4, alignItems: 'center', border: '3px solid var(--ink)' }}
 onClick={() => play(tt.id)}>
 <ItemIcon icon={tt.id} size={48} />
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 7, color: 'var(--ink)' }}>×{tt.count}</span>
 </button>
 ))}
 </div>
 </>
 )}
 </motion.div>
 </div>
 )}
 </div>
 );
}
