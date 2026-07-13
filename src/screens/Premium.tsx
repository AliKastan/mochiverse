import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/useGame';
import { useT } from '../i18n';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { ItemIcon } from '../components/ItemIcon';
import { SparkleIcon, TrophyIcon } from '../components/Icons';
import { PREMIUM } from '../game/premium';
import { purchasePremium, restorePurchases } from '../billing';
import { toast } from '../components/toast';

// The paywall. Lists what a $3/mo subscription unlocks and drives the purchase
// through billing.ts (real App Store IAP once RevenueCat is wired; a mock unlock
// on web/dev). Reachable from the ☰ menu and from every locked premium control.
export function Premium() {
  const COPY = useT();
  const premium = useGame((s) => s.premium);
  const go = useGame((s) => s.go);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  const benefits = [
    { icon: <span style={{ fontSize: 24 }}>💖</span>, t: COPY.premium.benefitRevive, s: COPY.premium.benefitReviveSub },
    { icon: <span style={{ fontSize: 24 }}>🌱</span>, t: COPY.premium.benefitCare, s: COPY.premium.benefitCareSub },
    { icon: <ItemIcon icon="gear" size={26} />, t: COPY.premium.benefitThemes, s: COPY.premium.benefitThemesSub },
    { icon: <SparkleIcon size={26} color="#B39DFF" />, t: COPY.premium.benefitSkins, s: COPY.premium.benefitSkinsSub },
    { icon: <ItemIcon icon="chart" size={26} />, t: COPY.premium.benefitStats, s: COPY.premium.benefitStatsSub },
    { icon: <TrophyIcon size={26} />, t: COPY.premium.benefitSupport, s: COPY.premium.benefitSupportSub },
  ];

  const buy = async () => {
    setBusy('buy');
    try { const ok = await purchasePremium(); if (ok) toast(COPY.premium.active); }
    finally { setBusy(null); }
  };
  const restore = async () => {
    setBusy('restore');
    try { const ok = await restorePurchases(); toast(ok ? COPY.premium.active : COPY.premium.subtitle); }
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
          <h2 style={{ color: 'var(--ink)', fontSize: 15 }}>{COPY.premium.menu}</h2>
          <span style={{ width: 46 }} />
        </div>

        <motion.div className="glass col" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ padding: '20px 18px', gap: 6, alignItems: 'center', textAlign: 'center',
            border: '3px solid var(--ink)' }}>
          <TrophyIcon size={42} />
          <h2 style={{ color: 'var(--ink)', fontSize: 20 }}>{COPY.premium.title}</h2>
          <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{COPY.premium.subtitle}</span>
          {premium && (
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: '#2a9c68', marginTop: 6 }}>{COPY.premium.active}</span>
          )}
        </motion.div>

        <div className="glass col" style={{ padding: 14, gap: 12 }}>
          {benefits.map((b, i) => (
            <div key={i} className="row" style={{ gap: 12, alignItems: 'center' }}>
              <div style={{ width: 34, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{b.icon}</div>
              <div className="col" style={{ gap: 1 }}>
                <span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{b.t}</span>
                <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{b.s}</span>
              </div>
            </div>
          ))}
        </div>

        {premium ? (
          <div className="glass col" style={{ padding: 16, gap: 6, alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontFamily: 'Fredoka', fontWeight: 700, color: 'var(--ink)' }}>{COPY.premium.manage}</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{COPY.premium.thanks}</span>
          </div>
        ) : (
          <div className="col" style={{ gap: 10, alignItems: 'center' }}>
            <motion.button className="btn" style={{ width: '100%', padding: 16, fontSize: 18 }}
              whileTap={{ scale: 0.97 }} animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              disabled={busy !== null} onClick={buy}>
              {busy === 'buy' ? '…' : `${COPY.premium.cta} · ${PREMIUM.priceLabel}${COPY.premium.perMonth}`}
            </motion.button>
            <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.62rem' }}
              disabled={busy !== null} onClick={restore}>
              {COPY.premium.restore}
            </button>
            <span className="muted" style={{ fontSize: 10.5, textAlign: 'center', maxWidth: 280 }}>{COPY.premium.legal}</span>
          </div>
        )}
      </div>
    </div>
  );
}
