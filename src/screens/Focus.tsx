import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { TIMER_PRESETS, ANTICHEAT, SUBJECT_COLORS, GENERAL_SUBJECT_ID } from '../game/constants';
import type { Subject } from '../game/types';
import { NightBackground } from '../components/backgrounds/NightBackground';
import { MonsterView } from '../components/MonsterView';
import { getFormFrames, useSpriteVersion } from '../assets/registry';
import type { SpeciesId, Stage } from '../game/types';
import { mmss } from '../game/time';
import { useInterval, usePageVisibility, useWakeLock } from '../hooks';
import { toast } from '../components/toast';
import { FOCUS_SOUNDS, playFocusSound, stopFocusSound, type FocusSoundId } from '../audio/focusSound';

export function Focus() {
 const pet = useGame((s) => s.pet);
 const session = useGame((s) => s.session);
 const startFocus = useGame((s) => s.startFocus);
 const completeFocus = useGame((s) => s.completeFocus);
 const quitFocus = useGame((s) => s.quitFocus);
 const addHiddenTime = useGame((s) => s.addHiddenTime);
 const go = useGame((s) => s.go);

 if (!pet) return null;
 return session
 ? <Running key="run" {...{ session, completeFocus, quitFocus, addHiddenTime }} pet={pet} />
 : <Picker key="pick" onStart={startFocus} onBack={() => go('home')} />;
}

// Localized display label for a subject (the starter "general" subject follows
// the UI language; user-made ones keep their typed name).
function subjectLabel(s: Subject, generalWord: string): string {
 return s.id === GENERAL_SUBJECT_ID ? generalWord : s.name;
}

