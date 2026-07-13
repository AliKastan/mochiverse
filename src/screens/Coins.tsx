import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { ItemIcon } from '../components/ItemIcon';
import { COIN_PACKS, type CoinPack } from '../game/premium';
import { purchaseCoins } from '../billing';
import { toast } from '../components/toast';

// In-app coin store. Coins are bought with real money via App Store consumable
// IAP (see billing.ts → purchaseCoins). Designed to feel premium: a highlighted
// "popular" pack, bonus badges, instant grant.
export function Coins() {
  const COPY = useT();
  const coins = useGame((s) => s.coins);
  const go = useGame((s) => s.go);
  const [busy, setBusy] = useState<string | null>(null);

  const buy = async (pack: CoinPack) => {
    setBusy(pack.id);
    try { const ok = await purchaseCoins(pack); if (ok) toast(COPY.coins.got); }
    finally { setBusy(null); }
  };

  return (
    <div className="col" style={{ position: 'absolute', inset: 0 }}>
      <SkyBackground />
      <div className="col scroll-y" style={{ position: 'relative', flex: 1, minHeight: 0, padding: '16px 16px 24px', gap: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="icon-btn" onClick={() => go('home')} aria-label={COPY.common.back}>
            <ItemIcon icon="back" size={22} />
          </button>
          <h2 style={{ color: 'var(--ink)', fontSize: 15 }}>{COPY.coins.title}</h2>
          <span className="chip"><ItemIcon icon="coin" size={20} /> {coins}</span>
        </div>

        <motion.div className="col" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ alignItems: 'center', gap: 4, padding: '6px 0 2px' }}>
          <ItemIcon icon="coin" size={56} />
          <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{COPY.coins.subtitle}</span>
        </motion.div>

        <div className="col" style={{ gap: 10 }}>
          {COIN_PACKS.map((pack, i) => {
            const badge = pack.badgeKey ? COPY.coins[pack.badgeKey] : null;
            const highlight = pack.badgeKey === 'popular';
            return (
              <motion.button key={pack.id} onClick={() => buy(pack)} disabled={busy !== null}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="glass row" style={{ position: 'relative', padding: '14px 16px', alignItems: 'center',
                  justifyContent: 'space-between', gap: 12, cursor: 'pointer',
                  border: highlight ? '3px solid #F5B942' : '3px solid var(--ink)',
                  boxShadow: highlight ? '0 4px 0 0 rgba(245,185,66,0.5)' : undefined }}>
                {badge && (
                  <span style={{ position: 'absolute', top: -10, right: 14, background: highlight ? '#F5B942' : 'var(--lavender)',
                    color: '#fff', fontFamily: 'var(--pixel)', fontSize: 7, padding: '3px 8px', borderRadius: 8,
                    border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{badge}</span>
                )}
                <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                  <ItemIcon icon="coin" size={40} />
                  <div className="col" style={{ gap: 1, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 19, color: 'var(--ink)' }}>
                      {pack.coins.toLocaleString()}
                    </span>
                    {pack.bonus ? (
                      <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 11, color: '#2a9c68' }}>+{pack.bonus}% bonus</span>
                    ) : (
                      <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{COPY.coins.unit}</span>
                    )}
                  </div>
                </div>
                <span className="btn btn-peach" style={{ padding: '10px 16px', fontSize: '0.66rem', pointerEvents: 'none' }}>
                  {busy === pack.id ? '…' : pack.priceLabel}
                </span>
              </motion.button>
            );
          })}
        </div>

        <span className="muted" style={{ fontSize: 10.5, textAlign: 'center' }}>{COPY.coins.legal}</span>
      </div>
    </div>
  );
}
