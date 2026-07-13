import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { getSkin } from '../game/premium';
import { useT } from '../i18n';
import { SPECIES } from '../game/constants';
import { TREE, xpRatio, hasNextForm } from '../game/tree';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { MonsterView } from '../components/MonsterView';
import { Confetti, SparkleRing } from '../components/Particles';
import { CandyIcon, MedicineIcon, MoodIcon, FireIcon } from '../components/Icons';
import { ItemIcon } from '../components/ItemIcon';

// Falling pixel coins celebrating the coin reward.
function CoinRain({ count = 14 }: { count?: number }) {
 const coins = Array.from({ length: count }, (_, i) => {
 const a = (i * 6151 + 1013) % 233280;
 return { x: (a / 233280) * 100, delay: (i % 7) * 0.18, dur: 1.6 + (i % 5) * 0.25, size: 18 + (i % 3) * 6 };
 });
 return (
 <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 55 }}>
 {coins.map((c, i) => (
 <motion.div key={i} style={{ position: 'absolute', left: `${c.x}%`, top: -30 }}
 initial={{ y: -30, opacity: 0, rotate: 0 }}
 animate={{ y: ['-30px', '780px'], opacity: [0, 1, 1, 0.8], rotate: [0, 180, 360] }}
 transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'easeIn' }}>
 <ItemIcon icon="coin" size={c.size} />
 </motion.div>
 ))}
 </div>
 );
}

export function SessionComplete() {
 const COPY = useT();
 const pet = useGame((s) => s.pet);
 const skinId = useGame((s) => s.settings.skin);
 const premium = useGame((s) => s.premium);
 const skin = getSkin(skinId).premium && !premium ? 'none' : skinId;
 const reward = useGame((s) => s.lastReward);
 const evolve = useGame((s) => s.evolveEvent);
 const ackEvolve = useGame((s) => s.ackEvolve);
 const go = useGame((s) => s.go);

 if (!pet || !reward) return null;
 const evoR = xpRatio(pet.stage, pet.xp);
 const canEvolve = hasNextForm(pet.form);

 const rewards = [
 { icon: <ItemIcon icon="coin" size={30} />, label: COPY.shop.coins, val: `+${reward.coins}` },
 { icon: <CandyIcon size={30} />, label: COPY.complete.candy, val: `+${reward.candy}` },
 ...(reward.medicine ? [{ icon: <MedicineIcon size={30} />, label: COPY.complete.medicine, val: `+${reward.medicine}` }] : []),
 { icon: <MoodIcon size={30} />, label: COPY.home.mood, val: `+${reward.mood}` },
 { icon: <FireIcon size={30} />, label: COPY.complete.streak, val: `${reward.streak}` },
 ];

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <SkyBackground />
 <CoinRain />

 <div className="col" style={{ position: 'relative', flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
 <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="col" style={{ alignItems: 'center', gap: 2 }}>
 <h1 style={{ fontSize: 32, color: 'var(--ink)' }}>{COPY.complete.title}</h1>
 <span className="muted" style={{ fontWeight: 700 }}>{COPY.complete.subtitle}</span>
 </motion.div>

 <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
 <SparkleRing />
 <MonsterView species={pet.species} stage={pet.stage} state="happy" size={180} form={pet.form} skin={skin} />
 </div>

 {/* rewards fly-in */}
 <div className="glass col" style={{ padding: 18, gap: 12, width: '100%', maxWidth: 340, borderRadius: 28 }}>
 <span style={{ fontFamily: 'Fredoka', fontWeight: 600, textAlign: 'center', color: 'var(--ink)' }}>{COPY.complete.rewards} </span>
 <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
 {rewards.map((r, i) => (
 <motion.div key={r.label} className="col"
 initial={{ scale: 0, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
 transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 + i * 0.12 }}
 style={{ alignItems: 'center', gap: 3, minWidth: 66 }}>
 {r.icon}
 <span style={{ fontFamily: 'Fredoka', fontWeight: 700, color: 'var(--ink)', fontSize: 17 }}>{r.val}</span>
 <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{r.label}</span>
 </motion.div>
 ))}
 </div>

 {canEvolve && (
 <div className="col" style={{ gap: 4, marginTop: 4 }}>
 <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, fontFamily: 'Fredoka', fontWeight: 600, color: 'var(--ink-soft)' }}>
 <span>{COPY.evolution.label} · ???</span><span>{Math.round(evoR * 100)}%</span>
 </div>
 <div style={{ height: 9, borderRadius: 999, background: 'rgba(255,255,255,0.6)', overflow: 'hidden' }}>
 <motion.div initial={{ width: 0 }} animate={{ width: `${evoR * 100}%` }}
 transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.5 }}
 style={{ height: '100%', borderRadius: 3, background: 'var(--lavender)' }} />
 </div>
 {evoR > 0.6 && <span className="muted" style={{ fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{COPY.complete.evolveSoon}</span>}
 </div>
 )}
 </div>

 <motion.button className="btn" style={{ width: '100%', maxWidth: 340, padding: 16 }}
 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
 onClick={() => go('home')}>
 {COPY.complete.next} 
 </motion.button>
 </div>

 {/* evolution cutscene */}
 <AnimatePresence>
 {evolve && <EvolutionCutscene pet={pet} to={evolve.to} onAck={ackEvolve} />}
 </AnimatePresence>
 </div>
 );
}

