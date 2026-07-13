import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SPECIES } from '../game/constants';
import { REVIVE } from '../game/premium';
import { purchaseReviveOrFree } from '../billing';
import { NightBackground } from '../components/backgrounds/NightBackground';
import { MonsterView } from '../components/MonsterView';
import { GravestoneIcon } from '../components/Icons';
import { toast } from '../components/toast';

export function DeathScene() {
 const COPY = useT();
 const dead = useGame((s) => s.memorial[0]);
 const canRevive = useGame((s) => s.revivablePet != null);
 const premium = useGame((s) => s.premium);
 const createEgg = useGame((s) => s.createEgg);
 const go = useGame((s) => s.go);
 const [reviving, setReviving] = useState(false);
 if (!dead) return null;

 const revive = async () => {
 setReviving(true);
 try { const ok = await purchaseReviveOrFree(); if (ok) toast(COPY.death.revived); }
 finally { setReviving(false); }
 };

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <NightBackground dim />
 <div className="col" style={{ position: 'relative', flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
 {/* ghost floating up */}
 <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: -6, opacity: 1 }}
 transition={{ duration: 2, ease: 'easeOut' }} style={{ position: 'relative' }}>
 <MonsterView species={dead.species} stage={dead.stage} state="ghost" size={150} />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
 className="col" style={{ alignItems: 'center', gap: 6 }}>
 <h1 style={{ color: '#fff', fontSize: 30, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>{COPY.death.title}</h1>
 <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{COPY.death.rip}</span>
 </motion.div>

 {/* gravestone card */}
 <motion.div className="glass col" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.8, type: 'spring', stiffness: 180, damping: 18 }}
 style={{ padding: 22, alignItems: 'center', gap: 6, width: '100%', maxWidth: 320,
 background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
 <GravestoneIcon size={36} />
 <h2 style={{ color: '#fff', fontSize: 15 }}>{dead.name}</h2>
 <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 13 }}>
 {SPECIES[dead.species].displayName}
 </span>
 <div className="row" style={{ gap: 20, marginTop: 8 }}>
 <div className="col" style={{ alignItems: 'center' }}>
 <span style={{ color: '#fff', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 24 }}>{dead.daysSurvived}</span>
 <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>{COPY.death.lived}</span>
 </div>
 <div className="col" style={{ alignItems: 'center' }}>
 <span style={{ color: '#fff', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 24 }}>{dead.totalFocusHours}</span>
 <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>{COPY.death.focusHours}</span>
 </div>
 </div>
 </motion.div>

 <motion.div className="col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
 style={{ gap: 10, width: '100%', maxWidth: 320 }}>
 {canRevive && (
 <motion.button className="btn btn-peach" style={{ width: '100%', padding: 15, fontSize: 16 }}
 whileTap={{ scale: 0.97 }} animate={{ scale: [1, 1.02, 1] }}
 transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
 disabled={reviving} onClick={revive}>
 {reviving ? '…' : premium ? `💖 ${COPY.death.reviveFree}` : `💖 ${COPY.death.revive} · ${REVIVE.priceLabel}`}
 </motion.button>
 )}
 {canRevive && !premium && (
 <button className="btn btn-ghost" style={{ width: '100%', padding: '9px', fontSize: '0.58rem' }} onClick={() => go('premium')}>
 {COPY.death.reviveHint}
 </button>
 )}
 <button className="btn" style={{ width: '100%', padding: 15 }} onClick={createEgg}>
 {COPY.death.newEgg}
 </button>
 <button className="btn btn-ghost" style={{ width: '100%', padding: 13 }} onClick={() => go('memorial')}>
 {COPY.death.toMemorial}
 </button>
 </motion.div>
 </div>
 </div>
 );
}