// ---------------------------------------------------------------
// Colour-coded subject selector: pick what you're focusing on (Physics, etc.)
// so the time is tallied per subject and shown as a weekly breakdown in Stats.
function SubjectSelector() {
 const COPY = useT();
 const subjects = useGame((s) => s.subjects);
 const activeId = useGame((s) => s.activeSubjectId);
 const setActive = useGame((s) => s.setActiveSubject);
 const addSubject = useGame((s) => s.addSubject);
 const deleteSubject = useGame((s) => s.deleteSubject);

 const [adding, setAdding] = useState(false);
 const [name, setName] = useState('');
 const [color, setColor] = useState(SUBJECT_COLORS[0]);

 const submit = () => {
 if (!name.trim()) return;
 addSubject(name, color);
 setName(''); setColor(SUBJECT_COLORS[0]); setAdding(false);
 };

 return (
 <div className="col" style={{ gap: 10, width: '100%', maxWidth: 340, alignItems: 'center' }}>
 <span style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--pixel)', fontSize: 9 }}>{COPY.focus.subject}</span>
 <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
 {subjects.map((s) => {
 const active = s.id === activeId;
 return (
 <button key={s.id} className="subject-chip" onClick={() => setActive(s.id)}
 style={{ background: active ? s.color : 'rgba(255,255,255,0.14)',
 borderColor: active ? '#fff' : s.color }}>
 <span className="subject-dot" style={{ background: s.color }} />
 {subjectLabel(s, COPY.focus.general)}
 {active && s.id !== GENERAL_SUBJECT_ID && (
 <span className="subject-del" role="button" aria-label="x"
 onClick={(e) => { e.stopPropagation(); deleteSubject(s.id); }}>✕</span>
 )}
 </button>
 );
 })}
 <button className="subject-chip subject-add" onClick={() => setAdding((a) => !a)} aria-label={COPY.focus.newSubject}>＋</button>
 </div>
 {adding && (
 <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
 className="col" style={{ gap: 10, width: '100%', maxWidth: 280 }}>
 <input className="subject-name-input" value={name} maxLength={18} autoFocus
 placeholder={COPY.focus.subjectName} onChange={(e) => setName(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
 <div className="row" style={{ gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
 {SUBJECT_COLORS.map((c) => (
 <button key={c} className="subject-swatch" onClick={() => setColor(c)}
 style={{ background: c, outline: c === color ? '3px solid #fff' : 'none', outlineOffset: 1 }} />
 ))}
 </div>
 <button className="btn btn-peach" style={{ padding: '11px' }} onClick={submit}>{COPY.focus.add}</button>
 </motion.div>
 )}
 </div>
 );
}

// ---------------------------------------------------------------
function Picker({ onStart, onBack }: { onStart: (m: number) => void; onBack: () => void }) {
 const COPY = useT();
 const [custom, setCustom] = useState(false);
 const [mins, setMins] = useState(25);

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <NightBackground />
 <div className="scroll-y col" style={{ position: 'relative', flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
 <motion.h2 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
 style={{ color: '#fff', fontSize: 24, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
 {COPY.focus.choose}
 </motion.h2>

 <SubjectSelector />

 <div className="row" style={{ gap: 12 }}>
 {TIMER_PRESETS.map((p) => (
 <motion.button key={p} whileTap={{ scale: 0.9 }}
 onClick={() => { setCustom(false); setMins(p); }}
 className="glass col" style={{ width: 88, height: 96, alignItems: 'center', justifyContent: 'center',
 gap: 2, border: !custom && mins === p ? '2.5px solid var(--pink)' : undefined,
 background: !custom && mins === p ? 'rgba(255,255,255,0.65)' : undefined }}>
 <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 30, color: 'var(--ink)' }}>{p}</span>
 <span className="muted" style={{ fontWeight: 700, fontSize: 13 }}>{COPY.focus.min}</span>
 </motion.button>
 ))}
 </div>

 <div className="col" style={{ alignItems: 'center', gap: 12, width: '100%', maxWidth: 300 }}>
 <button className="chip" onClick={() => setCustom(true)}
 style={{ border: custom ? '2px solid var(--pink)' : undefined }}>
 {COPY.focus.custom}
 </button>
 {custom && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="row" style={{ gap: 12 }}>
 <input type="range" min={5} max={120} step={5} value={mins}
 onChange={(e) => setMins(Number(e.target.value))} style={{ width: 180, accentColor: '#FF8FC7' }} />
 <span style={{ fontFamily: 'Fredoka', fontWeight: 700, color: '#fff', minWidth: 54 }}>{mins} {COPY.focus.min}</span>
 </motion.div>
 )}
 </div>

 <button className="btn" style={{ width: '100%', maxWidth: 300, padding: 16, fontSize: 19 }}
 onClick={() => onStart(mins)}>
 {COPY.focus.start} 
 </button>
 <button className="btn btn-ghost" style={{ padding: '10px 22px' }} onClick={onBack}>{COPY.common.back}</button>
 </div>
 </div>
 );
}

// ---------------------------------------------------------------
function Running({ session, pet, completeFocus, quitFocus, addHiddenTime }: {
 session: NonNullable<ReturnType<typeof useGame.getState>['session']>;
 pet: NonNullable<ReturnType<typeof useGame.getState>['pet']>;
 completeFocus: () => void;
 quitFocus: () => void;
 addHiddenTime: (ms: number) => void;
}) {
 const COPY = useT();
 const totalMs = session.durationMin * 60_000;
 const endAt = session.startedAt + totalMs;
 const [remaining, setRemaining] = useState(Math.max(0, endAt - Date.now()));
 const warnedRef = useRef(false);

 // Keep the screen awake for the whole session so the phone never dims mid-timer.
 useWakeLock(true);

 // Ambient focus sound (procedural). Plays for the session; premium sounds need
 // the subscription, otherwise they fall back to the free "brown" noise.
 const soundPref = useGame((s) => s.settings.focusSound);
 const setFocusSound = useGame((s) => s.setFocusSound);
 const premium = useGame((s) => s.premium);
 const go = useGame((s) => s.go);
 const effectiveSound = (() => {
 const def = FOCUS_SOUNDS.find((x) => x.id === soundPref);
 return def && def.premium && !premium ? 'lofi' : (soundPref as FocusSoundId);
 })();
 useEffect(() => { playFocusSound(effectiveSound); return () => stopFocusSound(); }, [effectiveSound]);

 // countdown
 useInterval(() => {
 const left = Math.max(0, endAt - Date.now());
 setRemaining(left);
 if (left <= 0) completeFocus();
 }, 250);

 // anti-cheat via Page Visibility
 usePageVisibility({
 onVisible: (awayMs) => {
 addHiddenTime(awayMs);
 const cumulative = session.hiddenMs + awayMs;
 if (cumulative >= ANTICHEAT.failMs) {
 quitFocus();
 } else if (cumulative >= ANTICHEAT.warnMs && !warnedRef.current) {
 warnedRef.current = true;
 toast(COPY.focus.watchWarn);
 }
 },
 }, true);

 const progress = 1 - remaining / totalMs;

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <NightBackground dim />
 <div className="col" style={{ position: 'relative', flex: 1, padding: 24, alignItems: 'center', justifyContent: 'space-between' }}>
 <div style={{ height: 20 }} />

 {/* the pet asleep on the ground — no bed. Sleeping sprite + a snot bubble
 that grows and pops on the nose, with drifting Zzz's above. */}
 <div className="col" style={{ alignItems: 'center', gap: 6, marginTop: 8 }}>
 <div style={{ position: 'relative', width: 200, height: 180 }}>
 {/* soft ground shadow so the pet reads as resting on the ground */}
 <div style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)',
 width: 122, height: 16, borderRadius: '50%', background: 'rgba(8,6,26,0.4)' }} />

 {/* drifting Zzz's above the head */}
 <SleepZs />

 {/* pet asleep — ONE static calm frame so the body/mouth never deforms
 (the sleeping sprite's own frames animate a snore bubble from the mouth,
 which we deliberately don't play), gently bobbing to breathe. The only
 animated bubble is our single overlay one, anchored to the nose. */}
 <div style={{ position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)',
 width: 150, height: 150 }}>
 <SleepingPet species={pet.species} stage={pet.stage} form={pet.form} size={150} />
 <SnotBubble />
 </div>
 </div>
 <span style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--pixel)', fontSize: 9 }}>
 {pet.name} {COPY.focus.sleeping}
 </span>
 </div>

 {/* countdown ring */}
 <div style={{ position: 'relative', width: 260, height: 260, display: 'grid', placeItems: 'center' }}>
 <svg width="260" height="260" viewBox="0 0 260 260" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
 <circle cx="130" cy="130" r="118" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
 <defs>
 <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stopColor="#FF8FC7" /><stop offset="50%" stopColor="#C79BFF" /><stop offset="100%" stopColor="#7FE3C0" />
 </linearGradient>
 </defs>
 <motion.circle cx="130" cy="130" r="118" fill="none" stroke="url(#ring)" strokeWidth="12" strokeLinecap="round"
 strokeDasharray={2 * Math.PI * 118}
 animate={{ strokeDashoffset: 2 * Math.PI * 118 * (1 - progress) }}
 transition={{ ease: 'linear', duration: 0.25 }} />
 </svg>
 <motion.div className="col" style={{ alignItems: 'center' }}
 animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
 <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 58, color: '#fff', letterSpacing: 1,
 textShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>{mmss(remaining / 1000)}</span>
 <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 13 }}>{COPY.focus.focusing}</span>
 </motion.div>
 </div>

 {/* ambient focus sound picker */}
 <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 }}>
 {FOCUS_SOUNDS.map((snd) => {
 const locked = snd.premium && !premium;
 const on = soundPref === snd.id;
 return (
 <button key={snd.id}
 onClick={() => { if (locked) go('premium'); else setFocusSound(snd.id); }}
 style={{ padding: '6px 11px', borderRadius: 999, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 12,
 cursor: 'pointer', color: '#fff',
 background: on ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.12)',
 border: `1.5px solid rgba(255,255,255,${on ? 0.7 : 0.3})` }}>
 {locked ? '🔒 ' : ''}{COPY.sounds[snd.nameKey as keyof typeof COPY.sounds] ?? snd.id}
 </button>
 );
 })}
 </div>

 <HoldToQuit onQuit={quitFocus} />
 </div>
 </div>
 );
}

