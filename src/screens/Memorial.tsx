import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SPECIES } from '../game/constants';
import { MonsterView } from '../components/MonsterView';
import { ItemIcon } from '../components/ItemIcon';
import { GravestoneIcon } from '../components/Icons';
import { formatDate } from '../game/time';
import type { DeadPet } from '../game/types';

export function Memorial() {
 const COPY = useT();
 const memorial = useGame((s) => s.memorial);
 const go = useGame((s) => s.go);
 const [selected, setSelected] = useState<DeadPet | null>(null);

 return (
 <div className="col" style={{ position: 'absolute', inset: 0,
 background: '#EFE6F6' }}>
 {/* soft floating pixel flowers */}
 {Array.from({ length: 8 }).map((_, i) => (
 <motion.div key={i} style={{ position: 'absolute', left: `${(i * 13 + 5) % 95}%`, top: -20, opacity: 0.7, zIndex: 0 }}
 animate={{ y: ['0vh', '105vh'], rotate: [0, 180] }}
 transition={{ duration: 12 + i * 2, repeat: Infinity, delay: i * 1.4, ease: 'linear' }}>
 <ItemIcon icon="flower" size={18} />
 </motion.div>
 ))}

 <div className="row" style={{ position: 'relative', justifyContent: 'space-between', padding: '18px 18px 6px' }}>
 <button className="icon-btn" onClick={() => go('home')} aria-label="Geri"><ItemIcon icon="back" size={22} /></button>
 <div className="col" style={{ alignItems: 'center' }}>
 <h2 style={{ color: 'var(--ink)' }}>{COPY.memorial.title}</h2>
 <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{COPY.memorial.subtitle}</span>
 </div>
 <div style={{ width: 46 }} />
 </div>

 <div className="scroll-y" style={{ position: 'relative', flex: 1, padding: 16 }}>
 {memorial.length === 0 ? (
 <div className="col center" style={{ height: '100%', gap: 12, textAlign: 'center', padding: 20 }}>
 <ItemIcon icon="flower" size={56} />
 <p className="muted" style={{ fontFamily: 'var(--pixel)', fontSize: 9, lineHeight: 1.7, maxWidth: 260 }}>{COPY.memorial.empty}</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
 {memorial.map((d) => (
 <motion.button key={d.id} whileTap={{ scale: 0.95 }} onClick={() => setSelected(d)}
 className="glass col" style={{ padding: 14, alignItems: 'center', gap: 4 }}>
 <div style={{ filter: 'grayscale(0.3)' }}>
 <MonsterView species={d.species} stage={d.stage} state="ghost" size={92} />
 </div>
 <GravestoneIcon size={20} />
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{d.name}</span>
 <span className="muted" style={{ fontFamily: 'var(--pixel)', fontSize: 6.5 }}>{d.daysSurvived} {COPY.common.days}</span>
 </motion.button>
 ))}
 </div>
 )}
 </div>

 {/* detail modal */}
 <AnimatePresence>
 {selected && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 onClick={() => setSelected(null)}
 style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center',
 background: 'rgba(80,60,100,0.58)', padding: 24 }}>
 <motion.div className="glass col" onClick={(e) => e.stopPropagation()}
 initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
 transition={{ type: 'spring', stiffness: 240, damping: 20 }}
 style={{ padding: 24, alignItems: 'center', gap: 8, maxWidth: 320, background: 'rgba(255,255,255,0.7)' }}>
 <MonsterView species={selected.species} stage={selected.stage} state="ghost" size={130} />
 <h2 style={{ color: 'var(--ink)' }}>{selected.name}</h2>
 <span className="chip" style={{ fontSize: 12 }}>
 {COPY.stage[selected.stage]} · {SPECIES[selected.species].displayName}
 </span>
 <p className="muted" style={{ fontStyle: 'italic', textAlign: 'center', fontWeight: 600, margin: '6px 0' }}>
 “{selected.epitaph}”
 </p>
 <div className="col" style={{ gap: 3, width: '100%', fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
 <div className="row" style={{ justifyContent: 'space-between' }}><span>{COPY.memorial.born}</span><span>{formatDate(selected.bornAt)}</span></div>
 <div className="row" style={{ justifyContent: 'space-between' }}><span>{COPY.memorial.died}</span><span>{formatDate(selected.diedAt)}</span></div>
 <div className="row" style={{ justifyContent: 'space-between' }}><span>{COPY.memorial.survived}</span><span>{selected.daysSurvived} {COPY.common.days}</span></div>
 <div className="row" style={{ justifyContent: 'space-between' }}><span>{COPY.death.focusHours}</span><span>{selected.totalFocusHours} {COPY.stats.hours}</span></div>
 </div>
 <button className="btn" style={{ marginTop: 10, padding: '11px 34px' }} onClick={() => setSelected(null)}>{COPY.common.back}</button>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
