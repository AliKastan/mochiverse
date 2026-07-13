import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { MonsterView } from '../components/MonsterView';
import { ItemIcon } from '../components/ItemIcon';
import { TREE, TREE_BY_STAGE } from '../game/tree';
import type { Stage } from '../game/types';

// The whole branching evolution tree. Forms the player has ever reached show
// their sprite + name; the rest are dark silhouettes with a "?". Discoveries
// persist across pets — the long-term goal is to fill the whole wheel.
const STAGE_ORDER: Stage[] = ['blob', 'baby', 'teen', 'legendary'];
const ALL_FORMS = STAGE_ORDER.flatMap((s) => TREE_BY_STAGE[s]);

export function Collection() {
 const COPY = useT();
 const discoveredList = useGame((s) => s.discovered);
 const go = useGame((s) => s.go);
 const discovered = new Set(discoveredList);

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <SkyBackground />
 <div className="col scroll-y" style={{ position: 'relative', flex: 1, minHeight: 0, padding: '16px 14px 20px' }}>
 <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
 <button className="icon-btn" onClick={() => go('home')} aria-label={COPY.common.back}>
 <ItemIcon icon="back" size={22} />
 </button>
 <h2 style={{ color: 'var(--ink)', fontSize: 15 }}>{COPY.collection.title}</h2>
 <span style={{ width: 46 }} />
 </div>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: 'var(--ink-soft)', textAlign: 'center', margin: '8px 0 14px' }}>
 {discovered.size}/{ALL_FORMS.length}
 </span>

 {STAGE_ORDER.map((stage) => (
 <div key={stage} className="col" style={{ gap: 8, marginBottom: 14 }}>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.stage[stage]}</span>
 <div style={{ display: 'grid', gridTemplateColumns: stage === 'legendary' ? '1fr 1fr' : `repeat(${Math.min(TREE_BY_STAGE[stage].length, 2)}, 1fr)`, gap: 10 }}>
 {TREE_BY_STAGE[stage].map((id) => {
 const known = discovered.has(id);
 const form = TREE[id];
 return (
 <div key={id} className="glass col" style={{ padding: 12, gap: 6, alignItems: 'center', position: 'relative' }}>
 {form.rare && known && (
 <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 12 }}>⭐</span>
 )}
 <div style={{ width: 92, height: 92, display: 'grid', placeItems: 'center' }}>
 {known ? (
 <MonsterView species="mochi" stage={stage} state="idle" size={88} form={id} />
 ) : (
 <div style={{ width: 72, height: 72, borderRadius: 14, background: 'rgba(60,45,80,0.22)',
 border: '3px solid rgba(60,45,80,0.3)', display: 'grid', placeItems: 'center' }}>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 22, color: 'rgba(60,45,80,0.5)' }}>?</span>
 </div>
 )}
 </div>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: 'var(--ink)' }}>
 {known ? form.name : COPY.collection.locked}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
