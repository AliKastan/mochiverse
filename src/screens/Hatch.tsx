import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { EggArt } from '../assets/EggArt';
import { MonsterView } from '../components/MonsterView';
import { SparkleRing } from '../components/Particles';
import { sound } from '../audio/sound';

// deterministic shell-fragment burst directions
const SHARDS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return { dx: Math.cos(a) * (70 + (i % 4) * 22), dy: Math.sin(a) * (70 + (i % 4) * 22), r: (i % 3) - 1 };
});

function ShellBurst() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'grid', placeItems: 'center', zIndex: 30 }}>
      {SHARDS.map((s, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', width: 12, height: 10, borderRadius: 3, background: '#FFE7F3', border: '2px solid #F3A9CE' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: s.dx, y: s.dy + 40, opacity: 0, scale: 0.6, rotate: s.r * 220 }}
          transition={{ duration: 0.9, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

export function Hatch() {
 const COPY = useT();
 const pet = useGame((s) => s.pet);
 const hatch = useGame((s) => s.hatch);
 const [crack, setCrack] = useState<0 | 1 | 2 | 3>(0);
 const [flash, setFlash] = useState(false);
 const [hatched, setHatched] = useState(false);
 const [name, setName] = useState('');

 if (!pet) return null;

 const tap = () => {
 if (hatched) return;
 sound.play('pop');
 const next = Math.min(3, crack + 1) as 0 | 1 | 2 | 3;
 setCrack(next);
 if (next === 3) {
 sound.play('chime');
 setFlash(true);
 setTimeout(() => setHatched(true), 380);
 setTimeout(() => setFlash(false), 760);
 }
 };

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <SkyBackground />
 <div className="col" style={{ position: 'relative', flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 26 }}>

 <AnimatePresence mode="wait">
 {!hatched ? (
 <motion.div key="egg" className="col" style={{ alignItems: 'center', gap: 26 }}
 exit={{ opacity: 0, scale: 0.6 }}>
 <motion.h2 style={{ color: 'var(--ink)', textAlign: 'center', fontSize: 14 }}
 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
 {crack === 0 ? COPY.hatch.tapEgg : COPY.hatch.hatching}
 </motion.h2>
 <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
 {flash && <ShellBurst />}
 <motion.button onClick={tap} whileTap={{ scale: 0.88 }} style={{ background: 'none' }}
 key={crack}
 animate={crack > 0 ? { x: [0, -8, 8, -5, 5, 0], rotate: [0, -6, 6, -4, 4, 0] } : {}}
 transition={{ duration: 0.4 }}>
 <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
 <EggArt crackStage={crack} size={210} />
 </motion.div>
 </motion.button>
 </div>
 <div className="row" style={{ gap: 6 }}>
 {[0, 1, 2].map((k) => (
 <div key={k} style={{ width: 10, height: 10, borderRadius: 999,
 background: crack > k ? 'var(--pink)' : 'rgba(255,255,255,0.7)' }} />
 ))}
 </div>
 </motion.div>
 ) : (
 <motion.div key="reveal" className="col" style={{ alignItems: 'center', gap: 20, width: '100%', maxWidth: 360 }}
 initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
 <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
 <SparkleRing />
 {/* hatches into the mystery cell — species stays hidden until it evolves */}
 <MonsterView species={pet.species} stage="blob" state="happy" size={190} form={pet.form} />
 </div>
 <div className="col" style={{ alignItems: 'center', gap: 4 }}>
 <span className="muted" style={{ fontFamily: 'var(--pixel)', fontSize: 8 }}>{COPY.hatch.mystery}</span>
 <h2 style={{ color: 'var(--ink)', fontSize: 13 }}>{COPY.hatch.naming}</h2>
 </div>
 <input
 autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={14}
 placeholder={COPY.hatch.placeholder}
 onKeyDown={(e) => e.key === 'Enter' && name.trim() && hatch(name)}
 style={{ width: '100%', textAlign: 'center', padding: '14px 18px', borderRadius: 12,
 border: '3px solid var(--ink)', background: 'var(--cream)',
 fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: 'var(--ink)', outline: 'none' }} />
 <button className="btn" style={{ width: '100%' }} disabled={!name.trim()} onClick={() => hatch(name)}>
 {COPY.hatch.confirm}
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* white flash at the moment of hatching */}
 <AnimatePresence>
 {flash && (
 <motion.div key="flash" style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 40, pointerEvents: 'none' }}
 initial={{ opacity: 0 }} animate={{ opacity: [0, 0.95, 0] }} exit={{ opacity: 0 }}
 transition={{ duration: 0.7, times: [0, 0.3, 1] }} />
 )}
 </AnimatePresence>
 </div>
 );
}
