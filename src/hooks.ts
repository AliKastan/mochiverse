import { useEffect, useRef } from 'react';

/**
 * Keep the screen awake while `active` (e.g. during a focus session) via the
 * Screen Wake Lock API, so the phone doesn't dim/sleep mid-timer. Re-acquires
 * the lock when the tab returns to the foreground (the OS drops it on hide).
 * No-op on browsers without the API.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    type WL = { release: () => Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WL> } };
    if (!nav.wakeLock) return;
    let lock: WL | null = null;
    let cancelled = false;
    const acquire = async () => {
      try { const l = await nav.wakeLock!.request('screen'); if (cancelled) l.release(); else lock = l; }
      catch { /* denied / not visible — ignore */ }
    };
    const onVis = () => { if (!document.hidden && !lock) acquire(); };
    acquire();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      lock?.release().catch(() => {});
    };
  }, [active]);
}

/** Fire `cb` every `ms` while `active`. Uses a ref so `cb` can change freely. */
export function useInterval(cb: () => void, ms: number | null, active = true) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; }, [cb]);
  useEffect(() => {
    if (ms == null || !active) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms, active]);
}

/**
 * Track cumulative hidden time via the Page Visibility API.
 * Calls onHidden() when the tab goes hidden, onVisible(hiddenMs) when it
 * returns with how long it was away. Used for focus-mode anti-cheat.
 */
export function usePageVisibility(handlers: {
  onHidden?: () => void;
  onVisible?: (hiddenMs: number) => void;
}, active: boolean) {
  const hiddenAt = useRef<number | null>(null);
  const h = useRef(handlers);
  useEffect(() => { h.current = handlers; }, [handlers]);

  useEffect(() => {
    if (!active) return;
    const onChange = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
        h.current.onHidden?.();
      } else if (hiddenAt.current != null) {
        const away = Date.now() - hiddenAt.current;
        hiddenAt.current = null;
        h.current.onVisible?.(away);
      }
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [active]);
}
