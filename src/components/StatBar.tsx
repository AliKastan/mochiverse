import { motion } from 'framer-motion';
import { CRITICAL_THRESHOLD } from '../game/constants';

// ============================================================
// Segmented pixel stat bar. Depletes block by block; the fill
// shifts green -> yellow -> red as the value drops, and the lit
// blocks pulse when the value is critical. No gradients.
// ============================================================

interface Props {
  label: string;
  value: number;         // 0..100
  icon: React.ReactNode;
  from?: string;         // (legacy, unused — color is value-driven)
  to?: string;
}

const SEGMENTS = 10;

export function StatBar({ label, value, icon }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const filled = Math.round((v / 100) * SEGMENTS);
  const critical = v <= CRITICAL_THRESHOLD;
  const color = v > 55 ? '#6FD99A' : v > 30 ? '#FFCB5C' : '#FF7B93';

  return (
    <div className="row" style={{ gap: 10, width: '100%' }}>
      <div style={{ width: 26, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: critical ? 'var(--danger)' : 'var(--ink)' }}>{label}</span>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: 'var(--ink-soft)' }}>{Math.round(v)}</span>
        </div>
        <div className="row" style={{ gap: 2, height: 14 }}>
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const on = i < filled;
            return (
              <motion.div
                key={i}
                style={{
                  flex: 1, height: '100%', borderRadius: 2,
                  border: '2px solid rgba(106,83,117,0.5)',
                  background: on ? color : 'rgba(106,83,117,0.12)',
                }}
                animate={critical && on ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                transition={critical && on ? { duration: 0.9, repeat: Infinity, delay: i * 0.05 } : {}}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
