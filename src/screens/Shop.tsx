import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SHOP_CATALOG } from '../game/constants';
import type { ShopItem, ItemKind } from '../game/types';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { ItemIcon } from '../components/ItemIcon';
import { toast } from '../components/toast';

const KINDS: ItemKind[] = ['food', 'medicine', 'toy'];

export function Shop() {
 const COPY = useT();
 const KIND_LABEL: Record<ItemKind, string> = { food: COPY.shop.food, medicine: COPY.shop.medicine, toy: COPY.shop.toy, cosmetic: COPY.shop.cosmetic };
 const coins = useGame((s) => s.coins);
 const inv = useGame((s) => s.inventory);
 const buyItem = useGame((s) => s.buyItem);
 const go = useGame((s) => s.go);
 const [confirm, setConfirm] = useState<ShopItem | null>(null);

 const doBuy = (it: ShopItem) => {
 const r = buyItem(it.id);
 toast(r === 'nocoins' ? COPY.shop.noCoins : COPY.shop.bought);
 setConfirm(null);
 };

 return (
 <div className="col" style={{ position: 'absolute', inset: 0 }}>
 <SkyBackground />
 <div className="col scroll-y" style={{ position: 'relative', flex: 1, minHeight: 0, padding: '16px 14px 20px' }}>
 <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
 <button className="icon-btn" onClick={() => go('home')} aria-label={COPY.common.back}>
 <ItemIcon icon="back" size={22} />
 </button>
 <h2 style={{ color: 'var(--ink)', fontSize: 15 }}>{COPY.shop.title}</h2>
 <button className="chip" onClick={() => go('coins')} aria-label={COPY.coins.title} style={{ cursor: 'pointer', gap: 6 }}>
 <ItemIcon icon="coin" size={20} /> {coins}
 <span style={{ marginLeft: 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--lavender)', color: '#fff', fontSize: 13, lineHeight: '14px', fontWeight: 700, display: 'inline-grid', placeItems: 'center' }}>+</span>
 </button>
 </div>

 {KINDS.map((kind) => (
 <div key={kind} className="col" style={{ gap: 8, marginTop: 14 }}>
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink-soft)' }}>{KIND_LABEL[kind]}</span>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
 {SHOP_CATALOG.filter((it) => it.kind === kind).map((it) => {
 const owned = inv.items?.[it.id] ?? 0;
 const canAfford = coins >= it.price;
 return (
 <div key={it.id} className="glass col" style={{ padding: 10, gap: 6, alignItems: 'center' }}>
 <ItemIcon icon={it.icon} size={48} />
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 7, textAlign: 'center', color: 'var(--ink)', lineHeight: 1.4 }}>
 {COPY.items[it.id] ?? it.id}
 </span>
 {owned > 0 && <span style={{ fontFamily: 'var(--pixel)', fontSize: 6, color: 'var(--ink-soft)' }}>×{owned}</span>}
 <button className={`btn ${canAfford ? 'btn-peach' : 'btn-ghost'}`} disabled={!canAfford}
 style={{ padding: '8px 10px', fontSize: '0.6rem', width: '100%', gap: 5 }}
 onClick={() => setConfirm(it)}>
 <ItemIcon icon="coin" size={14} /> {it.price}
 </button>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 {confirm && (
 <div style={{ position: 'absolute', inset: 0, background: 'rgba(60,40,80,0.55)', display: 'grid', placeItems: 'center', zIndex: 90 }}
 onClick={() => setConfirm(null)}>
 <motion.div className="glass col" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
 style={{ padding: 20, gap: 14, alignItems: 'center', width: 220 }} onClick={(e) => e.stopPropagation()}>
 <ItemIcon icon={confirm.icon} size={72} />
 <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.items[confirm.id] ?? confirm.id}</span>
 <span className="chip"><ItemIcon icon="coin" size={16} /> {confirm.price}</span>
 <div className="row" style={{ gap: 8, width: '100%' }}>
 <button className="btn btn-ghost" style={{ flex: 1, padding: 10, fontSize: '0.6rem' }} onClick={() => setConfirm(null)}>{COPY.common.back}</button>
 <button className="btn btn-peach" style={{ flex: 1, padding: 10, fontSize: '0.6rem' }} onClick={() => doBuy(confirm)}>{COPY.shop.confirmBuy}</button>
 </div>
 </motion.div>
 </div>
 )}
 </div>
 );
}
