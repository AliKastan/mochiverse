import { motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { MONTHS_TR } from '../game/copy';
 import { useT } from '../i18n';
import { localDateKey } from '../game/time';
import { GENERAL_SUBJECT_ID } from '../game/constants';
import type { Subject } from '../game/types';
import { FireIcon, SparkleIcon, TrophyIcon } from '../components/Icons';
import { ItemIcon } from '../components/ItemIcon';

// Sum focused minutes per subject over the last N days, richest first.
function bySubjectOverDays(subjects: Subject[], history: Record<string, Record<string, number>>, days: number) {
 const today = new Date(); today.setHours(0, 0, 0, 0);
 const keys: string[] = [];
 for (let i = 0; i < days; i++) keys.push(localDateKey(today.getTime() - i * 86_400_000));
 return subjects
 .map((s) => ({ s, minutes: keys.reduce((a, k) => a + ((history[s.id] ?? {})[k] ?? 0), 0) }))
 .filter((x) => x.minutes > 0)
 .sort((a, b) => b.minutes - a.minutes);
}
const weeklyBySubject = (s: Subject[], h: Record<string, Record<string, number>>) => bySubjectOverDays(s, h, 7);
const monthlyBySubject = (s: Subject[], h: Record<string, Record<string, number>>) => bySubjectOverDays(s, h, 30);

const WEEKS = 18;
const CELL = 13;
const GAP = 3;

// pink intensity scale
const LEVELS = ['#EFE4F3', '#FBD0E6', '#F7A9CE', '#FF8FC7', '#EC5EA0'];
function level(mins: number): number {
 if (mins <= 0) return 0;
 if (mins < 15) return 1;
 if (mins < 30) return 2;
 if (mins < 60) return 3;
 return 4;
}

interface Cell { key: string; mins: number; date: Date; }

function buildGrid(history: Record<string, number>): { columns: (Cell | null)[][]; monthLabels: { col: number; label: string }[] } {
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const days: Cell[] = [];
 for (let i = WEEKS * 7 - 1; i >= 0; i--) {
 const d = new Date(today.getTime() - i * 86_400_000);
 const key = localDateKey(d.getTime());
 days.push({ key, mins: history[key] ?? 0, date: d });
 }
 // pad front so first row is Monday
 const firstMon = (days[0].date.getDay() + 6) % 7;
 const padded: (Cell | null)[] = [...Array(firstMon).fill(null), ...days];

 const columns: (Cell | null)[][] = [];
 for (let c = 0; c < padded.length; c += 7) columns.push(padded.slice(c, c + 7));

 const monthLabels: { col: number; label: string }[] = [];
 let lastMonth = -1;
 columns.forEach((col, ci) => {
 const firstReal = col.find((c) => c);
 if (firstReal && firstReal.date.getMonth() !== lastMonth) {
 lastMonth = firstReal.date.getMonth();
 monthLabels.push({ col: ci, label: MONTHS_TR[lastMonth] });
 }
 });

 return { columns, monthLabels };
}

export function Stats() {
 const COPY = useT();
 const history = useGame((s) => s.focusHistory);
 const longest = useGame((s) => s.longestStreak);
 const totalMin = useGame((s) => s.totalFocusMinutes);
 const totalSessions = useGame((s) => s.totalSessions);
 const subjects = useGame((s) => s.subjects);
 const subjectHistory = useGame((s) => s.subjectHistory);
 const premium = useGame((s) => s.premium);
 const weeklyGoal = useGame((s) => s.weeklyGoalMinutes);
 const setWeeklyGoal = useGame((s) => s.setWeeklyGoal);
 const go = useGame((s) => s.go);

 const { columns, monthLabels } = buildGrid(history);
 const totalHours = Math.round((totalMin / 60) * 10) / 10;
 const weekly = weeklyBySubject(subjects, subjectHistory);
 const maxWeekMin = Math.max(1, ...weekly.map((w) => w.minutes));
 const monthly = monthlyBySubject(subjects, subjectHistory);
 const weekMin = weekly.reduce((a, w) => a + w.minutes, 0);
 const goalPct = weeklyGoal > 0 ? Math.min(1, weekMin / weeklyGoal) : 0;
 const GOALS = [300, 600, 900, 1200]; // 5h / 10h / 15h / 20h per week
 const subjectLabel = (s: Subject) => (s.id === GENERAL_SUBJECT_ID ? COPY.focus.general : s.name);

 return (
 <div className="col" style={{ position: 'absolute', inset: 0,
 background: '#E8ECFF' }}>
 <div className="row" style={{ justifyContent: 'space-between', padding: '18px 18px 6px' }}>
 <button className="icon-btn" onClick={() => go('home')} aria-label="Geri"><ItemIcon icon="back" size={22} /></button>
 <h2 style={{ color: 'var(--ink)' }}>{COPY.stats.title}</h2>
 <div style={{ width: 46 }} />
 </div>

 <div className="scroll-y col" style={{ flex: 1, padding: 16, gap: 16 }}>
 {/* summary cards */}
 <div className="row" style={{ gap: 12 }}>
 <StatCard icon={<FireIcon size={26} />} value={`${longest}`} label={COPY.stats.longestStreak} />
 <StatCard icon={<SparkleIcon size={26} color="#B39DFF" />} value={`${totalHours}`} label={`${COPY.stats.totalHours} (${COPY.stats.hours})`} />
 <StatCard icon={<TrophyIcon size={26} />} value={`${totalSessions}`} label={COPY.stats.totalSessions} />
 </div>

 {/* weekly breakdown by subject */}
 <div className="glass col" style={{ padding: 16, gap: 12 }}>
 <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
 <span style={{ fontFamily: 'Fredoka', fontWeight: 600, color: 'var(--ink)' }}>{COPY.stats.bySubject}</span>
 <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{COPY.stats.thisWeek}</span>
 </div>
 {weekly.length === 0 ? (
 <span className="muted" style={{ fontSize: 13 }}>{COPY.stats.noSubjectData}</span>
 ) : weekly.map(({ s, minutes }) => {
 const val = minutes < 60 ? `${minutes} ${COPY.focus.min}` : `${Math.round(minutes / 60 * 10) / 10} ${COPY.stats.hours}`;
 return (
 <div key={s.id} className="col" style={{ gap: 5 }}>
 <div className="row" style={{ justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
 <span className="row" style={{ gap: 7, alignItems: 'center' }}>
 <span style={{ width: 11, height: 11, borderRadius: '50%', background: s.color, boxShadow: '0 0 0 2px rgba(255,255,255,0.7)' }} />
 {subjectLabel(s)}
 </span>
 <span className="muted" style={{ fontWeight: 700 }}>{val}</span>
 </div>
 <div style={{ height: 9, borderRadius: 5, background: 'rgba(106,83,117,0.12)', overflow: 'hidden' }}>
 <motion.div initial={{ width: 0 }} animate={{ width: `${(minutes / maxWeekMin) * 100}%` }}
 transition={{ type: 'spring', stiffness: 120, damping: 20 }}
 style={{ height: '100%', background: s.color, borderRadius: 5 }} />
 </div>
 </div>
 );
 })}
 </div>

 {/* PRO insights — premium: monthly per-subject; free: locked upsell */}
 <div className="glass col" style={{ padding: 16, gap: 12, position: 'relative', border: premium ? undefined : '2px dashed rgba(197,139,0,0.5)' }}>
 <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
 <span className="row" style={{ gap: 6, alignItems: 'baseline', fontFamily: 'Fredoka', fontWeight: 700, color: premium ? 'var(--ink)' : '#c58b00' }}>
 {COPY.pro.title} {!premium && <span style={{ fontSize: 11 }}>🔒</span>}
 </span>
 <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>30 {COPY.stats.days}</span>
 </div>
 {premium ? (
 <>
 {/* weekly focus goal — the recurring "worth it" Pro feature */}
 <div className="col" style={{ gap: 8, alignItems: 'center', paddingBottom: 4 }}>
 {weeklyGoal > 0 ? (
 <>
 <GoalRing pct={goalPct} />
 <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>
 {Math.round(weekMin / 60 * 10) / 10} / {Math.round(weeklyGoal / 60)} {COPY.stats.hours}
 </span>
 <span className="muted" style={{ fontSize: 11.5 }}>
 {goalPct >= 1 ? COPY.pro.goalReached : `${Math.round(goalPct * 100)}% ${COPY.pro.ofGoal}`}
 </span>
 <button onClick={() => setWeeklyGoal(0)}
 style={{ fontSize: 10.5, background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', textDecoration: 'underline' }}>
 {COPY.pro.setGoal} ↺
 </button>
 </>
 ) : (
 <>
 <span className="muted" style={{ fontSize: 12.5 }}>{COPY.pro.weeklyGoal}</span>
 <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
 {GOALS.map((g) => (
 <button key={g} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '0.6rem' }}
 onClick={() => setWeeklyGoal(g)}>
 {g / 60} {COPY.stats.hours}
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 {/* monthly per-subject breakdown */}
 {monthly.length > 0 && <div style={{ height: 1, background: 'rgba(106,83,117,0.12)', margin: '2px 0' }} />}
 {monthly.map(({ s, minutes }) => (
 <div key={s.id} className="row" style={{ justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
 <span className="row" style={{ gap: 7, alignItems: 'center' }}>
 <span style={{ width: 11, height: 11, borderRadius: '50%', background: s.color, boxShadow: '0 0 0 2px rgba(255,255,255,0.7)' }} />
 {subjectLabel(s)}
 </span>
 <span className="muted" style={{ fontWeight: 700 }}>{Math.round(minutes / 60 * 10) / 10} {COPY.stats.hours}</span>
 </div>
 ))}
 </>
 ) : (
 <div className="col" style={{ gap: 10, alignItems: 'center', padding: '4px 0' }}>
 <span className="muted" style={{ fontSize: 12.5, textAlign: 'center' }}>{COPY.pro.goalHint}</span>
 <button className="btn btn-peach" style={{ padding: '10px 16px', fontSize: '0.62rem' }} onClick={() => go('premium')}>
 {COPY.pro.locked}
 </button>
 </div>
 )}
 </div>

 {/* heatmap */}
 <div className="glass col" style={{ padding: 16, gap: 10 }}>
 <span style={{ fontFamily: 'Fredoka', fontWeight: 600, color: 'var(--ink)' }}>{COPY.stats.heatmap} </span>

 <div className="scroll-y" style={{ overflowX: 'auto', paddingBottom: 4 }}>
 <div style={{ display: 'inline-block' }}>
 {/* month labels */}
 <div style={{ position: 'relative', height: 14, marginLeft: 0 }}>
 {monthLabels.map((m) => (
 <span key={`${m.col}-${m.label}`} style={{ position: 'absolute', left: m.col * (CELL + GAP),
 fontSize: 10, fontWeight: 700, color: 'var(--ink-soft)' }}>{m.label}</span>
 ))}
 </div>
 {/* grid */}
 <div className="row" style={{ gap: GAP, alignItems: 'flex-start' }}>
 {columns.map((col, ci) => (
 <div key={ci} className="col" style={{ gap: GAP }}>
 {Array.from({ length: 7 }).map((_, ri) => {
 const cell = col[ri];
 if (!cell) return <div key={ri} style={{ width: CELL, height: CELL }} />;
 const lv = level(cell.mins);
 return (
 <motion.div key={ri} title={`${cell.key}: ${cell.mins} dk`}
 initial={{ scale: 0 }} animate={{ scale: 1 }}
 transition={{ delay: Math.min(0.4, ci * 0.01), type: 'spring', stiffness: 300, damping: 20 }}
 style={{ width: CELL, height: CELL, borderRadius: 4, background: LEVELS[lv],
 border: '1px solid rgba(255,255,255,0.6)' }} />
 );
 })}
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* legend */}
 <div className="row" style={{ gap: 5, justifyContent: 'flex-end', alignItems: 'center' }}>
 <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{COPY.stats.less}</span>
 {LEVELS.map((c) => <div key={c} style={{ width: 11, height: 11, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.6)' }} />)}
 <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{COPY.stats.more}</span>
 </div>
 </div>
 </div>
 </div>
 );
}

// Circular progress ring for the weekly focus goal.
function GoalRing({ pct }: { pct: number }) {
 const R = 34, C = 2 * Math.PI * R;
 return (
 <svg width="84" height="84" viewBox="0 0 84 84">
 <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(106,83,117,0.14)" strokeWidth="8" />
 <defs>
 <linearGradient id="goal" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stopColor="#FF8FC7" /><stop offset="100%" stopColor="#7FE3C0" />
 </linearGradient>
 </defs>
 <motion.circle cx="42" cy="42" r={R} fill="none" stroke="url(#goal)" strokeWidth="8" strokeLinecap="round"
 transform="rotate(-90 42 42)" strokeDasharray={C}
 initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
 transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
 <text x="42" y="47" textAnchor="middle" style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, fill: 'var(--ink)' }}>
 {Math.round(pct * 100)}%
 </text>
 </svg>
 );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
 return (
 <motion.div className="glass col" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
 style={{ flex: 1, padding: '14px 8px', alignItems: 'center', gap: 3, textAlign: 'center' }}>
 {icon}
 <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 22, color: 'var(--ink)' }}>{value}</span>
 <span className="muted" style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.2 }}>{label}</span>
 </motion.div>
 );
}
