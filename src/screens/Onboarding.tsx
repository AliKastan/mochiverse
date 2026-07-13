import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { MonsterView } from '../components/MonsterView';
import { ItemIcon } from '../components/ItemIcon';
import { GravestoneIcon } from '../components/Icons';

const SLIDE_ICON = ['flower', 'chart', 'grave'];

export function Onboarding() {
 const COPY = useT();
 const finish = useGame((s) => s.finishOnboarding);
 const [i, setI] = useState(0);
 const slides = COPY.onboarding;
 const last = i === slides.length - 1;

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <SkyBackground />
 <div className="col" style={{ position: 'relative', flex: 1, padding: 24, justifyContent: 'space-between' }}>
 <div style={{ textAlign: 'center', marginTop: 18 }}>
 <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 14 }}
 className="row" style={{ fontSize: 20, color: 'var(--ink)', justifyContent: 'center', gap: 8 }}>
 Mochiverse <ItemIcon icon="flower" size={20} />
 </motion.h1>
 </div>

 <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
 <AnimatePresence mode="wait">
 <motion.div key={i} className="glass col"
 initial={{ opacity: 0, x: 40, scale: 0.95 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 exit={{ opacity: 0, x: -40, scale: 0.95 }}
 transition={{ type: 'spring', stiffness: 260, damping: 24 }}
 style={{ padding: '28px 24px', alignItems: 'center', textAlign: 'center', maxWidth: 360, gap: 14 }}>
 <motion.div
 animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
 {SLIDE_ICON[i] === 'grave' ? <GravestoneIcon size={60} /> : <ItemIcon icon={SLIDE_ICON[i]} size={60} />}
 </motion.div>
 <h2 style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{slides[i].title}</h2>
 <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>{slides[i].body}</p>
 </motion.div>
 </AnimatePresence>
 </div>

 {/* peeking mochi */}
 <div style={{ display: 'grid', placeItems: 'center', height: 90 }}>
 <MonsterView species="mochi" stage="baby" state={last ? 'sad' : 'happy'} size={120} />
 </div>

 <div className="col" style={{ alignItems: 'center', gap: 18 }}>
 <div className="row" style={{ gap: 8 }}>
 {slides.map((_, k) => (
 <motion.div key={k} animate={{ width: k === i ? 26 : 8, opacity: k === i ? 1 : 0.5 }}
 style={{ height: 8, borderRadius: 999, background: k === i ? 'var(--pink)' : '#fff' }} />
 ))}
 </div>
 <button className="btn" style={{ width: '100%', maxWidth: 340, padding: '16px' }}
 onClick={() => (last ? finish() : setI(i + 1))}>
 {last ? 'Hadi başlayalım!' : 'Devam'}
 </button>
 </div>
 </div>
 </div>
 );
}