// ---------------------------------------------------------------
function HoldToQuit({ onQuit }: { onQuit: () => void }) {
 const COPY = useT();
 const HOLD_MS = 3000;
 const [progress, setProgress] = useState(0);
 const [holding, setHolding] = useState(false);
 const raf = useRef(0);
 const start = useRef(0);

 const begin = () => {
 setHolding(true);
 start.current = Date.now();
 const loop = () => {
 const p = Math.min(1, (Date.now() - start.current) / HOLD_MS);
 setProgress(p);
 if (p >= 1) { onQuit(); return; }
 raf.current = requestAnimationFrame(loop);
 };
 raf.current = requestAnimationFrame(loop);
 };
 const end = () => { cancelAnimationFrame(raf.current); setHolding(false); setProgress(0); };
 useEffect(() => () => cancelAnimationFrame(raf.current), []);

 return (
 <div className="col" style={{ alignItems: 'center', gap: 8, width: '100%' }}>
 <AnimatePresence>
 {holding && (
 <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
 style={{ color: '#FFC2D6', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
 {COPY.focus.giveUpHint}
 </motion.span>
 )}
 </AnimatePresence>
 <button
 onPointerDown={begin} onPointerUp={end} onPointerLeave={end} onPointerCancel={end}
 style={{ position: 'relative', width: '100%', maxWidth: 300, padding: '15px', borderRadius: 999,
 overflow: 'hidden', background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.35)',
 color: 'rgba(255,255,255,0.9)', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, touchAction: 'none' }}>
 <div style={{ position: 'absolute', inset: 0, width: `${progress * 100}%`,
 background: 'rgba(255,107,138,0.65)', transition: 'none' }} />
 <span style={{ position: 'relative' }}>{COPY.focus.giveUpHold} {holding ? `(${Math.ceil(3 - progress * 3)})` : ''}</span>
 </button>
 </div>
 );
}

// ---------------------------------------------------------------
// The sleeping pet: a SINGLE static frame (never the cycling sleep
// animation, whose frames inflate a snore bubble out of the mouth),
// so the body stays completely still apart from a gentle breathing
// bob. Falls back to the always-drawable art if no sprite exists.
function SleepingPet({ species, stage, form, size }: { species: SpeciesId; stage: Stage; form: string; size: number }) {
 const reduced = useReducedMotion();
 const [failed, setFailed] = useState(false);
 useSpriteVersion(); // re-render when this form's frames finish lazy-loading
 const frames = getFormFrames(form, 'sleeping') ?? getFormFrames(form, 'idle');
 // a calm mid-cycle frame: closed eyes, no inflated snore bubble
 const pose = frames && frames.length ? frames[Math.floor(frames.length / 2)] : null;
 if (pose && !failed) {
 return (
 <motion.img className="pixelated" src={pose} width={size} height={size} draggable={false}
 onError={() => setFailed(true)} style={{ display: 'block' }}
 animate={reduced ? undefined : { y: [0, -3, 0] }}
 transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }} />
 );
 }
 return <MonsterView species={species} stage={stage} state="idle" form={form} size={size} />;
}