// Dim → glowing silhouette pulse → white flash → reveal + sparkles.
function EvolutionCutscene({ pet, to, onAck }: {
 pet: NonNullable<ReturnType<typeof useGame.getState>['pet']>;
 to: 'baby' | 'teen' | 'legendary';
 onAck: () => void;
}) {
 const COPY = useT();
 const [phase, setPhase] = useState<'glow' | 'flash' | 'reveal'>('glow');
 useEffect(() => {
 const t1 = setTimeout(() => setPhase('flash'), 1500);
 const t2 = setTimeout(() => setPhase('reveal'), 1850);
 return () => { clearTimeout(t1); clearTimeout(t2); };
 }, []);
 const label = to === 'baby' ? COPY.evolution.toBaby : to === 'legendary' ? COPY.evolution.toLegendary : COPY.evolution.toTeen;
 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', background: 'rgba(30,22,54,0.92)' }}>
 {phase === 'reveal' && <Confetti />}
 <div className="col" style={{ alignItems: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
 <motion.h1 style={{ fontSize: 20, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.4)', letterSpacing: 2 }}
 animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
 {COPY.evolution.title}
 </motion.h1>
 <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
 {phase === 'reveal' && <SparkleRing />}
 <motion.div
 style={{ filter: phase === 'reveal' ? 'none' : 'brightness(0)' }}
 animate={phase === 'glow'
 ? { scale: [1, 1.14, 1], filter: ['brightness(0.15)', 'brightness(0.7)', 'brightness(0.15)'] }
 : { scale: 1 }}
 transition={phase === 'glow' ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } : {}}>
 <MonsterView species={pet.species} stage={pet.stage} state="happy" size={200} form={pet.form} />
 </motion.div>
 </div>
 {phase === 'reveal' && (
 <motion.div className="col" style={{ alignItems: 'center', gap: 14 }}
 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
 <span style={{ color: '#fff', fontFamily: 'var(--pixel)', fontSize: 11 }}>{label}</span>
 <span className="chip" style={{ fontSize: 11 }}>{COPY.stage[pet.stage]} · {TREE[pet.form]?.name ?? SPECIES[pet.species].displayName}</span>
 <button className="btn" style={{ padding: '14px 40px', marginTop: 4 }} onClick={onAck}>{COPY.complete.next}</button>
 </motion.div>
 )}
 </div>
 {/* white flash */}
 <AnimatePresence>
 {phase === 'flash' && (
 <motion.div style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none' }}
 initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }}
 transition={{ duration: 0.5, times: [0, 0.4, 1] }} />
 )}
 </AnimatePresence>
 </motion.div>
 );
}