// ---------------------------------------------------------------
// A snot bubble on the pet's nose, its OWN element on top of the
// static sprite: it slowly inflates over ~2.4s, pops with a quick
// expand, releases a tiny burst of puffs, then repeats. This is the
// only bubble in the scene.
function SnotBubble() {
 const reduced = useReducedMotion();
 if (reduced) return null;
 const puffs: [number, number][] = [[-7, -8], [8, -9], [-9, 5], [7, 6]];
 return (
 <div style={{ position: 'absolute', left: '55%', top: '45%', width: 0, height: 0, zIndex: 3 }}>
 {/* the inflating-then-popping bubble */}
 <motion.div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%',
 background: 'rgba(200,230,255,0.42)', border: '2px solid rgba(255,255,255,0.82)',
 boxShadow: 'inset -3px -3px 0 rgba(150,200,255,0.45)', transformOrigin: 'bottom left' }}
 animate={{ scale: [0, 0.35, 1, 1.18, 0], opacity: [0, 0.85, 0.9, 0.95, 0] }}
 transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.28, 0.8, 0.9, 1] }} />
 {/* tiny burst puffs that flash outward exactly as the bubble pops */}
 {puffs.map(([dx, dy], i) => (
 <motion.div key={i} style={{ position: 'absolute', width: 4, height: 4, borderRadius: '50%',
 background: 'rgba(220,240,255,0.9)' }}
 animate={{ scale: [0, 0, 1.4, 0], opacity: [0, 0, 1, 0], x: [0, 0, dx * 1.8, dx * 2.6], y: [0, 0, dy * 1.8, dy * 2.6] }}
 transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', times: [0, 0.85, 0.92, 1] }} />
 ))}
 </div>
 );
}

// Drifting "z z z" that rise and fade above the sleeping pet, staggered.
function SleepZs() {
 const reduced = useReducedMotion();
 if (reduced) {
 return (
 <span style={{ position: 'absolute', top: 18, left: '62%', fontFamily: 'var(--pixel)',
 fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>z</span>
 );
 }
 return (
 <div style={{ position: 'absolute', top: 4, left: '58%', width: 60, height: 90, zIndex: 3 }}>
 {[0, 1, 2].map((i) => (
 <motion.span key={i} style={{ position: 'absolute', left: i * 7, top: 40, fontFamily: 'var(--pixel)',
 color: 'rgba(255,255,255,0.9)', fontSize: 11 + i * 4, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}
 animate={{ y: [8, -42], x: [0, 14], opacity: [0, 1, 0], scale: [0.6, 1] }}
 transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}>z</motion.span>
 ))}
 </div>
 );
}
